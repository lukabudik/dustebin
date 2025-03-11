# Development Guide

This document provides guidelines and information for developers working on the Dustebin project.

## Code Style and Linting

### ESLint Configuration

The project uses ESLint to enforce code quality and consistency. The configuration is in `eslint.config.mjs` and includes:

- Next.js recommended rules
- TypeScript strict rules
- React hooks rules
- Accessibility (jsx-a11y) rules

Key rules include:

- No use of `console.log` (use `console.warn` or `console.error` instead)
- No unused variables (with underscore prefix ignored)
- No explicit `any` types
- Proper React hooks dependencies

To run the linter:

```bash
pnpm lint
```

### Prettier

The project uses Prettier for code formatting. It's configured to work with ESLint and is run automatically on staged files before commit.

The Prettier configuration (`.prettierrc.json`) includes:

- Single quotes
- 2-space indentation
- 100 character line length
- Trailing commas in objects and arrays
- Semicolons at the end of statements
- Tailwind CSS class sorting

To manually format files:

```bash
# Format a specific file
npx prettier --write src/components/MyComponent.tsx

# Format all files
npx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}"
```

## Git Workflow

### Commit Message Format

The project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This enables automatic changelog generation and semantic versioning.

Each commit message should be structured as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to the build process or auxiliary tools

#### Examples

```
feat(editor): add syntax highlighting for Ruby

fix(api): resolve issue with paste expiration

docs: update README with Docker instructions
```

### Pre-commit Hooks

The project uses Husky to run pre-commit hooks:

1. **lint-staged**: Runs ESLint and Prettier on staged files
2. **commitlint**: Validates commit messages against the conventional commits format

These hooks ensure that all code committed to the repository meets the project's quality standards.

## Development Workflow

1. Create a new branch from `develop` for your feature or fix
2. Make your changes, following the code style guidelines
3. Write tests for your changes (if applicable)
4. Commit your changes with a descriptive commit message following the conventional commits format
5. Push your branch and create a pull request
6. Wait for CI checks to pass and address any issues
7. Request a review from a maintainer

## Docker Development

For development with Docker:

```bash
# Start the development environment
docker-compose up
```

This will start the application and a PostgreSQL database in Docker containers.
