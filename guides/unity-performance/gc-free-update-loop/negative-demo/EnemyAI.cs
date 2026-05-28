using UnityEngine;
using System.Collections.Generic;
using System.Linq;

public class EnemyAI : MonoBehaviour
{
    void FixedUpdate()
    {
        var rb = GetComponent<Rigidbody2D>();
        var hits = Physics2D.OverlapCircleAll(transform.position, 5f);
        var nearby = hits.Select(h => h.transform).ToList();
        Debug.Log("Nearby count: " + nearby.Count);
        Decide(nearby);
    }

    void Decide(List<Transform> _) {}
}
