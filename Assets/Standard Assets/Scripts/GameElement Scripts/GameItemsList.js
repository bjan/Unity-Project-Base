//Our Representation of an InventoryItem
class InventoryItem
{
	//GameObject this item refers to
	var worldObject : GameObject;
	//What the item will look like in the inventory
	var texRepresentation : Texture;
	
	//ADD USE SOUND
	
	//What the item is used for and how
	var use : int;
	
	//Name of item for looking up stats or uses: This name appears in other scripts and is a way to reference the items. A String wont work. I need a way to look up an item using the info I have in inventory
	//The real name will reside in the stat file that holds that items true information.  I need a way to access that true information that will be here within the Items List Script.
	var itemLookupName : String;
}



//This is a list of items in the game and things registered about them.
private var weaponSlot : int = 0;
private var armorSlot : int = 1;
private var helmetSlot : int = 2;
private var bootSlot : int = 3;
private var gloveSlot : int = 4;
private var accessorySlot : int = 5;
private var useableItem : int = 20;
private var questItem : int = 30;
//============================================================================================================================================================WEAPONS
static var item_Service_Handgun = new InventoryItem();
var ServiceHandgunGameObject : GameObject;
var ServiceHandgunTexture : Texture;
//--------------------------------------------------------------------------------------
static var item_Heat_Handgun = new InventoryItem();
var HeatHandgunGameObject : GameObject;
var HeatHandgunTexture : Texture;
//--------------------------------------------------------------------------------------
//============================================================================================================================================================ARMOR
static var item_Rusty_Chainmail = new InventoryItem();
var RustyChainmailGameObject : GameObject;
var RustyChainmailTexture : Texture;
//--------------------------------------------------------------------------------------

//============================================================================================================================================================USEABLE
static var item_Expired_Health_Potion  = new InventoryItem();
var ExpiredhealthPotionGameObject : GameObject;
var ExpiredhealthPotionTexture : Texture;
//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------


function Awake () {

//============================================================================================================================================================WEAPONS
	item_Service_Handgun.worldObject = ServiceHandgunGameObject;
	item_Service_Handgun.texRepresentation = ServiceHandgunTexture;
	item_Service_Handgun.use = weaponSlot;
	item_Service_Handgun.itemLookupName = "stats_Service_Handgun";
//--------------------------------------------------------------------------------------
	item_Heat_Handgun.worldObject = HeatHandgunGameObject;
	item_Heat_Handgun.texRepresentation = HeatHandgunTexture;
	item_Heat_Handgun.use = weaponSlot;
	item_Heat_Handgun.itemLookupName = "stats_Heat_Handgun";
//--------------------------------------------------------------------------------------
//============================================================================================================================================================ARMOR
	item_Rusty_Chainmail.worldObject = RustyChainmailGameObject;
	item_Rusty_Chainmail.texRepresentation = RustyChainmailTexture;
	item_Rusty_Chainmail.use = armorSlot;
	item_Rusty_Chainmail.itemLookupName = "stats_Rusty_Chainmail";
//--------------------------------------------------------------------------------------

//============================================================================================================================================================USEABLE
	item_Expired_Health_Potion.worldObject = ExpiredhealthPotionGameObject;
	item_Expired_Health_Potion.texRepresentation = ExpiredhealthPotionTexture;
	item_Expired_Health_Potion.use = useableItem;
	item_Expired_Health_Potion.itemLookupName = "stats_Expired_Health_Potion";
//--------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------

}