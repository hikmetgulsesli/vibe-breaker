# Vibe-Breaker

An endless runner arcade game built with vanilla JavaScript and HTML5 Canvas.

## Features

- 🎮 Smooth 60 FPS gameplay using `requestAnimationFrame`
- 🏃‍♂️ 2D endless runner with parallax scrolling background
- 🚀 Jump with SPACE key or tap on mobile
- 🎯 Random obstacles with varying heights
- 📊 Score tracking with localStorage persistence
- 🏆 High score saved between sessions
- 📱 Responsive design that adapts to viewport
- 🎨 Retro arcade aesthetic with neon styling

## How to Play

1. Press **SPACE** or tap the screen to start
2. Press **SPACE** or tap to jump over obstacles
3. Each obstacle passed increases your score by 1
4. Avoid hitting obstacles or it's game over!
5. Try to beat your high score

## Tech Stack

- **HTML5 Canvas** - Game rendering
- **Vanilla JavaScript** - No frameworks, pure JS
- **CSS3** - Styling with CSS custom properties
- **Google Fonts (Space Grotesk)** - Typography

## File Structure

```
vibe-breaker/
├── index.html      # Main HTML file with game container
├── style.css       # Game styling and responsive design
├── game.js         # Core game logic and rendering
└── stitch/         # Design assets and tokens
    ├── design-tokens.css
    └── *.html      # Screen designs
```

## Development

No build step required! This is a static site that can be served directly:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
