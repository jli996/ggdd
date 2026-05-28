using System.Collections.Generic;
using UnityEngine;

public class CrowdFormation : MonoBehaviour
{
    public enum FormationShape { Line, V, Square, Circle }

    [SerializeField] private FormationShape formation = FormationShape.V;
    [SerializeField] private float unitSpacingMeters = 0.4f;

    private List<Transform> units = new List<Transform>();

    public void AddUnits(int count)
    {
        for (int i = 0; i < count; i++)
            units.Add(null);
    }

    public void RemoveUnits(int count)
    {
        int removeCount = Mathf.Min(count, units.Count);
        units.RemoveRange(units.Count - removeCount, removeCount);
    }

    public Vector3[] LayoutPositions()
    {
        var positions = new Vector3[units.Count];
        switch (formation)
        {
            case FormationShape.Line:
                for (int i = 0; i < units.Count; i++)
                    positions[i] = new Vector3((i - units.Count / 2f) * unitSpacingMeters, 0, 0);
                break;
            case FormationShape.V:
                for (int i = 0; i < units.Count; i++)
                {
                    float side = (i % 2 == 0) ? 1 : -1;
                    positions[i] = new Vector3(side * (i / 2 + 1) * unitSpacingMeters, 0, -(i / 2) * unitSpacingMeters);
                }
                break;
            default:
                for (int i = 0; i < units.Count; i++)
                    positions[i] = new Vector3(i * unitSpacingMeters, 0, 0);
                break;
        }
        return positions;
    }
}
