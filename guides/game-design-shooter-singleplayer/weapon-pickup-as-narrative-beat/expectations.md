# Expectations: weapon-pickup-as-narrative-beat

After applying this guide, the agent's `Assets/Scripts/WeaponPickup.cs` should:

1. Be a `ScriptableObject` with `[CreateAssetMenu]`.
2. Declare a `StoryAct` enum with at least 4 distinct acts (intro, rising, climax, resolution).
3. Have a `weaponName` field.
4. Have a `act` field of type `StoryAct`.
5. Have an `actMissionIndex` integer field.
6. Have an `isNarrativeBeat` bool field.
