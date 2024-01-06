describe("Estimated Sold Products Value Test", () => {
  it("Should assign all employees, and estimated sold products should equal 100 * amount of employees", () => {
    cy.visit("localhost:3000");
    // WIP: Add endpoint to clear database here to help run tests more smoothly!
    // cy.request("localhost:3001/clear-database");

    // Wait for the disabled unassigned employee buttons to be present
    cy.get(".btn_unassigned[disabled]", { timeout: 10000 }) // Adjust timeout if needed
      .should("have.length.greaterThan", 0)
      .then(($buttons) => {
        const expectedCount = $buttons.length;
        cy.log(`Expected count of unassigned employees: ${expectedCount}`);

        cy.get("h2").contains("Estimated products sold: 0");

        // Assign all employees
        cy.get('.btn_assign', { timeout: 10000 }).as('assignButtons').then(($buttons) => {
          const shuffledAssignButtons = $buttons.toArray().sort(() => Math.random() - 0.5);

          // Create a recursive function to click all buttons
          const clickAssignButtons = (buttons: string | any[], index: number) => {
            if (index < buttons.length) {
              cy.wrap(buttons[index]).click().then(() => {
                cy.wait(5000); // Adjust wait time if needed
                clickAssignButtons(buttons, index + 1);
              });
            } else {
              // Wait for the estimated products sold to update
              cy.wait(5000); // Adjust wait time if needed
              cy.get(".estimated_products_sold", { timeout: 10000 }).should("contain", `Estimated products sold: ${expectedCount * 100}`);
            }
          };

          clickAssignButtons(shuffledAssignButtons, 0);
        });

        // Check if all employees have been assigned
        cy.get(".all_employees_assigned", { timeout: 10000 }).contains("You have assigned all employees!");
      });
  });
});
