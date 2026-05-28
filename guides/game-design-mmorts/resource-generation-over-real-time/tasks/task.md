# Task

Implement `Assets/Scripts/ResourceGenerator.cs`. Provide:
- Serialized `woodPerHour` (float, 100), `ironPerHour` (float, 80), `foodPerHour` (float, 120), and `storageCap` (int, 5000) fields.
- `AccumulatedSince(float resourcePerHour, float hoursElapsed)` returning `Mathf.Min(resourcePerHour * hoursElapsed, storageCap)`.
- Do NOT use `Update()` for resource generation — resources are computed on demand from elapsed time.
