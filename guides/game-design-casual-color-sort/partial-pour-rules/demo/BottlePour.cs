using UnityEngine;

public class BottlePour : MonoBehaviour
{
    [SerializeField] private int bottleCapacity = 4;

    public bool CanPour(int topColorSrc, int topColorDst, int dstFillCount)
    {
        if (topColorSrc < 0) return false;
        if (dstFillCount >= bottleCapacity) return false;
        if (dstFillCount == 0) return true;
        return topColorSrc == topColorDst;
    }

    public int HowMuchPours(int srcCount, int dstCount, int srcTopRun)
    {
        int dstSpace = bottleCapacity - dstCount;
        return Mathf.Min(srcTopRun, dstSpace);
    }
}
