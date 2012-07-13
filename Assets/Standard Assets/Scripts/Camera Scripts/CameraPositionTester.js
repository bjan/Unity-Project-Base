#pragma strict

private var cameraChosen : int = 2;

function Start () {
	if(cameraChosen == 1){
		print("Setting up Camera Position 1");
	 	transform.localPosition = Vector3(0, 70, 0);
	 	transform.localEulerAngles = Vector3(90, 0, 0);
	 	camera.fieldOfView = 25;
	 }
	 else if(cameraChosen == 2){
	 	print("Setting up Camera Position 2");
	 	transform.localPosition = Vector3(0, 56.11482, -33.66407);
	 	transform.localEulerAngles = Vector3(60, 0, 0);
	 	camera.fieldOfView = 25;
	 }
	  else if(cameraChosen == 3){
	 	print("Setting up Camera Position 3");
	 	transform.localPosition = Vector3(0, 56.11482, -33.66407);
	 	transform.localEulerAngles = Vector3(60, 0, 0);
	 	camera.fieldOfView = 15;
	 }
}

function Update () {

}