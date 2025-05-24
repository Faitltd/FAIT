import { performanceMonitor, Measure } from '../performanceUtils';

describe('performanceUtils', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    performanceMonitor.configure({ enabled: true, logToConsole: false });
    
    // Mock performance.now
    const originalNow = performance.now;
    let time = 1000;
    
    jest.spyOn(performance, 'now').mockImplementation(() => {
      time += 100;
      return time;
    });
    
    return () => {
      performance.now = originalNow;
    };
  });

  describe('performanceMonitor', () => {
    it('measures execution time', () => {
      performanceMonitor.start('test-operation');
      // Simulate some work
      performanceMonitor.end('test-operation');
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test-operation');
      expect(metrics[0].duration).toBe(100);
    });

    it('measures function execution time', () => {
      const result = performanceMonitor.measure('test-function', () => {
        // Simulate some work
        return 'result';
      });
      
      expect(result).toBe('result');
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test-function');
      expect(metrics[0].duration).toBe(100);
    });

    it('measures async function execution time', async () => {
      const result = await performanceMonitor.measureAsync('test-async', async () => {
        // Simulate some async work
        return 'async result';
      });
      
      expect(result).toBe('async result');
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test-async');
      expect(metrics[0].duration).toBe(100);
    });

    it('captures errors in measured functions', () => {
      expect(() => {
        performanceMonitor.measure('error-function', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('error-function');
      expect(metrics[0].metadata).toHaveProperty('error', 'Test error');
    });

    it('captures errors in async measured functions', async () => {
      await expect(
        performanceMonitor.measureAsync('async-error', async () => {
          throw new Error('Async test error');
        })
      ).rejects.toThrow('Async test error');
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('async-error');
      expect(metrics[0].metadata).toHaveProperty('error', 'Async test error');
    });

    it('calculates average duration', () => {
      performanceMonitor.measure('avg-test', () => {});
      performanceMonitor.measure('avg-test', () => {});
      performanceMonitor.measure('avg-test', () => {});
      
      const avg = performanceMonitor.getAverageDuration('avg-test');
      expect(avg).toBe(100);
    });

    it('respects enabled flag', () => {
      performanceMonitor.configure({ enabled: false });
      
      performanceMonitor.start('disabled-test');
      performanceMonitor.end('disabled-test');
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(0);
    });

    it('limits the number of metrics', () => {
      performanceMonitor.configure({ maxMetricsCount: 2 });
      
      performanceMonitor.measure('test1', () => {});
      performanceMonitor.measure('test2', () => {});
      performanceMonitor.measure('test3', () => {});
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(2);
      expect(metrics[0].name).toBe('test2');
      expect(metrics[1].name).toBe('test3');
    });
  });

  describe('Measure decorator', () => {
    it('measures method execution time', () => {
      class TestClass {
        @Measure()
        testMethod() {
          return 'result';
        }
        
        @Measure('custom-name')
        testMethodWithCustomName() {
          return 'custom result';
        }
        
        @Measure()
        async asyncMethod() {
          return 'async result';
        }
      }
      
      const instance = new TestClass();
      
      // Test regular method
      const result = instance.testMethod();
      expect(result).toBe('result');
      
      // Test method with custom name
      const customResult = instance.testMethodWithCustomName();
      expect(customResult).toBe('custom result');
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(2);
      expect(metrics[0].name).toBe('TestClass.testMethod');
      expect(metrics[1].name).toBe('custom-name');
    });
  });
});
