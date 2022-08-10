import 'cypress-axe'
require('cypress-terminal-report/src/installLogsCollector')();

// Hide all fetch/XHR requests in Cy console, toggle via cypress.json
if (Cypress.env('hideElements')) {
  const app = window.top;

  if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
    const style = app.document.createElement('style');
    style.innerHTML =
      '.command-name-request,.command-name-xhr,.command-name-readFile { display: none; }, .command-method::before { content: none; }'
    style.setAttribute('data-hide-command-log-request', '');

    app.document.head.appendChild(style);
  }
}

const severityIndicators = {
    minor:    '⚪️',
    moderate: '🟡',
    serious:  '🟠',
    critical: '🔴',
}

function callback(violations) {
    violations.forEach(violation => {
        const nodes = Cypress.$(violation.nodes.map(node => node.target).join(','))

        Cypress.log({
            name: `Error: ${violation.help}`,
            consoleProps: () => violation,
            $el: nodes,
            message: `\n${severityIndicators[violation.impact]} Impact: ${violation.impact}
            \n[Learn more](${violation.helpUrl})`
        })

        violation.nodes.forEach(({ target }) => {
            Cypress.log({
                name: '🔧 Element:',
                consoleProps: () => violation,
                $el: Cypress.$(target.join(',')),
                message: target
            })
        })
    });
}

Cypress.Commands.add("analizeA11y", (path, config = null) => {
    cy.visit(path);
    cy.injectAxe();
    cy.checkA11y(null, config, callback);
})