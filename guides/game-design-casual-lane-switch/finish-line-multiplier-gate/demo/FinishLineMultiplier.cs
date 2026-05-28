using UnityEngine;

public class FinishLineMultiplier : MonoBehaviour
{
    [System.Serializable]
    public class Gate
    {
        public int xMultiplier;
        public int lanePosition;
        public int requiredCrowdSize;
    }

    [SerializeField] private Gate[] gates = new Gate[]
    {
        new Gate { xMultiplier = 2,  lanePosition = 0, requiredCrowdSize = 1  },
        new Gate { xMultiplier = 5,  lanePosition = 1, requiredCrowdSize = 10 },
        new Gate { xMultiplier = 10, lanePosition = 2, requiredCrowdSize = 25 },
    };

    public int RewardForGate(int gateIndex, int crowdSize)
    {
        if (gateIndex < 0 || gateIndex >= gates.Length) return 0;
        var gate = gates[gateIndex];
        if (crowdSize < gate.requiredCrowdSize) return 0;
        return crowdSize * gate.xMultiplier;
    }
}
