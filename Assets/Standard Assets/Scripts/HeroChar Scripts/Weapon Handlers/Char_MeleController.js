
private var fireDelay : float;
//Default for this script is inactivity
private var activateScript : boolean = false;
private var blocking : boolean = false;

private var ammoCounterOffset : Vector2 = Vector2((Screen.width/3)+10, 10);
private var counterLengthHeight : Vector2 = Vector2(80, 40);

//WE DO NOT NEED TO TRACK  "CombatType" MESSAGES.  ONLY ONE SCRIPT PER OBJECT NEEDED TO TRACK MESSAGES.

function OnGUI(){
	if(activateScript){
		GUI.Box(new Rect(ammoCounterOffset.x, ammoCounterOffset.y, counterLengthHeight.x, counterLengthHeight.y), "Infinity");
	}
}

function Update () {

	if(activateScript){
		//Currently Do Nothing
		//Consider having Right click = BLOCK, and have block work like aimingGun does where when active char moves at half speed.  --- VARIABLE IS: blocking
	}

}

function CombatType (notification : Notification)
{
	//The notification is a Weapon Class Object currently Equipped.  IF WE ONLY HAVE 1 MELE CONTROLLER IT 
	//WILL HAVE TO DETECT MORE THAN '0' = Unarmed IN THE FUTURE TO INCLUDE ALL MELE TYPES
	
	if(notification.data.weaponType == 0)
	{
		//Something similar to commented code must be done about mele weapons and thins such as block which need to send ending messages
		/*		
		if(activateScript == true)
		{
			//GUN is beingSWAPPED for another gun and the system needs to reset everything first- MUST MAKE SURE TO DEACTIVATE before using InitiateWeapon()
			aimingGun = false;
			oldAimingGun = aimingGun;
			NotificationCenter.DefaultCenter().PostNotification(this, "WeaponReadied", aimingGun);
			activateScript = false;
		}
		*/
		//Run Function to Strip Relevant Mele info from the WeaponClass. (Activate the script after this function runs)
		InitiateWeapon(notification.data);
	} else {
		//Otherwise make sure this code is off!
		/*
		if(activateScript == true)
		{
			//Make sure no aiming message was left on.  -- SEND FALSE
			aimingGun = false;
			oldAimingGun = aimingGun;
			NotificationCenter.DefaultCenter().PostNotification(this, "WeaponReadied", aimingGun);
		}
		*/
		activateScript = false;
	}
}

function InitiateWeapon(theWeapon : Weapon){
	//Strip the stats out of the weapon class.
	/*
	weaponType = theWeapon.weaponType;
	//physicalAttack = theWeapon.weaponPhysicalAttack;
	//magicAttack = theWeapon.weaponMagicAttack;
	accuracyPenalty = theWeapon.weaponAccuracyPenalty;
	*/
	fireDelay = theWeapon.weaponFireDelay;
	/*
	reloadTime = theWeapon.weaponReloadTime;
	maxAmmoCount = theWeapon.weaponMaxAmmo;
	bulletType = theWeapon.weaponProjectileType;

	//Fill in any necesary info to get the gun initiated
	ammoCount = maxAmmoCount;
	reloading = false;
	*/
	
	//This yield will give us time to set stats and load information. (solves some bugs)
	yield WaitForSeconds(1.5);
	
	//Activate this script
	activateScript = true;
	
	//Send a message to inform (Mostly: InventoryGUI; where things are equipped) entities that it is now OKAY to EQUIP/UNEQUIP another weapon.
	NotificationCenter.DefaultCenter().PostNotification(this, "CanIEquipWeapons", true);
	
	//Run Function to begin timer and begin detecting shots controlls
	AttackTimer();
}

function AttackTimer(){
	//Checks to see if you are hitting the fire button and has an important delay function.  CANNOT attack while blocking
	while(activateScript){
		if(Input.GetButton ("Fire1") && !blocking){
			//Fire();
			yield WaitForSeconds(fireDelay);
		} else {
			yield;
		}
	}
}