#pragma strict

//This goes in the enemy ragdoll or rigidbody.  It sets off any particles and reports sounds to be played then destroys itself.

function Start () {
	BeginDeathSequence();
}

function BeginDeathSequence(){
	yield WaitForSeconds(3.5);
	//GetComponent(MeshRenderer).enabled = false;
	
	Destroy(gameObject, 1.0);
}