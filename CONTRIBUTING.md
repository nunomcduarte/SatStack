# Contributing to SatStack

Thank you for considering contributing to SatStack! This document outlines the process for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies with `npm install`
4. Set up environment variables by copying `.env.example` to `.env.local` and filling in the values
5. Run the development server with `npm run dev`

## Project Structure

SatStack follows the standard Next.js 14+ App Router structure:

```
src/
├── app/                # Application routes and layouts
│   ├── (auth)/         # Authentication routes (login, signup, etc.)
│   ├── dashboard/      # Dashboard routes (protected)
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── forms/          # Form components
│   ├── ui/             # Shared UI components
│   ├── portfolio/      # Portfolio-related components
│   └── transactions/   # Transaction-related components
├── lib/                # Utility functions and services
│   ├── auth/           # Authentication utilities
│   ├── db/             # Database utilities
│   ├── services/       # Service layer
│   └── utils/          # Utility functions
└── types/              # TypeScript type definitions
```

## Coding Standards

1. **TypeScript**: All code should be written in TypeScript with proper typing
2. **Component Structure**:
   - Use PascalCase for component names
   - Place components in appropriate subdirectories
   - Follow the functional component pattern
3. **Styling**:
   - Use TailwindCSS for styling
   - Follow the project's color scheme and design patterns
   - Ensure dark mode support for all components
4. **State Management**:
   - Use React Context for global state
   - Use React Query for server state
   - Use local state for component-specific state

## Pull Request Process

1. Create a new branch for your feature or bugfix
2. Make your changes, following the coding standards
3. Write tests for your changes if applicable
4. Ensure all tests pass by running `npm run test`
5. Update documentation if necessary
6. Submit a pull request with a clear description of the changes

## Development Workflow

### Design-First Approach

1. Start with a clear understanding of the feature requirements
2. Design the component interface and user flow
3. Implement the UI without real data (using mock data)
4. Integrate with backend services
5. Add error handling, loading states, and edge cases
6. Test the feature thoroughly

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
feat: add user profile page
fix: correct calculation in tax report
docs: update README with new features
style: format code according to style guide
refactor: simplify transaction processing logic
test: add tests for authentication flow
```

## Environment Variables

The following environment variables are required for development:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY

# CoinAPI Configuration
COINAPI_KEY

# App Configuration
NEXT_PUBLIC_APP_URL
```

For local development, you can use Development Mode to bypass external service requirements.

## Testing Guidelines

1. **Unit Tests**: Write unit tests for utility functions and isolated components
2. **Integration Tests**: Write integration tests for features that span multiple components
3. **E2E Tests**: Write end-to-end tests for critical user flows

## Accessibility

All components should follow WCAG 2.1 guidelines:

1. Use semantic HTML elements
2. Add proper ARIA attributes where necessary
3. Ensure keyboard navigability
4. Maintain color contrast ratios
5. Provide text alternatives for non-text content

## Performance Considerations

1. Use Server Components for static content
2. Use Client Components only when necessary for interactivity
3. Optimize images and assets
4. Implement proper loading states
5. Use code splitting where appropriate

## Security Guidelines

1. Never store secrets in client-side code
2. Always sanitize user input
3. Use Supabase RLS policies for database security
4. Follow the principle of least privilege
5. Keep dependencies up to date

## License

By contributing to SatStack, you agree that your contributions will be licensed under the project's MIT license. 