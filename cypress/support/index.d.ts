declare namespace Cypress {
  interface Chainable {
    /**
     * Login as a specific user role
     * @param role - The role to login as ('admin' | 'client' | 'serviceAgent')
     */
    loginAs(role: 'admin' | 'client' | 'serviceAgent'): Chainable<Element>
    
    /**
     * Login and persist session for a specific role
     * @param role - The role to login as ('admin' | 'client' | 'serviceAgent')
     */
    loginAndPersist(role: 'admin' | 'client' | 'serviceAgent'): Chainable<Element>
  }
}