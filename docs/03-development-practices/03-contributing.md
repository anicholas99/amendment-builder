# 3.3 Contributing Guide

Thank you for contributing to the Patent Drafter AI project! This guide outlines the process for contributing to ensure a smooth and consistent workflow.

## The Development Workflow

Our development process is based on a standard feature-branch workflow with pull requests.

1.  **Create an Issue**: Before starting work, ensure there is a corresponding issue on GitHub that describes the feature or bug.
2.  **Create a Branch**: Create a new branch from the `main` branch.
    -   Branch names should be descriptive and include the issue number.
    -   **Format**: `[type]/[issue-number]-[short-description]`
    -   **Examples**:
        -   `feat/PROJ-123-add-project-dashboard`
        -   `fix/PROJ-456-fix-login-redirect`
        -   `docs/PROJ-789-update-readme`
3.  **Make Commits**:
    -   Make small, logical commits.
    -   Write clear and concise commit messages. Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
    -   **Format**: `type(scope): subject`
    -   **Examples**:
        -   `feat(api): add endpoint for project creation`
        -   `fix(ui): correct alignment of header buttons`
        -   `docs(auth): explain ipd identity migration`
4.  **Keep Your Branch Updated**: Regularly rebase your branch on `main` to incorporate the latest changes and avoid complex merge conflicts later.
    ```bash
    git fetch origin
    git rebase origin/main
    ```
5.  **Submit a Pull Request (PR)**:
    -   When your work is complete and tested, push your branch to GitHub and open a pull request against the `main` branch.
    -   Use the PR template to provide a clear description of the changes. Link the PR to the relevant issue.
6.  **Participate in Code Review**:
    -   A team member will review your PR.
    -   Respond to comments and make any necessary changes.
    -   Once the PR is approved and all checks pass, it will be squashed and merged into `main`.

## Pre-Commit Checks

This project uses pre-commit hooks (managed by Husky) to automatically check your code before you commit. These hooks will:
-   Run ESLint to check for linting errors.
-   Run Prettier to format your code.
-   Run `tsc` to check for TypeScript errors.

If any of these checks fail, the commit will be aborted. You must fix the reported issues before you can successfully commit your changes. This ensures that no broken or poorly formatted code enters the main repository.

## Code Review Standards

-   **Be Respectful**: All feedback should be constructive and respectful.
-   **Explain Your Reasoning**: If you suggest a change, explain *why* it's better. Link to relevant documentation or style guides if possible.
-   **Ask Questions**: If you don't understand a piece of code, ask for clarification.
-   **Acknowledge and Respond**: As the PR author, you should respond to all comments, even if it's just with a "Done" or "👍". 