//This file will determine the personality and stats of an Enemy AI based on enemyCharacterType and more. 
//Messages will be sent when a stat must be changed. Stats load up on awake and are generated on awake as well.
//TEMPLATE TEMPLATE TEMPLATE TEMPLATE
//Vital Stats TEMPLATE TEMPLATE TEMPLATE TEMPLATE
private var enemyMaxHealth : float;

//Attack Variables
private var enemyAttackType : String; //"Ranged" "Mele" and more
private var weaponAttackRange : float;
private var attackDelay : float;

//Attack Engagement Variables
private var minDistFromPlayer : float;
private var idealRange : float;

//Navigation
var enemyMoveSpeed : float;
private var fieldOView : float;

//Personality
//private var damageReactionPattern: boolean = false;
private var enemyDamageReactionType : String = "Backup";


function Awake(){

	//Vital Stats
	enemyMaxHealth = 350.0;

	//Attack Variables
	enemyAttackType = "Ranged";
	weaponAttackRange = 15;
	attackDelay = 4.0;
	
	//Attack Engagement Variables
	minDistFromPlayer = 6.0;
	idealRange = 8.0;
	
	//Navigation
	if(enemyMoveSpeed == 0.0){
		enemyMoveSpeed = 5;
	}
	fieldOView = 90.0;
	
	//Death Handler stuff
	//timeBeforeDestruction = 3secs;
	//deathAnimationBegin = 12etc;
	//deathAnimationEnd = 36etc;
	//deathSFX
	//perhaps particle effect type or something
	
	//---------------------------------------------------GENERATE PERSONALITY STATS
	//If useFleePattern is TRUE set fleePattern to either "Coward" "Kamikaze" "None" etc... if FALSE set to "None"
	//Decide if we will have a damageReactionPattern or NOT. <--If this is off we will not send messages when hit.
}