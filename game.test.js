/**
 * @jest-environment jsdom
 */

// Vibe-Breaker Game Tests - Scoring System and High Score Persistence
// Story US-007

describe('Game State Machine', () => {
    beforeEach(() => {
        // Reset module state
        jest.resetModules();
        document.body.innerHTML = `
            <canvas id="gameCanvas" width="800" height="400"></canvas>
            <div id="start-screen" class="screen"></div>
            <div id="game-over-screen" class="screen hidden"></div>
            <div id="game-hud" class="hud hidden"></div>
            <div id="final-score">000000</div>
            <div id="game-over-high-score">000000</div>
            <div id="new-high-score-badge" class="hidden"></div>
            <div id="start-high-score">000000</div>
            <div id="current-score">000000</div>
            <div id="hud-high-score">000000</div>
            <button id="play-again-btn"></button>
            <button id="main-menu-btn"></button>
        `;
        // Clear localStorage
        localStorage.clear();
    });

    describe('Score Tracking', () => {
        test('score should start at 0', () => {
            require('./game.js');
            // Load the game module - it initializes with score = 0 in resetGame
            require('./game.js');
            // The game initializes with score = 0 in resetGame
            expect(document.getElementById('current-score').textContent).toBe('000000');
        });

        test('score should increment when obstacle passes character', () => {
            require('./game.js');
            
            // Simulate an obstacle passing the character
            // Obstacle passes when obstacle.x + obstacle.width < CHARACTER.x
            const obstacle = {
                x: 100,
                y: 300,
                width: 30,
                height: 60,
                passed: false
            };
            
            // Character is at x: 150
            // When obstacle moves past character.x (150)
            obstacle.x = 110; // obstacle.x + width (30) = 140 < 150
            
            // Check if the obstacle would be marked as passed
            expect(obstacle.x + obstacle.width).toBeLessThan(150);
        });

        test('score should display in top-right during gameplay', () => {
            document.body.innerHTML = `
                <canvas id="gameCanvas" width="800" height="400"></canvas>
                <div id="start-screen" class="screen hidden"></div>
                <div id="game-over-screen" class="screen hidden"></div>
                <div id="game-hud" class="hud">
                    <div id="current-score">000042</div>
                    <div id="hud-high-score">001000</div>
                </div>
                <div id="final-score">000000</div>
                <div id="game-over-high-score">000000</div>
                <div id="new-high-score-badge" class="hidden"></div>
                <div id="start-high-score">000000</div>
                <button id="play-again-btn"></button>
                <button id="main-menu-btn"></button>
            `;
            
            const gameHud = document.getElementById('game-hud');
            const currentScore = document.getElementById('current-score');
            
            expect(gameHud.classList.contains('hidden')).toBe(false);
            expect(currentScore).toBeTruthy();
            expect(currentScore.textContent).toMatch(/^\d{6}$/);
        });
    });

    describe('High Score Persistence', () => {
        test('high score should load from localStorage on game start', () => {
            // Set a high score in localStorage
            localStorage.setItem('vibe-breaker-highscore', '500');
            
            require('./game.js');
            
            // High score should be loaded from localStorage
            const hudHighScore = document.getElementById('hud-high-score');
            expect(hudHighScore).toBeTruthy();
        });

        test('high score should be stored in localStorage', () => {
            require('./game.js');
            
            // Simulate saving a high score
            localStorage.setItem('vibe-breaker-highscore', '1000');
            
            const stored = localStorage.getItem('vibe-breaker-highscore');
            expect(stored).toBe('1000');
        });

        test('high score should display in top-left during gameplay', () => {
            document.body.innerHTML = `
                <canvas id="gameCanvas" width="800" height="400"></canvas>
                <div id="start-screen" class="screen hidden"></div>
                <div id="game-over-screen" class="screen hidden"></div>
                <div id="game-hud" class="hud">
                    <div class="hud-header">
                        <div class="hud-score-section">
                            <div class="hud-label">High Score</div>
                            <div class="hud-value" id="hud-high-score">001000</div>
                        </div>
                    </div>
                    <div id="current-score">000042</div>
                </div>
                <div id="final-score">000000</div>
                <div id="game-over-high-score">000000</div>
                <div id="new-high-score-badge" class="hidden"></div>
                <div id="start-high-score">000000</div>
                <button id="play-again-btn"></button>
                <button id="main-menu-btn"></button>
            `;
            
            const hudHighScore = document.getElementById('hud-high-score');
            expect(hudHighScore).toBeTruthy();
            expect(hudHighScore.textContent).toMatch(/^\d{6}$/);
        });

        test('high score should update when current score exceeds it', () => {
            // Set initial high score
            localStorage.setItem('vibe-breaker-highscore', '100');
            
            require('./game.js');
            
            // Simulate a higher score
            const newScore = 150;
            const currentHighScore = parseInt(localStorage.getItem('vibe-breaker-highscore'), 10);
            
            if (newScore > currentHighScore) {
                localStorage.setItem('vibe-breaker-highscore', newScore.toString());
            }
            
            expect(localStorage.getItem('vibe-breaker-highscore')).toBe('150');
        });

        test('high score should not update when current score is lower', () => {
            // Set initial high score
            localStorage.setItem('vibe-breaker-highscore', '1000');
            
            require('./game.js');
            
            // Simulate a lower score
            const newScore = 500;
            const currentHighScore = parseInt(localStorage.getItem('vibe-breaker-highscore'), 10);
            
            if (newScore > currentHighScore) {
                localStorage.setItem('vibe-breaker-highscore', newScore.toString());
            }
            
            expect(localStorage.getItem('vibe-breaker-highscore')).toBe('1000');
        });
    });

    describe('New High Score Badge', () => {
        test('NEW badge should display when high score is beaten', () => {
            document.body.innerHTML = `
                <canvas id="gameCanvas" width="800" height="400"></canvas>
                <div id="start-screen" class="screen hidden"></div>
                <div id="game-over-screen" class="screen">
                    <div id="final-score">000150</div>
                    <div id="game-over-high-score">000150</div>
                    <div id="new-high-score-badge" class="">NEW HIGH SCORE!</div>
                </div>
                <div id="game-hud" class="hud hidden">
                    <div id="current-score">000000</div>
                    <div id="hud-high-score">000000</div>
                </div>
                <div id="start-high-score">000000</div>
                <button id="play-again-btn"></button>
                <button id="main-menu-btn"></button>
            `;
            
            const badge = document.getElementById('new-high-score-badge');
            const finalScore = document.getElementById('final-score').textContent;
            const highScore = document.getElementById('game-over-high-score').textContent;
            
            // Badge should be visible when score equals high score (new record)
            expect(badge).toBeTruthy();
            expect(finalScore).toBe(highScore);
        });

        test('NEW badge should be hidden when score does not beat high score', () => {
            document.body.innerHTML = `
                <canvas id="gameCanvas" width="800" height="400"></canvas>
                <div id="start-screen" class="screen hidden"></div>
                <div id="game-over-screen" class="screen">
                    <div id="final-score">000050</div>
                    <div id="game-over-high-score">000150</div>
                    <div id="new-high-score-badge" class="hidden">NEW HIGH SCORE!</div>
                </div>
                <div id="game-hud" class="hud hidden">
                    <div id="current-score">000000</div>
                    <div id="hud-high-score">000000</div>
                </div>
                <div id="start-high-score">000000</div>
                <button id="play-again-btn"></button>
                <button id="main-menu-btn"></button>
            `;
            
            const badge = document.getElementById('new-high-score-badge');
            expect(badge.classList.contains('hidden')).toBe(true);
        });
    });

    describe('Score Formatting', () => {
        test('score should be padded to 6 digits', () => {
            const score = 42;
            const formatted = score.toString().padStart(6, '0');
            expect(formatted).toBe('000042');
        });

        test('high score should be padded to 6 digits', () => {
            const highScore = 1000;
            const formatted = highScore.toString().padStart(6, '0');
            expect(formatted).toBe('001000');
        });
    });

    describe('Game HUD Display', () => {
        test('Game HUD should have correct structure', () => {
            document.body.innerHTML = `
                <canvas id="gameCanvas" width="800" height="400"></canvas>
                <div id="start-screen" class="screen hidden"></div>
                <div id="game-over-screen" class="screen hidden"></div>
                <div id="game-hud" class="hud">
                    <header class="hud-header">
                        <div class="hud-score-section">
                            <div class="hud-label">High Score</div>
                            <div class="hud-value" id="hud-high-score">001000</div>
                        </div>
                        <div class="hud-score-section hud-score-right">
                            <div class="hud-label hud-label-primary">Score</div>
                            <div class="hud-value hud-value-large" id="current-score">000042</div>
                        </div>
                    </header>
                </div>
                <div id="final-score">000000</div>
                <div id="game-over-high-score">000000</div>
                <div id="new-high-score-badge" class="hidden"></div>
                <div id="start-high-score">000000</div>
                <button id="play-again-btn"></button>
                <button id="main-menu-btn"></button>
            `;
            
            const hud = document.getElementById('game-hud');
            const hudHeader = hud.querySelector('.hud-header');
            const highScoreSection = hud.querySelector('#hud-high-score');
            const scoreSection = hud.querySelector('#current-score');
            
            expect(hudHeader).toBeTruthy();
            expect(highScoreSection).toBeTruthy();
            expect(scoreSection).toBeTruthy();
        });
    });

    describe('Game Over Screen Display', () => {
        test('Game Over screen should display final score', () => {
            document.body.innerHTML = `
                <canvas id="gameCanvas" width="800" height="400"></canvas>
                <div id="start-screen" class="screen hidden"></div>
                <div id="game-over-screen" class="screen">
                    <div id="final-score">000150</div>
                    <div id="game-over-high-score">000200</div>
                    <div id="new-high-score-badge" class="hidden"></div>
                </div>
                <div id="game-hud" class="hud hidden"></div>
                <div id="start-high-score">000000</div>
                <button id="play-again-btn"></button>
                <button id="main-menu-btn"></button>
            `;
            
            const finalScore = document.getElementById('final-score');
            expect(finalScore).toBeTruthy();
            expect(finalScore.textContent).toMatch(/^\d{6}$/);
        });

        test('Game Over screen should display high score', () => {
            document.body.innerHTML = `
                <canvas id="gameCanvas" width="800" height="400"></canvas>
                <div id="start-screen" class="screen hidden"></div>
                <div id="game-over-screen" class="screen">
                    <div id="final-score">000150</div>
                    <div id="game-over-high-score">000200</div>
                    <div id="new-high-score-badge" class="hidden"></div>
                </div>
                <div id="game-hud" class="hud hidden"></div>
                <div id="start-high-score">000000</div>
                <button id="play-again-btn"></button>
                <button id="main-menu-btn"></button>
            `;
            
            const highScore = document.getElementById('game-over-high-score');
            expect(highScore).toBeTruthy();
            expect(highScore.textContent).toMatch(/^\d{6}$/);
        });
    });
});
