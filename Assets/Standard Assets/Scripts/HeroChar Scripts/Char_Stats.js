//This will store inventory items as they are changed and removed and then further down this is called to modify stats.
var currentItemsArray : Array;
var currentStatContributors : Array;
//This corresponds EXACTLY to CharInventoryGUI.maxEquippedItems   If that ever changes so must this! (or figure out how to refrence it without hassle)
private var currentItemsArrayMax : int = 6;

//THE VITAL STATS==============================================================================================================================
static var heroMaxHealth : float;
static var heroMaxMana : float;
static var heroMaxStamina : float;
static var heroPhysicalDefense : int;
static var heroMagicDefense : int;
static var heroPhysicalAttack : int;
static var heroMagicAttack : int;
//=================================================================================================================================================

//THE SECONDARY STATS==============================================================================================================================
static var heroStrength : int;
static var heroDexterity : int;
static var heroWisdom : int;
//=======================================================================================================================================================

//Stats will be compiled and updated here that will controll the characters strengths and weaknesses.
function Awake(){
	//Observe when armor is switched added or removed.
	NotificationCenter.DefaultCenter().AddObserver(this, "EquipmentUpdated");
	
	//Fill array with the same number of equipment slots as are in CharInventoryGUIHybrid
	currentItemsArray = new Array(currentItemsArrayMax);
	currentStatContributors = new Array(currentItemsArrayMax);
		
	//On awake setup the stats for the first time
	statUpdater(true, 999999);
}

function Update () {
}

function EquipmentUpdated (notification: Notification) {
	//EquipmentUpdated will contain an array [NOTIFICATION] with [0]=Location of updated equipment and [1]=The updated equipment piece
		
	//Fill the array at the same place as the notification with the info from this notification.  Eventually a whole array will be filled and maintained.
	currentItemsArray[notification.data[0]] = notification.data[1];
	
	//Items have been updated. Run statUpdater
	statUpdater(false, notification.data[0]);
}

function statUpdater (firstTimeRunning : boolean, updatedLocation : int) {
	if(firstTimeRunning == true)
	{
		//Run this the first time to integrate the players class and level and other such things into the stats
		if(currentItemsArray[0] == null)
		{
			//We need to wait a second in order to let WeaponInfoList initialize before we grab info the first time from it.
			yield WaitForSeconds(1.0);
			//Weapon is null and must be replaced with stats_Unarmed
			currentStatContributors[0] = this.GetComponent(WeaponInfoList).stats_Unarmed;
		}
		
		//Now run through the array (skipping place 0) to collect Armor Stats_
		for(var i : int =1; i < currentItemsArrayMax; i++){
			if(currentItemsArray[i] == null)
			{
				//Replace null with stats_Unclothed inside currentStatContributors[] but leave currentItemsArray alone
				currentStatContributors[i] = this.GetComponent(ArmorInfoList).stats_Unclothed;;
			} else {
				//The armor is valid.  Place the stat_ version of it into currentStatContributors[] at the same location.
				currentStatContributors[i] = this.GetComponent(ArmorInfoList).GetType().GetField(currentItemsArray[i].itemLookupName).GetValue(this);;
			}
		}			
	}
	//THIS LOWER HALF UPDATES THE STAT ARRAY BASED ON updatedLocation.  The firstTimeRunning will update the whole shebang once through one time.
	else if(updatedLocation == 0)
	{
		var currentWeapon : Weapon;
		//Check the weapon First
		if(currentItemsArray[0] != null)
		{
			//The array at place 0 contained a weapon. Add the 'Weapon' class variable (looked up via the 'Item' class) to the currentStatContributors Array.
			var weaponStatsName : String = currentItemsArray[0].itemLookupName;
			currentWeapon = this.GetComponent(WeaponInfoList).GetType().GetField(weaponStatsName).GetValue(this);
			
			currentStatContributors[0] = currentWeapon;
		} else {
			//Weapon is null and must be replaced with stats_Unarmed
			currentWeapon = this.GetComponent(WeaponInfoList).stats_Unarmed;
			
			currentStatContributors[0] = currentWeapon;
		}
	}
	else if(updatedLocation > 0 && updatedLocation < currentItemsArrayMax)
	{
		var currentArmor : Armor;
		//An armor piece needs updating
		if(currentItemsArray[updatedLocation] == null)
		{
			//Replace null with stats_Unclothed inside currentStatContributors[] but leave currentItemsArray alone
			currentArmor = this.GetComponent(ArmorInfoList).stats_Unclothed;
			currentStatContributors[updatedLocation] = currentArmor;
		} else {
			//The armor is valid.  Place the stat_ version of it into currentStatContributors[] at the same location.
			var armorStatsName : String = currentItemsArray[updatedLocation].itemLookupName;
			currentArmor = this.GetComponent(ArmorInfoList).GetType().GetField(armorStatsName).GetValue(this);
			currentStatContributors[updatedLocation] = currentArmor;
		}
	}
	
	//Now we total all the armor along with the base stats
	tabulateHeroStats(firstTimeRunning, currentStatContributors);
}

function tabulateBaseStats()
{
	//MAKE A playerClass class... When you pick a class you get different modifiers.  Maybe playerClass.level will go somewhere else
	
	//heroBASEStrength = RoundDownToInt(playerClass.strengthMod * playerClass.level);
}

function tabulateHeroStats(firstTimeRunning : boolean, equippedItemsArray : Array)
{
	var totalEquipmentStrength : int = 0;
	var totalEquipmentDexterity : int = 0;
	var totalEquipmentWisdom : int = 0;
	var totalEquipmentPhysicalDefense : int = 0;
	var totalEquipmentMagicDefense : int = 0;
	var totalEquipmentPhysicalAttack : int = 25;
	var totalEquipmentMagicAttack : int = 0;
	var totalEquipmentStamina : float = 20.0;
	var totalEquipmentMana : float = 50.0;
	var totalEquipmentHealth : float = 100.0;
	
	//Tabulate slot 0 (weapon) first
	if(equippedItemsArray[0] != null)
	{
		totalEquipmentStrength += equippedItemsArray[0].weaponStrength;
		totalEquipmentDexterity += equippedItemsArray[0].weaponDexterity;
		totalEquipmentWisdom += equippedItemsArray[0].weaponWisdom;
		totalEquipmentPhysicalDefense += equippedItemsArray[0].weaponPhysicalDefense;
		totalEquipmentPhysicalAttack += equippedItemsArray[0].weaponPhysicalAttack;
		totalEquipmentMagicDefense += equippedItemsArray[0].weaponMagicDefense;
		totalEquipmentMagicAttack += equippedItemsArray[0].weaponMagicAttack;
		totalEquipmentStamina += equippedItemsArray[0].weaponStamina;
		totalEquipmentMana += equippedItemsArray[0].weaponMana;
		totalEquipmentHealth += equippedItemsArray[0].weaponHealth;
	}
	//Then tabulate the armor bonuses
	for(var i : int = 1; i < currentItemsArrayMax; i++)
	{
		totalEquipmentStrength += equippedItemsArray[i].armorStrength;
		totalEquipmentDexterity += equippedItemsArray[i].armorDexterity;
		totalEquipmentWisdom += equippedItemsArray[i].armorWisdom;
		totalEquipmentPhysicalDefense += equippedItemsArray[i].armorPhysicalDefense;
		totalEquipmentPhysicalAttack += equippedItemsArray[i].armorPhysicalAttack;
		totalEquipmentMagicDefense += equippedItemsArray[i].armorMagicDefense;
		totalEquipmentMagicAttack += equippedItemsArray[i].armorMagicAttack;
		totalEquipmentStamina += equippedItemsArray[i].armorStamina;
		totalEquipmentMana += equippedItemsArray[i].armorMana;
		totalEquipmentHealth += equippedItemsArray[i].armorHealth;
	}

	//heroStat = BASE STATS + totalEquipmentWhatever (LATER ON + levelClassMod)
	heroStrength = totalEquipmentStrength;
	heroDexterity = totalEquipmentDexterity;
	heroWisdom = totalEquipmentWisdom;
	heroPhysicalDefense = totalEquipmentPhysicalDefense;
	heroPhysicalAttack = totalEquipmentPhysicalAttack;
	heroMagicDefense = totalEquipmentMagicDefense;
	heroMagicAttack = totalEquipmentMagicAttack;
	heroMaxStamina = totalEquipmentStamina;
	heroMaxMana = totalEquipmentMana;
	heroMaxHealth = totalEquipmentHealth;
	
	//Update Health, Mana, Stamina bars visually in case the max values have changed. (But DO NOT ADD OR SUBTRACT FROM THEM) [sending 0.0 will still refresh the visual aspects]
	NotificationCenter.DefaultCenter().PostNotification(this, "modifyCurrentHealth", 0.0);
	NotificationCenter.DefaultCenter().PostNotification(this, "modifyCurrentMana", 0.0);
	NotificationCenter.DefaultCenter().PostNotification(this, "modifyCurrentStamina", 0.0);
	
	if(firstTimeRunning)
	{
		//Send a message that the stats have FINALLY been setup
		NotificationCenter.DefaultCenter().PostNotification(this, "BaseStatsInitiated");
	}
}
