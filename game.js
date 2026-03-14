// Vibe-Breaker - Endless Runner Game
// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

// Game constants
const GROUND_HEIGHT = 60;
const GROUND_Y = CANVAS_HEIGHT - GROUND_HEIGHT;
const CHARACTER_X = 150;
const CHARACTER_SIZE = 40;
const INITIAL_JUMP_VELOCITY = -15;
const GRAVITY = 0.8;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_MIN_GAP = 300;
const INITIAL_OBSTACLE_SPEED = 6;
const MAX_OBSTACLE_SPEED = 12;
const SPEED_INCREMENT = 0.5;
const SPEED_INCREMENT_SCORE = 10;

// Colors
const COLORS = {
    background1: '#1a1a2e',
    background2: '#16213e',
    ground: '#0f3460',
    character: '#e94560',
    obstacle1: '#533483',
    obstacle2: '#7952b3',
    text: '#ffffff',
    highScore: '#ffd700'
};

// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const gameOverHighScoreEl = document.getElementById('game-over-high-score');
const newHighScoreBadge = document.getElementById('new-high-score-badge');
const playAgainBtn = document.getElementById('play-again-btn');
const startHighScoreEl = document.getElementById('start-high-score');

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameover'
let score = 0;
let highScore = 0;
let obstacleSpeed = INITIAL_OBSTACLE_SPEED;
let obstacles = [];
let lastObstacleX = CANVAS_WIDTH;

// Parallax background layers
let bgLayers = [
    { x: 0, speed: 0.5 }, // far layer
    { x: 0, speed: 1 }    // near layer
];

// Character
const character = {
    x: CHARACTER_X,
    y: GROUND_Y - CHARACTER_SIZE,
    width: CHARACTER_SIZE,
    height: CHARACTER_SIZE,
    velocityY: 0,
    isJumping: false,
    squash: 1,
    stretch: 1
};

// Initialize
function init() {
    loadHighScore();
    displayStartScreen();
    setupEventListeners();
    requestAnimationFrame(gameLoop);
}

function loadHighScore() {
    const stored = localStorage.getItem('vibe-breaker-highscore');
    highScore = stored ? parseInt(stored, 10) : 0;
}

function saveHighScore() {
    localStorage.setItem('vibe-breaker-highscore', highScore.toString());
}

function displayStartScreen() {
    if (highScore > 0) {
        startHighScoreEl.textContent = `High Score: ${highScore}`;
    } else {
        startHighScoreEl.textContent = '';
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
}

function handleInput() {
    if (gameState === 'start') {
        startGame();
    } else if (gameState === 'playing' && !character.isJumping) {
        jump();
    }
}

function startGame() {
    gameState = 'playing';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    resetGame();
}

function resetGame() {
    score = 0;
    obstacleSpeed = INITIAL_OBSTACLE_SPEED;
    obstacles = [];
    lastObstacleX = CANVAS_WIDTH;
    character.y = GROUND_Y - CHARACTER_SIZE;
    character.velocityY = 0;
    character.isJumping = false;
    character.squash = 1;
    character.stretch = 1;
    bgLayers.forEach(layer => layer.x = 0);
}

function jump() {
    character.velocityY = INITIAL_JUMP_VELOCITY;
    character.isJumping = true;
    character.squash = 0.7;
    character.stretch = 1.3;
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
        if (character.y >= GROUND_Y - CHARACTER_SIZE) {
            character.y = GROUND_Y - CHARACTER_SIZE;
            character.velocityY = 0;
            character.isJumping = false;
            character.squash = 1.3;
            character.stretch = 0.7;
        }
    }
    
    // Animate squash/stretch back to normal
    character.squash += (1 - character.squash) * 0.2;
    character.stretch += (1 - character.stretch) * 0.2;
    
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
        INITIAL_OBSTACLE_SPEED + Math.floor(score / SPEED_INCREMENT_SCORE) * SPEED_INCREMENT,
        MAX_OBSTACLE_SPEED
    );
}

function updateObstacles() {
    // Move existing obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;
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
        if (!obstacle.passed && obstacle.x + obstacle.width < CHARACTER_X) {
            obstacle.passed = true;
            score++;
        }
    });
}

function spawnObstacle() {
    const heights = [40, 60, 80];
    const height = heights[Math.floor(Math.random() * heights.length)];
    
    obstacles.push({
        x: CANVAS_WIDTH,
        y: GROUND_Y - height,
        width: OBSTACLE_WIDTH,
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
            x: obstacle.x + 2,
            y: obstacle.y + 2,
            width: obstacle.width - 4,
            height: obstacle.height - 4
        };
        
        if (charBox.x < obsBox.x + obsBox.width &&
            charBox.x + charBox.width > obsBox.x &&
            charBox.y < obsBox.y + obsBox.height &&
            charBox.y + charBox.height > obsBox.y) {
            gameOver();
            return;
        }
    }
}

function render() {
    // Clear canvas
    ctx.fillStyle = COLORS.background1;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, COLORS.background1);
    gradient.addColorStop(1, COLORS.background2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw parallax background
    drawBackground();
    
    // Draw ground
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Draw ground line
    ctx.strokeStyle = '#1a4a7a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();
    
    // Draw obstacles
    obstacles.forEach(obstacle => {
        const obsGradient = ctx.createLinearGradient(
            obstacle.x, obstacle.y,
            obstacle.x, obstacle.y + obstacle.height
        );
        obsGradient.addColorStop(0, COLORS.obstacle1);
        obsGradient.addColorStop(1, COLORS.obstacle2);
        
        ctx.fillStyle = obsGradient;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Obstacle border
        ctx.strokeStyle = '#9b6dd3';
        ctx.lineWidth = 2;
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
    ctx.fillStyle = '#0f1525';
    const farOffset = bgLayers[0].x;
    for (let i = 0; i < 3; i++) {
        const x = farOffset + (i * 400);
        drawMountain(x, GROUND_Y - 100, 150, 120);
        drawMountain(x + 200, GROUND_Y - 80, 100, 80);
    }
    
    // Near layer (ground details)
    ctx.fillStyle = '#0a1a2e';
    const nearOffset = bgLayers[1].x;
    for (let i = 0; i < 4; i++) {
        const x = nearOffset + (i * 200);
        ctx.fillRect(x, GROUND_Y - 20, 40, 20);
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
    ctx.fillStyle = COLORS.character;
    ctx.beginPath();
    ctx.roundRect(character.x, character.y, character.width, character.height, 8);
    ctx.fill();
    
    // Character outline
    ctx.strokeStyle = '#ff8fa3';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(character.x + 8, character.y + 10, 8, 8);
    ctx.fillRect(character.x + 24, character.y + 10, 8, 8);
    
    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(character.x + 10, character.y + 12, 4, 4);
    ctx.fillRect(character.x + 26, character.y + 12, 4, 4);
    
    ctx.restore();
}

function drawScore() {
    // Current score
    ctx.fillStyle = COLORS.text;
    ctx.font = '24px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, CANVAS_WIDTH - 20, 35);
    
    // High score
    ctx.fillStyle = COLORS.highScore;
    ctx.textAlign = 'left';
    ctx.fillText(`Best: ${highScore}`, 20, 35);
}

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

// Start the game
init();
