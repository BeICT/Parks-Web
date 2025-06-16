# Park Tycoon - Theme Park Management Simulator

A modern web-based theme park management game built with TypeScript and Three.js. Build and manage your own theme park with realistic 3D graphics and engaging gameplay mechanics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.0+-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-Latest-green.svg)

## About

Park Tycoon is an open-source theme park management simulator that lets you build, manage, and grow your own amusement park. Inspired by classic tycoon games, it features modern 3D graphics, realistic economic simulation, and engaging gameplay mechanics.

### Key Features

- **8 Unique Ride Types** - From gentle carousels to extreme drop towers
- **3D Visualization** - Beautiful Three.js powered 3D park rendering
- **Economic Simulation** - Realistic financial management and budgeting
- **Staff Management** - Hire and manage different types of park staff
- **Scenario Challenges** - Multiple scenarios with varying difficulty levels
- **Achievement System** - Unlock rewards and track your progress
- **Research & Development** - Advance your park through technology research

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Modern web browser with WebGL support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BeICT/parks-web.git
cd parks-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:8080`

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist` directory.

## How to Play

1. **Start the Game** - Launch Park Tycoon and select "New Game" from the main menu
2. **Choose a Scenario** - Pick from beginner to expert difficulty challenges
3. **Build Your Park** - Use the toolbar to construct rides, shops, and facilities
4. **Manage Operations** - Hire staff, research technologies, and monitor finances
5. **Achieve Goals** - Complete scenario objectives and unlock achievements

### Game Controls

- **Left Click** - Build structures, interact with UI
- **Right Click** - Delete objects (when delete tool is selected)
- **Mouse Wheel** - Zoom in/out
- **Mouse Drag** - Rotate camera view
- **ESC** - Toggle main menu

### Available Rides

- **Ferris Wheel** - Classic observation ride for all ages
- **Roller Coaster** - High-thrill experience for adrenaline seekers
- **Carousel** - Traditional family-friendly spinning ride
- **Bumper Cars** - Interactive collision-based fun
- **Water Slide** - Refreshing summer thrill attraction
- **Haunted House** - Spooky dark ride experience
- **Drop Tower** - Extreme vertical drop experience
- **Spinning Teacups** - Whimsical spinning family ride

## Development Status

This is a community-driven project in active development. Current status:

### ✅ Completed Features
- Core gameplay mechanics and 3D rendering
- Eight unique ride types with custom 3D models
- User interface and park management systems
- Multiple challenge scenarios
- Achievement and progression systems

### ⚠️ Features with Limitations
- Save/load functionality (planned)
- Advanced AI systems (basic implementation)
- Sound and music system (not implemented)
- Mobile device optimization (limited)

### 🚧 In Development
- Enhanced graphics and visual effects
- Additional ride types and customization
- Advanced visitor and staff AI
- Comprehensive tutorial system

### � Planned Features
- Multiplayer park sharing
- Custom scenario editor
- Modding support and API
- Advanced analytics and reporting

## Contributing

We welcome contributions from the community! Whether you're a developer, designer, or theme park enthusiast, there are many ways to help.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices and maintain type safety
- Maintain consistent code formatting and style
- Add comprehensive comments for complex logic
- Test changes across different browsers
- Update documentation for new features

### Issues and Bug Reports

Found a bug or have a feature request? Please:

1. Check existing issues to avoid duplicates
2. Create a new issue with clear description
3. Include steps to reproduce (for bugs)
4. Provide browser and system information
5. Add screenshots or videos if helpful

## Technical Architecture

### Built With

- **TypeScript** - Type-safe JavaScript development
- **Three.js** - 3D graphics and rendering engine
- **Webpack** - Module bundling and build system
- **HTML5/CSS3** - Modern web standards and responsive design

### Project Structure

```
src/
├── entities/          # Game entities (Park, Ride, Visitor)
├── game/             # Core game systems (Engine, Scene, Camera)
├── ui/               # User interface components and modals
├── utils/            # Utility classes and helpers
├── types/            # TypeScript type definitions
└── index.ts          # Application entry point

public/
├── css/              # Stylesheets and themes
├── assets/           # Game assets and textures
└── index.html        # Main HTML file
```

### Key Components

- **Engine** - Main game engine managing rendering and updates
- **Park** - Central game state and management logic
- **Scene** - 3D scene setup and object management
- **UI System** - Modal windows and interface management
- **Event System** - Decoupled communication between components

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## About BeICT

Park Tycoon is created and maintained by [BeICT](https://beict.nl), a technology company focused on innovative web applications and digital experiences.

**BeICT** specializes in:
- Custom web application development
- 3D visualization and interactive experiences
- Progressive web applications
- Modern frontend technologies

### Contact

- **Website**: [https://beict.nl](https://beict.nl)
- **Email**: info@beict.nl

## Acknowledgments

- Inspired by classic theme park management games (RollerCoaster Tycoon, Planet Coaster)
- Three.js community for excellent 3D web graphics library
- Open source contributors and community testers
- Theme park enthusiasts and gaming communities worldwide

## Project Stats

![GitHub stars](https://img.shields.io/github/stars/BeICT/parks-web)
![GitHub forks](https://img.shields.io/github/forks/BeICT/parks-web)
![GitHub issues](https://img.shields.io/github/issues/BeICT/parks-web)
![GitHub pull requests](https://img.shields.io/github/issues-pr/BeICT/parks-web)

- **Language**: TypeScript
- **Framework**: Three.js
- **License**: MIT
- **Status**: Active Development
- **Version**: 1.0.0 Community Edition

---

**Ready to build your theme park empire? Start playing Park Tycoon today!**

[Play Online](https://your-demo-url.com) | [Report Bug](https://github.com/BeICT/parks-web/issues) | [Request Feature](https://github.com/BeICT/parks-web/issues)