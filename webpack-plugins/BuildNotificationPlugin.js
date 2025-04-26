/**
 * Webpack plugin to show build notifications
 */
class BuildNotificationPlugin {
  constructor(options = {}) {
    this.options = {
      title: options.title || 'Webpack Build',
      logo: options.logo,
      successMessage: options.successMessage || 'Build completed successfully',
      errorMessage: options.errorMessage || 'Build failed',
      notifyOnSuccess: options.notifyOnSuccess !== undefined ? options.notifyOnSuccess : true,
      notifyOnError: options.notifyOnError !== undefined ? options.notifyOnError : true,
    };
  }

  apply(compiler) {
    // Hook into the compilation done hook
    compiler.hooks.done.tap('BuildNotificationPlugin', stats => {
      const hasErrors = stats.hasErrors();
      
      if (hasErrors && this.options.notifyOnError) {
        this.showNotification(false, stats);
      } else if (!hasErrors && this.options.notifyOnSuccess) {
        this.showNotification(true, stats);
      }
    });
  }

  showNotification(success, stats) {
    const time = (stats.endTime - stats.startTime) / 1000;
    const message = success 
      ? `${this.options.successMessage} in ${time.toFixed(2)}s`
      : `${this.options.errorMessage}: ${this.getErrorMessage(stats)}`;

    // Log to console
    console.log('\n');
    if (success) {
      console.log('\x1b[32m%s\x1b[0m', `✅ ${this.options.title}: ${message}`);
    } else {
      console.log('\x1b[31m%s\x1b[0m', `❌ ${this.options.title}: ${message}`);
    }
    console.log('\n');

    // Show native notification if available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(this.options.title, {
          body: message,
          icon: this.options.logo,
        });
      }
    }
  }

  getErrorMessage(stats) {
    const { errors } = stats.compilation;
    if (errors.length === 0) return 'Unknown error';
    
    // Get the first error
    const error = errors[0];
    return error.message || 'Unknown error';
  }
}

module.exports = BuildNotificationPlugin;
