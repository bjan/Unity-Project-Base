//Our Representation of an InventoryItem
class Weapon
{
	//0 = unarmed; 1 = handgun
	var weaponType : int;
	
	//What the weapon looks like.  This is the model that the player will hold.
	var weaponGameObject : GameObject;
	
	//The name visible to players during play
	var weaponTrueName : String;
	
	//penalty to how straight the projectile flys.  0.0 for no penalty.
	var weaponAccuracyPenalty : float;
	
	//Time between shots
	var weaponFireDelay : float;
	
	//Time it takes to reload
	var weaponReloadTime : float;
	
	//This can either be 1 or 2.  Perhaps later I will add weapons that need 0 hands to use.
	var handsNeeded : int;
	
	//hurrr
	var weaponMaxAmmo : int;
	
	//Each weaponType can have its own list of projectiles.  So type 5 projectile for handgun is NOT the same as type 5 projectile for ElmWand The handlers will suss this out.
	var weaponProjectileType : int;
	
	//Raw Stat Modifiers======================================================================================
	var weaponStrength : int;
	var weaponDexterity : int;
	var weaponWisdom : int;
	var weaponPhysicalDefense : int;
	var weaponPhysicalAttack : int;
	var weaponMagicDefense : int;
	var weaponMagicAttack : int;
	var weaponStamina : int;
	var weaponMana : int;
	var weaponHealth : int;
}



//This is a list of items in the game and things registered about them.
private var unarmed : int = 0;
private var handgun : int = 1;
private var sword : int = 2;
private var rocket : int = 3;
private var bow : int = 4;
private var shotgun : int = 5;

//====================================================================================UNARMED
	static var stats_Unarmed = new Weapon();
//--------------------------------------------------------------------------------------
//====================================================================================HANDGUNS
	static var stats_Service_Handgun = new Weapon();
//--------------------------------------------------------------------------------------
	static var stats_Heat_Handgun = new Weapon();
//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------


function Awake () {
//====================================================================================UNARMED
	stats_Unarmed.weaponType = unarmed;
	stats_Unarmed.weaponTrueName = "Unarmed";
	stats_Unarmed.weaponAccuracyPenalty = 0.0;
	stats_Unarmed.weaponFireDelay = 1.0;
	stats_Unarmed.weaponReloadTime = 0.0;
	stats_Unarmed.handsNeeded = 2;
	stats_Unarmed.weaponMaxAmmo = 0;
	stats_Unarmed.weaponProjectileType= 0;
	
	stats_Unarmed.weaponStrength = 0;
	stats_Unarmed.weaponDexterity = 0;
	stats_Unarmed.weaponWisdom = 0;
	stats_Unarmed.weaponPhysicalDefense = 0;
	stats_Unarmed.weaponPhysicalAttack = 5;
	stats_Unarmed.weaponMagicDefense = 0;
	stats_Unarmed.weaponMagicAttack = 0;
	stats_Unarmed.weaponStamina = 0;
	stats_Unarmed.weaponMana = 0;
	stats_Unarmed.weaponHealth = 0;
//--------------------------------------------------------------------------------------
//====================================================================================HANDGUNS
	stats_Service_Handgun.weaponType = handgun;
	stats_Service_Handgun.weaponTrueName = "Service Handgun";
	stats_Service_Handgun.weaponAccuracyPenalty = 1.0;
	stats_Service_Handgun.weaponFireDelay = 0.5;
	stats_Service_Handgun.weaponReloadTime = 2.0;
	stats_Service_Handgun.handsNeeded = 2;
	stats_Service_Handgun.weaponMaxAmmo = 25;
	stats_Service_Handgun.weaponProjectileType = 2;
	
	stats_Service_Handgun.weaponStrength = 0;
	stats_Service_Handgun.weaponDexterity = 2;
	stats_Service_Handgun.weaponWisdom = 0;
	stats_Service_Handgun.weaponPhysicalDefense = 0;
	stats_Service_Handgun.weaponPhysicalAttack = 10;
	stats_Service_Handgun.weaponMagicDefense = 0;
	stats_Service_Handgun.weaponMagicAttack = 0;
	stats_Service_Handgun.weaponStamina = 5;
	stats_Service_Handgun.weaponMana = 0;
	stats_Service_Handgun.weaponHealth =	10;
//--------------------------------------------------------------------------------------
	stats_Heat_Handgun.weaponType = handgun;
	stats_Heat_Handgun.weaponTrueName = "Heat Handgun";
	stats_Heat_Handgun.weaponAccuracyPenalty = 1.0;
	stats_Heat_Handgun.weaponFireDelay = 0.3;
	stats_Heat_Handgun.weaponReloadTime = 2.0;
	stats_Heat_Handgun.handsNeeded = 2;
	stats_Heat_Handgun.weaponMaxAmmo = 20;
	stats_Heat_Handgun.weaponProjectileType = 1;
	
	stats_Heat_Handgun.weaponStrength = 1;
	stats_Heat_Handgun.weaponDexterity = 3;
	stats_Heat_Handgun.weaponWisdom = 0;
	stats_Heat_Handgun.weaponPhysicalDefense = 0;
	stats_Heat_Handgun.weaponPhysicalAttack = 15;
	stats_Heat_Handgun.weaponMagicDefense = 0;
	stats_Heat_Handgun.weaponMagicAttack = 0;
	stats_Heat_Handgun.weaponStamina = 0;
	stats_Heat_Handgun.weaponMana = 0;
	stats_Heat_Handgun.weaponHealth =	0;
//--------------------------------------------------------------------------------------
	
//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

}