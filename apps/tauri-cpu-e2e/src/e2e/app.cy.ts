describe('angular-monorepo-e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('Cpu reporting toggle can switch off', () => {
    cy.get('button').should('have.class', 'bg-gray-200');
    cy.get('button').click();
    cy.get('button').should('have.class', 'bg-indigo-600');
  });
});
