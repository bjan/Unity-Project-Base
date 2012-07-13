#pragma strict
//THIS METHOD BELOW WILL BE MORE EFFECTIVE THAN THE CURRENT SETUP SO DO IT WHEN YOU HAVE TIME:
//CONSIDER TESTING A RAY LINE FROM BULLET CURRENT POSITION TO WHERE BULLET WAS FIRED FROM TO SEE IF RAY HITS ENEMY.  IF SO DELETE BULLET AND SEND DAMAGE MESSAGE

private var bullet1Speed : int = 100;
var bulletInformation : int[] = new int[2];
private var decayTime : float = 1.0;
private var bulletStarted : boolean = false;
private var physDamage : int;
private var magicDamage : int;
private var alreadySentMessage = false;

function Start(){
	//Start the death timer coroutine so it heads to its timely death.
	Destroy(gameObject, decayTime);
}

function Update () {
	if(bulletInformation != null && bulletStarted == false){
	//Bullet Information is set in the gun controller, Later I can add the character that shot the bullet or anything else I need to the bulletInformation array.
		physDamage = bulletInformation[0];
		magicDamage = bulletInformation[1];
		bulletStarted = true;		
	}
	else if(bulletStarted == true){
	//Propell the bullet forward at a certain speed.
	//rigidbody.velocity = transform.forward * bullet1Speed;
	rigidbody.AddForce(transform.forward * bullet1Speed);
	}
}

function OnCollisionEnter(objHit : Collision){
//Im trying to leave out the (collisionInfo : Collision) because it will slow things down and I dont need it
	
	if (objHit.gameObject.tag == "Enemy" && !alreadySentMessage) 
    { 
		print("Hit the enemy for "+physDamage);
		alreadySentMessage = true;
		
		objHit.gameObject.SendMessage ("ApplyDamage", physDamage);
		objHit.gameObject.SendMessage ("ApplyForce", objHit.contacts[0].point);
	}
	
	Destroy(gameObject);

}