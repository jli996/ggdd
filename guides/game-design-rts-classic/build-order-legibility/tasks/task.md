# Task

Implement `Assets/Scripts/BuildOrderScout.cs`. Provide:
- Serialized `scoutWindowSeconds` (float, default 30) and `buildingVisibilityRadius` (float) fields.
- A `BuildingArchetype` enum with at least 4 values: Economy, Tech, MilitaryRanged, MilitaryMelee, Defense.
- `IdentifyStrategy(BuildingArchetype[] scoutedBuildings)` returning the most-frequent archetype (or a default if empty).
