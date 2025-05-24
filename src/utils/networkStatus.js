/**
 * Network status monitoring utility
 */

// Event names
const EVENTS = {
  ONLINE: 'network:online',
  OFFLINE: 'network:offline',
  SLOW: 'network:slow',
  CHANGE: 'network:change'
};

// Network status object
const networkStatus = {
  isOnline: navigator.onLine,
  effectiveType: 'unknown',
  downlink: 0,
  rtt: 0,
  saveData: false,
  listeners: new Map(),
  
  /**
   * Initialize network status monitoring
   */
  init() {
    // Set initial values
    this.isOnline = navigator.onLine;
    
    // Add online/offline event listeners
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Monitor connection quality if supported
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      this.updateConnectionInfo(connection);
      
      // Listen for connection changes
      connection.addEventListener('change', () => {
        this.updateConnectionInfo(connection);
        this.dispatchEvent(EVENTS.CHANGE, this.getStatus());
      });
    }
    
    // Dispatch initial status
    this.dispatchEvent(EVENTS.CHANGE, this.getStatus());
    
    return this;
  },
  
  /**
   * Update connection information
   * 
   * @param {NetworkInformation} connection - Network information object
   */
  updateConnectionInfo(connection) {
    this.effectiveType = connection.effectiveType;
    this.downlink = connection.downlink;
    this.rtt = connection.rtt;
    this.saveData = connection.saveData;
    
    // Check if connection is slow
    const isConnectionSlow = 
      this.effectiveType === 'slow-2g' || 
      this.effectiveType === '2g' ||
      (this.downlink < 0.5 && this.rtt > 500);
    
    if (isConnectionSlow) {
      this.dispatchEvent(EVENTS.SLOW, this.getStatus());
    }
  },
  
  /**
   * Handle online event
   */
  handleOnline() {
    this.isOnline = true;
    this.dispatchEvent(EVENTS.ONLINE, this.getStatus());
    this.dispatchEvent(EVENTS.CHANGE, this.getStatus());
  },
  
  /**
   * Handle offline event
   */
  handleOffline() {
    this.isOnline = false;
    this.dispatchEvent(EVENTS.OFFLINE, this.getStatus());
    this.dispatchEvent(EVENTS.CHANGE, this.getStatus());
  },
  
  /**
   * Get current network status
   * 
   * @returns {Object} - Network status object
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      effectiveType: this.effectiveType,
      downlink: this.downlink,
      rtt: this.rtt,
      saveData: this.saveData,
      timestamp: Date.now()
    };
  },
  
  /**
   * Add event listener
   * 
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {Function} - Unsubscribe function
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
      }
    };
  },
  
  /**
   * Remove event listener
   * 
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  },
  
  /**
   * Dispatch event
   * 
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  dispatchEvent(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in network status listener for ${event}:`, error);
        }
      });
    }
    
    // Also dispatch to general change listeners
    if (event !== EVENTS.CHANGE && this.listeners.has(EVENTS.CHANGE)) {
      this.listeners.get(EVENTS.CHANGE).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in network status change listener:`, error);
        }
      });
    }
  }
};

// Initialize and export
export default networkStatus.init();

// Export event names
export { EVENTS };
