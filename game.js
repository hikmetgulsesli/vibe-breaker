// Vibe-Breaker - Endless Runner Game
// ===================================

// ============================================================
// GAME STATE MACHINE
// ============================================================

/**
 * @readonly
 * @enum {string}
 */
const GameState = Object.freeze({
    START: 'START',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER'
});

/**
 * State transition rules
 * @type {Object.<GameState, GameState[]>}
 */
const STATE_TRANSITIONS = Object.freeze({
    [GameState.START]: [GameState.PLAYING],
    [GameState.PLAYING]: [GameState.GAME_OVER],
    [GameState.GAME_OVER]: [GameState.START, GameState.PLAYING]
});

/**
 * Game State Machine
 * Manages game state transitions and validation
 */
class StateMachine {
    constructor() {
        /** @type {GameState} */
        this._state = GameState.START;
        /** @type {number} */
        this._stateStartTime = performance.now();
        /** @type {Map<GameState, Function[]>} */
        this._listeners = new Map();
        /** @type {Map<string, Function>} */
        this._transitionListeners = new Map();
    }

    /**
     * Get current state
     * @returns {GameState}
     */
    get state() {
        return this._state;
    }

    /**
     * Get time spent in current state (ms)
     * @returns {number}
     */
    get stateDuration() {
        return performance.now() - this._stateStartTime;
    }

    /**
     * Check if transition is valid
     * @param {GameState} fromState
     * @param {GameState} toState
     * @returns {boolean}
     */
    isValidTransition(fromState, toState) {
        const allowedTransitions = STATE_TRANSITIONS[fromState];
        return allowedTransitions && allowedTransitions.includes(toState);
    }

    /**
     * Transition to new state
     * @param {GameState} newState
     * @returns {boolean} - true if transition succeeded
     */
    transition(newState) {
        if (!this.isValidTransition(this._state, newState)) {
            console.warn(`Invalid state transition: ${this._state} -> ${newState}`);
            return false;
        }

        const previousState = this._state;
        this._state = newState;
        this._stateStartTime = performance.now();

        // Notify transition listeners
        const transitionKey = `${previousState}->${newState}`;
        const transitionListener = this._transitionListeners.get(transitionKey);
        if (transitionListener) {
            transitionListener(previousState, newState);
        }

        // Notify state listeners
        const listeners = this._listeners.get(newState) || [];
        listeners.forEach(callback => callback(newState, previousState));

        return true;
    }

    /**
     * Add listener for state entry
     * @param {GameState} state
     * @param {Function} callback
     */
    onEnter(state, callback) {
        if (!this._listeners.has(state)) {
            this._listeners.set(state, []);
        }
        this._listeners.get(state).push(callback);
    }

    /**
     * Add listener for specific transition
     * @param {GameState} fromState
     * @param {GameState} toState
     * @param {Function} callback
     */
    onTransition(fromState, toState, callback) {
        const key = `${fromState}->${toState}`;
        this._transitionListeners.set(key, callback);
    }

    /**
     * Check if current state matches
     * @param {GameState} state
     * @returns {boolean}
     */
    is(state) {
        return this._state === state;
    }
}

// ============================================================
// GAME LOOP WITH DELTA TIME
// ============================================================

/**
 * Game Loop Manager
 * Handles requestAnimationFrame with delta time calculation
 */
class GameLoop {
    constructor() {
        /** @type {number|null} */
        this._animationFrameId = null;
        /** @type {number} */
        this._lastTimestamp = 0;
        /** @type {number} */
        this._deltaTime = 0;
        /** @type {number} */
        this._fps = 0;
        /** @type {number} */
        this._frameCount = 0;
        /** @type {number} */
        this._fpsUpdateTime = 0;
        /** @type {Function|null} */
        this._updateCallback = null;
        /** @type {Function|null} */
        this._renderCallback = null;
        /** @type {boolean} */
        this._isRunning = false;
        /** @type {number} */
        this._targetFPS = 60;
        /** @type {number} */
        this._targetFrameTime = 1000 / 60;
    }

    /**
     * Get current delta time in seconds
     * @returns {number}
     */
    get deltaTime() {
        return this._deltaTime;
    }

    /**
     * Get current FPS
     * @returns {number}
     */
     get fps() {
        return this._fps;
    }

    /**
     * Set update callback
     * @param {Function} callback - receives deltaTime in seconds
     */
    onUpdate(callback) {
        this._updateCallback = callback;
    }

    /**
     * Set render callback
     * @param {Function} callback
     */
    onRender(callback) {
        this._renderCallback = callback;
    }

    /**
     * Start the game loop
     */
    start() {
        if (this._isRunning) return;
        this._isRunning = true;
        this._lastTimestamp = performance.now();
        this._fpsUpdateTime = this._lastTimestamp;
        this._frameCount = 0;
        this._animationFrameId = requestAnimationFrame((timestamp) => this._loop(timestamp));
    }

    /**
     * Stop the game loop
     */
    stop() {
        this._isRunning = false;
        if (this._animationFrameId !== null) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
    }

    /**
     * Main loop function
     * @param {number} timestamp
     * @private
     */
    _loop(timestamp) {
        if (!this._isRunning) return;

        // Calculate delta time
        this._deltaTime = (timestamp - this._lastTimestamp) / 1000;
        this._lastTimestamp = timestamp;

        // Cap delta time to prevent large jumps (e.g., after tab switch)
        const maxDeltaTime = 0.1; // 100ms max
        if (this._deltaTime > maxDeltaTime) {
            this._deltaTime = maxDeltaTime;
        }

        // Calculate FPS
        this._frameCount++;
        if (timestamp - this._fpsUpdateTime >= 1000) {
            this._fps = this._frameCount;
            this._frameCount = 0;
            this._fpsUpdateTime = timestamp;
        }

        // Update
        if (this._updateCallback) {
            this._updateCallback(this._deltaTime);
        }

        // Render
        if (this._renderCallback) {
            this._renderCallback();
        }

        // Schedule next frame
        this._animationFrameId = requestAnimationFrame((t) => this._loop(t));
    }
}

// ============================================================
// DESIGN TOKENS - Colors, Typography, Spacing
// ============================================================

/** @type {Object} Design token colors */
const TOKENS = {
    colors: {
        // Primary brand color
        primary: '#f43325',
        primaryLight: 'rgba(244, 51, 37, 0.1)',
        primaryBorder: 'rgba(244, 51, 37, 0.2)',
        primaryGlow: 'rgba(244, 51, 37, 0.5)',

        // Background colors
        backgroundDark: '#0f172a',
        backgroundGradientStart: '#1a1a2e',
        backgroundGradientEnd: '#16213e',
        backgroundOverlay: 'rgba(0, 0, 0, 0.8)',

        // Surface colors
        surfaceDark: '#221110',
        surfaceLight: '#f8f6f5',

        // Text colors
        textPrimary: '#ffffff',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',

        // Game-specific colors
        ground: '#0f3460',
        character: '#e94560',
        characterOutline: '#ff8fa3',
        obstacle1: '#533483',
        obstacle2: '#7952b3',
        obstacleBorder: '#9b6dd3',
        highScore: '#ffd700',
        mountainFar: '#0f1525',
        groundDetail: '#0a1a2e',
        groundLine: '#1a4a7a'
    },

    typography: {
        fontDisplay: '"Space Grotesk", monospace',
        fontMono: '"Courier New", monospace',
        fontMaterial: '"Material Symbols Outlined", sans-serif',

        // Font sizes
        sizeTitle: '48px',
        sizeTitleLarge: '72px',
        sizeScore: '24px',
        sizeButton: '20px',
        sizeBody: '18px',
        sizeSmall: '14px'
    },

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    borderRadius: {
        default: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
    }
};

// ============================================================
// GAME CONSTANTS - Physics, Dimensions, Gameplay Parameters
// ============================================================

/** @type {Object} Canvas dimensions */
const CANVAS = {
    width: 800,
    height: 400,
    aspectRatio: 2
};

/** @type {Object} Game physics parameters */
const PHYSICS = {
    gravity: 0.8,
    jumpVelocity: -15,
    groundHeight: 60,
    get groundY() { return CANVAS.height - this.groundHeight; }
};

/** @type {Object} Character properties */
const CHARACTER = {
    x: 150,
    size: 40,
    width: 40,
    height: 40,
    cornerRadius: 8,
    eyeSize: 8,
    pupilSize: 4,
    squashFactor: 0.7,
    stretchFactor: 1.3,
    returnSpeed: 0.2
};

/** @type {Object} Obstacle properties */
const OBSTACLE = {
    width: 30,
    minGap: 300,
    heights: [40, 60, 80],
    colors: {
        start: '#533483',
        end: '#7952b3'
    },
    borderColor: '#9b6dd3',
    borderWidth: 2,
    hitboxPadding: 4
};

/** @type {Object} Speed and difficulty settings */
const SPEED = {
    initial: 6,
    max: 12,
    increment: 0.5,
    incrementScore: 10
};

/** @type {Object} Background parallax settings */
const PARALLAX = {
    layers: [
        { speed: 0.5, color: '#0f1525' },
        { speed: 1, color: '#0a1a2e' }
    ],
    mountainCount: 3,
    detailCount: 4,
    mountainSpacing: 400,
    detailSpacing: 200
};

/** @type {Object} Score display settings */
const SCORE = {
    padding: 20,
    yPosition: 35,
    highScoreYPosition: 35
};

/** @type {Object} LocalStorage keys */
const STORAGE = {
    highScore: 'vibe-breaker-highscore'
};

// ============================================================
// DOM ELEMENTS
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const gameOverHighScoreEl = document.getElementById('game-over-high-score');
const newHighScoreBadge = document.getElementById('new-high-score-badge');
const playAgainBtn = document.getElementById('play-again-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const startHighScoreEl = document.getElementById('start-high-score');
const currentScoreEl = document.getElementById('current-score');
const hudHighScoreEl = document.getElementById('hud-high-score');
const gameHud = document.getElementById('game-hud');

// ============================================================
// GAME STATE MANAGER
// ============================================================

const stateMachine = new StateMachine();
const gameLoop = new GameLoop();

let score = 0;
let highScore = 0;
let obstacleSpeed = SPEED.initial;
let obstacles = [];

// Parallax background layers
let bgLayers = [
    { x: 0, speed: PARALLAX.layers[0].speed },
    { x: 0, speed: PARALLAX.layers[1].speed }
];

// Character state
const character = {
    x: CHARACTER.x,
    y: PHYSICS.groundY - CHARACTER.size,
    width: CHARACTER.width,
    height: CHARACTER.height,
    velocityY: 0,
    isJumping: false,
    squash: 1,
    stretch: 1
};

// ============================================================
// INITIALIZATION
// ============================================================

function init() {
    loadHighScore();
    setupEventListeners();
    setupStateMachine();
    setupGameLoop();

    // Start with start screen visible
    showStartScreen();

    // Start the game loop
    gameLoop.start();
}

function setupStateMachine() {
    // START state - show start screen
    stateMachine.onEnter(GameState.START, () => {
        hideAllScreens();
        showStartScreen();
    });

    // PLAYING state - hide overlays, show HUD, reset game
    stateMachine.onEnter(GameState.PLAYING, () => {
        hideAllScreens();
        showHud();
        resetGame();
    });

    // GAME_OVER state - hide HUD, show game over screen
    stateMachine.onEnter(GameState.GAME_OVER, () => {
        hideHud();
        updateGameOverScreen();
        showGameOverScreen();
    });

    // Transition: START -> PLAYING
    stateMachine.onTransition(GameState.START, GameState.PLAYING, () => {
        console.log('Game started!');
    });

    // Transition: PLAYING -> GAME_OVER
    stateMachine.onTransition(GameState.PLAYING, GameState.GAME_OVER, () => {
        console.log('Game over!');
    });

    // Transition: GAME_OVER -> START
    stateMachine.onTransition(GameState.GAME_OVER, GameState.START, () => {
        console.log('Returning to menu');
    });

    // Transition: GAME_OVER -> PLAYING (restart)
    stateMachine.onTransition(GameState.GAME_OVER, GameState.PLAYING, () => {
        console.log('Game restarted!');
    });
}

function setupGameLoop() {
    gameLoop.onUpdate((deltaTime) => {
        update(deltaTime);
    });

    gameLoop.onRender(() => {
        render();
    });
}

function loadHighScore() {
    const stored = localStorage.getItem(STORAGE.highScore);
    highScore = stored ? parseInt(stored, 10) : 0;
}

function saveHighScore() {
    localStorage.setItem(STORAGE.highScore, highScore.toString());
}

function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleInput();
        }
    });

    // Touch/click controls
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleInput();
    });
    canvas.addEventListener('click', handleInput);

    // Play again button
    playAgainBtn.addEventListener('click', () => {
        stateMachine.transition(GameState.PLAYING);
    });

    // Main menu button
    mainMenuBtn.addEventListener('click', () => {
        stateMachine.transition(GameState.START);
    });
}

function handleInput() {
    if (stateMachine.is(GameState.START)) {
        stateMachine.transition(GameState.PLAYING);
    } else if (stateMachine.is(GameState.PLAYING) && !character.isJumping) {
        jump();
    } else if (stateMachine.is(GameState.GAME_OVER)) {
        stateMachine.transition(GameState.PLAYING);
    }
}

function resetGame() {
    score = 0;
    obstacleSpeed = SPEED.initial;
    obstacles = [];
    character.y = PHYSICS.groundY - CHARACTER.size;
    character.velocityY = 0;
    character.isJumping = false;
    character.squash = 1;
    character.stretch = 1;
    bgLayers.forEach(layer => { layer.x = 0; });
    updateHud();
}

function jump() {
    character.velocityY = PHYSICS.jumpVelocity;
    character.isJumping = true;
    character.squash = CHARACTER.squashFactor;
    character.stretch = CHARACTER.stretchFactor;
}

function showStartScreen() {
    hideAllScreens();
    startScreen.classList.remove('hidden');
    if (highScore > 0) {
        startHighScoreEl.textContent = highScore.toString().padStart(6, '0');
        startHighScoreEl.parentElement.style.display = 'block';
    } else {
        startHighScoreEl.parentElement.style.display = 'none';
    }
}

function showGameOverScreen() {
    gameOverScreen.classList.remove('hidden');
}

function hideAllScreens() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    hideHud();
}

function showHud() {
    if (gameHud) {
        gameHud.classList.remove('hidden');
    }
}

function hideHud() {
    if (gameHud) {
        gameHud.classList.add('hidden');
    }
}

function updateGameOverScreen() {
    const isNewHighScore = score > highScore;
    if (isNewHighScore) {
        highScore = score;
        saveHighScore();
    }

    finalScoreEl.textContent = score.toString().padStart(6, '0');
    gameOverHighScoreEl.textContent = highScore.toString().padStart(6, '0');

    if (isNewHighScore && score > 0) {
        newHighScoreBadge.classList.remove('hidden');
    } else {
        newHighScoreBadge.classList.add('hidden');
    }
}

function updateHud() {
    if (currentScoreEl) {
        currentScoreEl.textContent = score.toString().padStart(6, '0');
    }
    if (hudHighScoreEl) {
        hudHighScoreEl.textContent = highScore.toString().padStart(6, '0');
    }
}

function triggerGameOver() {
    stateMachine.transition(GameState.GAME_OVER);
}

// ============================================================
// GAME LOOP UPDATE
// ============================================================

function update(deltaTime) {
    // Update character squash/stretch animation (always runs)
    // Use deltaTime for frame-rate independent animation
    const dtFactor = deltaTime * 60; // Factor to normalize movement to 60 FPS
    const animSpeed = CHARACTER.returnSpeed * dtFactor;
    character.squash += (1 - character.squash) * animSpeed;
    character.stretch += (1 - character.stretch) * animSpeed;

    // Update background (runs in all states for visual continuity)
    bgLayers.forEach(layer => {
        layer.x -= (layer.speed * obstacleSpeed) * dtFactor;
        if (layer.x <= -CANVAS.width) {
            layer.x += CANVAS.width;
        }
    });

    // Only update game logic when playing
    if (!stateMachine.is(GameState.PLAYING)) return;

    // Update character physics
    if (character.isJumping) {
        character.velocityY += PHYSICS.gravity * dtFactor;
        character.y += character.velocityY * dtFactor;

        // Landing
        if (character.y >= PHYSICS.groundY - CHARACTER.size) {
            character.y = PHYSICS.groundY - CHARACTER.size;
            character.velocityY = 0;
            character.isJumping = false;
            character.squash = CHARACTER.stretchFactor;
            character.stretch = CHARACTER.squashFactor;
        }
    }

    // Update obstacles
    updateObstacles(dtFactor);

    // Check collision
    checkCollision();

    // Update speed based on score
    obstacleSpeed = Math.min(
        SPEED.initial + Math.floor(score / SPEED.incrementScore) * SPEED.increment,
        SPEED.max
    );

    // Update HUD
    updateHud();
}

function updateObstacles(dtFactor) {
    // Move existing obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed * dtFactor;
    });

    // Remove off-screen obstacles
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    // Spawn new obstacles
    const rightmostX = obstacles.length > 0
        ? Math.max(...obstacles.map(o => o.x + o.width))
        : CANVAS.width;

    if (rightmostX < CANVAS.width - OBSTACLE.minGap - Math.random() * 200) {
        spawnObstacle();
    }

    // Update score for passed obstacles
    obstacles.forEach(obstacle => {
        if (!obstacle.passed && obstacle.x + obstacle.width < CHARACTER.x) {
            obstacle.passed = true;
            score++;
        }
    });
}

function spawnObstacle() {
    const height = OBSTACLE.heights[Math.floor(Math.random() * OBSTACLE.heights.length)];

    obstacles.push({
        x: CANVAS.width,
        y: PHYSICS.groundY - height,
        width: OBSTACLE.width,
        height: height,
        passed: false
    });
}

function checkCollision() {
    const charBox = {
        x: character.x + 5,
        y: character.y + 5,
        width: character.width - 10,
        height: character.height - 10
    };

    for (const obstacle of obstacles) {
        const obsBox = {
            x: obstacle.x + OBSTACLE.hitboxPadding,
            y: obstacle.y + OBSTACLE.hitboxPadding,
            width: obstacle.width - (OBSTACLE.hitboxPadding * 2),
            height: obstacle.height - (OBSTACLE.hitboxPadding * 2)
        };

        if (charBox.x < obsBox.x + obsBox.width &&
            charBox.x + charBox.width > obsBox.x &&
            charBox.y < obsBox.y + obsBox.height &&
            charBox.y + charBox.height > obsBox.y) {
            triggerGameOver();
            return;
        }
    }
}

// ============================================================
// RENDERING
// ============================================================

function render() {
    // Clear canvas
    ctx.fillStyle = TOKENS.colors.backgroundGradientStart;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS.height);
    gradient.addColorStop(0, TOKENS.colors.backgroundGradientStart);
    gradient.addColorStop(1, TOKENS.colors.backgroundGradientEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

    // Draw parallax background
    drawBackground();

    // Draw ground
    ctx.fillStyle = TOKENS.colors.ground;
    ctx.fillRect(0, PHYSICS.groundY, CANVAS.width, PHYSICS.groundHeight);

    // Draw ground line
    ctx.strokeStyle = TOKENS.colors.groundLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, PHYSICS.groundY);
    ctx.lineTo(CANVAS.width, PHYSICS.groundY);
    ctx.stroke();

    // Draw obstacles
    obstacles.forEach(obstacle => {
        const obsGradient = ctx.createLinearGradient(
            obstacle.x, obstacle.y,
            obstacle.x, obstacle.y + obstacle.height
        );
        obsGradient.addColorStop(0, TOKENS.colors.obstacle1);
        obsGradient.addColorStop(1, TOKENS.colors.obstacle2);

        ctx.fillStyle = obsGradient;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Obstacle border
        ctx.strokeStyle = TOKENS.colors.obstacleBorder;
        ctx.lineWidth = OBSTACLE.borderWidth;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw character
    drawCharacter();

    // Draw HUD when playing (behind the DOM HUD, but just in case)
    if (stateMachine.is(GameState.PLAYING)) {
        drawScore();
    }
}

function drawBackground() {
    // Far layer (mountains silhouette)
    ctx.fillStyle = PARALLAX.layers[0].color;
    const farOffset = bgLayers[0].x;
    for (let i = 0; i < PARALLAX.mountainCount; i++) {
        const x = farOffset + (i * PARALLAX.mountainSpacing);
        drawMountain(x, PHYSICS.groundY - 100, 150, 120);
        drawMountain(x + 200, PHYSICS.groundY - 80, 100, 80);
    }

    // Near layer (ground details)
    ctx.fillStyle = PARALLAX.layers[1].color;
    const nearOffset = bgLayers[1].x;
    for (let i = 0; i < PARALLAX.detailCount; i++) {
        const x = nearOffset + (i * PARALLAX.detailSpacing);
        ctx.fillRect(x, PHYSICS.groundY - 20, 40, 20);
    }
}

function drawMountain(x, baseY, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x + width / 2, baseY - height);
    ctx.lineTo(x + width, baseY);
    ctx.closePath();
    ctx.fill();
}

function drawCharacter() {
    const centerX = character.x + character.width / 2;
    const centerY = character.y + character.height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(character.squash, character.stretch);
    ctx.translate(-centerX, -centerY);

    // Character body
    ctx.fillStyle = TOKENS.colors.character;
    ctx.beginPath();
    ctx.roundRect(character.x, character.y, character.width, character.height, CHARACTER.cornerRadius);
    ctx.fill();

    // Character outline
    ctx.strokeStyle = TOKENS.colors.characterOutline;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(character.x + 8, character.y + 10, CHARACTER.eyeSize, CHARACTER.eyeSize);
    ctx.fillRect(character.x + 24, character.y + 10, CHARACTER.eyeSize, CHARACTER.eyeSize);

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(character.x + 10, character.y + 12, CHARACTER.pupilSize, CHARACTER.pupilSize);
    ctx.fillRect(character.x + 26, character.y + 12, CHARACTER.pupilSize, CHARACTER.pupilSize);

    ctx.restore();
}

function drawScore() {
    // Current score
    ctx.fillStyle = TOKENS.colors.textPrimary;
    ctx.font = `${TOKENS.typography.sizeScore} ${TOKENS.typography.fontMono}`;
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, CANVAS.width - SCORE.padding, SCORE.yPosition);

    // High score
    ctx.fillStyle = TOKENS.colors.highScore;
    ctx.textAlign = 'left';
    ctx.fillText(`Best: ${highScore}`, SCORE.padding, SCORE.highScoreYPosition);
}

// ============================================================
// POLYFILLS
// ============================================================

// Polyfill for roundRect if not supported
if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

// ============================================================
// START THE GAME
// ============================================================

init();
