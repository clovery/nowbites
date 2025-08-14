# Pre-commit Hooks

This project uses pre-commit hooks to ensure code quality and prevent commits when tests fail.

## Setup

The pre-commit hooks are automatically installed when you run:

```bash
pnpm install
```

This will install Husky and set up the pre-commit hook.

## How it works

Every time you try to commit code, the following checks will run automatically:

1. **Lint-staged**: Formats and lints only the staged files
2. **Tests**: Runs all tests across the monorepo
3. **Commit**: Only proceeds if all checks pass

## What happens if tests fail?

If any tests fail, the commit will be blocked with an error message:

```
❌ Tests failed! Please fix the issues before committing.
```

You must fix the failing tests before you can commit your changes.

## Manual testing

You can run tests manually at any time:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for a specific package
pnpm --filter <package-name> test
```

## Skipping hooks (emergency only)

If you absolutely need to skip the pre-commit hooks (not recommended), you can use:

```bash
git commit --no-verify -m "your message"
```

## Configuration

The pre-commit hooks are configured in:

- `.husky/pre-commit` - The main pre-commit script
- `package.json` - lint-staged configuration
- `turbo.json` - Test task definitions

## Adding tests to packages

To add tests to a package that doesn't have them:

1. Add test scripts to the package's `package.json`:

   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch"
     }
   }
   ```

2. Install testing dependencies (Jest, etc.)
3. Create test files
4. The pre-commit hook will automatically pick up and run these tests

## Troubleshooting

### Hook not working

Make sure Husky is properly installed:

```bash
pnpm run prepare
```

### Permission denied

Make the hook executable:

```bash
chmod +x .husky/pre-commit
```

### Tests hanging

Check if any tests are running in watch mode and stop them with `Ctrl+C`.
