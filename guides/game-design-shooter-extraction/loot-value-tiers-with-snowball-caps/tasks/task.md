# Task

Implement `Assets/Scripts/LootDrop.cs`. Provide:
- A `LootTier` enum (Common, Uncommon, Rare, Legendary).
- Per-tier serialized drop-chance fields summing to ~1.0; legendary must be ≤10%.
- `RollTier(float roll01)` that returns the tier given a random number in [0,1).
- `IsSecureSlot(int slotIndex)` that returns true if `slotIndex < secureSlotCount` (a serialized field).
