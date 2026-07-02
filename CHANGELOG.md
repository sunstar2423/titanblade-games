# Changelog

All notable changes to Titanblade Games will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Isle of Adventure - The Inland Wilds & New Artwork

#### Added
- Eight new locations built around the newly added artwork:
  - **The Mountain Pass** (`mountainpass.png`) — Captain Doris of the Mountain Watch guards the gate after 14 years without an interesting shift
  - **The Toll Bridge** (`trollbridge.png`) — the Troll Brothers' cousins went into infrastructure; the toll is one (1) good joke, choose from three
  - **The Raging River** (`ragingriver.png`) — the bridge is out; swim it, walk the log, or compliment the union beavers
  - **The Peaceful Meadow** (`peaceful meadow.png`) — gateway to the Inland Wilds, patrolled by deer with opinions
  - **The Fairy Lake** (`peacefulfansyscenelake.png`) — Lady Marina, Regional Manager of Mystical Lakes (Interim), is out of swords but has a Lucky Pebble
  - **The Elf Village** (`elvestreehutvillage.png`) — Aelenwood, where modesty was removed from the curriculum in the Third Age
  - **The Elven Palace** (`elves palace interior.png`) — amuse Queen Elarwen the Eternally Unimpressed to earn the Elven Charm (and waybread)
  - **The Whispering Ruins** (`ruinsonanisland.png`) — a riddle door guards the lore of the Portal Makers and the Ancient Coin
- The Fork now offers three paths (Mountain Road, Meadow Trail, Coastal Path); Pirate Island gains an "Explore the Ruins" option
- Three optional trinkets (Lucky Pebble, Elven Charm, Ancient Coin) tracked as "Optional wonders discovered" in the victory report
- Beach Cove and the Secret Pirate Base now display their intended artwork (`beachscene.png`, `piratebase.png`)

#### Fixed
- CI `test` job could never pass: it installed html5validator from apt, which doesn't exist there — now installed via pip, with the deploy-time `{{GOOGLE_ANALYTICS_ID}}` placeholder excluded from URL validation
- CI `security` job (super-linter) failed on every run because the checkout was shallow — now uses `fetch-depth: 0`
- Invalid `http-equiv` meta tags (X-Content-Type-Options, Referrer-Policy, Permissions-Policy) in both web games — these are response-header-only directives browsers ignore as meta tags; Referrer-Policy replaced with the valid `<meta name="referrer">` form

### Isle of Adventure - Story Expansion & Overhaul

#### Added
- **The Beach Cove** — a new optional location off the Rocky Shore, home of Gary the professional castaway (rescued 14 times, keeps coming back). Gary dispenses quest hints, comedy, and emergency bread if you missed the loaf in the house
- **The Secret Pirate Base** — a new location where the Bottle of Rum must now be *earned* by beating Cap'n Barnacles in a three-round Duel of Wits (choose the right comeback; wrong answers are funny and let you retry)
- The two new scenes use `images/beachscene.png` and `images/piratebase.png` automatically once those files are added, and gracefully fall back to existing art until then
- Alternate troll solution: toss your bread at the Troll Brothers and stroll past while they brawl over the crusty end (consumes the previously useless Food item)
- Every dialogue choice now gets its own unique NPC response (trolls, ogre, squid, pirates, sorcerer, Gary) instead of one canned reply for all three options
- Quest guidance: village shows sacred-item progress (0/3), house shows a gear checklist, fork gives contextual hints, and the sorcerer names where each missing item can be found
- Victory screen now shows an adventure report (locations explored, foes bested, items pocketed, and whether baked goods were deployed diplomatically)
- Ambient atmosphere: fireflies in the forest/village, embers in the cave and pirate camps, bubbles at sea, sparkles in magical rooms, sea spray on the shore
- Cinematic polish: fade transitions between scenes, slow Ken Burns drift on backgrounds, floating collectible items, character idle animations, loading percentage readout

#### Fixed
- A failed video load could crash the whole preloader and leave players on a black screen in browsers without the right codec support; the intro video is now optional everywhere it is used
- Sentry initialization crashed the page for players using adblockers (Sentry CDN blocked → `Sentry is not defined`); it is now guarded
- Scene layouts previously squeezed everything into the top 550px of the 768px canvas; all scenes now use the full play area with a consistent layout grid

#### Changed
- All 16 scenes refactored onto a shared `BaseScene` (backgrounds with fallback support, buttons, dialogue choices, transitions, music, particles), removing ~600 lines of duplicated code
- Buttons polished: gold borders, drop shadows, hover growth, hand cursor, larger touch targets
- Writing pass across the whole game for wittier, more immersive storytelling

### Isle of Adventure - Review & Improvements

#### Added
- Save/load persistence via `localStorage`: progress (inventory, visited locations, defeated enemies) is now stored automatically as you play
- "Continue Game" on the main menu now actually resumes a saved game; it is greyed out when no save exists
- Global mute/unmute button (🔊/🔇) in the top-left corner that toggles all audio

#### Fixed
- Background music restarted from the beginning on every scene change between scenes that share a track; the same track now keeps playing seamlessly across those transitions
- Main menu layout: the "Opening Credits" button overlapped the "Progress Reset!" confirmation text; menu buttons are now spaced without overlap
- Scene titles (Rocky Mountains, Rocky Shore, Out at Sea, Giant Squid Battle) lacked an outline and were hard to read over bright backgrounds; all titles now use a consistent black stroke

#### Changed
- The inventory panel is hidden when empty (e.g. on the menu) and shows a live item count in its heading

### Stick Wars - Major Overhaul

#### Fixed
- Melee attacks dealt damage every frame of the swing animation (~20x intended damage); each swing now lands once at the moment of impact
- A scoping bug (`const Combat = window.Combat || ...`) crashed the frame whenever a projectile or explosion hit, skipping game logic and suppressing all hit effects
- Enemy ranged attacks fired backwards (away from their target) due to a facing-direction mismatch with `Object3D.lookAt`
- Player movement used an inverted rotation, so WASD drifted in the wrong direction at most camera angles; first-person mode ignored facing entirely
- Enemy health bars never faced the camera (looked at the ambient light instead)
- Weapon key 7 did nothing despite the "Press 7 to equip" message; keyboard weapon switching now also syncs the weapon-bar highlight
- Player death removed the camera from the scene and the game kept running; there is now a proper game-over state that freezes the battle
- Damage flash could get stuck leaving figures permanently red when hits overlapped
- Bomb unlock threshold was inconsistent (20 vs 200 coins); unlocks are now 100 coins (rifle) and 150 coins (bomb) with progress shown in the HUD
- Enemies could spawn on top of the player; they now spawn in a ring around the player and avoid obstacles
- Mobile attack button was unreachable (covered by the look-touch area) and now supports hold-to-attack
- Local 2P passed a color where a character type was expected, player 2's controls never registered, and player 2's attacks damaged player 1; all fixed, and player 2 is tinted blue
- Removed the non-functional online multiplayer buttons (connection handshake could never complete)

#### Changed
- Full combat rebalance: player 200 HP, enemy HP 50-140 by type, sensible weapon damage/cooldown tradeoffs, gentler wave scaling
- Smarter AI: melee types charge with type-specific weapons, archers/mages keep distance and kite, enemies slide around obstacles and no longer stack on one spot
- Player projectiles follow the camera pitch so you can aim up and down

#### Added
- Procedural sound effects (Web Audio): attacks, hits, coins, explosions, reloads, wave start, unlocks, victory/defeat
- Visual HUD health bar, damage vignette when hurt, reload indicator, named weapon slots with lock state
- Pause (P key), hold-to-attack on desktop and mobile, coin magnet pickup, richer wave/victory/defeat screens with run stats

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
- AWS S3 static hosting with CloudFront CDN
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

- [Battle of the Druids Web](http://battle-of-the-druids-web.s3-website-ap-southeast-2.amazonaws.com/) - Play the latest web version
- [Repository](https://github.com/sunstar2423/titanblade-games) - Source code and development
- [Issues](https://github.com/sunstar2423/titanblade-games/issues) - Bug reports and feature requests
- [Releases](https://github.com/sunstar2423/titanblade-games/releases) - Download specific versions