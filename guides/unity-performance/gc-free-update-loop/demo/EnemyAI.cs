using UnityEngine;
using System.Collections.Generic;

public class EnemyAI : MonoBehaviour
{
    private Rigidbody2D rb;
    private readonly List<Transform> nearby = new List<Transform>(16);
    private readonly Collider2D[] hits = new Collider2D[8];

    void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    void FixedUpdate()
    {
        int count = Physics2D.OverlapCircleNonAlloc(transform.position, 5f, hits);
        nearby.Clear();
        for (int i = 0; i < count; i++) nearby.Add(hits[i].transform);
        Decide(nearby);
    }

    void Decide(List<Transform> _) {}
}
