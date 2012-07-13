//Our Representation of an InventoryItem
class Armor
{
	//What the armor looks like.  This is the model that the player will hold.
	var armorGameObject : GameObject;
	
	//The name visible to players during play
	var armorTrueName : String;
	
	//Raw Stat Modifiers======================================================================================
	var armorStrength : int;
	var armorDexterity : int;
	var armorWisdom : int;
	var armorPhysicalDefense : int;
	var armorPhysicalAttack : int;
	var armorMagicDefense : int;
	var armorMagicAttack : int;
	var armorStamina : int;
	var armorMana : int;
	var armorHealth : int;
	
}


//--------------------------------------------------------------------------------------
	static var stats_Unclothed = new Armor();
//--------------------------------------------------------------------------------------
	static var stats_Rusty_Chainmail = new Armor();
//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------


function Awake () {
//--------------------------------------------------------------------------------------
	stats_Unclothed.armorTrueName = "Unclothed";
	
	stats_Unclothed.armorStrength = 0;
	stats_Unclothed.armorDexterity = 0;
	stats_Unclothed.armorWisdom = 0;
	stats_Unclothed.armorPhysicalDefense = 0;
	stats_Unclothed.armorPhysicalAttack = 5;
	stats_Unclothed.armorMagicDefense = 0;
	stats_Unclothed.armorMagicAttack = 0;
	stats_Unclothed.armorStamina = 0;
	stats_Unclothed.armorMana = 0;
	stats_Unclothed.armorHealth =	0;
//--------------------------------------------------------------------------------------
	//stats_Rusty_Chainmail.armorGameObject = VARIABLE YET TO BE CREATED;
	stats_Rusty_Chainmail.armorTrueName = "Rusty Chainmail";

	stats_Rusty_Chainmail.armorStrength = 1;
	stats_Rusty_Chainmail.armorDexterity = 1;
	stats_Rusty_Chainmail.armorWisdom = 0;
	stats_Rusty_Chainmail.armorPhysicalDefense = 5;
	stats_Rusty_Chainmail.armorPhysicalAttack = 5;
	stats_Rusty_Chainmail.armorMagicDefense = 1;
	stats_Rusty_Chainmail.armorMagicAttack = 0;
	stats_Rusty_Chainmail.armorStamina = 0;
	stats_Rusty_Chainmail.armorMana = 0;
	stats_Rusty_Chainmail.armorHealth =	5;
//--------------------------------------------------------------------------------------
	
//--------------------------------------------------------------------------------------
	
//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

}