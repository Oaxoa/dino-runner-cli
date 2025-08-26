# 🦕 Dino Runner CLI

A fast-paced terminal-based endless runner game inspired by the Chrome dinosaur game! Built with TypeScript and Node.js.
Navigate through obstacles, collect points, and see how long you can survive as the difficulty increases!

## 🎮 Game Preview

```
___▐_____________________________g____________y________________⍘ | Score: 15 | Lvl: 2
___▌____________________________g____________y________________⍘_ | Score: 15 | Lvl: 2
___▐___________________________g____________y________________⍘__ | Score: 15 | Lvl: 2
```

## 🚀 Quick Start

Github: https://github.com/Oaxoa/dino-runner-cli<br>
NPM: https://www.npmjs.com/package/dino-runner-cli

### Play Instantly (Recommended)

```bash
npx dino-runner-cli
```

### Or Install Globally

```bash
npm install -g dino-runner-cli
dino-runner-cli
```

## 🎯 How to Play

- **↑ (Up Arrow)**: Jump over ground obstacles (`g`, `y`)
- **↓ (Down Arrow)**: Duck under overhead obstacles (`⍘`)
- **Ctrl+C**: Quit the game

### Game Elements

- `▌▐`: Your character (alternates while running)
- `g`, `y`: Ground obstacles (jump over these)
- `⍘`: Overhead obstacles (duck under these)
- `_`: Safe ground

### Scoring

- **+1 point** for each obstacle you successfully avoid
- **Level increases** every 64 steps, making the game faster and more challenging
- **Game Over** when you hit an obstacle

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) runtime
- Node.js (for npx distribution)

### Local Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run index.ts

# Build for distribution
npm run build

# Test the built version locally
npm link
npx dino-runner-cli
```

## 🎨 Game Features

- **Endless Runner**: Procedurally generated obstacles
- **Progressive Difficulty**: Game speed increases with your score
- **Smooth Animation**: 50ms frame rate for fluid gameplay
- **Responsive Controls**: Instant response to arrow key inputs
- **Score Tracking**: Real-time score and level display
- **Cross-Platform**: Works on any terminal that supports ANSI escape codes

## 🏗️ Technical Details

Built with:

- **TypeScript** for type-safe game logic
- **Node.js** process APIs for terminal control
- **Bun** for fast development and building
- **npm** for package distribution

The game uses raw terminal input mode to capture arrow keys and renders using ANSI escape sequences for smooth
animation.

## 📦 Publishing

This package is designed to be distributed via npm and run with `npx`. The build process:

1. TypeScript source is compiled to JavaScript
2. Shebang (`#!/usr/bin/env node`) is added for CLI execution
3. Package is configured with proper `bin` entry point

## 🤝 Contributing

Feel free to submit issues and pull requests! Some ideas for contributions:

## 📄 License

MIT License - see package.json for details

## 👨‍💻 Author

Pierluigi Pesenti (gpantaa@gmail.com)
