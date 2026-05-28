# Expectations: role-counter-pick-draft

After applying this guide, the agent's `Assets/Scripts/DraftSystem.cs` should:

1. Declare a `Role` enum with at least 5 values (Tank, Assassin, Support, Marksman, Mage).
2. Have serialized `banCount` and `pickCount` int fields both greater than 0.
3. Have a serialized `pickAfterBan` bool field.
4. Expose an `IsValidDraft(Role[])` method returning true when at least 3 distinct roles are present.
5. Reference the `Role` enum in the method body (parameter type and/or internal usage).
