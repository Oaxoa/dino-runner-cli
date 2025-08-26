// TYPES

type TState = {
	score: number,
	playerState: number,
	playerFlipState: boolean,
	difficulty: number;
	scroll: number;
	chunk1: number[];
	chunk2: number[];
	chunks: number[] | null;
};

// SETUP

const keys = {
	"\u001b[A": 6,
	"\u001b[B": 7,
};

const blocks = ['_', 'g', 'y', '⍘', '▌', '▐', '▀', '▄',];

const CHUNK_SIZE = 64;
const PLAYER_X = 3;
const EMPTY_CHUNK = new Array(CHUNK_SIZE).fill(0);

// PLATFORM SPECIFIC CODE

const init = () => {
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.setEncoding("utf8");
};

const log = (state: TState, arg: string) => {
	process.stdout.write(`\r${arg} | Score: ${state.score} | Lvl: ${Math.floor(state.difficulty)}`);
}

const quit = () => {
	process.exit();
}

// UTILS

const toRandomBlock = () => ({
	position: Math.floor(Math.random() * CHUNK_SIZE),
	block: Math.floor(Math.random() * 3) + 1
});

const getChunk = (difficulty: number) => {
	const numberOfObstacles = Math.round(difficulty);

	const obstacles = new Array(numberOfObstacles).fill(0).map(toRandomBlock);

	return obstacles.reduce((acc, obstacle) => {
		acc[obstacle.position] = obstacle.block;
		return acc;
	}, [...EMPTY_CHUNK]);
}

const checkCollision = (state: TState, chunks: number[]) => {
	const targetBlock = chunks[PLAYER_X];

	if (targetBlock !== 0) {
		state.score++;
	}

	const hitDown = (targetBlock === 1 || targetBlock === 2) && state.playerState !== 6;
	const hitUp = targetBlock === 3 && state.playerState !== 7

	return hitDown || hitUp;
}

const step = (state: TState) => {
	const newState = {...state};
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
}

const toRendered = (state: TState) => (acc: string, code: number) => {
	acc += code === 4 ? blocks[code + (state.playerFlipState ? 1 : 0)] : blocks[code];
	return acc;
}

const render = (state: TState) => {
	const withPlayer = [...state.chunks];
	withPlayer[PLAYER_X] = state.playerState;

	log(state, withPlayer.reduce(toRendered(state), ""));
}


/////////////////////////////

const initState: TState = {
	score: 0,
	playerState: 4,
	playerFlipState: false,
	difficulty: 1,
	scroll: 0,
	chunk1: getChunk(0),
	chunk2: getChunk(1),
	chunks: null,
};

const startGame = () => {
	let state = initState;

	// animate
	setInterval(() => {
		state = step(state);
		render(state);
	}, 50);

	// listen to kb events
	process.stdin.on("data", (key) => {
		if (key === "\u0003") quit(); // CTRL+C

		const match = keys[key];

		if (match) {
			// set the player to up or down
			state.playerState = match;

			setTimeout(() => {
				// reset the player
				state.playerState = 4;
			}, 500)
		}
	});
}

init();
startGame();
