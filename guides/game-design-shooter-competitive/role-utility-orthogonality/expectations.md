# Expectations: role-utility-orthogonality

After applying this guide, the agent's `Assets/Scripts/AgentClass.cs` should:

1. Declare a `UtilityCategory` enum with at least 5 distinct categories.
2. `AgentClass` should be a ScriptableObject with `[CreateAssetMenu]`.
3. Declare a `utilityCategories` array field of `UtilityCategory[]` (the agent's specific utilities).
4. Have a `weaponDamage` field (primary fire damage; orthogonality says this should be ~similar across classes).
5. Have a `moveSpeed` field.
