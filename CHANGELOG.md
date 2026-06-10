# Changelog

All notable changes to Titanblade Games will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive issue templates for bug reports, feature requests, and questions
- Enhanced GitHub Actions workflows for CI/CD, security, and automation
- Dependabot configuration for automated dependency updates
- Code of Conduct and Contributing guidelines
- Security policy and vulnerability reporting process
- Lighthouse performance testing in deployment pipeline

### Changed
- Enhanced deployment workflow with better caching and performance optimization
- Improved repository structure with comprehensive documentation

### Security
- Added CodeQL security scanning
- Implemented secret detection with TruffleHog
- Added dependency review for pull requests

## [2.0.0] - 2025-06-09

### Added
- **Battle of the Druids Web Edition** - Complete Phaser.js conversion from Python
- **Isle of Adventure** - New point-and-click adventure game
- **Doom Riders** - New action-adventure game (initial release)
- GitHub Pages static hosting with custom domain
- Responsive design supporting desktop and mobile
- Enhanced visual effects with particle systems and screen shake
- Session-based gameplay (no save persistence between sessions)
- Touch-friendly controls for mobile devices

### Changed
- Migrated from Python/Pygame to JavaScript/Phaser.js for web compatibility
- Redesigned UI for better web experience
- Optimized asset loading with fallback systems
- Improved mobile touch handling and zoom functionality

### Technical
- Modular JavaScript architecture with scene-based system
- Automatic asset loading with colored fallbacks for missing images
- Cross-platform compatibility (works on any device with a browser)
- No installation required - instant browser access

## [1.0.0] - 2025-06-04

### Added
- **Battle of the Druids Python Edition** - Original Python/Pygame version
- Four character classes: Knight, Wizard, Rogue, Soldier
- Turn-based combat system with attack, special attack, and heal abilities
- Equipment system with weapons, armor, and accessories
- Druid Store with tiered equipment purchasing
- Nine unique locations with progressive unlock system
- Save system with multiple save slots
- Character progression and stat tracking
- Background music and sound effects support

### Game Features
- **Character Classes**:
  - Knight: Balanced warrior with strong defense
  - Wizard: Magical attacker with mana system
  - Rogue: Fast assassin with critical strikes
  - Soldier: Tough fighter with excellent all-around stats

- **Locations**:
  1. Arena - Starting location
  2. Maze - Labyrinthine challenges
  3. Haunted Mansion - Supernatural encounters
  4. Pirate Docks - Maritime battles
  5. Ancient City - Archaeological dangers
  6. Sacred Shrine - Divine guardians
  7. Volcanic Caves - Elemental fury
  8. Battle of Druids Castle - Ultimate challenge
  9. Bot Attack - Futuristic warfare

- **Equipment Tiers**:
  - Basic equipment (starting gear)
  - Iron/Steel tier (mid-game upgrades)
  - Dragon Scale tier (high-end equipment)
  - Legendary DRUID CLOAK (ultimate goal)

### Technical
- Built with Python 3.6+ and Pygame 2.0+
- 1400x900 resolution with 60 FPS gameplay
- Modular code structure for easy expansion
- JSON-based save system
- Asset loading with graceful fallbacks

## Development History

### Pre-1.0.0 (Development Phase)
- Initial concept and game design
- Character class balancing and combat mechanics
- Asset creation and audio integration
- User interface design and implementation
- Testing and bug fixing across multiple Python versions

---

## Legend

- **Added** - New features
- **Changed** - Changes in existing functionality  
- **Deprecated** - Soon-to-be removed features
- **Removed** - Now removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes and security improvements
- **Technical** - Infrastructure and development improvements

## Links

- [Play All Games](https://www.titanbladegames.com/) - Play the latest web versions
- [Repository](https://github.com/sunstar2423/titanblade-games) - Source code and development
- [Issues](https://github.com/sunstar2423/titanblade-games/issues) - Bug reports and feature requests
- [Releases](https://github.com/sunstar2423/titanblade-games/releases) - Download specific versions