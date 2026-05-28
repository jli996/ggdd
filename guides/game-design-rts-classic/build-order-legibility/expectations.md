# Expectations: build-order-legibility

After applying this guide, the agent's `Assets/Scripts/BuildOrderScout.cs` should:

1. Have a serialized `scoutWindowSeconds` float defaulting to a value in [15, 60].
2. Declare a `BuildingArchetype` enum with at least 4 values (Economy, Tech, MilitaryRanged, MilitaryMelee, Defense).
3. Expose an `IdentifyStrategy(BuildingArchetype[])` method that returns the dominant archetype.
4. Reference the `BuildingArchetype` enum multiple times in the class body (input parameter, return type, and internal usage).
5. Have a method returning a `BuildingArchetype` value as the dominant strategy result.
