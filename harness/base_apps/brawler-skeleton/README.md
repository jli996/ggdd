# brawler-skeleton (placeholder)

This base-app is a placeholder. The action-design guides (hit-stop-on-impact, input-buffering, knockback-with-control-takeback) currently use `empty-unity6` until this skeleton is built out.

To create it:

```shell
UNITY="/Applications/Unity/Hub/Editor/6000.3.11f1/Unity.app/Contents/MacOS/Unity"
"$UNITY" -batchmode -nographics -createProject harness/base_apps/brawler-skeleton -quit
# Then add a basic 2D scene with a player, enemy, and combat scaffolding.
```

Tracked TODO: see CONTEXT.md.
