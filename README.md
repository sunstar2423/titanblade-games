# 🎮 Titanblade Games - Open Source Collection

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Release](https://img.shields.io/github/v/release/sunstar2423/titanblade-games)](https://github.com/sunstar2423/titanblade-games/releases)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)

**Open source browser-based RPG games collection featuring turn-based combat, adventure, and strategic gameplay!**

🌟 **Completely free and open source** - Play, modify, learn, and contribute!

## 🎮 Games Collection

### Battle of the Druids - Web Edition
Complete turn-based RPG converted from Python/Pygame to JavaScript/Phaser.js. Experience epic battles, character progression, and strategic combat!

### Isle of Adventure  
Point-and-click adventure game with puzzles, exploration, and story-driven gameplay.

### Doom Riders
Fast-paced action-adventure game (in active development).

**Developed by Titan Blade Games & Open Source Contributors**

## 🎮 Play Now

**[► Play All Games](https://www.titanbladegames.com/)**

No downloads, no installation - just click and play!

## 🚀 How to Play

1. **Online**: Simply visit the game URL above
2. **Local Development**:
   ```bash
   cd battle-of-the-druids-web
   python3 -m http.server 8000
   # Open http://localhost:8000
   ```

3. **Gameplay**:
   - Create a character (Knight, Wizard, Rogue, or Soldier)
   - Explore the world map and battle enemies
   - Visit the store to buy better equipment
   - Check your inventory to see equipped items and stats
   - Progress through 9 unique locations

## ✨ Features

### ✅ Complete Game Systems
- **Character Classes**: Knight, Wizard, Rogue, Soldier with unique abilities
- **Equipment System**: Weapons, armor, accessories with tier progression
- **Magic System**: Wizard spells with mana management
- **Battle System**: Turn-based combat with visual effects
- **World Map**: 9 locations with progressive unlock requirements
- **Store System**: Tiered equipment purchasing with gold economy
- **Inventory System**: Visual equipment display and comprehensive stats

### ✅ Visual Enhancements
- **Particle Effects**: Spell effects, attack animations, damage numbers
- **Screen Shake**: Impact feedback for special attacks
- **Floating Text**: Real-time combat feedback
- **Dynamic Backgrounds**: Location-specific atmospheres
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Clean, intuitive interface with hover effects

### ✅ Web-Specific Features
- **Instant Loading**: No installation required
- **Session-Based**: Fresh adventure every time you play
- **Easy Sharing**: Just send a link
- **Mobile Support**: Touch-friendly controls
- **Modern Performance**: Smooth 60fps gameplay
- **Cross-Platform**: Works on any device with a browser

## 🎯 Game Progression

**Locations** (unlock by completing previous areas):
1. **Arena** - Starting location for new warriors
2. **Maze** - Labyrinthine challenges  
3. **Haunted Mansion** - Supernatural encounters
4. **Pirate Docks** - Maritime battles
5. **Ancient City** - Archaeological dangers
6. **Sacred Shrine** - Divine guardians
7. **Volcanic Caves** - Elemental fury
8. **Battle of Druids Castle** - The ultimate challenge
9. **Bot Attack** - Futuristic warfare

**Character Classes**:
- **Knight**: Balanced warrior with strong defense
- **Wizard**: Magical attacker with powerful spells and mana
- **Rogue**: Fast assassin with critical strike potential
- **Soldier**: Tough fighter with excellent all-around capabilities

## 🔧 Technical Implementation

- **Engine**: Phaser.js 3.70 with modular scene architecture
- **Deployment**: GitHub Pages with GitHub Actions CI/CD
- **Performance**: Optimized asset loading with fallback systems
- **Architecture**: Clean separation of concerns across multiple modules
- **Responsive**: Automatic scaling for different screen sizes

## 🏗️ Project Structure

```
js/
├── Game.js              # Main game configuration and initialization
├── GameData.js          # Game constants, character presets, locations
├── Character.js         # Character classes and combat mechanics
├── Equipment.js         # Equipment system and store logic
├── Effects.js           # Visual effects and animations
├── Assets.js            # Asset loading and fallback management
└── scenes/
    ├── PreloadScene.js  # Asset preloading
    ├── CharacterSelectionScene.js
    ├── MainMenuScene.js
    ├── WorldMapScene.js
    ├── BattleScene.js
    ├── InventoryScene.js
    └── StoreScene.js
```

## 🚀 Advantages Over Python Version

1. **Distribution**: Instant web access vs Python environment setup
2. **Performance**: Hardware-accelerated graphics and smooth animations
3. **Accessibility**: Cross-platform compatibility
4. **Development**: Faster iteration with modern web tools
5. **Features**: Enhanced visual effects and responsive design

## 🤝 Open Source & Contributing

### Why Open Source?
We believe great games are built by passionate communities! By making Titanblade Games open source, we enable:

- 🎮 **Learn Game Development** - Study real game code and mechanics
- 🛠️ **Customize & Mod** - Create your own versions and modifications  
- 🐛 **Fix Bugs Together** - Help improve the games for everyone
- 🎨 **Add Features** - Contribute new content, mechanics, or polish
- 📚 **Educational Use** - Perfect for learning JavaScript, game dev, and web technologies

### How to Contribute

**All contributions welcome!** Whether you're a seasoned developer or just starting out:

- 🐛 **Report Bugs** - Found an issue? [Create a bug report](https://github.com/sunstar2423/titanblade-games/issues/new?template=bug_report.yml)
- 💡 **Suggest Features** - Have ideas? [Request new features](https://github.com/sunstar2423/titanblade-games/issues/new?template=feature_request.yml)
- 🎨 **Create Assets** - Design sprites, audio, or backgrounds
- 💻 **Code Improvements** - Fix bugs, optimize performance, add features
- 📝 **Documentation** - Improve guides, write tutorials, translate content
- 🎮 **Game Testing** - Play and provide feedback

**Getting Started:**
1. 🍴 [Fork this repository](https://github.com/sunstar2423/titanblade-games/fork)
2. 📖 Read our [Contributing Guide](CONTRIBUTING.md)
3. 🔧 Set up your [development environment](CONTRIBUTING.md#getting-started)
4. 🚀 Submit your first [pull request](https://github.com/sunstar2423/titanblade-games/pulls)!

### 📄 License & Usage

**MIT License** - Use freely for any purpose!

✅ **Commercial use allowed**  
✅ **Modify and distribute**  
✅ **Private use permitted**  
✅ **No warranty or liability**

See [LICENSE](LICENSE) for full details.

### 🌟 Community

- 💬 **Discussions**: [GitHub Discussions](https://github.com/sunstar2423/titanblade-games/discussions)
- 🐛 **Issues**: [Bug Reports & Features](https://github.com/sunstar2423/titanblade-games/issues)
- 📋 **Project Board**: [Development Progress](https://github.com/sunstar2423/titanblade-games/projects)
- 📦 **Releases**: [Version History](https://github.com/sunstar2423/titanblade-games/releases)

## 🎪 Ready for Adventure!

Titanblade Games showcases modern web game development capabilities while delivering complete, engaging gaming experiences. Perfect for:

- 🎮 **Players** - Hours of strategic combat and adventure
- 👨‍💻 **Developers** - Learning JavaScript game development
- 🏫 **Educators** - Teaching game programming concepts
- 🎨 **Creators** - Building upon existing game foundations

## 🙏 Acknowledgments

Thanks to all contributors who help make these games better:

<!-- contributors will be automatically added here by GitHub -->

Special thanks to the open source game development community and the creators of:
- [Phaser.js](https://phaser.io/) - Awesome HTML5 game framework
- [Pygame](https://www.pygame.org/) - Original Python game development platform
- [GitHub](https://github.com/) - For hosting and collaboration tools

---

**© 2025 Titan Blade Games & Contributors** - Licensed under MIT License  
🌟 **Star this repo** if you enjoyed the games! | 🍴 **Fork it** to make it your own!