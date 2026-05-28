# Expectations: run-pacing-3-act-structure

After applying this guide, the agent's `Assets/Scripts/RunActConfig.cs` should:

1. Be a `ScriptableObject` with a `[CreateAssetMenu]` attribute.
2. Declare exactly 3 act fields (e.g. `act1`, `act2`, `act3`).
3. Each act should declare `normalEncounterCount`, `eliteCount`, and `restSiteCount` (or equivalent integer fields).
4. Act 2's elite count should be greater than Act 1's elite count (escalation).
5. Act 3's rest-site count should be <= Act 2's rest-site count (climax withholds rest).
