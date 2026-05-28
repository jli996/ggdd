using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private InputActionAsset inputActions;
    private InputAction moveAction;

    void OnEnable()
    {
        moveAction = inputActions.FindActionMap("Player").FindAction("Move");
        moveAction.Enable();
    }

    void OnDisable() => moveAction.Disable();

    void Update()
    {
        Vector2 move = moveAction.ReadValue<Vector2>();
        transform.Translate(new Vector3(move.x, 0f, move.y) * Time.deltaTime);
    }
}
