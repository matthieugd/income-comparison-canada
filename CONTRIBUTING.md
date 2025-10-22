# Contributing to Income Comparison Canada

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/income-comparison-canada.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m "feat: add your feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Code Style

- Use ES6+ features
- Follow existing code formatting
- Write clear, descriptive variable names
- Add comments for complex logic
- Use functional React components with hooks

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
- `feat: add provincial comparison feature`
- `fix: correct percentile calculation for edge cases`
- `docs: update API documentation`

## Adding New Data

To add new geographic regions or demographic data:

1. Create a JSON file in `backend/src/data/census-2021/`
2. Follow the existing data structure:
```json
{
  "geography": "Region Name",
  "geographyCode": "CODE",
  "year": 2020,
  "demographic": "all",
  "percentiles": { ... },
  "median": 0,
  "average": 0,
  "totalRecipients": 0
}
```
3. Restart the backend server
4. Test the new data via the API

## Testing

Before submitting a PR:

1. Test with various income inputs
2. Verify calculations are accurate
3. Check responsive design on mobile
4. Ensure no console errors
5. Test API endpoints with different parameters

## Pull Request Process

1. Update README.md if needed
2. Update documentation for any API changes
3. Ensure all tests pass
4. Request review from maintainers
5. Address any feedback
6. Merge once approved

## Questions?

Open an issue for:
- Bug reports
- Feature requests
- Questions about the code
- Suggestions for improvements

## Code of Conduct

Be respectful and constructive in all interactions. We're here to build something useful together!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
