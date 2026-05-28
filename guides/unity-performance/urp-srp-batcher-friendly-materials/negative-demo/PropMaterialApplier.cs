using UnityEngine;

public class PropMaterialApplier : MonoBehaviour
{
    public void SetColor(Color c)
    {
        GetComponent<Renderer>().material.color = c;
    }
}
