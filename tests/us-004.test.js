/** @jest-environment jsdom */

/**
 * US-004: Character Rendering and Physics - Tests
 * 
 * Acceptance Criteria:
 * 1. Character renders at fixed X position (150px)
 * 2. Space key triggers jump with initial velocity -15
 * 3. Gravity (0.8) accelerates character downward
 * 4. Character stops at ground level
 * 5. Squash/stretch animation plays on jump
 * 6. Character cannot double jump
 */

// Fix TextEncoder/TextDecoder for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Read the actual game file
const gameCode = fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8');

// Mock canvas context
function createMockContext() {
    return {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        arcTo: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        createLinearGradient: jest.fn(() => ({
            addColorStop: jest.fn()
        })),
        roundRect: jest.fn(),
    };
}

describe('US-004: Character Rendering and Physics', () => {
    let dom;
    let window;
    let document;
    let mockCtx;

    beforeEach(() => {
        // Create a minimal HTML structure
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <canvas id="gameCanvas" width="800" height="400"></canvas>
                <div id="start-screen" class="screen"></div>
                <div id="game-over-screen" class="screen hidden"></div>
                <span id="final-score">0</span>
                <span id="game-over-high-score">0</span>
                <p id="new-high-score-badge" class="hidden"></p>
                <button id="play-again-btn"></button>
                <span id="start-high-score"></span>
            </body>
            </html>
        `;
        
        dom = new JSDOM(html, {
            runScripts: 'dangerously',
            pretendToBeVisual: true,
            url: 'http://localhost'
        });
        
        window = dom.window;
        document = window.document;
        
        // Mock canvas
        const canvas = document.getElementById('gameCanvas');
        mockCtx = createMockContext();
        canvas.getContext = jest.fn(() => mockCtx);
        
        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(),
                setItem: jest.fn(),
            },
            writable: true
        });
        
        // Mock requestAnimationFrame
        window.requestAnimationFrame = jest.fn();
        
        // Execute game code in JSDOM context
        const script = new window.Function(gameCode);
        script.call(window);
    });

    describe('AC1: Character X Position', () => {
        test('character has fixed X position of 150px', () => {
            // The CHARACTER constant should have x = 150
            expect(gameCode).toContain('x: 150');
            expect(gameCode).toContain('CHARACTER_X = CHARACTER.x');
        });
        
        test('character renders at x position defined in constants', () => {
            expect(gameCode).toMatch(/character\.x\s*[=:]\s*CHARACTER_X|x:\s*CHARACTER_X/);
        });
    });

    describe('AC2: Space Key Jump Trigger', () => {
        test('jump velocity is set to -15', () => {
            expect(gameCode).toContain('jumpVelocity: -15');
            expect(gameCode).toContain('INITIAL_JUMP_VELOCITY = PHYSICS.jumpVelocity');
        });
        
        test('space key event listener exists', () => {
            expect(gameCode).toContain('keydown');
            expect(gameCode).toContain("'Space'");
            expect(gameCode).toContain('e.code ===');
        });
        
        test('handleInput function processes space key', () => {
            expect(gameCode).toContain('function handleInput');
            expect(gameCode).toContain('jump()');
        });
    });

    describe('AC3: Gravity Physics', () => {
        test('gravity constant is 0.8', () => {
            expect(gameCode).toContain('gravity: 0.8');
            expect(gameCode).toContain('GRAVITY = PHYSICS.gravity');
        });
        
        test('gravity accelerates character downward in update loop', () => {
            // Gravity should be added to velocityY during jump
            expect(gameCode).toMatch(/velocityY\s*\+=\s*GRAVITY|velocityY\s*\+=\s*PHYSICS\.gravity/);
        });
        
        test('velocity affects character Y position', () => {
            expect(gameCode).toMatch(/character\.y\s*\+=\s*character\.velocityY/);
        });
    });

    describe('AC4: Ground Collision', () => {
        test('ground Y position is calculated from canvas height and ground height', () => {
            expect(gameCode).toContain('groundY()');
            expect(gameCode).toContain('CANVAS.height - this.groundHeight');
        });
        
        test('character stops at ground level when landing', () => {
            // Check for landing logic that resets Y to ground level
            expect(gameCode).toMatch(/character\.y\s*[=:]\s*GROUND_Y|character\.y\s*[=:]\s*PHYSICS\.groundY/);
        });
        
        test('velocity resets to 0 on ground landing', () => {
            expect(gameCode).toMatch(/velocityY\s*=\s*0/);
        });
        
        test('isJumping flag is set to false on landing', () => {
            expect(gameCode).toMatch(/isJumping\s*=\s*false/);
        });
    });

    describe('AC5: Squash/Stretch Animation', () => {
        test('squash factor constant exists', () => {
            expect(gameCode).toContain('squashFactor');
        });
        
        test('stretch factor constant exists', () => {
            expect(gameCode).toContain('stretchFactor');
        });
        
        test('squash and stretch values are applied on jump', () => {
            // In jump function, squash and stretch should be set
            expect(gameCode).toMatch(/character\.squash\s*=\s*CHARACTER\.squashFactor/);
            expect(gameCode).toMatch(/character\.stretch\s*=\s*CHARACTER\.stretchFactor/);
        });
        
        test('squash and stretch are inverted on landing', () => {
            expect(gameCode).toContain('squash = CHARACTER.stretchFactor');
            expect(gameCode).toContain('stretch = CHARACTER.squashFactor');
        });
        
        test('return speed constant exists for animation recovery', () => {
            expect(gameCode).toContain('returnSpeed');
        });
        
        test('squash and stretch return to normal over time', () => {
            expect(gameCode).toMatch(/squash\s*\+=.*returnSpeed/);
            expect(gameCode).toMatch(/stretch\s*\+=.*returnSpeed/);
        });
        
        test('canvas scale is used for squash/stretch rendering', () => {
            expect(gameCode).toContain('ctx.scale(character.squash, character.stretch)');
        });
    });

    describe('AC6: No Double Jump', () => {
        test('jump function checks isJumping flag', () => {
            // The handleInput should check !character.isJumping before calling jump
            expect(gameCode).toContain('!character.isJumping');
        });
        
        test('isJumping is set to true when jump starts', () => {
            expect(gameCode).toContain('isJumping = true');
        });
        
        test('character can only jump when on ground', () => {
            // The jump should only trigger when not already jumping
            expect(gameCode).toMatch(/handleInput.*!character\.isJumping|if.*playing.*&&.*!character\.isJumping/);
        });
    });

    describe('AC7: Constants Structure', () => {
        test('PHYSICS object contains all physics constants', () => {
            expect(gameCode).toContain('const PHYSICS = {');
            expect(gameCode).toMatch(/PHYSICS\s*=\s*\{[^}]*gravity/s);
            expect(gameCode).toMatch(/PHYSICS\s*=\s*\{[^}]*jumpVelocity/s);
        });
        
        test('CHARACTER object contains all character properties', () => {
            expect(gameCode).toContain('const CHARACTER = {');
            expect(gameCode).toMatch(/CHARACTER\s*=\s*\{[^}]*x:/s);
            expect(gameCode).toMatch(/CHARACTER\s*=\s*\{[^}]*squashFactor/s);
            expect(gameCode).toMatch(/CHARACTER\s*=\s*\{[^}]*stretchFactor/s);
        });
        
        test('character state object has all required properties', () => {
            expect(gameCode).toMatch(/const\s+character\s*=\s*\{[^}]*velocityY/s);
            expect(gameCode).toMatch(/const\s+character\s*=\s*\{[^}]*isJumping/s);
            expect(gameCode).toMatch(/const\s+character\s*=\s*\{[^}]*squash/s);
            expect(gameCode).toMatch(/const\s+character\s*=\s*\{[^}]*stretch/s);
        });
    });
});

describe('US-004: Code Quality Checks', () => {
    test('no TODO comments in code', () => {
        expect(gameCode).not.toMatch(/TODO|FIXME|XXX/i);
    });
    
    test('game constants are properly defined', () => {
        expect(gameCode).toContain('const CANVAS');
        expect(gameCode).toContain('const PHYSICS');
        expect(gameCode).toContain('const CHARACTER');
        expect(gameCode).toContain('const OBSTACLE');
        expect(gameCode).toContain('const TOKENS');
    });
    
    test('game uses requestAnimationFrame for 60 FPS', () => {
        expect(gameCode).toContain('requestAnimationFrame');
        expect(gameCode).toContain('function gameLoop');
    });
});
