//[FILE IS USED IN ALL ENEMY STANDARD TYPES]
//Engages the Player depending on the Type of enemy and its personality.
private var controller : CharacterController;
private var playerLocationScript;
var nameOfStatsScript : String = "Enemy_PersonalityStats";
var ragdoll : GameObject;
var enemyBulletObject : GameObject;
var bulletSpawn : GameObject;
public var projectileDetonatorScript : MonoBehaviour;
@HideInInspector
var engage : boolean = false;
@HideInInspector
var lostPlayer : boolean = false;

//Velocity recorder
private var enemyPrevPosition : Vector3;
var enemyVelocity : Vector3;

//Death variables
private var enemyDeathReported : boolean = false;

//Vital Stats
private var currentEnemyHealth : float = -1.0;
private var enemyMaxHealth : float = -1.0;

private var timeForAnotherAttack : boolean = false;
private var currentlyStrafing : boolean = false;
private var pathChosen : boolean = false;
private var resetVariablesAlready : boolean = false;
private var chargeInitiated : boolean = false;
private var actualTrailSize : int = 0;
private var currentArrayTarget : int = -1;
private var copyFollowTrail : Array;
private var positionToCharge : Vector3 = Vector3(-1, -1, -1);

//SimpleMele Bunch Check timers and stats
private var timeSinceLastBunchCheck : float = -1;
private var timeForBunchingCheck : boolean = false;
private var leftRayBunching : boolean = false;
private var rightRayBunching : boolean = false;

//Colapse Follow Trail vars
private var currentAssuredLocation : int = 0;
private var colapsedFollowArray : Array;
private var curColapsedArrayMax : int = 0;
private var targetArrayPos : int = 0;
private var timeSinceLastSearch : float;
private var timePerSearches : float = 0.25;

private var layerMask = 1<<10;
private var timeSinceAttackBegan : float = -1.0;
private var giveUpAttackTime : boolean = false;
private var secsToNextStrafe : float = -1.0;
private var timeSinceLastAttack : float = -1.0;
private var secsPerLineCheck : float = 0.5;
private var secsSinceLastLinecast : float;
private var timeSinceLastStrafe : float = 0.0;
private var timeSpentStrafing : float = 0.0;
private var secsForStrafing : float = 0.0;
private var strafeDir : String = "Left";
private var searchBehavior : String = "track";
private var distFromIdeal : float = 1.1;
//(1.5 WORKS Well without rotation clamping) (Anything lower than 1.5 required rotation clamping and perhaps a rewrite of the margin arival system Which i have done already)
private var arrivalMargin : float;

//Reaction Variables for when AI gets hit for damage.
private var damageReaction : boolean = false;
private var timeSinceLastReaction : float = 0.0;
private var timeReactionBegan : float = 0.0;
private var maxSecsPerDamReactions : float = 5.0;
private var maxReactionMoveTime : float = 2.5;
private var randomized_maxReactionMoveTime : float = 0.0;
private var damageReactionStage : int = 0;
private var turnDirectionPicked : boolean = false;
private var turnReferenceDirection : Vector3 = Vector3(0,0,0);
private var subDamageReactionType : String = "null";

//get the following info from Enemy_PersonalityStats:
private var enemyMoveSpeed : float;
private var enemyAttackType : String;
private var enemyMeleDamage : float;
private var enemyRangedDamage : float;
private var damageReactionType : String;
private var weaponAttackRange : float;
private var minDistFromPlayer : float;
private var idealRange : float;
private var attackDelay : float;
//Personality -- TAKEN FROM _Stats.js file
private var damageReactionPattern : boolean;

//Ranged info for projectiles
private var enemyBulletInfoArray : int[] = new int[2];


function Awake() {
	//NotificationCenter.DefaultCenter().AddObserver(this, "");
}

function Start(){
	//This references the SCRIPT where the MainPlayer position STATIC variable is housed.
	playerLocationScript = GameObject.FindWithTag("MainPlayer").GetComponent(GameController);
	
	controller = GetComponent(CharacterController);
	
	//Get this info from Enemy_Navigation.  This keeps shared variables from needing duplicates.
	arrivalMargin = this.GetComponent(Enemy_Navigation).arrivalMargin;
	
	//GET THIS INFO FROM AIPersonalityAndStats aka the [monstertype]_Stats script
	enemyMoveSpeed = this.GetComponent(nameOfStatsScript).enemyMoveSpeed;
	enemyAttackType = this.GetComponent(nameOfStatsScript).enemyAttackType;
	enemyMeleDamage = this.GetComponent(nameOfStatsScript).enemyMeleDamage;
	enemyRangedDamage = this.GetComponent(nameOfStatsScript).enemyRangedDamage;
	damageReactionPattern = this.GetComponent(nameOfStatsScript).damageReactionPattern;
	damageReactionType = this.GetComponent(nameOfStatsScript).enemyDamageReactionType;
	attackDelay = this.GetComponent(nameOfStatsScript).attackDelay;
	weaponAttackRange = this.GetComponent(nameOfStatsScript).weaponAttackRange;
	minDistFromPlayer = this.GetComponent(nameOfStatsScript).minDistFromPlayer;
	idealRange = this.GetComponent(nameOfStatsScript).idealRange;
	//Vital Stats
	enemyMaxHealth = this.GetComponent(nameOfStatsScript).enemyMaxHealth;
	//Personality

	
	currentEnemyHealth = enemyMaxHealth;
	//mele damage for projectile array
	enemyBulletInfoArray[0] = enemyRangedDamage;
	//magic damage [Consider removing or replacing if no maigcz]
	enemyBulletInfoArray[1] = 0.0;
}


function Update(){
	if(engage == true){
		resetVariablesAlready = false;

		if(lostPlayer == true){
			if(searchBehavior == "track"){
				TrackPlayer();
			}
			else if(searchBehavior == "colapse"){
				ColapseFollowArray(actualTrailSize);
			}
			else if(searchBehavior == "follow"){
				FollowPlayerTrail();
			}
		}
		else {
			EngagePlayer();
		}
	}
	else if(!resetVariablesAlready){
			//If we are off we should reset this for next time.
			resetVariables();
	}
	
	//Record velocity which is (xf-xi)/deltaTime
	enemyVelocity = ( (transform.position - enemyPrevPosition)/ Time.deltaTime);
	enemyPrevPosition = transform.position;
	
	//checks HEALTH for DEATH conditions
	if(currentEnemyHealth <= 0.0 && !enemyDeathReported){
		//YOU ARE A DEAD ENEMY
		
		//Send message to related files about this creatures death. (Such as navigation and even a function used in this script)
		this.gameObject.SendMessage("JustGotKilled");
		
		enemyDeathReported = true;
	}
}


function resetVariables(){
	resetVariablesAlready = true;
	lostPlayer = false;
	searchBehavior = "track";
	targetArrayPos = 0;
	currentAssuredLocation = 0;
}


function ResetHealth(){
	currentEnemyHealth = enemyMaxHealth;
}


function ApplyDamage(damageDone : float){
	//ADD a damage TYPE as well. (Mele, or Ranged) -- This way we can react to the attack properly.

	//Damage done will be in positive numbers.
	currentEnemyHealth -= damageDone;
	//Send message to Enemy_Navigation to begin agro if it is not already on.
	this.gameObject.SendMessage("JustGotDamaged");
	
	print("my current health is: "+currentEnemyHealth);
	
	//WE HAVE BEEN HIT! If damageReactionPattern is true we activate the damage reaction function
	if(damageReactionPattern){
		ReactToDamage();
	}
}


//WANT THE ENEMY TO BE MOVED WHEN HIT? -- Here ya go.
function ApplyForce(positionHit : Vector3){
	print("I was hit at: "+positionHit);
}


function JustGotKilled(){
	//Turn off all attack patterns
	engage = false;
	
	//Spawn the ragdoll or rigidbody and set its velocity to the enemies last velocity.	
	var deadRag : GameObject = Instantiate(ragdoll, transform.position, transform.rotation) as GameObject;
    
    enemyVelocity.y = 0.0;
    
    deadRag.GetComponent(Rigidbody).velocity = enemyVelocity;
	
	//Then delete the object.
	Destroy(gameObject);
}


function EngagePlayer(){
	playerPos = playerLocationScript.playerTransform.transform.position;
	var distanceFromPlayer : float = Vector3.Distance(transform.position, playerPos);
	
	//Every couple seconds check if we can still linecast to player.  
	PlayerStillVisibleTest(playerPos);
	
	
	if(enemyAttackType == "Null"){
		print("MY ATTACK IS NULL!");
	}
	
	else if(damageReaction == true){
		//React to damage (usually part of a chain of evasion moves)
		DamageReactionPattern(playerPos);
	}
	
	else if(enemyAttackType == "Kamikaze"){
		//Go straight to the enemy and don't stop for anything!
		transform.LookAt(playerPos);
			moveDirection = transform.TransformDirection(Vector3.forward);
		controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
	}
	else if(enemyAttackType == "SimpleMele"){
		SimpleMeleAttackPattern(playerPos);
	}
	else if(enemyAttackType == "HoverRanged"){
		HoverRangedAttackPattern(playerPos);
	}
	else if(enemyAttackType == "HoverMele"){
		HoverMeleAttackPattern(playerPos);
	}
	else if(enemyAttackType == "MeleGatorBlue"){
		MeleGatorBlueAttackPattern(playerPos);
	}
}


function PlayerStillVisibleTest(playerPosition){
	//We are Engaging the Player!  Every couple seconds check if we can still linecast to player.  
	if(Mathf.Abs(Time.time-secsSinceLastLinecast) > secsPerLineCheck){
		//Time for a linecast to the player
		if(Physics.Linecast(transform.position, playerPosition, layerMask)){
			//An obstacle is blocking the view of player. Go into lostPlayer mode
			lostPlayer = true;
			print("lost");
			secsSinceLastLinecast = Time.time;
			return;
		}
		//Otherwise it's all good! [Record current time for the checker.]
		secsSinceLastLinecast = Time.time;
	}
}



function SimpleMeleAttackPattern(playerPosition){

	var distanceFromPlayer : float = Vector3.Distance(transform.position, playerPosition);
	var maxDistFromPlayer = weaponAttackRange*4;
	
	//Reset Timer Variables
	if(timeSinceLastAttack == -1){
		timeSinceLastAttack = Time.time;
		//Added delay time of up to an extra attackDelay in seconds
		addedDelayTime = Random.Range(0, attackDelay);
		timeForAnotherAttack = false;
	}
	
	
	//Reset Timer For Bunch Check
	if(timeSinceLastBunchCheck == -1){
		timeSinceLastBunchCheck = Time.time;
		timeForBunchingCheck = false;
	}
	
	if(timeForBunchingCheck == true){
		//SHOOT A RAY FORWARD TO SEE IF ENEMY IS BUNCHED BEHIND OTHER ENEMIES.  (this keeps lines from forming on clippable enemies)
		CheckForForwardBunching(playerPosition);
		timeSinceLastBunchCheck = -1;
	}
	else if(Mathf.Abs(Time.time-timeSinceLastBunchCheck) >= 1.0){
		timeForBunchingCheck = true;
	}

	
	//Check if its time to attack
	if(timeForAnotherAttack == true){
		//Check if AI is within range of weapon for an attack.
		if(distanceFromPlayer <= weaponAttackRange){
		
			//ATTACK
			transform.LookAt(playerPosition);
			print("I Attacked!!");
			timeSinceLastAttack = -1;

		}
		else{
			
			//Run up to AttackRange of player
			transform.LookAt(playerPosition);
			moveDirection = transform.TransformDirection(Vector3.forward);
				moveDirection.y =0.0;
			controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed );			
			
		}
	}
	else if(Mathf.Abs(Time.time-timeSinceLastAttack) >= attackDelay+addedDelayTime){
		timeForAnotherAttack = true;
	}
	else{	
		
		//PROXIMITY CODE

		//If we are outside of weaponRange*something (It should be a lesser range for MELE types so make it twice as big)
		if(distanceFromPlayer > maxDistFromPlayer ){
			//Head closer to player
			transform.LookAt(playerPosition);

			moveDirection = transform.TransformDirection(Vector3.forward);
				moveDirection.y =0.0;
			controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
		}
		
		//We are either too far or too close from idealRange by a distance of distFromIdeal
		else if(Mathf.Abs(distanceFromPlayer-idealRange) > distFromIdeal){

			if(distanceFromPlayer < idealRange){
				//We are far away from ideal range.Back up while facing the player.
				transform.LookAt(playerPosition);

				moveDirection = transform.TransformDirection(-Vector3.forward);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed/4));
			
			}
			else if(distanceFromPlayer > idealRange){
				//We are behind ideal range. Come forward.
				transform.LookAt(playerPosition);

				moveDirection = transform.TransformDirection(Vector3.forward);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
			
			}
			
		}
		
		else{
			//At least look at the player if not moving.
			transform.LookAt(playerPosition);
		}
		
	}
	//The results of the Bunch check are sorted here.  If one is triggered it results in sidemovement until the next check.
	//The raycast seems to be bugged and is being trigg'd be the mesh that cast it.  Causing AI to FOREVER loop from left to right scooting (but this looks ok for now)
	if(leftRayBunching && rightRayBunching){
		//Shuffle a random direction (ALTHOUGH RIGHT NOW IT IS NOT RANDOM AND IS SIMPLY THE SAME AS LEFT)
		//print("I need to RANDOMLY shuffle");
		EnemyStrafePattern("ScootLeft", playerPosition);
		
	}
	else if(leftRayBunching){
		//shuffle right
		//print("I need to shuffle RIGHT");
		EnemyStrafePattern("ScootRight", playerPosition);
		
	}
	else if(rightRayBunching){
		//shuffle left
		//print("I need to shuffle LEFT");
		EnemyStrafePattern("ScootLeft", playerPosition);
		
	}
}




function HoverRangedAttackPattern(playerPosition){
	
	var distanceFromPlayer : float = Vector3.Distance(transform.position, playerPosition);
	
	//Reset Timer variables
	if(timeSinceLastAttack == -1){
		timeSinceLastAttack = Time.time;
		//Added delay time of up to an extra attackDelay in seconds
		addedDelayTime = Random.Range(0, attackDelay);
		timeForAnotherAttack = false;
	}
	
	//Check if its time to attack
	if(timeForAnotherAttack == true){
		//Check if AI is within range of weapon for an attack.
		if(distanceFromPlayer <= weaponAttackRange){
				//ATTACK - First check linecast to make sure a shot wouldnt look stupid
			if(Physics.Linecast(this.transform.position, playerPosition, layerMask)){
				//Something is in the way
				//print("I want to take the shot but something is in the way");
			}
			else{
				//TAKE THE SHOT!
				transform.LookAt(playerPosition);
				print("I TOOK THE SHOT!");
				//Instantiate enemy specific bullet. THEN fill it with enemybulletInfoArray info. 
				instantiatedBullet = Instantiate(enemyBulletObject, bulletSpawn.transform.position, bulletSpawn.transform.rotation);
				(instantiatedBullet.GetComponent("RangedCube_Projectiles") as RangedCube_Projectiles).enemyBulletInformation = enemyBulletInfoArray;
				//Send (OBJECT WIDE ONLY) message to other scripts in object
				this.gameObject.SendMessage("AttackRanged1");
				//Send message to detonatorScript in BulletSpawnPoint object 
				projectileDetonatorScript.Explode();
				timeSinceLastAttack = -1;
			}
		}
		/*
		else{			
			print("I WANT TO SHOOT BUT IM TOO FAR AWAY");
			//Run up to AttackRange of player -- Redundant, we have code that does this right below.
			transform.LookAt(playerPosition);
			moveDirection = transform.TransformDirection(Vector3.forward);
				moveDirection.y =0.0;
			controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed) );
		}
		*/
	}
	else if(Mathf.Abs(Time.time-timeSinceLastAttack) >= attackDelay+addedDelayTime){
		timeForAnotherAttack = true;
	}
	
	//see if we should RANDOMISE idealRange (but only very slightly per iteration)
	if(Random.Range(0, 10) < 1){
		var possibleNewIdealRange : float = Random.Range(-1.0, 1.0);
		possibleNewIdealRange = (idealRange + possibleNewIdealRange);
		
			//if its farther than the minRange and closer than the maxAttack Range its the new ideal!
		if(possibleNewIdealRange > minDistFromPlayer && possibleNewIdealRange < weaponAttackRange){
			idealRange = possibleNewIdealRange;
		}
	}
	
	//PROXIMITY CODE
	//If we are closer to the player than we should be:
		//***THIS IS REDUNDAND,  THE BOTTOM CODE DOES THE SAME THING AND IF THIS TIGGERS FIRST IT HOLDS UP OTHER else CODE***
			//***CONSIDER REMOVING THIS FROM THE OTHER ENGAGEMENT TACTICS BELOW AND REWRITING THE backup CODE WITHOUT THIS.**** 
	if(distanceFromPlayer < minDistFromPlayer){
		//Back up while facing target!
		transform.LookAt(playerPosition);
		
		moveDirection = transform.TransformDirection(-Vector3.forward);
			moveDirection.y =0.0;
		controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
	}
	//If we are outside of weaponRange
	else if(distanceFromPlayer > weaponAttackRange){
		//Head closer to player
		transform.LookAt(playerPosition);

		moveDirection = transform.TransformDirection(Vector3.forward);
			moveDirection.y =0.0;
		controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
	}
	//We are either too far or too close from idealRange by a distance of distFromIdeal
	else if(Mathf.Abs(distanceFromPlayer-idealRange) > distFromIdeal){

		if(distanceFromPlayer < idealRange){
			//We are behind ideal range. Back up while facing the player.
			transform.LookAt(playerPosition);

			moveDirection = transform.TransformDirection(-Vector3.forward);
				moveDirection.y =0.0;
			controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed/2));
		
		}
		else if(distanceFromPlayer > idealRange){
			//We are far away from ideal range. Come forward.
			transform.LookAt(playerPosition);

			moveDirection = transform.TransformDirection(Vector3.forward);
				moveDirection.y =0.0;
			controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
		
		}
	}
	else{
		//At least look at the player if not moving.
		transform.LookAt(playerPosition);
	}
	
	//STRAFE CODE
	EnemyStrafePattern(enemyAttackType, playerPosition);
	
		//Whenever he gets hit he activates a boolean & moves backwards for a random ammount of time. (Special if statement for this) [Geting hit a second(maybe third?) time while boolean is still true sets the boolean false! AND TRIGGERS A STRAFE]
}



function HoverMeleAttackPattern(playerPosition){

	var distanceFromPlayer : float = Vector3.Distance(transform.position, playerPosition);
	var maxDistFromPlayer = weaponAttackRange*4;
	var secsBeforeEndingCharge : float = 5.0;
	
	//Reset Timer Variables
	if(timeSinceLastAttack == -1){
		timeSinceLastAttack = Time.time;
		//Added delay time of up to an extra attackDelay in seconds
		addedDelayTime = Random.Range(0, attackDelay);
		chargeInitiated = false;
		timeForAnotherAttack = false;
	}
	
	//Check if its time to attack
	if(timeForAnotherAttack == true){
		//Check if AI is within range of weapon for an attack.
		if(distanceFromPlayer <= weaponAttackRange){
				//ATTACK
				transform.LookAt(playerPosition);
				print("I Attacked!!");
				//Notify the GameController that damage has been done to the player
				NotificationCenter.DefaultCenter().PostNotification(this, "modifyCurrentHealth", -enemyMeleDamage );
				this.gameObject.SendMessage("AttackMele2");
				
				timeSinceLastAttack = -1;
				timeSinceAttackBegan = -1;

		}
		else{
			//Run up to AttackRange of player
			if(distanceFromPlayer > 8.0 && !chargeInitiated ){
				transform.LookAt(playerPosition);
				moveDirection = transform.TransformDirection(Vector3.forward);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed*1.5) );
				//print("Running into Mele range so I can CHARGE YOU");
			}
			else if( !chargeInitiated){
				positionToCharge = playerPosition;
				chargeInitiated = true;
				//print("renewing position to charge");
				
			}
			else if(Vector3.Distance(Vector3(transform.position.x,0.0,transform.position.z), Vector3(positionToCharge.x,0.0,positionToCharge.z)) > arrivalMargin && !giveUpAttackTime) {
				//Charge recorded position with greater speed.  (But it is now dodgeable)
				transform.LookAt(positionToCharge);
				moveDirection = transform.TransformDirection(Vector3.forward);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed*2.3) );
				//print("Charging");
				
				if(timeSinceAttackBegan == -1){
					timeSinceAttackBegan = Time.time;
				}
				//Timer for giving up a charge.
				if(Mathf.Abs(Time.time-timeSinceAttackBegan) >= secsBeforeEndingCharge){
					giveUpAttackTime = true;
				}
			}
			else if(giveUpAttackTime){
				//Reset both attack counters. (one for per attack and one counting time withing the attack)
				//Reset giveUpAttackTime so the next attack will execute properly.
				timeSinceLastAttack = -1;
				timeSinceAttackBegan = -1;
				giveUpAttackTime = false;
				print("I HAVE GIVEN UP THE CHARGE ATTACK");
			}
			else{
				//We have made it to the target location but he has dodged!.
				timeSinceLastAttack = -1;
				timeSinceAttackBegan = -1;
				giveUpAttackTime = false;
				print("YOU DODGED");
				
				this.gameObject.SendMessage("AttackMele1");
				
			}
		}
	}
	else if(Mathf.Abs(Time.time-timeSinceLastAttack) >= attackDelay+addedDelayTime){
		timeForAnotherAttack = true;
	}
	else{
		
		//see if we should RANDOMISE idealRange (but only very slightly per iteration)
		if(Random.Range(0, 10) < 1){
			var possibleNewIdealRange : float = Random.Range(-0.6, 0.6);
			possibleNewIdealRange = (idealRange + possibleNewIdealRange);
			
				//if its farther than the minRange and closer than the maxAttack Range its the new ideal!
			if(possibleNewIdealRange > minDistFromPlayer && possibleNewIdealRange < maxDistFromPlayer){
				idealRange = possibleNewIdealRange;
			}
		}
		
		//PROXIMITY CODE
		//If we are closer to the player than we should be:
		//***THIS IS REDUNDAND,  THE BOTTOM CODE DOES THE SAME THING AND IF THIS TIGGERS FIRST IT HOLDS UP OTHER else CODE***
			//***CONSIDER REMOVING THIS FROM THE OTHER ENGAGEMENT TACTICS BELOW AND REWRITING THE backup CODE WITHOUT THIS.**** 
		if(distanceFromPlayer < minDistFromPlayer){
			//Back up while facing target!
			transform.LookAt(playerPosition);
			
			moveDirection = transform.TransformDirection(-Vector3.forward);
				moveDirection.y =0.0;
			controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
		}
		//If we are outside of weaponRange*2 (It should be a lesser range for MELE types so make it twice as big)
		else if(distanceFromPlayer > maxDistFromPlayer ){
			//Head closer to player
			transform.LookAt(playerPosition);

			moveDirection = transform.TransformDirection(Vector3.forward);
				moveDirection.y =0.0;
			controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
		}
		//We are either too far or too close from idealRange by a distance of distFromIdeal
		else if(Mathf.Abs(distanceFromPlayer-idealRange) > distFromIdeal){

			if(distanceFromPlayer < idealRange){
				//We are far away from ideal range.Back up while facing the player.
				transform.LookAt(playerPosition);

				moveDirection = transform.TransformDirection(-Vector3.forward);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed/2));
			
			}
			else if(distanceFromPlayer > idealRange){
				//We are behind ideal range. Come forward.
				transform.LookAt(playerPosition);

				moveDirection = transform.TransformDirection(Vector3.forward);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
			
			}
			
		}
		else{
			//At least look at the player if not moving.
			transform.LookAt(playerPosition);
		}
		
		//STRAFE CODE
		EnemyStrafePattern(enemyAttackType, playerPosition);
		
			//Whenever he gets hit he activates a boolean & moves backwards for a random ammount of time. (Special if statement for this) [Geting hit a second(maybe third?) time while boolean is still true sets the boolean false! AND TRIGGERS A STRAFE]
	}
}



function MeleGatorBlueAttackPattern(playerPosition){

	var distanceFromPlayer : float = Vector3.Distance(transform.position, playerPosition);
	var maxDistFromPlayer = weaponAttackRange*4;
	
	//Reset Timer Variables
	if(timeSinceLastAttack == -1){
		timeSinceLastAttack = Time.time;
		//Added delay time of up to an extra attackDelay in seconds
		addedDelayTime = Random.Range(0, attackDelay);
		timeForAnotherAttack = false;
	}

	
	//Check if its time to attack
	if(timeForAnotherAttack == true){
		//Check if AI is within range of weapon for an attack.
		if(distanceFromPlayer <= weaponAttackRange){
		
			//ATTACK
			transform.LookAt(playerPosition);
			print("I Attacked!!");
			timeSinceLastAttack = -1;

		}
		else{
			
			//Run up to AttackRange of player
			transform.LookAt(playerPosition);
			moveDirection = transform.TransformDirection(Vector3.forward);
				moveDirection.y =0.0;
			controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed );			
			
		}
	}
	else if(Mathf.Abs(Time.time-timeSinceLastAttack) >= attackDelay+addedDelayTime){ //Should these all have an IF: time foranotherattack == false statement as well?
		timeForAnotherAttack = true;
	}
	else{	
		
		//PROXIMITY CODE

		//If we are outside of weaponRange*something (It should be a lesser range for MELE types so make it twice as big)
		if(distanceFromPlayer > maxDistFromPlayer ){
			//Head closer to player
			transform.LookAt(playerPosition);

			moveDirection = transform.TransformDirection(Vector3.forward);
				moveDirection.y =0.0;
			controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
		}
		
		//We are either too far or too close from idealRange by a distance of distFromIdeal
		else if(Mathf.Abs(distanceFromPlayer-idealRange) > distFromIdeal){

			if(distanceFromPlayer < idealRange){
				//We are far away from ideal range.Back up while facing the player.
				transform.LookAt(playerPosition);

				moveDirection = transform.TransformDirection(-Vector3.forward);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed/4));
			
			}
			else if(distanceFromPlayer > idealRange){
				//We are behind ideal range. Come forward.
				transform.LookAt(playerPosition);

				moveDirection = transform.TransformDirection(Vector3.forward);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
			
			}
			
		}
		
		else{
			//At least look at the player if not moving.
			transform.LookAt(playerPosition);
		}
		
	}
	
	//STRAFE CODE
	EnemyStrafePattern("SimpleSideSteps", playerPosition);
}



function ReactToDamage(){
	//Gets called every time AI is damaged, but ONLY if their damageReactionPattern from _Stats is set true.
	if(Mathf.Abs(Time.time - timeSinceLastReaction) >= maxSecsPerDamReactions){
		//Enough time has gone by that we can react to damage again.
		if(engage == true){
			damageReaction = true;
		}
	}
	if(damageReaction == true){

		//Incriment the stage.  it resets to ZER0.
		damageReactionStage += 1;
		//We must set the timeReactionBegan to Now to begin countdown toward completing the 'reaction'
		timeReactionBegan = Time.time;
		//Create random maxReactionMovement variable
		randomized_maxReactionMoveTime = Random.Range(0.1, maxReactionMoveTime);
		
	}
}


function DamageReactionPattern(playerPosition){
	//this means damageReaction boolean has been set to true.  Somewehere in here it must be set to false again.
	
	if(damageReactionStage == 0){
		//We shouldn't be here.
		return;
	}
	
	else if(damageReactionType == "Backup"){
	//Used when hit by a ranged weapon. (Usually used by a Ranged attack Enemy)
	
		//Limit the stages used to a max of the higest one in "Backup" which is 3
		if(damageReactionStage > 2){
			damageReactionStage = 3;
		}
		//Special Code for picking a turning direction in "Backup" stage 2.
		else if(damageReactionStage == 2 && turnDirectionPicked == false){
			//Randomly Set the turn direction LEFT or RIGHT, and get turnReferenceDirection.
			turnDirectionPicked = true;
			
			if(Random.Range(0.0, 6.0) >= 3.0){
				//Set TurnReferenceDirection to Right
				turnReferenceDirection = transform.TransformDirection(Vector3.right);
			}
			else{
				//Set TurnReferenceDirection to Left
				turnReferenceDirection = transform.TransformDirection(Vector3.left);
			}
			
			turnReferenceDirection.y = 0.0;
		}
	
		//Check if there is still time left to do evasive things. (timeReactionBegan resets every time we go to a new stage.)
		if(Mathf.Abs(Time.time - timeReactionBegan) < randomized_maxReactionMoveTime ){
		
			//Check which stage of the action we are in.
			if(damageReactionStage == 1){
				//Back up while facing the player -- for a random time from 0 to maxBackupTime
				transform.LookAt(playerPosition);
		
				moveDirection = transform.TransformDirection(-Vector3.forward);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
			}
			else if(damageReactionStage == 2){
				//Go LEFT or RIGHT for time from 0 to MaxBackupTime.  (Face direction of travel) (not a curve like strafe)(SPEED BOOST)
				transform.LookAt(turnReferenceDirection);
				controller.Move(turnReferenceDirection * Time.deltaTime * (enemyMoveSpeed+(enemyMoveSpeed*0.6)));
			}
			else if(damageReactionStage == 3){
				//We are getting shot too much.Turn off damageReaction boolean. Reset everything
				damageReactionStage = 0;
				damageReaction = false;
				turnDirectionPicked = false;
				timeSinceLastReaction = Time.time;
			}
		
		}
		else{
			//We finished one of the stages.  In any case we are done reacting now. Reset everything
			damageReactionStage = 0;
			damageReaction = false;
			turnDirectionPicked = false;
			timeSinceLastReaction = Time.time;
		}
		
	}

	else if(damageReactionType == "MeleDualResponse"){
		//Used when hit by a Ranged weapon (Usually used by Mele Enemies) -- HAS TWO OPTIONS BASED ON DISTANCE
		
		//Determine subDamageReactionType if not already set.
		if(damageReactionStage == 1 && subDamageReactionType == "null"){
			//Set subDamageReactionType based on distance from player.
			//If we are farther than two thrids MAXdistance from player do a ZigZag to get closer. (maxDistFromPlayer = weaponAttackRange*4) currently....
			if(Vector3.Distance(transform.position, playerPosition) > (weaponAttackRange*3)){
				subDamageReactionType = "ZigZag";
				print("ZIGZAG CHOSEN");
			}
			else{
				//We are closer than two thirds of Max distance.
				subDamageReactionType = "StrafeBack";
				print("STRAFE BACK CHOSEN");
			}
		}
		
		//Limit the stages used to a max of the higest one in "ZigZag" which is 3
		if(damageReactionStage > 2){
			damageReactionStage = 3;
		}
		//Special Code for picking a turning direction in "MeleDualResponse" stage 1.
		else if(damageReactionStage == 1 && turnDirectionPicked == false){
			//Randomly Set the turn direction LEFT or RIGHT, and get turnReferenceDirection.
			turnDirectionPicked = true;
			
			if(Random.Range(0.0, 6.0) >= 3.0){
				//Set TurnReferenceDirection to Right -- We will use this as a PART of the total moveDirection code below.
				turnReferenceDirection = transform.TransformDirection(Vector3.right);
			}
			else{
				//Set TurnReferenceDirection to Left
				turnReferenceDirection = transform.TransformDirection(Vector3.left);
			}
			
			turnReferenceDirection.y = 0.0;
		}
	
		//Check if there is still time left to do evasive things. (timeReactionBegan resets every time enter a new stage.)
		if(Mathf.Abs(Time.time - timeReactionBegan) < randomized_maxReactionMoveTime ){
		
			//Check which stage of the action we are in.
			if(damageReactionStage == 1){
			
				if(subDamageReactionType == "ZigZag"){
					//zigzag left or right dir + toward player (facing player) (Head this way for a certain time length (+SPEED BOOST)
					if(Mathf.Abs(Time.time - timeReactionBegan) < (randomized_maxReactionMoveTime/2)){
						//First half -- the ZIG
						transform.LookAt(playerPosition);
				
						moveDirection = transform.TransformDirection(Vector3.forward);
						moveDirection += turnReferenceDirection;
							moveDirection.y =0.0;
						controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed+(enemyMoveSpeed*0.6)) );
					}
					else{
						//Second half -- the ZAG
						transform.LookAt(playerPosition);
				
						moveDirection = transform.TransformDirection(Vector3.forward);
						moveDirection += (-1*turnReferenceDirection);
							moveDirection.y =0.0;
						controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed+(enemyMoveSpeed*0.6)) );
					}
					
				}
				else{
					//subreatcion type is the close range response: StrafeBack -- head toward player at SLOWER than usual speed on the first reaction hit. (do nothing but come closer)
					transform.LookAt(playerPosition);
			
					moveDirection = transform.TransformDirection(Vector3.forward);
						moveDirection.y =0.0;
					controller.Move(moveDirection * Time.deltaTime *  (enemyMoveSpeed-(enemyMoveSpeed*0.3)) );
					print("Moving Forward Slowly");
				}
			}
			else if(damageReactionStage == 2){
			
				if(subDamageReactionType == "ZigZag"){
					//During the zig zagwe were hit again! Break out and go (WITH SUPER SPEED BONUS!) backwards while facing player.
					transform.LookAt(playerPosition);
			
					moveDirection = transform.TransformDirection(-Vector3.forward);
						moveDirection.y =0.0;
					controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed*2) );
					print("Backing out QUICKLY");
				}
				else{
					//subreatcion type is the close ranged : StrafeBack --Unike the first part; this part is a quick strafe away and to the side of the player.
					transform.LookAt(playerPosition);
			
					moveDirection = transform.TransformDirection(-Vector3.forward);
					moveDirection += turnReferenceDirection;
						moveDirection.y =0.0;
					controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed+(enemyMoveSpeed*0.6)) );
					print("Retreating Mele strafe");
				}
				
			}
			else if(damageReactionStage == 3){
				//We are getting shot too much.Turn off damageReaction boolean. Reset everything
				damageReactionStage = 0;
				damageReaction = false;
				turnDirectionPicked = false;
				subDamageReactionType = "null";
				timeSinceLastReaction = Time.time;
			}
		
		}
		else{
			//We finished one of the stages.  In any case we are done reacting now. Reset everything
			damageReactionStage = 0;
			damageReaction = false;
			turnDirectionPicked = false;
			subDamageReactionType = "null";
			timeSinceLastReaction = Time.time;
		}
		
	}
	// More Reactions here....
}


function CheckForForwardBunching(playerPosition){
	//Sends a short raycast forward, if a fellow enemy is spotted then this AI strafes left or right a tad while facing the enemy,
	//Strafes left or Right using the strafe function and a special call for this case.
	leftRaybunching = false;
	rightRayBunching = false;
	//Bit shift so only the ClipEnemies are detected by the ray (ClipEnemy layer is only set of enemies that could possibly bunch up anyway)
	var enemyLayerMask = 1<<14;
	//See if AI can draw a line to the enemy without hitting another enemy in front of them
	
	//WE NEED ONE RAYCAST TO AI LEFT AND ONE TO AI RIGHT..  IF BOTH ARE TRIGG'd IN A CHECK go random, if Left trig'd, go right and vice versa!
	
	var fwd = transform.TransformDirection (Vector3.forward);
	//TO make this more robust in the future we may need the dimensions of all enemies and the we had radius to z and (radius + a-lil-extra) to x
	var leftAIRay = Vector3(transform.position.x+0.30, transform.position.y, transform.position.z-0.55);
	var rightAIRay = Vector3(transform.position.x-0.30, transform.position.y, transform.position.z-0.55);
		
	if(Physics.Raycast (leftAIRay, fwd, 2.0, enemyLayerMask)) {
       //Someone is in the way;  Activate the strafe function with special instruction (Shuffle)
       leftRayBunching = true;
	}
	if(Physics.Raycast (rightAIRay, fwd, 2.0, enemyLayerMask)) {
       //Someone is in the way;  Activate the strafe function with special instruction (Shuffle)
       rightRayBunching = true;
	}
	
	Debug.DrawRay (leftAIRay, fwd*2, Color.black, 1.0);

 	Debug.DrawRay (rightAIRay, fwd*2, Color.black, 1.0);



	//otherwise do nothing.
}


function EnemyStrafePattern(AttackPattern, playerPosition){ 
	//Strafes depending on the type of attack pattern used.
	//Strafing Code.
	
	//(THE RAYCAST DOESNT WORK PROPERLY AND IT MAY BE HOGGING RESOURCES... (THE SCOOTLEFT AND SCOOTRIGHT CODES ALSO THE BUNCH Function ABOVE)
	//If the end result is that they will ALWAYS scoot even when alone why not program them to do so withou the cost of the raycasting every 1.2 seconds?)

	if(AttackPattern == "ScootLeft"){
				
		transform.LookAt(playerPosition);
		//strafe left!
		moveDirection = transform.TransformDirection(Vector3.left);
			moveDirection.y =0.0;
		controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed/5));

	}
	
	else if(AttackPattern == "ScootRight"){
		
		transform.LookAt(playerPosition);
		//Strafe right!
		moveDirection = transform.TransformDirection(Vector3.right);
			moveDirection.y =0.0;
		controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed/5) );

	}
	
	else if(AttackPattern == "SimpleSideSteps"){
	//STRAFES VERY SLOWLY AND RANDOMLY (used for easier enemies)
		if(secsToNextStrafe == -1.0){
			secsToNextStrafe = Random.Range(0.5, 3.0);
		}
		else if(currentlyStrafing == false && Mathf.Abs(Time.time-timeSinceLastStrafe) >= secsToNextStrafe){
			currentlyStrafing = true;
			timeSpentStrafing = Time.time;
			secsForStrafing = Random.Range(1, 3.0);
			
			//Determine strafe direction
			if(Random.Range(0.0, 6.0) >= 3.0){
				strafeDir = "Right";
			}
			else{
				strafeDir = "Left";
			}
			
		}
		else if(currentlyStrafing == true && Mathf.Abs(Time.time-timeSpentStrafing) < secsForStrafing){
			
			if(strafeDir == "Left"){
				transform.LookAt(playerPosition);
				//strafe left!
				moveDirection = transform.TransformDirection(Vector3.left);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
			}
			else{
				transform.LookAt(playerPosition);
				//Strafe right!
				moveDirection = transform.TransformDirection(Vector3.right);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
			}
			
		}
		else if(currentlyStrafing == true){
			//It's true but has been running longer than it should.  Turn it off. and RANDOMISE secsToNextStrafe for the next time.
			currentlyStrafing = false;
			timeSinceLastStrafe = Time.time;
			secsToNextStrafe = Random.Range(0.5, 4.5);
		}
	}
	
	else if(AttackPattern == "HoverRanged"){
		if(secsToNextStrafe == -1.0){
			secsToNextStrafe = Random.Range(0.5, 4.5);
		}
		else if(currentlyStrafing == false && Mathf.Abs(Time.time-timeSinceLastStrafe) >= secsToNextStrafe){
			currentlyStrafing = true;
			timeSpentStrafing = Time.time;
			secsForStrafing = Random.Range(1, 2.5);
			
			//Determine strafe direction
			if(Random.Range(0.0, 6.0) >= 3.0){
				strafeDir = "Right";
			}
			else{
				strafeDir = "Left";
			}
			
		}
		else if(currentlyStrafing == true && Mathf.Abs(Time.time-timeSpentStrafing) < secsForStrafing){
			
			if(strafeDir == "Left"){
				transform.LookAt(playerPosition);
				//strafe left!
				moveDirection = transform.TransformDirection(Vector3.left);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed+(enemyMoveSpeed/2)));
			}
			else{
				transform.LookAt(playerPosition);
				//Strafe right!
				moveDirection = transform.TransformDirection(Vector3.right);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed+(enemyMoveSpeed/2)) );
			}
			
		}
		else if(currentlyStrafing == true){
			//It's true but has been running longer than it should.  Turn it off. and RANDOMISE secsToNextStrafe for the next time.
			currentlyStrafing = false;
			timeSinceLastStrafe = Time.time;
			secsToNextStrafe = Random.Range(0.5, 4.5);
		}
	}
	
	else if(AttackPattern == "HoverMele"){
	//STRAFES SLOWER THAN RANGED
		if(secsToNextStrafe == -1.0){
			secsToNextStrafe = Random.Range(0.5, 4.5);
		}
		else if(currentlyStrafing == false && Mathf.Abs(Time.time-timeSinceLastStrafe) >= secsToNextStrafe){
			currentlyStrafing = true;
			timeSpentStrafing = Time.time;
			secsForStrafing = Random.Range(1, 2.5);
			
			//Determine strafe direction
			if(Random.Range(0.0, 6.0) >= 3.0){
				strafeDir = "Right";
			}
			else{
				strafeDir = "Left";
			}
			
		}
		else if(currentlyStrafing == true && Mathf.Abs(Time.time-timeSpentStrafing) < secsForStrafing){
			
			if(strafeDir == "Left"){
				transform.LookAt(playerPosition);
				//strafe left!
				moveDirection = transform.TransformDirection(Vector3.left);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
			}
			else{
				transform.LookAt(playerPosition);
				//Strafe right!
				moveDirection = transform.TransformDirection(Vector3.right);
					moveDirection.y =0.0;
				controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed );
			}
			
		}
		else if(currentlyStrafing == true){
			//It's true but has been running longer than it should.  Turn it off. and RANDOMISE secsToNextStrafe for the next time.
			currentlyStrafing = false;
			timeSinceLastStrafe = Time.time;
			secsToNextStrafe = Random.Range(0.5, 4.5);
		}
	}
}


function TrackPlayer(){
//(linecasts from last to first of the PlayerFollowTrail)(until again viewing player)(Given a slight speed boost in this mode).
	
	//if the size of the trail is 0 no trail is current so get a new one.
	if(actualTrailSize == 0){
		//Grab the playerFollowTrail from the Gamecontroller Script and make a COPY of it so it wont change.
		copyFollowTrail = new Vector3[playerLocationScript.playerFollowTrail.length];
		copyFollowTrail = playerLocationScript.playerFollowTrail;
		//Grab actualTrailSpaceUsed and make it into actualTrailSize
		actualTrailSize = playerLocationScript.actualTrailSpaceUsed;
	}
	else if(!pathChosen){
		//We need to find the best place to begin heading to the player.
		for(var i : int = actualTrailSize-1; i >= 0; i--){
			if(Physics.Linecast(transform.position, copyFollowTrail[i], layerMask)){
				//Its not this one!
			}
			else{
				/*
				//We found it, lets see if the one behind it is valid
				if(i != 0){
					//There is at least one more space left
					if(Physics.Linecast(transform.position, copyFollowTrail[i-1], layerMask)){
						//Location i-1 cannot be linecasted to, use i instead.
						currentArrayTarget = i;
						pathChosen = true;
						break;
					}
					else{
						//the location one space behind the first valid spot is also valid!
						currentArrayTarget = (i-1);
						pathChosen = true;
						break;
					}
				}
				*/
				
				//Use i - The above code may be causing clipping into walls when a linecast can make it around a corner but the AI's body cannot.
				currentArrayTarget = i;
				pathChosen = true;
				break;
			}
			

			if(i==0){
				if(actualTrailSize != 1){
					//Couldnt find a match, just try going for that first and only spot....
					print("NO MATCHES of at least 2 spots, targeting place 0 "+copyFollowTrail[0]);
					currentArrayTarget = i;
					pathChosen = true;
					break;
				}
				else{
					//The trail was size 1 to begin with and the one filled spot was obscured. Just go home.
					print("Cannot find attackers only waypoint, GOING HOME");
					//Sets the ball moving, asuming PersueEnemy() is running this command will shut everything down and turn engage off.
					this.GetComponent(Enemy_Navigation).justGoHome = true;
					//Usually this resets to 0 in the colapseArray function. But in this case it will never make it that far and must be reset NOW
					actualTrailSize = 0;
					break;
				}
			}
		}
	}
	else{
		//The path is chosen.  Now it is time to colapse chosen path.
		pathChosen = false;
		searchBehavior = "colapse";
		//print("I HAVE COLLAPED THE PLAYERS FOLLOW ARRAY");
	}
}



function ColapseFollowArray(arrayAmmtFilled : int){
//colapse the array into its most basic connected (without physical interruption) waypoints. -- If a pathway cannot be made then use uncolapsed array!
//Array is considered collapsed once (currentAssuredLocation == actualTrailSize)  <-- last place.

	//Just for the heck of it we will store currentArrayTarget and then compare all points starting at currentArrayTarget+1 (if this isn't >= arrayAmmtFilled)
	if(currentAssuredLocation == 0){
		//Instantiate array
		colapsedFollowArray = new Vector3[arrayAmmtFilled];
	
		//Fill place 0 with copyFollowTrail[currentArrayTarget] <--this becomes the origin.
		colapsedFollowArray[0] = copyFollowTrail[currentArrayTarget];
		curColapsedArrayMax = 1;
		//Incriment currentAssuredLocation so it auto-inclued currentArrayTarget+1
		currentAssuredLocation = currentArrayTarget+1;
	}
	
	var trailRanCold : boolean = false;
	
	if(currentAssuredLocation != arrayAmmtFilled-1){
		
		//crumbLocArray[currentAssuredLocation] is added to the colapsedCrumbArray[curColapsedArrayMax],
		colapsedFollowArray[curColapsedArrayMax] = copyFollowTrail[currentAssuredLocation];
		
		//colapsedFollowArray[currentAssuredLocation] is linecasted against copyFollowTrail[g]. (Start at the end and crawl backwards)
		for(var g : int = arrayAmmtFilled-1; g > curColapsedArrayMax; g--){
	
			if( Physics.Linecast(colapsedFollowArray[curColapsedArrayMax], copyFollowTrail[g], layerMask) ){
				//Something on the OBSTACLE layer is in the way!  These two locations DO NOT connect.
				
				//Check if g is at the last location before currentAssuredLocation(We dont want to check it against itself)
				if(g == (curColapsedArrayMax+1) ){
					//The trail just ran cold without a connection!
					currentAssuredLocation = g;
					print("TRAIL BROKEN AT "+copyFollowTrail[g]);
					//Incriment the arrayMax so the next stored position will be one higher.
					curColapsedArrayMax += 1;
					break; 
				}
			}
			else{
				//Nothing on the OBSTACLE layer stops these locatons from connecting.  We have the next assuredLocation.
				currentAssuredLocation = g;
				//Incriment the arrayMax so the next stored position will be one higher.
				curColapsedArrayMax += 1;
				
				break;
			}
			
		}

	}
	else{		
		//Put the last position into the array because crumbArrayHasColpased = true, and we will not return to the top again for standard array insertion.  We do not incriment arrayMax as this is the last addition.
		colapsedFollowArray[curColapsedArrayMax] = copyFollowTrail[currentAssuredLocation];
		currentAssuredLocation = 0;
		//print("Array to follow is size "+(curColapsedArrayMax+1));
		searchBehavior = "follow";
	}
}


function FollowPlayerTrail(){
	//Array has been colapsed and is ready to be followed. //The personality still applies in FollowPlayerTrail()! [ALSO ai gets a speed boost]
	playerPos = playerLocationScript.playerTransform.transform.position;
	var distanceFromPlayer : float = Vector3.Distance(transform.position, playerPos);
	var alreadyTeleportedFromStuck : boolean;
	
	if(targetArrayPos == 0){
		actualTrailSize = 0;
		//Make sure the first thing that happens when following the player is an immediate linecast search.
		timeSinceLastSearch = timePerSearches;
	}
	
	//NOT IN USE == See if we are ready to attack OR we are outside weaponAttackRange - This means we need to find the player ASAP! 
	//if(timeForAnotherAttack || distanceFromPlayer > weaponAttackRange){
	
	//Check if we are outside Arrival range of targetArrayPos
	if(Vector3.Distance(Vector3(transform.position.x,0.0,transform.position.z), Vector3(colapsedFollowArray[targetArrayPos].x,0.0,colapsedFollowArray[targetArrayPos].z) ) > arrivalMargin){
		//We haven't reached this node yet. Head closer
		
		// DOES NOT WORK (var alreadyTeleportedFromStuck : boolean = false;)
		//Retrying the last two positions never worked either.  They got stuck exactly the same way.  (the positions themselves would need moving, perhaps AWAY from AI)
		if(this.GetComponent(Enemy_Navigation).consecutiveLostStuckPings == 0){
			alreadyTeleportedFromStuck = false;
		}
		else{
			if(this.GetComponent(Enemy_Navigation).consecutiveLostStuckPings > 1){
				//Will need a triedBacktrackingAlready variable that is reset with actual trail size.
				print("Teleporting to next pos");
				alreadyTeleportedFromStuck = true;
				//Resetting Lost and Stuck counter.
				this.GetComponent(Enemy_Navigation).consecutiveLostStuckPings = 0;
				transform.position = Vector3(colapsedFollowArray[targetArrayPos].x, transform.position.y, colapsedFollowArray[targetArrayPos].z);
			}
		}
		
		/* DOES NOT WORK
			//We tend to get stuck while lost and searching for the player.  
			//Therefore here is some obstacle detection & avoidance code.
			var avoidanceTurnDir : Vector3 = (colapsedFollowArray[targetArrayPos] - transform.position).normalized;
			var avoidanceRayHit : RaycastHit;
			
			var leftRayOrigin : Vector3 = transform.position;
			var rightRayOrigin : Vector3 = transform.position;
			
			//This will need to be dynamic and come from the stats file.  A single character radius to determine how far to its sides.
			leftRayOrigin.x -= 1.3;
			rightRayOrigin.x += 1.3;
			
			//Raycasts to find the propper direction normal, then add that to the lookAt and then make it move forward toward the goal.
			if(Physics.Raycast(transform.position, transform.forward, avoidanceRayHit, 10, layerMask)){
				Debug.DrawLine(transform.position, avoidanceRayHit.point, Color.red);
				avoidanceTurnDir += avoidanceRayHit.normal * 30;
			}
			
			if(Physics.Raycast(leftRayOrigin, transform.forward, avoidanceRayHit, 10, layerMask)){
				Debug.DrawLine(leftRayOrigin, avoidanceRayHit.point, Color.red);
				avoidanceTurnDir += avoidanceRayHit.normal * 30;
			}
			
			if(Physics.Raycast(rightRayOrigin, transform.forward, avoidanceRayHit, 10, layerMask)){
				Debug.DrawLine(rightRayOrigin, avoidanceRayHit.point, Color.red);
				avoidanceTurnDir += avoidanceRayHit.normal * 30;
			}
			
			var lookAvoidance : Quaternion = Quaternion.LookRotation(avoidanceTurnDir);
			
			transform.rotation = Quaternion.Slerp(transform.rotation, lookAvoidance, Time.deltaTime);
			
			moveDirection = transform.TransformDirection(Vector3.forward);
			//moveDirection.y =0.0;
			controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed+(enemyMoveSpeed*0.6)) );
			
			
		}
		else{
		*/
		
		//We arent stuck so follow the array node.
		transform.LookAt(colapsedFollowArray[targetArrayPos]);

		moveDirection = transform.TransformDirection(Vector3.forward);
		//moveDirection.y =0.0;
		controller.Move(moveDirection * Time.deltaTime * (enemyMoveSpeed+(enemyMoveSpeed*0.6)) );

		
		//Check if its time to linecast for player
		if(Mathf.Abs(Time.time-timeSinceLastSearch) >= timePerSearches){
			//Linecast to player to see if we have found them.
			if(Physics.Linecast(transform.position, playerPos, layerMask)){
				Debug.DrawLine(transform.position, playerPos, Color.red);
				//We cannot see player, reset timer
				timeSinceLastSearch = Time.time;
				//print("Lost, Cannot SEE PLAYER!");
			}
			else{
				//We FOUND the player!
				print("I FOUND YOU");
				searchBehavior = "track";
				targetArrayPos = 0;
				lostPlayer = false;
				
			}
		}
		
	}
	else{
		//We have arrived at the current Node. Incriment and continue or stop if it's the last place.
		if(targetArrayPos == curColapsedArrayMax){
			//The last place has been reached.  Go back to track player behavior and try again.
			searchBehavior = "track";
			targetArrayPos = 0;
			//print("AI has reached the end of trail.");
			return;
		}else{
			targetArrayPos +=1;
		}
	}
}