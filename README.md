# 🎢 Park Tycoon

A 3D theme park management game built with Three.js and TypeScript. Design and manage your own theme park, build exciting rides, and keep your visitors happy!

## 🎮 Features

- **3D Environment**: Fully 3D park with realistic lighting and shadows
- **Interactive Building**: Place rides, shops, paths, and decorations
- **Visitor Simulation**: AI-driven visitors with needs and preferences  
- **Park Management**: Monitor finances, visitor happiness, and park reputation
- **Camera Controls**: Free camera movement with WASD, mouse rotation, and zoom
- **Real-time Updates**: Dynamic park simulation with real-time statistics

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/parks-web.git
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

## 🎯 How to Play

### Controls

- **WASD** or **Arrow Keys**: Move camera
- **Right Click + Drag**: Rotate camera view
- **Mouse Wheel**: Zoom in/out
- **Q/E**: Rotate camera left/right
- **ESC**: Return to main menu

### Building

1. Select a building tool from the bottom toolbar
2. Click on the ground to place items
3. Use the delete tool to remove buildings
4. Monitor your budget and visitor happiness

### Game Elements

- **Rides**: Attract visitors and generate income
  - Roller Coaster: High excitement, expensive to build
  - Ferris Wheel: Family-friendly, moderate cost
  - Carousel: Low intensity, cheap to maintain

- **Shops**: Provide food and drinks for visitors
- **Paths**: Connect different areas of your park
- **Decorations**: Improve park aesthetics and visitor happiness

## 🛠️ Development

### Project Structure

```
src/
├── entities/       # Game entities (Park, Ride, Visitor)
├── game/          # Core game engine (Engine, Scene, Camera)
├── ui/            # User interface components
├── utils/         # Utility classes (EventManager, AssetLoader)
├── types/         # TypeScript type definitions
└── index.ts       # Main entry point
```

### Technologies Used

- **Three.js**: 3D graphics and rendering
- **TypeScript**: Type-safe JavaScript development
- **Webpack**: Module bundling and build system
- **HTML5 Canvas**: 2D UI elements and overlays

### Adding New Features

1. **New Ride Types**: Extend the `Ride` class in `src/entities/Ride.ts`
2. **UI Components**: Add new elements to `src/ui/`
3. **Game Mechanics**: Modify the game loop in `src/game/Engine.ts`
4. **Asset Loading**: Use `AssetLoader` for textures and models

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public methods

## 📦 Scripts

- `npm start`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run dev`: Build in development mode with watch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎨 Assets

The game uses procedurally generated textures and simple geometric shapes. To add custom assets:

1. Place textures in `public/assets/textures/`
2. Place 3D models in `public/assets/models/`
3. Update the asset loader in `src/utils/AssetLoader.ts`

## 🐛 Known Issues

- Audio system not yet implemented
- Save/Load functionality is placeholder
- Advanced ride customization not available
- Mobile device support needs optimization

## 🚀 Future Features

- [ ] Save/Load game functionality
- [ ] More ride types and customization
- [ ] Weather system
- [ ] Staff management
- [ ] Research and development tree
- [ ] Multiplayer support
- [ ] Mobile responsive design
- [ ] Sound effects and music

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/parks-web/issues) page
2. Create a new issue with detailed description
3. Include browser information and console errors

## 🙏 Acknowledgments

- Three.js community for excellent documentation
- Park simulation games for inspiration
- Open source contributors

---

Made with ❤️ and JavaScript