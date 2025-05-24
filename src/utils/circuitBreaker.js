/**
 * Circuit Breaker implementation to prevent cascading failures
 */

// Circuit breaker states
const STATES = {
  CLOSED: 'CLOSED',      // Normal operation, requests pass through
  OPEN: 'OPEN',          // Failing, requests are immediately rejected
  HALF_OPEN: 'HALF_OPEN' // Testing if service has recovered
};

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.halfOpenSuccessThreshold = options.halfOpenSuccessThreshold || 2;
    
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.services = new Map(); // Track multiple services
  }
  
  /**
   * Execute a function with circuit breaker protection
   * 
   * @param {Function} fn - The function to execute
   * @param {string} serviceKey - Identifier for the service being called
   * @returns {Promise<any>} - The result of the function
   */
  async exec(fn, serviceKey = 'default') {
    // Initialize service if it doesn't exist
    if (!this.services.has(serviceKey)) {
      this.services.set(serviceKey, {
        state: STATES.CLOSED,
        failureCount: 0,
        successCount: 0,
        nextAttempt: Date.now()
      });
    }
    
    const service = this.services.get(serviceKey);
    
    // Check if circuit is open
    if (service.state === STATES.OPEN) {
      if (service.nextAttempt <= Date.now()) {
        // Move to half-open state
        service.state = STATES.HALF_OPEN;
      } else {
        // Circuit is open and timeout hasn't elapsed
        throw new Error(`Circuit breaker is open for service: ${serviceKey}`);
      }
    }
    
    try {
      const result = await fn();
      
      // On success in half-open state
      if (service.state === STATES.HALF_OPEN) {
        service.successCount++;
        
        if (service.successCount >= this.halfOpenSuccessThreshold) {
          // Reset to closed state
          service.state = STATES.CLOSED;
          service.failureCount = 0;
          service.successCount = 0;
        }
      } else if (service.state === STATES.CLOSED) {
        // Reset failure count on success in closed state
        service.failureCount = 0;
      }
      
      return result;
    } catch (error) {
      // Handle failure
      service.failureCount++;
      
      if (
        service.state === STATES.HALF_OPEN ||
        (service.state === STATES.CLOSED && service.failureCount >= this.failureThreshold)
      ) {
        // Trip the circuit
        service.state = STATES.OPEN;
        service.nextAttempt = Date.now() + this.resetTimeout;
        service.successCount = 0;
      }
      
      throw error;
    }
  }
  
  /**
   * Reset a specific service circuit breaker
   * 
   * @param {string} serviceKey - The service to reset
   */
  reset(serviceKey = 'default') {
    if (this.services.has(serviceKey)) {
      this.services.set(serviceKey, {
        state: STATES.CLOSED,
        failureCount: 0,
        successCount: 0,
        nextAttempt: Date.now()
      });
    }
  }
  
  /**
   * Reset all circuit breakers
   */
  resetAll() {
    this.services.clear();
  }
  
  /**
   * Get the current state of a service
   * 
   * @param {string} serviceKey - The service to check
   * @returns {Object} - The service state
   */
  getState(serviceKey = 'default') {
    return this.services.get(serviceKey) || {
      state: STATES.CLOSED,
      failureCount: 0,
      successCount: 0,
      nextAttempt: Date.now()
    };
  }
}

// Create a singleton instance
const circuitBreaker = new CircuitBreaker();

export default circuitBreaker;
