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

let intervalMain: NodeJS.Timeout;


const keys = {
	// space
	" ": 6,
	// up arrow
	"\u001b[A": 6,
	// down arrow
	"\u001b[B": 7,
};

const blocks = ['_', 'g', 'y', '⍘', '▌', '▐', '▀', '▄',];

const CHUNK_SIZE = 64;
const PLAYER_X = 3;
const EMPTY_CHUNK = new Array(CHUNK_SIZE).fill(0);

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

const defaultState: TState = {
	score: 0,
	playerState: 4,
	playerFlipState: false,
	difficulty: 1,
	scroll: 0,
	chunk1: getChunk(0),
	chunk2: getChunk(1),
	chunks: null,
};

// PLATFORM SPECIFIC CODE

const clear = () => {
	process.stdout.write('\r\x1b[K');
}
const log = (state: TState, arg: string) => {
	clear();
	process.stdout.write(`\r${arg} | Score: ${state.score} | Lvl: ${Math.floor(state.difficulty)}`);
}

const onStartKey = (key) => {
	if (key === " ") {
		startGame();
	}
};

const getPad = (len: number) => new Array(len).fill('_').join('');

const padWithGround = (arg: string) => {
	const diffLength = CHUNK_SIZE - arg.length;
	const lengthBefore = Math.floor(diffLength / 2);
	const lengthAfter = Math.ceil(diffLength / 2);
	const padBefore = getPad(lengthBefore - 1);
	const padAfter = getPad(lengthAfter - 1);

	return `${padBefore} ${arg} ${padAfter}`;
};

const init = (state: TState) => {
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.setEncoding("utf8");

	log(state || {...defaultState}, padWithGround('Press SPACE to start'));

	process.stdin.on("data", onStartKey);
};

const endGame = (state: TState) => {
	clearInterval(intervalMain);

	setTimeout(() => log(state, padWithGround('GAME OVER!')), 0);

	setTimeout(() => init(state), 2000);

}

const quit = () => {
	process.exit();
}

// UTILS


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
		endGame(state);
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


const startGame = () => {
	let state = {...defaultState};
	let timeout: NodeJS.Timeout;

	process.stdin.off("data", onStartKey);

	// animate
	intervalMain = setInterval(() => {
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
			clearTimeout(timeout);

			timeout = setTimeout(() => {
				// reset the player
				state.playerState = 4;
			}, 500)
		}
	});
}

init();
// startGame();
