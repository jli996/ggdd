using UnityEngine;

public enum GamePhase { Lane, Mid, Late }

[CreateAssetMenu(menuName = "GGDD/MobaPhases")]
public class MobaPhases : ScriptableObject
{
    [System.Serializable]
    public class ChampionPowerCurve
    {
        public string championName;
        public float lanePower;
        public float midPower;
        public float latePower;
    }

    [SerializeField] private ChampionPowerCurve[] champions;

    public float PowerInPhase(string championName, GamePhase phase)
    {
        var champ = System.Array.Find(champions, c => c.championName == championName);
        if (champ == null) return 0f;
        return phase switch
        {
            GamePhase.Lane => champ.lanePower,
            GamePhase.Mid  => champ.midPower,
            GamePhase.Late => champ.latePower,
            _ => 0f,
        };
    }

    public GamePhase PeakPhase(string championName)
    {
        var champ = System.Array.Find(champions, c => c.championName == championName);
        if (champ == null) return GamePhase.Lane;
        if (champ.lanePower >= champ.midPower && champ.lanePower >= champ.latePower)
            return GamePhase.Lane;
        if (champ.midPower >= champ.latePower)
            return GamePhase.Mid;
        return GamePhase.Late;
    }
}
