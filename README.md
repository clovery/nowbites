# NowBites

A modern monorepo project built with Turborepo.

## Getting Started

Clone the repository and install dependencies:

```sh
git clone https://github.com/clovery/nowbites.git
cd nowbites
pnpm install
```

## What's Inside?

This monorepo includes the following packages/apps:

### Apps

- `docs`: a [Next.js](https://nextjs.org/) app for documentation
- `web`: a [Next.js](https://nextjs.org/) app for the main web application
- `weapp`: a WeChat Mini Program application

### Packages

- `ui`: a React component library shared by both `web` and `docs` applications
- `eslint-config`: `eslint` configurations used throughout the monorepo
- `typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This project has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Turborepo](https://turborepo.org/) for monorepo management

### Build

To build all apps and packages, run the following command:

```sh
# Using pnpm (recommended)
pnpm build

# Or using Turborepo directly
pnpm exec turbo build
```

You can build a specific app or package by using a filter:

```sh
# Build only the web app
pnpm build --filter=web

# Build only the docs app
pnpm build --filter=docs

# Build only the weapp
pnpm build --filter=weapp
```

### Develop

To develop all apps and packages, run the following command:

```sh
# Using pnpm (recommended)
pnpm dev

# Or using Turborepo directly
pnpm exec turbo dev
```

You can develop a specific app by using a filter:

```sh
# Develop only the web app
pnpm dev --filter=web

# Develop only the docs app
pnpm dev --filter=docs

# Develop only the weapp
pnpm dev --filter=weapp
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

To enable Remote Caching:

1. Create a Vercel account if you don't have one already
2. Authenticate with Vercel:

```sh
pnpm exec turbo login
```

3. Link your project to Remote Cache:

```sh
pnpm exec turbo link
```

## Project Structure

```
├── apps/
│   ├── docs/         # Documentation site
│   ├── web/          # Main web application
│   └── weapp/        # WeChat Mini Program
└── packages/
    ├── eslint-config/    # Shared ESLint configurations
    ├── typescript-config/ # Shared TypeScript configurations
    └── ui/               # Shared UI components
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the terms of the license included in the repository.
