using UnityEngine;

[CreateAssetMenu(menuName = "Runners/RunEconomy")]
public class RunEconomy : ScriptableObject
{
    public enum UnlockType { Character, Board, PowerUp }

    [System.Serializable]
    public class Unlockable
    {
        public string     name;
        public int        costCoins;
        public UnlockType unlockType;
    }

    [SerializeField] private Unlockable[] unlockables;
    [SerializeField] private int   baseCoinsPerSecond = 2;
    [SerializeField] private float failureCoinKeepPercent = 0.5f;

    public float CoinsEarned(float runSeconds, bool succeeded)
    {
        float gross = baseCoinsPerSecond * runSeconds;
        return succeeded ? gross : gross * failureCoinKeepPercent;
    }
}
