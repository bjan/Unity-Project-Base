//THIS SCRIPT HANDLES ALL WEAPON CHANGE MESSAGES

private var Unarmed : Weapon;

private var equipTimerActive : boolean = false;
private var equipTimerOffset : Vector2 = new Vector2(10, 53);
private var timerBarLength : float;
private var timerBarMaxLength : float = (Screen.width / 3);
private var currentTimerCount : float;
//This corresponds to the ammount of time it takes to equip a weapon (given in any of the weapon controller scripts)
private var maxTimerCount : float = 1.5;

function Awake() {
	NotificationCenter.DefaultCenter().AddObserver(this, "EquipmentUpdated");
	NotificationCenter.DefaultCenter().AddObserver(this, "BaseStatsInitiated");
	//COMBAT TYPE IS USED IN THE WEAPON, MAGIC, MELE CONTROLLERS -- NOT HERE.  BUT THIS IS THE CLEANEST PLACE TO PUT THE LISTENER.
	NotificationCenter.DefaultCenter().AddObserver(this, "CombatType");
	
	//Set the weapon to Unarmed at the start before the real info is fed in.
	Unarmed = GameObject.Find("HeroCube/Main Camera").GetComponent(WeaponInfoList).stats_Unarmed;
}

function BaseStatsInitiated(notification: Notification){
	//This will run the updateWeapon Script one time as unarmed at the beginning when everything is loading up.
	updateWeapon(Unarmed);
}

function OnGUI(){
	if(equipTimerActive){
		//The equip timer was activated below.  Run the visual equip weapon timer bar and then turn equipTimerActive off.
		if(Time.time - maxTimerCount < currentTimerCount){
			//Compute timerBarLength and display the timer bar.
			timerBarLength = timerBarMaxLength * ((Time.time - currentTimerCount)/maxTimerCount);
			
			GUI.Box(new Rect(equipTimerOffset.x, equipTimerOffset.y, timerBarLength, 10), "");
			
		} else {
			equipTimerActive = false;
		}
	}
}

function EquipmentUpdated (notification: Notification) {
	//UPDATES CONCERNING WEAPON SLOT ONLY
	
	//Check to make sure notification.data[0] (this tells which slot was changed) is 0 (Weapon slot = 0)
	if(notification.data[0] == 0)
	{
		//Take the notification [1] (the actual inventoryItem) and if non-null place it into the funcion to convert it.
		if(notification.data[1] == null)
		{
			//Item is null and therefore becomes unarmed
			updateWeapon(Unarmed);
		}else{
			//Item is a real item and needs converting
			convertItemToWeapon(notification.data[1]);
		}
		
		//Begin the visual equip weapon timer bar in OnGUI
		equipTimerActive = true;
		currentTimerCount = Time.time;
	}
	//Otherwise this update is not weapons related
}

function convertItemToWeapon(currentItem : InventoryItem){
	var convertedWeapon : Weapon;
	var weaponStatsName : String;
	
	//Set weaponStatsName equal to the "itemLookupName" of this currentItem
	weaponStatsName = currentItem.itemLookupName;
	//Use this "itemLookupName" within weaponStatsName to call the converted weapon. As the lookup name is identical to the name of the weapon iteself.
	convertedWeapon = GameObject.Find("HeroCube/Main Camera").GetComponent(WeaponInfoList).GetType().GetField(weaponStatsName).GetValue(this);
	
	updateWeapon(convertedWeapon);
}

function updateWeapon(currentWeapon : Weapon)
{	
	//SEND A MESSAGE containing the Weapon.  The weaponHandlers can then use notification.data[0].weaponType to see if they should use the info.
	//Only one weapon type should be in use at any time. The others should deactivate when the type does not match thier own.
	NotificationCenter.DefaultCenter().PostNotification(this, "CombatType", currentWeapon);
}



