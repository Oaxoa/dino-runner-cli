#!/usr/bin/env node
// index.ts
var intervalMain;
var keys = {
  " ": 6,
  "\x1B[A": 6,
  "\x1B[B": 7
};
var blocks = ["_", "g", "y", "⍘", "▌", "▐", "▀", "▄"];
var CHUNK_SIZE = 64;
var PLAYER_X = 3;
var EMPTY_CHUNK = new Array(CHUNK_SIZE).fill(0);
var toRandomBlock = () => ({
  position: Math.floor(Math.random() * CHUNK_SIZE),
  block: Math.floor(Math.random() * 3) + 1
});
var getChunk = (difficulty) => {
  const numberOfObstacles = Math.round(difficulty);
  const obstacles = new Array(numberOfObstacles).fill(0).map(toRandomBlock);
  return obstacles.reduce((acc, obstacle) => {
    acc[obstacle.position] = obstacle.block;
    return acc;
  }, [...EMPTY_CHUNK]);
};
var defaultState = {
  score: 0,
  playerState: 4,
  playerFlipState: false,
  difficulty: 1,
  scroll: 0,
  chunk1: getChunk(0),
  chunk2: getChunk(1),
  chunks: null
};
var OFFSET_UI = 24;
var clear = () => {
  process.stdout.write("\r\x1B[K");
};
var log = (state, arg) => {
  const width = (process.stdout.columns || 80) - OFFSET_UI;
  const output = arg.length > width ? arg.slice(0, width) : arg;
  clear();
  process.stdout.write(`\r${output} | Score: ${state.score} | Lvl: ${Math.floor(state.difficulty)}`);
};
var onStartKey = (key) => {
  if (key === " ") {
    startGame();
  }
};
var getPad = (len) => new Array(Math.max(len, 0)).fill("_").join("");
var padWithGround = (arg) => {
  const width = Math.min(process.stdout.columns - OFFSET_UI, CHUNK_SIZE);
  const diffLength = width - arg.length;
  const lengthBefore = Math.floor(diffLength / 2);
  const lengthAfter = Math.ceil(diffLength / 2);
  const padBefore = getPad(lengthBefore - 1);
  const padAfter = getPad(lengthAfter - 1);
  return `${padBefore} ${arg} ${padAfter}`;
};
var preInit = () => {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
};
var init = (state) => {
  log(state || { ...defaultState }, padWithGround("SPACE to start. ↑ = Jump, ↓ = Crouch"));
  process.stdin.on("data", onStartKey);
};
var endGame = (state) => {
  clearInterval(intervalMain);
  setTimeout(() => log(state, padWithGround("GAME OVER!")), 0);
  setTimeout(() => init(state), 2000);
};
var quit = () => {
  process.exit();
};
var checkCollision = (state, chunks) => {
  const targetBlock = chunks[PLAYER_X];
  if (targetBlock !== 0) {
    state.score++;
  }
  const hitDown = (targetBlock === 1 || targetBlock === 2) && state.playerState !== 6;
  const hitUp = targetBlock === 3 && state.playerState !== 7;
  return hitDown || hitUp;
};
var step = (state) => {
  const newState = { ...state };
  const chunks = [...newState.chunk1, ...newState.chunk2].slice(newState.scroll, newState.scroll + CHUNK_SIZE);
  newState.chunks = chunks;
  newState.scroll += 1;
  newState.scroll = newState.scroll % CHUNK_SIZE;
  if (newState.scroll === 0) {
    newState.chunk1 = newState.chunk2;
    newState.chunk2 = getChunk(newState.difficulty);
    newState.difficulty += 0.1;
  }
  if (checkCollision(newState, chunks)) {
    endGame(state);
  }
  newState.playerFlipState = !newState.playerFlipState;
  return newState;
};
var toRendered = (state) => (acc, code) => {
  acc += code === 4 ? blocks[code + (state.playerFlipState ? 1 : 0)] : blocks[code];
  return acc;
};
var render = (state) => {
  const withPlayer = [...state.chunks];
  withPlayer[PLAYER_X] = state.playerState;
  log(state, withPlayer.reduce(toRendered(state), ""));
};
var startGame = () => {
  let state = { ...defaultState };
  let timeout;
  process.stdin.off("data", onStartKey);
  intervalMain = setInterval(() => {
    state = step(state);
    render(state);
  }, 50);
  process.stdin.on("data", (key) => {
    if (key === "\x03")
      quit();
    const match = keys[key];
    if (match) {
      state.playerState = match;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        state.playerState = 4;
      }, 500);
    }
  });
};
preInit();
setTimeout(init, 500);
