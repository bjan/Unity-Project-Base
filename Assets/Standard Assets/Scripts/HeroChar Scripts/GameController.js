//STORES the player transform as a static variable for use all over the game.  -- MORE OF A CHARACTER CONTROLLER THAN AN ENTIRE GAME CONTROLLER
static var playerTransform : Transform;
static var playerFollowTrail : Array;
static var currentPlayerHealth : float = -1.0;
static var currentPlayerMana : float = -1.0;
static var currentPlayerStamina : float = -1.0;

//May neeed to be longerrr
var followTrailLength : int = 500;
var distPerTrailNode : float = 1;
private var agroCounter : int = 0;
private var actualTrailSpaceUsed = 0;
private var charStatsLocation;

//Stat Regeneration Variables -----------------------------MAGIC HAS NOT BEEN ADDED YET!@
private var secsPerStamRegen : float = 0.25;
private var timeSinceStamRegen : float = 0.0;
private var secsPerHealthRegen : float = 6.0;
private var timeSinceHealthRegen : float = 0.0;
//private var staminaRegen : float = 0.15; One below is for testing purposes
private var staminaRegen : float = 0.55;
private var healthRegen : float = 5.0;

// *** BEGIN BRANDON EDIT *** //
// This object holds the message data to be sent to the notification system
// Would have just made it a string, but I wanted it to contain two variables:
// the message text, and the number of characters in that message
private var messageData : String;
// *** END BRANDON EDIT *** //

//This is used for debugging the player follow trail (which enemies follow when lost)
//var demonstrationObject : GameObject;

function Awake()
{  
	NotificationCenter.DefaultCenter().AddObserver(this, "BaseStatsInitiated");
	NotificationCenter.DefaultCenter().AddObserver(this, "modifyCurrentHealth");
	NotificationCenter.DefaultCenter().AddObserver(this, "modifyCurrentMana");
	NotificationCenter.DefaultCenter().AddObserver(this, "modifyCurrentStamina");
	//NotificationCenter.DefaultCenter().AddObserver(this, "beATypeWriter");
	NotificationCenter.DefaultCenter().AddObserver(this, "EnemyAgro");
	
	
	playerTransform = GameObject.FindWithTag("MainPlayer").GetComponent(Transform);
	charStatsLocation = GameObject.FindWithTag("MainCamera").GetComponent(Char_Stats);
}


function Start()
{
	//Initiate the follow array
	playerFollowTrail = new Vector3[followTrailLength];
}


function Update()
{
	//This is for TESTING ONLY and WILL NOT STAY FOR TOO LONG
	if(Input.GetButtonUp ("Jump")){
		var healthMod : float = -11.0;
		NotificationCenter.DefaultCenter().PostNotification(this, "modifyCurrentHealth", healthMod);
		NotificationCenter.DefaultCenter().PostNotification(this, "modifyCurrentStamina", 1.0);
	}
	
	// *** BEGIN BRANDON EDIT *** //
	// This was just my way of testing the PostNotification.
	// Really, the following lines can be called from anywhere.
	// First, construct the necessary variables message text in index 1, and message length in index 0.
	// Of course, you want to set the message text first, and the length second.
	// Then just send the messageData object to the notification system, under the name "beATypeWriter.
	if(Input.GetButtonUp("Jump")){
		messageData = "So the dog went to the store";
		NotificationCenter.DefaultCenter().PostNotification(this, "beATypeWriter", messageData);
	}
	// *** END BRANDON EDIT *** //
		
	//Agro counter for the Follow Trail
	if(agroCounter != 0){
		if(agroCounter > 0){
			CreateFollowTrail();
		}
		else{
			//Agro counter got into the negatives somehow so reset to 0.
			agroCounter = 0;
		}
	}
	else{
		//Reset this to zero when the agro is gone.
		actualTrailSpaceUsed = 0;
	}
	
	//Stat ReGeNeRaTiOn!
	//HEALTH regen:.
	if(Mathf.Abs(Time.time - timeSinceHealthRegen) > secsPerHealthRegen){
		NotificationCenter.DefaultCenter().PostNotification(this, "modifyCurrentHealth", healthRegen);
		timeSinceHealthRegen = Time.time;
	}
	//STAMINA regen:.
	if(Mathf.Abs(Time.time - timeSinceStamRegen) > secsPerStamRegen){
		NotificationCenter.DefaultCenter().PostNotification(this, "modifyCurrentStamina", staminaRegen);
		timeSinceStamRegen = Time.time;
	} 
}

function EnemyAgro(notification : Notification){
	//Boolean data: True = Agro Set, False = Lost Agro
	
	if(notification.data == true){
		//Add one to the agro counter
		agroCounter += 1;
	}
	else{
		//Take one from agro counter
		agroCounter -= 1;
	}
}


function BaseStatsInitiated(notification : Notification)
{
	//If this is called then the base stats have been set up and are ready for use. 
	if(currentPlayerHealth <= 0.0)
	{
		currentPlayerHealth = charStatsLocation.heroMaxHealth;
	}
	if(currentPlayerMana <= 0.0)
	{
		currentPlayerMana = charStatsLocation.heroMaxMana;
	}
	if(currentPlayerStamina <= 0.0)
	{
		currentPlayerStamina = charStatsLocation.heroMaxStamina;
	}
}


function modifyCurrentHealth(notification : Notification){
	//This will be called after an initial setup message is sent from char_stats.  Also will be called every time a message is sent about health adjustment.
	var maxHealth : float = charStatsLocation.heroMaxHealth;

	currentPlayerHealth += notification.data;
	
	if(currentPlayerHealth < 0.0)
	{
		currentPlayerHealth = 0.0;
		//ALSO YOU'RE DEAD!
	}
	
	if(currentPlayerHealth > maxHealth)
	{
		currentPlayerHealth = maxHealth;
	}
}


function modifyCurrentMana(notification: Notification)
{
	//This will be called after an initial setup message is sent from char_stats.  Also will be called every time a message is sent about mana adjustment.
	var maxMana : float = charStatsLocation.heroMaxMana;

	currentPlayerMana += notification.data;
	
	if(currentPlayerMana < 0.0)
	{
		currentPlayerMana = 0.0;
	}
	
	if(currentPlayerMana > maxMana)
	{
		currentPlayerMana = maxMana;
	}
}


function modifyCurrentStamina(notification: Notification)
{
	//This will be called after an initial setup message is sent from char_stats.  Also will be called every time a message is sent about Stamina adjustment.
	var maxStamina : float = charStatsLocation.heroMaxStamina;
	var staminaDepleted : boolean = false;
	
	//Before we adjust the stamina below we must check if it is currently depleted
	if(currentPlayerStamina == 0.0){
		staminaDepleted = true;
	}

	currentPlayerStamina += notification.data;
	
	if(currentPlayerStamina < 0.0 && maxStamina > 0.0)
	{
		currentPlayerStamina = 0.0;

		//if stamina wasn't depleted before this, and some valid (non 0) adjustment was requested. (THIS STOPS IT FROM REPORTING NO STAMINA ON STARTUP when it starts at 0.0 for a second) 
		if(!staminaDepleted && notification.data != 0.0){
			NotificationCenter.DefaultCenter().PostNotification(this, "StaminaAvailable", false);
		}
	}
	
	if(currentPlayerStamina > 0.0 && staminaDepleted){
		//Stamina used to be 0 before this update and is now greater than 0.  Alert listeners with the news.
		NotificationCenter.DefaultCenter().PostNotification(this, "StaminaAvailable", true);
	}
	
	if(currentPlayerStamina > maxStamina)
	{
		currentPlayerStamina = maxStamina;
	}
}



function CreateFollowTrail(){
	//BASED ON DISTANCE TRAVELED FROM LAST POINT.
	//If first time running array at place 0 will be null
	if(actualTrailSpaceUsed == 0){
		//Record first position
		playerFollowTrail[0] = transform.position;
		actualTrailSpaceUsed = 1;
	}
	//Incriment array, If Distance is achieved.
	else if(Vector3.Distance(playerFollowTrail[(actualTrailSpaceUsed-1)], transform.position) >= distPerTrailNode){
		//see IF array is full:
		if(actualTrailSpaceUsed >= followTrailLength){

			//SKIP place 0, and fill in the official array with the rest of itself starting at 0.
			for(var i:int = 1; i < followTrailLength; i++){
				playerFollowTrail[(i-1)] = playerFollowTrail[i];
			}
			
			//Add new position to END (Do not add to actualTrailSpaceUsed it is already full)
			playerFollowTrail[followTrailLength-1] = transform.position;
			print("Full, adding to end: "+transform.position);
			
		}
		else{
			//Not full, Add new position
			playerFollowTrail[actualTrailSpaceUsed] = transform.position;
			actualTrailSpaceUsed += 1;
		}
		/*
		//Drop demonstrationObject __ THIS WILL BE REMOVED AFTER IM CONVINED IT WORKS PROPERLY
		var instantiatedCrumb : GameObject = Instantiate(demonstrationObject, transform.position, transform.rotation);
		*/
	}
}