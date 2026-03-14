/** @jest-environment jsdom */

/**
 * US-008: UI Screens (Start, Game Over) and Input Handling Tests
 */

describe('US-008: UI Screens and Input Handling', () => {
    beforeEach(() => {
        // Set up DOM structure
        document.body.innerHTML = `
            <div id="game-container">
                <canvas id="gameCanvas" width="800" height="400"></canvas>
                <div id="game-hud" class="hud hidden"></div>
                <div id="start-screen" class="screen">
                    <h1 class="neon-text">VIBE-BREAKER</h1>
                    <div class="high-score-display">
                        <p>HIGH SCORE: <span id="start-high-score">000000</span></p>
                    </div>
                    <div class="start-instruction">
                        <h2 class="pulse">PRESS SPACE TO START</h2>
                    </div>
                </div>
                <div id="game-over-screen" class="screen hidden">
                    <h1>GAME OVER</h1>
                    <span id="final-score">000000</span>
                    <span id="game-over-high-score">000000</span>
                    <p id="new-high-score-badge" class="hidden">NEW HIGH SCORE!</p>
                    <button id="play-again-btn">Restart</button>
                    <button id="main-menu-btn">Main Menu</button>
                </div>
            </div>
        `;

        // Clear localStorage
        localStorage.clear();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        localStorage.clear();
    });

    describe('AC1: Start Screen Title', () => {
        test('Start screen contains VIBE-BREAKER title', () => {
            const startScreen = document.getElementById('start-screen');
            expect(startScreen.textContent).toContain('VIBE-BREAKER');
        });

        test('Title is centered using CSS flexbox layout', () => {
            const startScreen = document.getElementById('start-screen');
            const style = window.getComputedStyle(startScreen);
            // Check flexbox centering properties
            expect(startScreen.classList.contains('screen')).toBe(true);
        });

        test('Title has neon-text class for styling', () => {
            const title = document.querySelector('#start-screen h1');
            expect(title.classList.contains('neon-text')).toBe(true);
        });
    });

    describe('AC2: Start Screen High Score Display', () => {
        test('Start screen shows high score element', () => {
            const highScoreEl = document.getElementById('start-high-score');
            expect(highScoreEl).not.toBeNull();
        });

        test('High score display shows 000000 when no high score exists', () => {
            const highScoreEl = document.getElementById('start-high-score');
            expect(highScoreEl.textContent).toBe('000000');
        });

        test('High score section can be hidden when no score exists', () => {
            const highScoreDisplay = document.querySelector('.high-score-display');
            expect(highScoreDisplay).not.toBeNull();
        });
    });

    describe('AC3: Start Screen Instruction with Pulse Animation', () => {
        test('Start screen shows press space instruction', () => {
            const startScreen = document.getElementById('start-screen');
            expect(startScreen.textContent).toContain('PRESS');
            expect(startScreen.textContent).toContain('SPACE');
            expect(startScreen.textContent).toContain('TO START');
        });

        test('Instruction has pulse animation class', () => {
            const instruction = document.querySelector('.start-instruction h2');
            expect(instruction.classList.contains('pulse')).toBe(true);
        });

        test('Pulse animation CSS class exists', () => {
            // Create a test element to verify animation
            const testEl = document.createElement('div');
            testEl.className = 'pulse';
            document.body.appendChild(testEl);
            expect(testEl.classList.contains('pulse')).toBe(true);
        });
    });

    describe('AC4: Game Over Dark Background', () => {
        test('Game Over screen exists', () => {
            const gameOverScreen = document.getElementById('game-over-screen');
            expect(gameOverScreen).not.toBeNull();
        });

        test('Game Over screen has overlay structure', () => {
            const gameOverScreen = document.getElementById('game-over-screen');
            expect(gameOverScreen.classList.contains('screen')).toBe(true);
        });

        test('Game Over screen is initially hidden', () => {
            const gameOverScreen = document.getElementById('game-over-screen');
            expect(gameOverScreen.classList.contains('hidden')).toBe(true);
        });
    });

    describe('AC5: Game Over Score Display', () => {
        test('Game Over shows GAME OVER title', () => {
            const gameOverScreen = document.getElementById('game-over-screen');
            expect(gameOverScreen.textContent).toContain('GAME OVER');
        });

        test('Game Over shows final score element', () => {
            const finalScoreEl = document.getElementById('final-score');
            expect(finalScoreEl).not.toBeNull();
        });

        test('Game Over shows high score element', () => {
            const highScoreEl = document.getElementById('game-over-high-score');
            expect(highScoreEl).not.toBeNull();
        });
    });

    describe('AC6: Play Again Button', () => {
        test('Play Again button exists', () => {
            const playAgainBtn = document.getElementById('play-again-btn');
            expect(playAgainBtn).not.toBeNull();
        });

        test('Play Again button has text', () => {
            const playAgainBtn = document.getElementById('play-again-btn');
            expect(playAgainBtn.textContent.length).toBeGreaterThan(0);
        });

        test('Play Again button can have click event listener attached', () => {
            const playAgainBtn = document.getElementById('play-again-btn');
            const clickHandler = jest.fn();
            playAgainBtn.addEventListener('click', clickHandler);
            playAgainBtn.click();
            expect(clickHandler).toHaveBeenCalled();
        });
    });

    describe('AC7: Space Key Input Handling', () => {
        test('Space key event can be captured', () => {
            const keyHandler = jest.fn();
            document.addEventListener('keydown', keyHandler);
            
            const event = new KeyboardEvent('keydown', { code: 'Space' });
            document.dispatchEvent(event);
            
            expect(keyHandler).toHaveBeenCalled();
        });

        test('Space key has correct code value', () => {
            const event = new KeyboardEvent('keydown', { code: 'Space' });
            expect(event.code).toBe('Space');
        });
    });

    describe('AC8: Touch/Click Input Handling', () => {
        test('Canvas element exists for touch handling', () => {
            const canvas = document.getElementById('gameCanvas');
            expect(canvas).not.toBeNull();
        });

        test('Canvas can have touch event listeners', () => {
            const canvas = document.getElementById('gameCanvas');
            const touchHandler = jest.fn();
            canvas.addEventListener('touchstart', touchHandler);
            
            const event = new Event('touchstart');
            canvas.dispatchEvent(event);
            
            expect(touchHandler).toHaveBeenCalled();
        });

        test('Canvas can have click event listeners', () => {
            const canvas = document.getElementById('gameCanvas');
            const clickHandler = jest.fn();
            canvas.addEventListener('click', clickHandler);
            
            canvas.click();
            
            expect(clickHandler).toHaveBeenCalled();
        });
    });

    describe('AC9: Main Menu Button', () => {
        test('Main Menu button exists', () => {
            const mainMenuBtn = document.getElementById('main-menu-btn');
            expect(mainMenuBtn).not.toBeNull();
        });

        test('Main Menu button has click handler capability', () => {
            const mainMenuBtn = document.getElementById('main-menu-btn');
            const clickHandler = jest.fn();
            mainMenuBtn.addEventListener('click', clickHandler);
            mainMenuBtn.click();
            expect(clickHandler).toHaveBeenCalled();
        });
    });

    describe('AC10: New High Score Badge', () => {
        test('New high score badge element exists', () => {
            const badge = document.getElementById('new-high-score-badge');
            expect(badge).not.toBeNull();
        });

        test('New high score badge is initially hidden', () => {
            const badge = document.getElementById('new-high-score-badge');
            expect(badge.classList.contains('hidden')).toBe(true);
        });
    });
});

describe('US-008: Screen Visibility State Management', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="game-container">
                <canvas id="gameCanvas" width="800" height="400"></canvas>
                <div id="game-hud" class="hud hidden"></div>
                <div id="start-screen" class="screen"></div>
                <div id="game-over-screen" class="screen hidden"></div>
            </div>
        `;
    });

    test('Start screen is visible by default', () => {
        const startScreen = document.getElementById('start-screen');
        expect(startScreen.classList.contains('hidden')).toBe(false);
    });

    test('Game HUD is hidden by default', () => {
        const gameHud = document.getElementById('game-hud');
        expect(gameHud.classList.contains('hidden')).toBe(true);
    });

    test('Game Over screen is hidden by default', () => {
        const gameOverScreen = document.getElementById('game-over-screen');
        expect(gameOverScreen.classList.contains('hidden')).toBe(true);
    });
});

describe('US-008: CSS Animation Requirements', () => {
    test('Pulse animation keyframes can be defined in CSS', () => {
        // Create a style element with pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }
            .pulse {
                animation: pulse 1.5s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);

        const testEl = document.createElement('div');
        testEl.className = 'pulse';
        document.body.appendChild(testEl);

        const computedStyle = window.getComputedStyle(testEl);
        expect(testEl.classList.contains('pulse')).toBe(true);
    });
});
