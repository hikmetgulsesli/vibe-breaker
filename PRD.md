# Vibe-Breaker - Product Requirements Document

## 1. Project Overview

**Project Name:** Vibe-Breaker  
**Project Type:** Browser-based Endless Runner Game  
**Core Functionality:** A 2D endless runner where a character runs automatically while the player jumps over obstacles to survive as long as possible and achieve the highest score.  
**Target Users:** Casual gamers looking for quick, addictive gameplay sessions in-browser.

---

## 2. Target Platform

| Platform | Support |
|----------|---------|
| Web (Desktop) | ✅ Primary - Chrome, Firefox, Safari, Edge |
| Web (Mobile) | ✅ Touch support for jump |
| Desktop (PWA) | Optional future enhancement |

**Responsive Design:** Canvas adapts to viewport width while maintaining aspect ratio.

---

## 3. Functional Requirements

### 3.1 Core Game Mechanics

| ID | Requirement | Description |
|----|-------------|-------------|
| F1 | Auto-run | Character runs in place (left-scrolling background, character fixed at ~20% from left) |
| F2 | Jump | Space key (desktop) or tap (mobile) triggers jump |
| F3 | Gravity | Character falls with gravity acceleration after jump peak |
| F4 | Obstacles | Randomly generated obstacles spawn from right edge, move left |
| F5 | Obstacle Variety | Obstacles have varying heights (small: 40px, medium: 60px, tall: 80px) |
| F6 | Score System | +1 point for each obstacle successfully passed |
| F7 | Collision Detection | Rectangle-based collision between character and obstacles |
| F8 | Game Over | On collision, display game over screen with final score |
| F9 | Replay | "Play Again" button restarts the game |
| F10 | High Score | Best score persists in localStorage |

### 3.2 User Interactions

| ID | Action | Trigger | Result |
|----|--------|---------|--------|
| I1 | Jump | Space / Tap | Character jumps |
| I2 | Restart | Click "Play Again" button | Game resets and starts |
| I3 | Start Game | Any key/tap on start screen | Game begins |

### 3.3 Game States

1. **Start Screen** - Title, high score (if exists), "Press Space/Tap to Start"
2. **Playing** - Active gameplay
3. **Game Over** - Final score, high score, "Play Again" button

---

## 4. Technical Requirements

### 4.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Rendering | HTML5 Canvas 2D |
| Language | Vanilla JavaScript (ES6+) |
| Styling | CSS3 |
| Build | Static file serving (no build step) |
| Storage | localStorage for high score |

### 4.2 File Structure

```
~/projects/vibe-breaker/
├── index.html      # Single HTML file
├── style.css      # Styling
├── game.js        # Game logic
└── README.md      # Basic documentation
```

### 4.3 Performance

| Metric | Target |
|--------|--------|
| Frame Rate | 60 FPS (requestAnimationFrame) |
| Memory | < 50MB |
| Load Time | < 2 seconds |
| First Input Latency | < 100ms |

### 4.4 Canvas Specifications

- **Width:** 800px default, responsive to viewport (max-width: 100%)
- **Height:** 400px default
- **Aspect Ratio:** 2:1
- **Scaling:** Canvas scales proportionally to fit viewport while maintaining aspect ratio

---

## 5. UI/UX Requirements

### 5.1 Visual Design

| Element | Color/Style |
|---------|-------------|
| Background | Gradient: #1a1a2e (dark blue) → #16213e (navy) |
| Ground | #0f3460 (dark blue) - 60px height at bottom |
| Character | #e94560 (coral red) - 40x40px square with simple animation |
| Obstacles | #533483 (purple) - rectangles with varying heights |
| Score Text | #ffffff (white), 24px, monospace |
| Game Over Overlay | rgba(0, 0, 0, 0.7) |

### 5.2 Typography

- **Font Family:** 'Courier New', monospace (retro game feel)
- **Title:** 48px, bold
- **Score:** 24px
- **Button Text:** 20px

### 5.3 Character Design

- **Shape:** Rounded rectangle (40x40px)
- **Color:** Coral red (#e94560)
- **Animation:** Simple squash/stretch on jump
- **Position:** Fixed at X = 150px from left edge

### 5.4 Obstacle Design

- **Shape:** Rectangle
- **Colors:** Purple gradient (#533483 → #7952b3)
- **Width:** 30px fixed
- **Heights:** Random - Small (40px), Medium (60px), Tall (80px)
- **Spacing:** Minimum 300px between obstacles

### 5.5 Background Design

- **Parallax:** Yes - 2 layers (far: 0.5x speed, near: 1x speed)
- **Far Layer:** Distant mountains/buildings (darker, slower)
- **Near Layer:** Ground details (faster)

### 5.6 Screens

#### 5.6.1 Start Screen
- Game title "VIBE-BREAKER" centered
- High score display (if exists)
- "Press SPACE or TAP to Start" instruction
- Subtle pulse animation on instruction text

#### 5.6.2 Playing Screen
- Scrolling background
- Character (fixed X, animated)
- Obstacles (moving left)
- Score display (top-right corner)
- High score display (top-left corner)

#### 5.6.3 Game Over Screen
- Semi-transparent dark overlay
- "GAME OVER" title
- Final score
- High score (with "NEW!" badge if beaten)
- "Play Again" button (centered, hover effect)

---

## 6. Gameplay Parameters

| Parameter | Value |
|-----------|-------|
| Initial Jump Velocity | -15 px/frame |
| Gravity | 0.8 px/frame² |
| Ground Y Position | canvas.height - 60 |
| Obstacle Speed | 6 px/frame (increases 0.5 per 10 obstacles, max 12) |
| Minimum Obstacle Gap | 300px |
| Character X Position | 150px |

---

## 7. Data Persistence

### localStorage Schema

```json
{
  "vibe-breaker-highscore": 42
}
```

- Key: `vibe-breaker-highscore`
- Value: Integer (highest score achieved)
- Update: Only when current score > stored high score

---

## 8. Acceptance Criteria

### 8.1 Functional Acceptance

- [ ] Game starts on Space key or screen tap
- [ ] Character jumps with smooth arc trajectory
- [ ] Obstacles spawn at random intervals with varying heights
- [ ] Score increments when obstacle passes character
- [ ] Collision stops game and shows Game Over screen
- [ ] High score persists across browser sessions
- [ ] Play Again button restarts game immediately

### 8.2 Performance Acceptance

- [ ] Maintains 60 FPS during gameplay
- [ ] No memory leaks during extended play
- [ ] Responsive canvas fits any viewport width

### 8.3 Visual Acceptance

- [ ] All colors match specification
- [ ] Text is readable on all backgrounds
- [ ] Animations are smooth
- [ ] Game over overlay is clearly visible

---

## 9. Future Enhancements (Out of Scope)

- Sound effects
- Multiple characters/skins
- Power-ups
- Leaderboard
- Mobile app wrapper
