# Contributing to Park Tycoon

Thank you for your interest in contributing to Park Tycoon! This document provides guidelines and information for contributors.

## Ways to Contribute

### 🐛 Bug Reports
- Search existing issues before creating new ones
- Include detailed steps to reproduce the issue
- Provide browser and system information
- Add screenshots or videos when helpful

### ✨ Feature Requests
- Describe the feature and its benefits
- Explain how it fits with the game's vision
- Consider implementation complexity
- Provide mockups or examples if applicable

### 💻 Code Contributions
- Fork the repository and create a feature branch
- Follow the coding standards and guidelines
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed

### 📚 Documentation
- Improve README and other documentation
- Add code comments and JSDoc
- Create tutorials and guides
- Translate content to other languages

## Development Setup

1. **Prerequisites**
   - Node.js 14+
   - npm or yarn
   - Git
   - Modern browser with WebGL support

2. **Setup**
   ```bash
   git clone https://github.com/BeICT/parks-web.git
   cd parks-web
   npm install
   npm start
   ```

3. **Development Commands**
   - `npm start` - Development server with hot reload
   - `npm run build` - Production build
   - `npm run dev` - Development build with watch mode

## Coding Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type when possible
- Use meaningful variable and function names
- Add JSDoc comments for public methods

### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in arrays and objects
- Keep lines under 100 characters when reasonable
- Use descriptive names for variables and functions

### File Organization
- Keep files focused and single-purpose
- Use consistent naming conventions
- Place related files in appropriate directories
- Export classes and interfaces properly

## Commit Guidelines

### Commit Message Format
```
type(scope): brief description

Optional longer description explaining what and why.

Fixes #123
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Build process or auxiliary tool changes

### Examples
```
feat(rides): add water slide ride type
fix(ui): resolve modal window positioning issue
docs(readme): update installation instructions
style(components): improve code formatting
```

## Testing Guidelines

### Before Submitting
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Verify responsive design on different screen sizes
- Check for console errors or warnings
- Test game functionality thoroughly
- Ensure build process works correctly

### Performance Considerations
- Profile Three.js performance impact
- Minimize bundle size increases
- Optimize asset loading
- Consider memory usage

## Pull Request Process

1. **Preparation**
   - Create feature branch from main
   - Make focused, atomic commits
   - Write clear commit messages
   - Update documentation if needed

2. **Submission**
   - Create pull request with clear description
   - Reference related issues
   - Add screenshots for UI changes
   - Request appropriate reviewers

3. **Review Process**
   - Address reviewer feedback promptly
   - Make requested changes
   - Keep discussions constructive
   - Be patient during review process

## Project Structure

```
src/
├── entities/          # Game objects (Park, Ride, Visitor)
├── game/             # Core systems (Engine, Scene, Camera)
├── ui/               # User interface components
├── utils/            # Utility classes and helpers
├── types/            # TypeScript type definitions
└── index.ts          # Application entry point

public/
├── css/              # Stylesheets
├── assets/           # Game assets
└── index.html        # Main HTML file
```

## Feature Development Guidelines

### Adding New Rides
1. Define ride properties in `types/index.ts`
2. Create ride class method in `entities/Ride.ts`
3. Add 3D model creation method
4. Update UI to include new ride
5. Test gameplay integration

### UI Components
1. Create component in `ui/` directory
2. Add appropriate CSS styles
3. Integrate with event system
4. Ensure responsive design
5. Test accessibility

### Game Mechanics
1. Plan feature architecture
2. Update core game systems
3. Add necessary data structures
4. Implement user interface
5. Test gameplay balance

## Community Guidelines

### Communication
- Be respectful and constructive
- Help newcomers get started
- Share knowledge and experience
- Provide helpful feedback

### Collaboration
- Work together on complex features
- Share ideas and discuss solutions
- Review others' contributions
- Participate in community discussions

## Questions and Support

### Getting Help
- Check existing documentation
- Search closed issues for solutions
- Ask questions in GitHub Discussions
- Contact maintainers if needed

### Contact Information
- **Project Maintainer**: BeICT
- **Website**: [https://beict.nl](https://beict.nl)
- **Email**: info@beict.nl

## Recognition

Contributors will be recognized in:
- Project README acknowledgments
- Release notes for significant contributions
- Special mentions for outstanding work
- Community spotlights

Thank you for contributing to Park Tycoon! Your efforts help make this game better for everyone. 🎢🎡🎠
