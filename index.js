#!/usr/bin/env node
// index.ts
var keys = {
  "\x1B[A": 6,
  "\x1B[B": 7
};
var blocks = ["_", "g", "y", "⍘", "▌", "▐", "▀", "▄"];
var CHUNK_SIZE = 64;
var PLAYER_X = 3;
var EMPTY_CHUNK = new Array(CHUNK_SIZE).fill(0);
var init = () => {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
};
var log = (state, arg) => {
  process.stdout.write(`\r${arg} | Score: ${state.score} | Lvl: ${Math.floor(state.difficulty)}`);
};
var quit = () => {
  process.exit();
};
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
    log(newState, `GAME OVER!`);
    quit();
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
var initState = {
  score: 0,
  playerState: 4,
  playerFlipState: false,
  difficulty: 1,
  scroll: 0,
  chunk1: getChunk(0),
  chunk2: getChunk(1),
  chunks: null
};
var startGame = () => {
  let state = initState;
  setInterval(() => {
    state = step(state);
    render(state);
  }, 50);
  process.stdin.on("data", (key) => {
    if (key === "\x03")
      quit();
    const match = keys[key];
    if (match) {
      state.playerState = match;
      setTimeout(() => {
        state.playerState = 4;
      }, 500);
    }
  });
};
init();
startGame();
