# eval-view

React/Vite dashboard for ggdd evaluation results.

## Local development

```shell
ggdd-dev dashboard       # starts the Vite dev server
# or directly:
cd eval-view && npm start
```

In dev, data is read from sibling `harness/runs/` (populated by `ggdd-dev eval`).

## Deploy to GitHub Pages

```shell
ggdd-dev deploy
# or directly:
cd eval-view && npm run deploy-pages
```

The `collect-runs.ts` script snapshots `harness/runs/` into `eval-view/public/data/` so the static build is self-contained. `gh-pages` pushes `dist/` to the `gh-pages` branch.
