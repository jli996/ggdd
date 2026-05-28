using UnityEngine;

[CreateAssetMenu(menuName = "Match3/SpecialTileFactory")]
public class SpecialTileFactory : ScriptableObject
{
    public enum SpecialTileType { None, LineBomb, ColorBomb, Explosion }

    public enum MatchShape
    {
        Linear3,
        Linear4,
        Linear5,
        TShape,
        LShape,
        Square2x2
    }

    [System.Serializable]
    public class SpecialThreshold
    {
        public MatchShape shape;
        public SpecialTileType creates;
    }

    [SerializeField] private SpecialThreshold[] thresholds = new SpecialThreshold[]
    {
        new SpecialThreshold { shape = MatchShape.Linear4, creates = SpecialTileType.LineBomb },
        new SpecialThreshold { shape = MatchShape.Linear5, creates = SpecialTileType.ColorBomb },
        new SpecialThreshold { shape = MatchShape.TShape,  creates = SpecialTileType.Explosion },
        new SpecialThreshold { shape = MatchShape.LShape,  creates = SpecialTileType.Explosion },
    };

    public SpecialTileType WhatDoesShapeCreate(MatchShape shape)
    {
        foreach (var t in thresholds)
        {
            if (t.shape == shape) return t.creates;
        }
        return SpecialTileType.None;
    }
}
