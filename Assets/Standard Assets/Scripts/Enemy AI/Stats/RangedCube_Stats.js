#pragma strict

//This file will determine the personality and stats of an Enemy AI based on enemyCharacterType and more. 
//Messages will be sent when a stat must be changed. Stats load up on awake and are generated on awake as well.

//Vital Stats
private var enemyMaxHealth : float;

//Attack Variables
private var enemyAttackType : String; //"Ranged" "Mele" and more
private var weaponAttackRange : float;
private var attackDelay : float;
private var enemyMeleDamage : float;
private var enemyRangedDamage : float;

//Attack Engagement Variables
private var minDistFromPlayer : float;
private var idealRange : float;

//Navigation
var enemyMoveSpeed : float;
private var fieldOView : float;

//Personality
private var damageReactionPattern: boolean;
private var enemyDamageReactionType : String;


function Awake(){

	//Vital Stats
	enemyMaxHealth = 350.0;

	//Attack Variables
	enemyAttackType = "HoverRanged";
	weaponAttackRange = 18;
	attackDelay = 4.0;
	enemyMeleDamage = 0.0;
	enemyRangedDamage = 15.0;
	
	//Attack Engagement Variables
	minDistFromPlayer = 6.0;
	idealRange = 8.0;
	
	//Navigation
	if(enemyMoveSpeed == 0.0){
		enemyMoveSpeed = 5;
	}
	fieldOView = 90.0;
	
	//Damage Reaction
	damageReactionPattern = true;
	enemyDamageReactionType = "Backup";
	
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

//------------------------------------------------------------------------------------------------------------------------ANIMATIONS

private var childAnimation : Animation;

function Start(){
	//Plays Animation on the specified GameObject
	childAnimation = this.GetComponentInChildren(Animation);

}

function AttackRanged1(){
	//Play the ranged attack animation
	childAnimation.Play("Attack_Ranged_1");
}

