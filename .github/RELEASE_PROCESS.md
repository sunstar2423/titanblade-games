# Release Process Guide

This document outlines the release process for Titanblade Games, including semantic versioning, release automation, and deployment procedures.

## 📋 Release Types

### Semantic Versioning (SemVer)

We follow [Semantic Versioning](https://semver.org/) with the format `MAJOR.MINOR.PATCH`:

- **MAJOR** (X.0.0) - Breaking changes or major new game releases
- **MINOR** (0.X.0) - New features, new game modes, or significant enhancements  
- **PATCH** (0.0.X) - Bug fixes, small improvements, or content updates

### Release Categories

| Type | Version Pattern | Example | Description |
|------|----------------|---------|-------------|
| **Major** | X.0.0 | 3.0.0 | New game launch, major architecture changes |
| **Minor** | X.Y.0 | 2.1.0 | New features, game modes, or significant updates |
| **Patch** | X.Y.Z | 2.1.1 | Bug fixes, balance changes, small improvements |
| **Pre-release** | X.Y.Z-alpha/beta.N | 2.1.0-beta.1 | Testing versions before official release |

## 🚀 Release Workflow

### Automatic Releases (Recommended)

1. **Create and push a tag:**
   ```bash
   git tag v2.1.0
   git push origin v2.1.0
   ```

2. **GitHub Actions automatically:**
   - Generates changelog from commit history
   - Creates release packages for web and Python versions
   - Publishes GitHub Release with assets
   - Deploys to production (for stable releases)
   - Updates CHANGELOG.md

### Manual Releases

1. **Navigate to Actions tab in GitHub**
2. **Select "Release Management" workflow**
3. **Click "Run workflow"**
4. **Enter release version** (e.g., v2.1.0)
5. **Choose if it's a pre-release**
6. **Click "Run workflow"**

## 📦 Release Assets

Each release automatically generates:

### Web Games Package
- **File:** `titanblade-games-web-vX.Y.Z.zip`
- **Contents:** All web games ready for hosting
- **Use case:** Self-hosting, offline play, or distribution

### Python Version Package  
- **File:** `battle-of-the-druids-python-vX.Y.Z.zip`
- **Contents:** Python/Pygame version with assets
- **Use case:** Desktop installation, modding, or local development

### Source Code Package
- **File:** `titanblade-games-source-vX.Y.Z.zip` 
- **Contents:** Complete source code repository
- **Use case:** Development, code review, or forking

## 📝 Release Notes Template

Release notes are automatically generated with this structure:

```markdown
## 🎮 What's New in vX.Y.Z

### Changes
- Automated list of commits since last release

### 🚀 Play the Games
- [Play All Games](https://www.titanbladegames.com/)
- [Download Python Version](download-link)

### 📥 Installation
Instructions for both web and Python versions

### 🎯 Game Features
Overview of current games and features

### 🔧 Technical Improvements
Development and infrastructure updates
```

## 🎯 Release Checklist

### Pre-Release (Manual Steps)

- [ ] **Code Quality**
  - [ ] All tests pass
  - [ ] No critical bugs or security issues
  - [ ] Code review completed
  - [ ] Documentation updated

- [ ] **Game Testing**
  - [ ] All games load correctly
  - [ ] Core gameplay mechanics work
  - [ ] Mobile compatibility verified
  - [ ] Browser compatibility tested

- [ ] **Version Planning**
  - [ ] Version number follows SemVer
  - [ ] CHANGELOG.md updated (if manual changes needed)
  - [ ] Breaking changes documented
  - [ ] Migration guide written (if needed)

### Release Process (Automated)

- [x] **CI/CD Pipeline**
  - [x] Security scans pass
  - [x] Automated tests complete
  - [x] Linting and code quality checks
  - [x] Asset validation

- [x] **Package Creation**
  - [x] Web games package generated
  - [x] Python version package created
  - [x] Source code archive prepared
  - [x] Asset optimization completed

- [x] **Deployment**
  - [x] GitHub Release created
  - [x] Release notes generated
  - [x] Production deployment (stable releases)
  - [x] CDN cache invalidation

### Post-Release

- [ ] **Verification**
  - [ ] Live website accessible
  - [ ] Download links work
  - [ ] Release assets complete
  - [ ] Version tags correct

- [ ] **Communication**
  - [ ] Social media announcement
  - [ ] Community notifications
  - [ ] Developer blog post (major releases)
  - [ ] Documentation site updated

## 🔄 Branch Strategy

### Main Branch
- **Purpose:** Production-ready code
- **Protection:** Requires PR reviews
- **Deployment:** Auto-deploys on tag creation
- **Quality:** All tests must pass

### Development Branch (Optional)
- **Purpose:** Integration of new features
- **Merging:** Feature branches merge here first
- **Testing:** Automated testing and review
- **Promotion:** Merged to main for releases

### Feature Branches
- **Naming:** `feature/description` or `bugfix/issue-number`
- **Lifecycle:** Created from main, merged via PR
- **Requirements:** Tests, documentation, review

## 🏷️ Tagging Strategy

### Tag Format
- **Pattern:** `vMAJOR.MINOR.PATCH[-PRERELEASE]`
- **Examples:** `v2.1.0`, `v2.2.0-beta.1`, `v3.0.0-alpha.2`

### Tag Creation
```bash
# Create annotated tag with message
git tag -a v2.1.0 -m "Release version 2.1.0"

# Push tag to trigger release
git push origin v2.1.0

# Create pre-release tag
git tag -a v2.1.0-beta.1 -m "Beta release 2.1.0-beta.1"
git push origin v2.1.0-beta.1
```

## 🔧 Emergency Releases

### Hotfix Process

1. **Create hotfix branch from main:**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-bug-fix
   ```

2. **Fix the issue and test thoroughly**

3. **Create PR to main:**
   ```bash
   git push origin hotfix/critical-bug-fix
   # Create PR via GitHub
   ```

4. **After merge, create emergency release:**
   ```bash
   git checkout main
   git pull origin main
   git tag v2.1.1
   git push origin v2.1.1
   ```

### Rollback Process

1. **Identify last known good version**
2. **Revert deployment to previous release**
3. **Create rollback tag if needed**
4. **Communicate issue to users**
5. **Fix issue and create new release**

## 📊 Release Metrics

### Tracking Success
- **Download counts** from GitHub Releases
- **Website traffic** to live games
- **Issue reports** after releases
- **Community feedback** and engagement

### Performance Monitoring
- **Lighthouse scores** for web performance
- **Load times** across different devices
- **Error rates** in production
- **User experience** metrics

## 🔐 Security Considerations

### Release Security
- **Code signing** for downloadable packages
- **Checksum verification** for release assets
- **Vulnerability scanning** before releases
- **Dependency auditing** in CI/CD

### Access Control
- **Release permissions** limited to maintainers
- **Tag protection** for version tags
- **Secrets management** for deployment keys
- **Audit logging** for release activities

## 📚 Resources

### Documentation
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases Guide](https://docs.github.com/en/repositories/releasing-projects-on-github)

### Tools
- **GitHub Actions** - Automated release workflow
- **GitHub CLI** - Manual release management
- **Lighthouse CI** - Performance testing

---

## 🎮 Game-Specific Release Notes

### Battle of the Druids
- Character balance changes
- New equipment tiers
- Combat system improvements
- Visual effect enhancements

### Isle of Adventure  
- New story chapters
- Puzzle difficulty adjustments
- Audio and music updates
- Scene transition improvements

### Doom Riders
- Gameplay mechanic additions
- Level design updates
- Performance optimizations
- Beta feature releases

---

**Happy releasing!** 🚀 This process ensures consistent, reliable releases while maintaining high quality standards for all Titanblade Games.