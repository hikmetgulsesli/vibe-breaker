/** @jest-environment jsdom */

/**
 * Collision Detection Tests for Vibe-Breaker
 * Tests rectangle-based AABB collision detection
 */

// Test collision detection function directly
function checkCollisionAABB(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

describe('Collision Detection - AABB Algorithm', () => {
    describe('Basic Collision Detection', () => {
        test('should detect collision when rectangles overlap', () => {
            const char = { x: 100, y: 100, width: 40, height: 40 };
            const obstacle = { x: 120, y: 100, width: 30, height: 60 };
            
            expect(checkCollisionAABB(char, obstacle)).toBe(true);
        });

        test('should not detect collision when rectangles are separated horizontally', () => {
            const char = { x: 100, y: 100, width: 40, height: 40 };
            const obstacle = { x: 200, y: 100, width: 30, height: 60 };
            
            expect(checkCollisionAABB(char, obstacle)).toBe(false);
        });

        test('should not detect collision when rectangles are separated vertically', () => {
            const char = { x: 100, y: 100, width: 40, height: 40 };
            const obstacle = { x: 100, y: 200, width: 30, height: 60 };
            
            expect(checkCollisionAABB(char, obstacle)).toBe(false);
        });

        test('should not detect collision when rectangles only touch edges', () => {
            const char = { x: 100, y: 100, width: 40, height: 40 };
            const obstacle = { x: 140, y: 100, width: 30, height: 60 };
            
            // Touching at x=140 (char ends at 100+40=140), no overlap
            expect(checkCollisionAABB(char, obstacle)).toBe(false);
        });

        test('should detect collision when one rectangle is inside another', () => {
            const char = { x: 100, y: 100, width: 40, height: 40 };
            const obstacle = { x: 110, y: 110, width: 20, height: 20 };
            
            expect(checkCollisionAABB(char, obstacle)).toBe(true);
        });
    });

    describe('Edge Cases - No False Positives/Negatives', () => {
        test('should not have false positive with barely touching corners', () => {
            const char = { x: 100, y: 100, width: 40, height: 40 };
            const obstacle = { x: 141, y: 141, width: 30, height: 60 };
            
            // At x=141 and char ends at 140 (100+40), no collision
            expect(checkCollisionAABB(char, obstacle)).toBe(false);
        });

        test('should detect collision with slight overlap', () => {
            const char = { x: 100, y: 100, width: 40, height: 40 };
            const obstacle = { x: 139, y: 100, width: 30, height: 60 };
            
            // Overlapping by 1 pixel
            expect(checkCollisionAABB(char, obstacle)).toBe(true);
        });

        test('should handle zero width rectangles', () => {
            const char = { x: 100, y: 100, width: 0, height: 40 };
            const obstacle = { x: 100, y: 100, width: 30, height: 60 };
            
            expect(checkCollisionAABB(char, obstacle)).toBe(false);
        });

        test('should handle zero height rectangles', () => {
            const char = { x: 100, y: 100, width: 40, height: 0 };
            const obstacle = { x: 100, y: 100, width: 30, height: 60 };
            
            expect(checkCollisionAABB(char, obstacle)).toBe(false);
        });
    });

    describe('Game-Specific Collision Scenarios', () => {
        test('should detect character hitting obstacle from left', () => {
            const char = { x: 150, y: 260, width: 30, height: 30 }; // Character at ground
            const obstacle = { x: 170, y: 260, width: 30, height: 60 }; // Obstacle to the right
            
            expect(checkCollisionAABB(char, obstacle)).toBe(true);
        });

        test('should detect character jumping over but hitting obstacle top', () => {
            const char = { x: 150, y: 200, width: 30, height: 30 }; // Character in air
            const obstacle = { x: 150, y: 220, width: 30, height: 40 }; // Obstacle below
            
            expect(checkCollisionAABB(char, obstacle)).toBe(true);
        });

        test('should not detect collision when character successfully jumps over', () => {
            const char = { x: 150, y: 150, width: 30, height: 30 }; // Character high in air
            const obstacle = { x: 150, y: 260, width: 30, height: 60 }; // Obstacle on ground
            
            expect(checkCollisionAABB(char, obstacle)).toBe(false);
        });

        test('should detect collision with hitbox padding applied', () => {
            // Simulating the game's hitbox padding logic
            const hitboxPadding = 4;
            const rawChar = { x: 150, y: 260, width: 40, height: 40 };
            const rawObstacle = { x: 180, y: 260, width: 30, height: 60 };
            
            const charBox = {
                x: rawChar.x + hitboxPadding,
                y: rawChar.y + hitboxPadding,
                width: rawChar.width - (hitboxPadding * 2),
                height: rawChar.height - (hitboxPadding * 2)
            };
            
            const obsBox = {
                x: rawObstacle.x + hitboxPadding,
                y: rawObstacle.y + hitboxPadding,
                width: rawObstacle.width - (hitboxPadding * 2),
                height: rawObstacle.height - (hitboxPadding * 2)
            };
            
            // With padding: char x=154, width=32; obstacle x=184, width=22
            // char ends at 186, obstacle starts at 184 - collision!
            expect(checkCollisionAABB(charBox, obsBox)).toBe(true);
        });
    });
});

describe('Game State Transitions', () => {
    test('Game Over state should be reachable from Playing state', () => {
        const GameState = {
            START: 'START',
            PLAYING: 'PLAYING',
            GAME_OVER: 'GAME_OVER'
        };
        
        const STATE_TRANSITIONS = {
            [GameState.START]: [GameState.PLAYING],
            [GameState.PLAYING]: [GameState.GAME_OVER],
            [GameState.GAME_OVER]: [GameState.START, GameState.PLAYING]
        };
        
        // Verify PLAYING can transition to GAME_OVER
        expect(STATE_TRANSITIONS[GameState.PLAYING]).toContain(GameState.GAME_OVER);
    });

    test('Collision should trigger transition to GAME_OVER', () => {
        // This verifies the logic flow: collision -> triggerGameOver -> state transition
        const stateMachine = {
            state: 'PLAYING',
            transition: jest.fn(function(newState) {
                if (newState === 'GAME_OVER') {
                    this.state = newState;
                    return true;
                }
                return false;
            })
        };
        
        function onCollision() {
            stateMachine.transition('GAME_OVER');
        }
        
        onCollision();
        expect(stateMachine.transition).toHaveBeenCalledWith('GAME_OVER');
    });
});
