# empty-unity6

Minimal Unity 6 (6000.3.11f1) project with URP, Input System, and Test Framework.
Used by graders with `baseApp: empty-unity6`.

## Pre-warming the Library cache

```shell
ggdd-dev warm-cache empty-unity6
```

Populates `library-cache/` so subsequent grader runs start with `Library/` symlinked to the warm copy (~5s subsequent runs vs. ~90s cold).
