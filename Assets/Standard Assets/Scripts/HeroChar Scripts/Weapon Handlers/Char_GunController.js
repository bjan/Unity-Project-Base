var bulletSpawn : GameObject;  //Where the bullet shoots from:  This could be a game object passed from the gun itself perhaps

var handgunBullet_1 : GameObject; //First of many bullet types
var handgunBullet_2 : GameObject; //First of many bullet types

//private var emptyClipSound : AudioClip;  //For later use  CONSIDER A SEPARATE CODE USED FOR ALL SOUND EFFECTS~!
//private var fireShotSound : AudioClip;  //For later use CONSIDER A SEPARATE CODE USED FOR ALL SOUND EFFECTS~!
private var weaponType : int;
private var physicalAttack : int;
private var magicAttack : int;
private var maxAmmoCount : int;
private var bulletType : int;
private var accuracyPenalty : float;
private var fireDelay : float;
private var reloadTime : float;

private var reloading : boolean = false;
private var activateScript : boolean = false;
private var aimingGun : boolean = false;
private var oldAimingGun : boolean = false;

private var ammoCount : int;
private var ammoCounterOffset : Vector2 = Vector2((Screen.width/3)+10, 10);
private var counterLengthHeight : Vector2 = Vector2(80, 40);
private var currentBulletObject : GameObject;

//The bullet to be made when you shoot.
private var instantiatedBullet : GameObject;

//WE DO NOT NEED TO TRACK  "CombatType" MESSAGES.  ONLY ONE SCRIPT PER OBJECT NEEDED TO TRACK MESSAGES.

function OnGUI(){
	if(activateScript){
		GUI.Box(new Rect(ammoCounterOffset.x, ammoCounterOffset.y, counterLengthHeight.x, counterLengthHeight.y), ammoCount+" / "+ maxAmmoCount);
	}
}

function Update () {
	
	if(activateScript)
	{
		//Checks if Reload button has been released.  If not already reloading, then reloading function begins.
		if(Input.GetButtonUp ("Reload") && reloading == false){
			reloading = true;
			//turn the gun off while reloading to play reload animations and NOT shoot bullets of couse...
			aimingGun = false;
			Reload();
		} 
		else if(Input.GetButton("ReadyWeapon") && !aimingGun && !reloading){
			//Player has readied (aimed) his weapon, is not currently aiming or reloading
			//DECREASE PLAYER SPEED BY HALF WHILE AIMING [from within the FPSWalker]
				aimingGun = true;
		}
		else if(Input.GetButtonUp("ReadyWeapon") && aimingGun){
				aimingGun = false;
		}
		
		//Checks to see if we have changed our aiming status either from or to active.
		if(oldAimingGun != aimingGun){
			//previous boolean is not the same as current one.
			oldAimingGun = aimingGun;
			//Send message that the gun aim status has changed! -- Decreases player speed (currently by half) in the char controller via this message.
			NotificationCenter.DefaultCenter().PostNotification(this, "WeaponReadied", aimingGun);
		}
	}
}

function CombatType (notification : Notification)
{
	//The notification is a Weapon Class Object currently Equipped.  IF WE ONLY HAVE 1 GUN CONTROLLER IT 
	//WILL HAVE TO DETECT MORE THAN '1' IN THE FUTURE TO INCLUDE ALL GUN TYPES
	
	if(notification.data.weaponType == 1)
	{
		if(activateScript == true)
		{
			//GUN is beingSWAPPED for another gun and the system needs to reset everything first- MUST MAKE SURE activateScript = FALSE before using InitiateWeapon()
			aimingGun = false;
			oldAimingGun = aimingGun;
			NotificationCenter.DefaultCenter().PostNotification(this, "WeaponReadied", aimingGun);
			activateScript = false;
		}
		//Run Function to Strip Relevant Gun info from the WeaponClass. (Activate the script after this function runs)
		InitiateWeapon(notification.data);
	} else {
		//Otherwise make sure this code is off!
		if(activateScript == true)
		{
			//Make sure no aiming message was left on.  -- SEND FALSE
			aimingGun = false;
			oldAimingGun = aimingGun;
			NotificationCenter.DefaultCenter().PostNotification(this, "WeaponReadied", aimingGun);
		}
		activateScript = false;
	}
}

function InitiateWeapon(theWeapon : Weapon){
	//Strip the stats out of the weapon class.
	weaponType = theWeapon.weaponType;
	//physicalAttack = theWeapon.weaponPhysicalAttack;
	//magicAttack = theWeapon.weaponMagicAttack;
	accuracyPenalty = theWeapon.weaponAccuracyPenalty;
	fireDelay = theWeapon.weaponFireDelay;
	reloadTime = theWeapon.weaponReloadTime;
	maxAmmoCount = theWeapon.weaponMaxAmmo;
	bulletType = theWeapon.weaponProjectileType;

	//Fill in any necesary info to get the gun initiated
	ammoCount = maxAmmoCount;
	reloading = false;
	
	//Runs the BulletType script and makes sure a bullet is there to shoot before continuing this code.
	yield GetBulletType(bulletType);
		//This yield will give us time to set stats and load information. (solves some bugs)
		yield WaitForSeconds(1.5);
	
	//Activate this script
	activateScript = true;
	
	//Send a message to inform (Mostly: InventoryGUI; where things are equipped) entities that it is now OKAY to EQUIP/UNEQUIP another weapon.
	NotificationCenter.DefaultCenter().PostNotification(this, "CanIEquipWeapons", true);
	
	//Run Function to begin timer and begin detecting shots controlls
	ShootTimer();
}

function GetBulletType(bulletNumber : int){
	if(bulletNumber == 1){
		currentBulletObject = handgunBullet_1;
	}
	else if(bulletNumber == 2){
		currentBulletObject = handgunBullet_2;
	}
	else if(bulletNumber == 3){
	
	}
	else if(bulletNumber == 4){
	
	}
	else if(bulletNumber == 5){
	
	}
	
	return true;
}

function Reload(){
	if(ammoCount == maxAmmoCount){
		print("Ammo is already full!");
		reloading = false;
		return;
	} 	else {
		yield WaitForSeconds(reloadTime);
		ammoCount = maxAmmoCount;
		print("Reloaded");
		reloading = false;
	} 
}

function ShootTimer(){
	//Checks to see if you are hitting the fire button and has an important delay function.
	while(activateScript){
		if(Input.GetButton ("Fire1") && aimingGun){
			Fire();
			yield WaitForSeconds(fireDelay);
		} else {
			yield;
		}
	}
}

function Fire(){
	if(ammoCount == 0){
		//Gun plays empty clip SFX -- PLAY GUN SPECIFIC EMPTY CLIP SFX theWeapon.emptyClipSFX or something
		//The gun shoots more bullets than it has without this line.
		print("Reload!");
		return;
	}
	
	else if(weaponType == 1)
	{
			if(ammoCount >=1){
			//I want to imbed the TRUE DAMAGE (a measure of both the weapon damage and the character +attack stats) and place this in the bullet for detection as an array.
			var charPhysDamage : int = GameObject.Find("HeroCube/Main Camera").GetComponent(Char_Stats).heroPhysicalAttack;
			var charMagicDamage : int = GameObject.Find("HeroCube/Main Camera").GetComponent(Char_Stats).heroMagicAttack;
			var bulletInfoArray : Array = new Array(2);
			bulletInfoArray[0] = charPhysDamage;
			bulletInfoArray[1] = charMagicDamage;
			//Fire bullet if ammo count is great enough.
			instantiatedBullet = Instantiate(currentBulletObject, bulletSpawn.transform.position, bulletSpawn.transform.rotation);
			
			//This actually sends the array into each bullet as "bulletInformation" within the handgunbulletscript.
			(instantiatedBullet.GetComponent("HandgunBulletScript") as HandgunBulletScript).bulletInformation = bulletInfoArray;
			
			ammoCount -= 1;
			
			if(ammoCount == 0){
				//The last bullet shot will remind you to reload, along with all attempts to shoot afterward.
				print("Reload!");
			}
		}
	}
	
	//I put a weapon type sorter on the fire code so more than one weaponType of GUN can be shot using this code.
	//SHIT MAYBE HAVING A SEPARATE SCRIPT TO HANDLE EACH TYPE OF GUN IS SMARTER.  THE GUNS WOULD REACT FASTER DUE TO SPECIALIZED CODE FOR THE EACH OF EM.
	//OTHERWISE EVERY BULLET WOULD CHECK IF THE GUN TYPE IS CORRECT BEFORE BEING SHOT.
	//ITS EITHER THAT OR I SEND EACH BULLET TYPE TO A DIFFERENT FIRE FUNCTION -- LIKE FIRE1 for type 1 and FIRE2 for type 2 etc.
}
