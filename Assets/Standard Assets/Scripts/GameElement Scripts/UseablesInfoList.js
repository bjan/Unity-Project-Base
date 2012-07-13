//Our Representation of an InventoryItem
class Useable
{
	//The name visible to players during play
	var useableTrueName : String;
	
	//STAT EFFECTED : --- Perhaps more than one field for multi stat useable items like statEffect2 . 3 .4 etc
	var statEffected : int;
	
	//AGUMENTATON AMMOUNT : INT
	var augmentationAmmount : int;
}

//This is a list of stats with corresponding numbers to use when describing statEffected
private var health : int = 0;
private var mana : int = 1;
private var stamina : int = 2;


//--------------------------------------------------------------------------------------
	static var stats_Expired_Health_Potion = new Useable();
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
	stats_Expired_Health_Potion.useableTrueName = "Expired Health Potion";
	stats_Expired_Health_Potion.statEffected = health;
	stats_Expired_Health_Potion.augmentationAmmount = 25;
//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------
	
//--------------------------------------------------------------------------------------
	
//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

}