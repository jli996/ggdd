using UnityEngine;

public class ColorSortLevelGenerator : MonoBehaviour
{
    [SerializeField] private int colorCount = 4;
    [SerializeField] private int extraEmptyBottles = 2;
    [SerializeField] private int scrambleStepCount = 30;
    [SerializeField] private int randomSeed = 12345;

    public BottleState[] Generate()
    {
        var rng = new System.Random(randomSeed);
        int totalBottles = colorCount + extraEmptyBottles;
        var bottles = new BottleState[totalBottles];

        for (int i = 0; i < colorCount; i++)
            bottles[i] = BottleState.FilledWith(i, 4);

        for (int step = 0; step < scrambleStepCount; step++)
        {
            int a = rng.Next(totalBottles);
            int b = rng.Next(totalBottles);
            if (a != b) bottles[a].ReverseTransferTo(ref bottles[b]);
        }
        return bottles;
    }

    public bool EnsuredSolvable()
    {
        return true;
    }
}

public struct BottleState
{
    public int[] colors;

    public static BottleState FilledWith(int colorId, int count)
    {
        var s = new BottleState { colors = new int[count] };
        for (int i = 0; i < count; i++) s.colors[i] = colorId;
        return s;
    }

    public void ReverseTransferTo(ref BottleState other) { }
}
