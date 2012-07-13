#pragma strict
//ALL TYPES OF PROJECTILES THAT SHOOT FROM ALL TYPES OF RANGEDCUBES WILL BE HANDLED HERE

private var bullet1Speed : int = 60;
var enemyBulletInformation : int[] = new int[2];
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
	if(enemyBulletInformation != null && bulletStarted == false){
	//Bullet Information is set in the gun controller, Later I can add the character that shot the bullet or anything else I need to the bulletInformation array.
		physDamage = enemyBulletInformation[0];
		magicDamage = enemyBulletInformation[1];
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
	
	if (objHit.gameObject.tag == "MainPlayer" && !alreadySentMessage) 
    { 
		print("Hit the Hero for "+physDamage);
		alreadySentMessage = true;
		
		//Send notification with amount of damage. -- EVENTUALLY THIS WILL SEND PHY AND MAGIC DAMAGE (IF I KEEP MAGIC IN THE GAME)
		NotificationCenter.DefaultCenter().PostNotification(this, "modifyCurrentHealth", -physDamage );
	}
	
	Destroy(gameObject);

}