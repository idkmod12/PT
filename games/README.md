# Locally hosted games

MLV serves game folders from this directory on the existing Vercel deployment. A game placed at:

`games/example-game/index.html`

is available at:

`https://mathguide-seven.vercel.app/games/example-game/`

Keep each game's HTML, JavaScript, WebAssembly, images, audio, and data files together in its own folder so its relative asset paths continue to work. Add a matching entry to `games.json` with `src` set to `./games/example-game/index.html`.

Only add games that you created, own, or are licensed to redistribute and host. The current PolyTrack copy remains in `game/` because that is its existing local folder.
