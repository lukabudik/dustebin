# Contributing to Dustebin

Thank you for considering contributing to Dustebin! This document outlines the process for contributing to the project and provides guidelines to make the contribution process smooth and effective.

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the existing issues to see if the problem has already been reported. If it has and the issue is still open, add a comment to the existing issue instead of opening a new one.

When creating a bug report, please include as much detail as possible:

- **Use a clear and descriptive title** for the issue
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected to see
- **Include screenshots or animated GIFs** if possible
- **Include details about your environment** (OS, browser, etc.)
- **Note any relevant error messages** from the console

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title** for the issue
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **Include any relevant mockups or examples**

### Pull Requests

- Fill in the required template
- Follow the [style guides](#style-guides)
- Include appropriate tests
- Update documentation as needed
- Link to any related issues

## Getting Started

### Development Environment Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/dustebin.git
   cd dustebin
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Set up your environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/dustebin?schema=public"
   CLEANUP_API_KEY="your-secure-api-key-for-admin-routes"
   ```
5. Set up the database:

   ```bash
   # Run the SQL script to create the database and tables
   psql -U username -f prisma/init.sql

   # Apply migrations and generate Prisma client
   npx prisma migrate dev
   ```

6. Run the development server:
   ```bash
   pnpm dev
   ```
7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch for integrating features
- Feature branches - Named as `feature/your-feature-name`
- Bug fix branches - Named as `fix/issue-description`

Always create your branch from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

## Development Workflow

For detailed information about the development workflow, coding standards, and tools, please refer to the [Development Guide](DEVELOPMENT.md).

The Development Guide includes:

- ESLint configuration and rules
- Commit message format (Conventional Commits)
- Pre-commit hooks setup
- Docker development environment
- Recommended workflow for feature development

## Style Guides

### Git Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. See the [Development Guide](DEVELOPMENT.md) for details.

### JavaScript/TypeScript Style Guide

- Use TypeScript for all new code
- Follow the ESLint configuration in the project
- Use async/await instead of Promise chains
- Prefer functional programming patterns when appropriate
- Use meaningful variable and function names

### CSS Style Guide

- Use Tailwind CSS utility classes
- Follow the component-based styling approach
- Maintain responsive design principles

### Documentation Style Guide

- Use Markdown for documentation
- Include code examples when relevant
- Keep documentation up-to-date with code changes

## Testing

- Write tests for all new features and bug fixes
- Ensure all tests pass before submitting a pull request
- Aim for good test coverage

## Additional Notes

### Issue and Pull Request Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## Thank You!

Your contributions to open source, large or small, make projects like this possible. Thank you for taking the time to contribute.
