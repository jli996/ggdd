using UnityEngine;

public class PlayerController : MonoBehaviour
{
    void Update()
    {
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        transform.Translate(new Vector3(h, 0f, v) * Time.deltaTime);
        if (Input.GetKey(KeyCode.Space)) Jump();
    }

    void Jump() {}
}
