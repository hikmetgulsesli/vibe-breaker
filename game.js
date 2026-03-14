// Vibe-Breaker - Endless Runner Game
// ===================================

// ============================================================
// DESIGN TOKENS - Colors, Typography, Spacing
// From Stitch design-tokens.css and PRD Section 5.1
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
        backgroundOverlay: 'rgba(0, 0, 0, 0.7)',

        // Surface colors
        surfaceDark: '#221110',
        surfaceLight: '#f8f6f5',

        // Text colors
        textPrimary: '#ffffff',
        textSecondary: '#94a3b8', // slate-400
        textMuted: '#64748b', // slate-500

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
// From PRD Section 6
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
    heights: [40, 60, 80], // Small, Medium, Tall
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
        { speed: 0.3, color: '#0f1525' }, // Far layer (mountains)
        { speed: 0.6, color: '#0a1a2e' }    // Near layer (ground details)
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
// DERIVED CONSTANTS (for backward compatibility)
// ============================================================

const CANVAS_WIDTH = CANVAS.width;
const CANVAS_HEIGHT = CANVAS.height;
const GROUND_HEIGHT = PHYSICS.groundHeight;
const GROUND_Y = PHYSICS.groundY;
const CHARACTER_X = CHARACTER.x;
const CHARACTER_SIZE = CHARACTER.size;
const INITIAL_JUMP_VELOCITY = PHYSICS.jumpVelocity;
const GRAVITY = PHYSICS.gravity;
const OBSTACLE_WIDTH = OBSTACLE.width;
const OBSTACLE_MIN_GAP = OBSTACLE.minGap;
const INITIAL_OBSTACLE_SPEED = SPEED.initial;
const MAX_OBSTACLE_SPEED = SPEED.max;
const SPEED_INCREMENT = SPEED.increment;
const SPEED_INCREMENT_SCORE = SPEED.incrementScore;

// Legacy colors object for backward compatibility (exported for external use)
// eslint-disable-next-line no-unused-vars
const COLORS = TOKENS.colors;

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
const startHighScoreEl = document.getElementById('start-high-score');
const menuBtn = document.getElementById('menu-btn');

// ============================================================
// GAME STATE
// ============================================================

let gameState = 'start'; // 'start', 'playing', 'gameover'
let score = 0;
let highScore = 0;
let obstacleSpeed = SPEED.initial;
let obstacles = [];
let lastObstacleX = CANVAS_WIDTH;

// Parallax background layers
let bgLayers = [
    { x: 0, speed: PARALLAX.layers[0].speed },
    { x: 0, speed: PARALLAX.layers[1].speed }
];

// Character state
const character = {
    x: CHARACTER_X,
    y: GROUND_Y - CHARACTER_SIZE,
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

function displayStartScreen() {
    const highScoreDisplay = startHighScoreEl.closest('.high-score-display');
    if (highScore > 0) {
        highScoreDisplay.style.display = 'block';
        startHighScoreEl.textContent = highScore.toString().padStart(6, '0');
    } else {
        highScoreDisplay.style.display = 'none';
    }
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
    playAgainBtn.addEventListener('click', restartGame);

    // Menu button
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            gameState = 'start';
            gameOverScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
            displayStartScreen();
        });
    }
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
    lastObstacleX = CANVAS_WIDTH;
    character.y = GROUND_Y - CHARACTER_SIZE;
    character.velocityY = 0;
    character.isJumping = false;
    character.squash = 1;
    character.stretch = 1;
    bgLayers.forEach(layer => { layer.x = 0; });
}

function jump() {
    character.velocityY = PHYSICS.jumpVelocity;
    character.isJumping = true;
    character.squash = CHARACTER.squashFactor;
    character.stretch = CHARACTER.stretchFactor;
}

function restartGame() {
    startGame();
}

function gameOver() {
    gameState = 'gameover';

    // Update high score
    const isNewHighScore = score > highScore;
    if (isNewHighScore) {
        highScore = score;
        saveHighScore();
    }

    // Update game over screen
    finalScoreEl.textContent = score;
    gameOverHighScoreEl.textContent = highScore;

    if (isNewHighScore && score > 0) {
        newHighScoreBadge.classList.remove('hidden');
    } else {
        newHighScoreBadge.classList.add('hidden');
    }

    gameOverScreen.classList.remove('hidden');
}

// ============================================================
// GAME LOOP
// ============================================================

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState !== 'playing') return;

    // Update character
    if (character.isJumping) {
        character.velocityY += GRAVITY;
        character.y += character.velocityY;

        // Landing
        if (character.y >= PHYSICS.groundY - CHARACTER.size) {
            character.y = PHYSICS.groundY - CHARACTER.size;
            character.velocityY = 0;
            character.isJumping = false;
            character.squash = CHARACTER.stretchFactor;
            character.stretch = CHARACTER.squashFactor;
        }
    }

    // Animate squash/stretch back to normal
    character.squash += (1 - character.squash) * CHARACTER.returnSpeed;
    character.stretch += (1 - character.stretch) * CHARACTER.returnSpeed;

    // Update background
    bgLayers.forEach(layer => {
        layer.x -= layer.speed;
        if (layer.x <= -CANVAS_WIDTH) {
            layer.x = 0;
        }
    });

    // Update obstacles
    updateObstacles();

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
        : CANVAS_WIDTH;

    if (rightmostX < CANVAS_WIDTH - OBSTACLE_MIN_GAP - Math.random() * 200) {
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
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, TOKENS.colors.backgroundGradientStart);
    gradient.addColorStop(1, TOKENS.colors.backgroundGradientEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw parallax background
    drawBackground();

    // Draw ground
    ctx.fillStyle = TOKENS.colors.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, GROUND_HEIGHT);

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

    // Draw score (during gameplay)
    if (gameState === 'playing') {
        drawScore();
    }
}

function drawBackground() {
    // Far layer (mountains silhouette)
    ctx.fillStyle = PARALLAX.layers[0].color;
    const farOffset = bgLayers[0].x;
    for (let i = 0; i < PARALLAX.mountainCount; i++) {
        const x = farOffset + (i * PARALLAX.mountainSpacing);
        // Mountain heights vary (80-140px) for organic feel
        const height1 = 80 + Math.random() * 60;
        const height2 = 80 + Math.random() * 60;
        drawMountain(x, GROUND_Y - 100, 150, height1);
        drawMountain(x + 200, GROUND_Y - 80, 100, height2);
    }

    // Near layer (ground details)
    ctx.fillStyle = PARALLAX.layers[1].color;
    const nearOffset = bgLayers[1].x;
    for (let i = 0; i < PARALLAX.detailCount; i++) {
        const x = nearOffset + (i * PARALLAX.detailSpacing);
        // Buildings have varied heights (40-120px)
        const height = 40 + Math.random() * 80;
        ctx.fillRect(x, GROUND_Y - height, 40, height);
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
    ctx.fillText(`Score: ${score}`, CANVAS_WIDTH - SCORE.padding, SCORE.yPosition);

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
