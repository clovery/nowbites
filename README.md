# NowBites

A monorepo for recipe management with WeChat Mini Program, web app, and API.

## Features

- 🍳 Recipe management and parsing
- 📱 WeChat Mini Program (Taro + React)
- 🌐 Web application (Next.js)
- 🔌 RESTful API (Fastify)
- 📚 Documentation site
- 🧪 Comprehensive testing with pre-commit hooks

## Pre-commit Hooks

This project uses pre-commit hooks to ensure code quality and prevent commits when tests fail.

### How it works

Every time you try to commit code, the following checks run automatically:

1. **Lint-staged**: Formats and lints only the staged files
2. **Tests**: Runs all tests across the monorepo
3. **Commit**: Only proceeds if all checks pass

### What happens if tests fail?

If any tests fail, the commit will be blocked with an error message:

```
❌ Tests failed! Please fix the issues before committing.
```

You must fix the failing tests before you can commit your changes.

### Manual testing

You can run tests manually at any time:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for a specific package
pnpm --filter <package-name> test
```

### Skipping hooks (emergency only)

If you absolutely need to skip the pre-commit hooks (not recommended), you can use:

```bash
git commit --no-verify -m "your message"
```

## Development

### Prerequisites

- Node.js >= 18
- pnpm >= 9.0.0

### Setup

```bash
# Install dependencies
pnpm install

# The pre-commit hooks are automatically installed
```

### Available Scripts

```bash
# Development
pnpm dev          # Start all dev servers
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm test         # Run all tests
pnpm test:watch   # Run tests in watch mode

# Package-specific commands
pnpm --filter weapp dev     # Start weapp dev server
pnpm --filter web dev       # Start web dev server
pnpm --filter api dev       # Start API dev server
```

## Project Structure

```
nowbites/
├── apps/
│   ├── weapp/          # WeChat Mini Program
│   ├── web/            # Web application
│   ├── api/            # API server
│   └── docs/           # Documentation site
├── packages/
│   ├── parse-markdown-recipe/  # Recipe parsing library
│   ├── types/                  # Shared TypeScript types
│   ├── ui/                     # Shared UI components
│   └── eslint-config/          # Shared ESLint configuration
├── .husky/             # Git hooks configuration
└── docs/               # Project documentation
```

## Testing

The project includes comprehensive testing:

- **parse-markdown-recipe**: 98 tests covering recipe parsing functionality
- **Other packages**: Placeholder test scripts (can be expanded as needed)

Tests are automatically run before each commit to ensure code quality.

## Contributing

1. Make your changes
2. Ensure tests pass: `pnpm test`
3. Commit your changes (tests will run automatically)
4. If tests fail, fix the issues and try again

## License

MIT
