# Trove

A puzzle game about arranging pieces on a grid for the best possible sale.
Pieces boost each other: arrows multiply, add, turn and copy, and the effects stack.

## Play
Open `index.html` through a web server, for example GitHub Pages
(Settings → Pages → deploy from the main branch).

## Files
- `index.html` – page and styles
- `play.js` – game screens, input (mouse and touch)
- `logic.js` – items and how a layout is valued
- `art.js` – drawings for the large pieces
- `route.js` – which pieces a level gets
- `solver.js` – the bot that finds the best layout
- `solverw.js`, `exactw.js` – background workers for the bot
