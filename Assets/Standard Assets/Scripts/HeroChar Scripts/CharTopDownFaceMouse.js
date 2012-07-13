//Character faces raycast position at certain speed
var speed = 10.0;

function Update () {

    var playerPlane : Plane = new Plane(Vector3.up, transform.position);
    var ray : Ray = Camera.main.ScreenPointToRay (Input.mousePosition);
    var hitdist : float = 0.0;

    if (playerPlane.Raycast (ray, hitdist)) {

        var targetPoint : Vector3 = ray.GetPoint(hitdist);
        var targetRotation = Quaternion.LookRotation(targetPoint - transform.position);

        transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, speed * Time.deltaTime);
    }
}
