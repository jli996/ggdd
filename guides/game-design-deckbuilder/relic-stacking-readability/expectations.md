# Expectations: relic-stacking-readability

After applying this guide, the agent's `Assets/Scripts/RelicData.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Define a `RelicHook` enum naming explicit trigger points (at least `OnTurnStart`, `OnDamageTaken`, `OnCardPlayed`).
3. Have a `hook` field of type `RelicHook`.
4. Have a `tooltip` string field (so players can read what it does).
5. NOT have arrays of effects — single-effect-per-relic by convention.
