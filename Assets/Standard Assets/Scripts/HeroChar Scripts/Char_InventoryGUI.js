//Keeps track of the inventory and equip screen visibility
private var inventoryIsOn : boolean = false;
private var equipScreenIsOn : boolean = false;
private var statsScreenIsOn : boolean = false;

//This holds the location of GameController.js
private var playerStaticStats;

//The layer on which all lootable object will reside : Currently 8 = loot layer
var lootLayer : LayerMask;

//Distance in a sphere that the hero can loot from
private var lootableRange : float = 3;

//Pings true if an item is dragged out of the ivnentory array and onto the ground.
private var itemDropConfirmation : boolean = false;

//Keeps weapons from equipping/unequipping if the current one isn't done being equipped fully.
private var canIEquipWeapons : boolean = true;

//An array to hold the position of each inventory rectangle for detection and movement
var windowRecArray : Array;

//An array to hold the Rectangle positions for each lootable object on the ground
var lootTableRecArray : Array;

//An array to hold the Rectangle positions for each equipped item.
var equipmentRecArray : Array;

//Our inventory
var inventory : Array;

//List of nearby lootable items
var lootList : Array;

//Array to hold currently equipped items
var equippedItemsArray : Array;

//This will be drawn when a slot is empty
public var emptyTex : Texture;

//This will be drawn when a texture is being dragged from inventory
private var currentlyDraggedTex : Texture;

//Currently its 3 on each side for 6 total equipped items
private var maxEquippedItems : int = 6;

//Maximum displayed lootable items in GUI (5 is nice and even and require less coding)
private var maxLootBoxes : int = 5;

//the size of the inventory in x and y dimension
public var inventorySizeX : int = 5;
public var inventorySizeY : int = 5;

//The pixel size (height and width) of an inventory slot  VERY REAL PROBLEM HERE: 20 in the code, 50 in the inspector.  If I change this to 50 it misaligns.  it must be DIFFERENT for some FUCKED UP REASON here than in
//The INSPECTOR.  If I change either one it will shift to the left or it will shrink to an actual size of 20 pix per box.
var iconWidthHeight : int = 20; 

//Space between slots (in x and y)
var spacing : int = 4;

//set the position of the inventory start point; currently Half the screen on X minus half the icon width etc.
private var offSet : Vector2 = Vector2( (Screen.width / 2) - (inventorySizeX*(iconWidthHeight+spacing)) , ((Screen.height / 2) - (inventorySizeY* (iconWidthHeight+spacing)) )+(iconWidthHeight*3)  );

//sets the loot table position to the far right and flush with the Y position of the inventory background
private var lootTableOffset : Vector2 = Vector2(Screen.width - (iconWidthHeight*2+spacing*3) , offSet.y);

//The first half of  .X for equipment is flush with the inventory and has the same offset, the second half is goin to be 3 blank boxes away from .X offset.  .Y is the same for both.
private var equipmentOffset : Vector2 = Vector2( (Screen.width/2)-inventorySizeX*(iconWidthHeight+spacing), ((((Screen.height / 2) - (inventorySizeY* (iconWidthHeight+spacing)) )+(iconWidthHeight*2)))-(maxEquippedItems*(iconWidthHeight+spacing)) );

//This will keep track of the i and k value used to recall which array location I am dragging or working with.
private var arrayLocInUse : Vector2;

//This keeps track of the I and K value of the square we drag an item ONTO.  this way we can swap the dragged item for the one it is dragged upon.
private var arrayLocForSwap : Vector2;

//I cant typecast this because it's not a Rect like I thought, because rects can not be null yet this variable MUST be able to be null.
var currentlyDraggedRect;

//This window displayes the hero STATS
private var statWindowRect : Rect;
//HEALTH BAR GUI COMPONENTS
private var healthBarMaxLength : float = (Screen.width / 3);
private var healthBarLength : float;
private var currentHealth : float = -1.0;
//MANA BAR GUI COMPONENTS
private var manaBarMaxLength : float = (Screen.width / 3);
private var manaBarLength : float;
private var currentMana : float = -1.0;
//Stamina BAR GUI COMPONENTS
private var staminaBarMaxLength : float = (Screen.width / 3);
private var staminaBarLength : float;
private var currentStamina : float = -1.0;

// *** BEGIN BRANDON EDIT *** //
//Mesage BOX GUI COMPONENTS

// Length of the message container
private var messageBoxGUILength : float = (Screen.width / 3);

// Whether or not the container is turned on.
// We could leave it on all the time but that would
// be a waste of resources
private var messageBoxIsOn : boolean = false;

// This holds the message that is currently displayed (not the full message).					
private var messageBoxCurrMsg : String;

// This keeps track of what letter we are currently displaying
private var messageBoxCurrPos : int = 0;

// This will hold the complete message retrieved from the notification system
private var messageText : String;

// This is the length of the complete message
private var messageLength : int = 0;

// This keeps track of time so we can display the letters at a specific rate
private var timeTracker : int;

// This is how often (in seconds) we display a new letter
private var messageDisplayInterval : float = .5;

// This determines how long the text stays on the screen after it has been written out
private var messageDisplaySecs : float = 4;

// Whether or not there are more letters to display
private var keepGoing : boolean = false;
// *** END BRANDON EDIT *** //


private var requestedActionBarSlot : int = -1;
private var actionBarSelectionMode : boolean = false;

// TEX VARIABLE --- THIS IS THE BACKGROUND CURRENTLY TO THE CHAR SCREEN.  LATER CHANGE THIS FROM testTex to GUIBackgroundTex1
public var testTex : Texture;

// Create the Inventory array, the lootTable Rect position array and the Rect position holder array
function Awake() 
{ 
	//Observe when the stats have finished loading so that we may use them.
	NotificationCenter.DefaultCenter().AddObserver(this, "BaseStatsInitiated");
	NotificationCenter.DefaultCenter().AddObserver(this, "modifyCurrentHealth");
	NotificationCenter.DefaultCenter().AddObserver(this, "modifyCurrentMana");
	NotificationCenter.DefaultCenter().AddObserver(this, "modifyCurrentStamina");
	NotificationCenter.DefaultCenter().AddObserver(this, "ActionBarSelectionRequest");
	NotificationCenter.DefaultCenter().AddObserver(this, "ActionBarInventoryActivate");
	NotificationCenter.DefaultCenter().AddObserver(this, "CanIEquipWeapons");

	
// *** BEGIN BRANDON EDIT *** //

	// This watches for messages
	NotificationCenter.DefaultCenter().AddObserver(this, "beATypeWriter");
	
 // *** END BRANDON EDIT *** //
	
	//This triggers the firstTime stipulation and makes the Status bars appear to be full until real info is retrieved --- THIS WILL NOT BE NEEDED ONCE THE INFO IS TAKEN FROM GameController
	adjustCurrentHealth(0.0);
	adjustCurrentMana(0.0);
	adjustCurrentStamina(0.0);
	
	statWindowRect =  new Rect(Screen.width-180, 0, 180, 350);

	equipmentRecArray = new Array(maxEquippedItems);
	equippedItemsArray = new Array(maxEquippedItems);

	lootTableRecArray = new Array(maxLootBoxes);

	inventory = new Array(inventorySizeX);
	windowRecArray = new Array(inventorySizeX);
	
    for( var i = 0; i < inventory.length; i ++ ) 
    { 
        inventory[i] = new Array(inventorySizeY);
		windowRecArray[i] = new Array(inventorySizeY);
    } 
} 

function Start(){
	//Monitor the players health from the singleton variable in GameController.js
	playerStaticStats = GameObject.FindWithTag("MainPlayer").GetComponent(GameController);
	currentHealth = playerStaticStats.currentPlayerHealth;
}

function OnGUI() 
{ 	
	//STATUS BARS-- REPLACE WITH A TEXTURE
	//---Health Bar
	var hpString : String =  Mathf.Round(currentHealth) + "/" + this.GetComponent(Char_Stats).heroMaxHealth;
	GUI.Box(new Rect(10, 10, healthBarMaxLength, 20), GUIContent( "", hpString));
	GUI.Box(new Rect(10, 10, healthBarLength, 20), "");
	//---Mana Bar
	var manaString : String =  Mathf.Round(currentMana) + "/" + this.GetComponent(Char_Stats).heroMaxMana;
	GUI.Box(new Rect(10, 31, manaBarMaxLength, 10), GUIContent( "", manaString));
	GUI.Box(new Rect(10, 31, manaBarLength, 10), "");
	//---Stamina Bar
	var staminaString : String = Mathf.Round(currentStamina) + "/" + this.GetComponent(Char_Stats).heroMaxStamina;
	GUI.Box(new Rect(10, 42, staminaBarMaxLength, 10), GUIContent( "", staminaString));
	GUI.Box(new Rect(10, 42, staminaBarLength, 10), "");
	
	//Mouse Label for Tooltips
	var guiToolSpacing : int = 12;
	GUI.Label(Rect(Event.current.mousePosition.x+guiToolSpacing,Event.current.mousePosition.y-(guiToolSpacing/2), 200,20), GUI.tooltip);
	
// *** BEGIN BRANDON EDIT *** //

	// This turns the message container on
	if(messageBoxIsOn){
		 GUI.Label(Rect(10,53,messageBoxGUILength,38), messageBoxCurrMsg);
	}
// *** END BRANDON EDIT *** //
	
	if(statsScreenIsOn){
		//A (moveable?)Window setup for STATS screen ============================================================================================================================================
		statWindowRect = GUI.Window(0, statWindowRect, runStatWindow, "Attributes:");
	}

	if(equipScreenIsOn){
		//Top Half of inventory screen -- Equipment area ==================================================================================================================================	
		var equipmentTexToUse : Texture;
		var currentEquipmentItem : InventoryItem;
		
		//THE SPACING IN THE OFFSET IS PROBABLY OFF on the HEIGHT POSITION in the OFFSET most likely
		GUI.DrawTexture(new Rect(equipmentOffset.x-spacing, equipmentOffset.y-spacing, (inventorySizeX*(iconWidthHeight+spacing))+spacing, ((maxEquippedItems/2)*(iconWidthHeight+spacing))+spacing ), testTex );
		
		//Each place in the items array will be specially assigned 0=Weapon 1=Armor 2=Helmet 3=Boots 4=Gloves 5=Accessory (ring/necklace/skull)
		
		//populate with 6 equipment boxes. (Each box will be from the EquipmentRecArray and be in the same [location] as the equipped item [location])
		for(var n=0; n < equippedItemsArray.length; n++)
		{	
			equipmentTexToUse = emptyTex;
			currentEquipmentItem = equippedItemsArray[n];
			
			if(currentEquipmentItem != null)
			{
				equipmentTexToUse = currentEquipmentItem.texRepresentation;
			}
			
			if(n > (maxEquippedItems/2)-1){
				//We have finished the first half of the boxes. the last half will be separated by 3 blank boxes on the X horizontal.
				equipmentRecArray[n] = new Rect(equipmentOffset.x+((maxEquippedItems/2)+1)*(iconWidthHeight+spacing), equipmentOffset.y+(n-(maxEquippedItems/2))*(iconWidthHeight+spacing), iconWidthHeight, iconWidthHeight); 
			} else {
				//We are on the first half of the boxes and they go on the right at the same offset as the inventory boxes
				equipmentRecArray[n] = new Rect(equipmentOffset.x, equipmentOffset.y+n*(iconWidthHeight+spacing), iconWidthHeight, iconWidthHeight); 
			}
			
			GUI.DrawTexture(equipmentRecArray[n], equipmentTexToUse);
			
			if(Event.current.type == EventType.MouseUp && Event.current.button == 1 && equipmentRecArray[n].Contains(Event.current.mousePosition))
			{
				if(currentEquipmentItem != null)
				{
					if(LootItem(currentEquipmentItem))
					{
					
						//If the item removed from equipment slot is a weapon, then "Unarmed" is active.  canIEquipWeapons is set FALSE to give "Unarmed" a moment to load. (Prevents twich bugs)
						if(currentEquipmentItem.use == 0){
							canIEquipWeapons = false;
						}
					
						//if LootItem is true then the item has been placed into the inventory.  Make Equipment array null at current spot
						equippedItemsArray[n] = null;
						
						//SEND A MESSAGE TO THE MESSAGE CONSTRUCT TO UPDATE THE STATS AND THE VISUAL CHARACTER MODEL-=-=-=-=-=-=-=-=-=-=-=-=-
						var piecesOfInfoToSend : int = 2;
						var updatedEquipmentArray : Array = new Array(piecesOfInfoToSend);
						//Fill the array with the location of the updated equipment AND what the new equipment is.
						updatedEquipmentArray[0] = n;
						updatedEquipmentArray[1] = equippedItemsArray[n];
						
						NotificationCenter.DefaultCenter().PostNotification(this, "EquipmentUpdated", updatedEquipmentArray );
					}
					//If it is false do nothing because there was no room in the inventory to remove it to.					
				}
			}
		}
		//Display the major stats between the item slots.
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing), equipmentOffset.y-4, 160, 20), "HP:  " +  Mathf.Round(currentHealth)  +"/"+ this.GetComponent(Char_Stats).heroMaxHealth);
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing), equipmentOffset.y+8, 160, 20), "=-=-=-=-=-=-=-=-=-=-=-=-=-");
		//-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing), equipmentOffset.y+22, 160, 20), "Phys Attack: ");
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing), equipmentOffset.y+37, 160, 20), "Magic Attack: ");
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing), equipmentOffset.y+52, 160, 20), "Phys Defense: ");
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing), equipmentOffset.y+67, 160, 20), "Magic Defense: ");
		//This is the actual values in separate boxes in order to be lined up neatly
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing)+92, equipmentOffset.y+22, 160, 20), ""+this.GetComponent(Char_Stats).heroPhysicalAttack);
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing)+92, equipmentOffset.y+37, 160, 20), "" + this.GetComponent(Char_Stats).heroMagicAttack);
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing)+92, equipmentOffset.y+52, 160, 20), "" + this.GetComponent(Char_Stats).heroPhysicalDefense);
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing)+92, equipmentOffset.y+67, 160, 20), "" + this.GetComponent(Char_Stats).heroMagicDefense);
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing), equipmentOffset.y+79, 160, 20), "-------------------------------------------------");
		//-------------------------------------------------------------------------------------------------------------------------------------------------
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing), equipmentOffset.y+94, 176, 20), "Strength: ");
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing), equipmentOffset.y+109, 176, 20), "Wisdom: ");
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing), equipmentOffset.y+124, 176, 20), "Dexterity: ");
		//This is the actual values in separate boxes in order to be lined up neatly
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing)+60, equipmentOffset.y+94, 176, 20), "" + this.GetComponent(Char_Stats).heroStrength);
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing)+60, equipmentOffset.y+109, 176, 20), "" + this.GetComponent(Char_Stats).heroWisdom);
		GUI.Label(Rect(equipmentOffset.x+(iconWidthHeight+spacing)+60, equipmentOffset.y+124, 176, 20), "" + this.GetComponent(Char_Stats).heroDexterity);
	}
		
	if(inventoryIsOn){
		//Bottom Half of inventory screen -- Actual Inventory =============================================================================================================================
		var texToUse : Texture;
		var currentInventoryItem : InventoryItem;
		
		//Display the background texture.
		GUI.DrawTexture(new Rect(offSet.x-spacing, offSet.y-spacing, (inventorySizeX*(iconWidthHeight+spacing))+spacing, (inventorySizeY*(iconWidthHeight+spacing))+spacing) , testTex);

		//Go through each row 
		for( var i = 0; i < inventory.length; i ++ ) 
		{ 
			// and each column 
			for( var k = 0; k < inventory[i].length; k ++ ) 
			{ 
				texToUse = emptyTex;
				currentInventoryItem = inventory[i][k];
				
				//if there is an item in the i-th row and the k-th column, draw it (WHY NOT USE currentInventoryItem here for the null check?)
				if( currentInventoryItem != null ) 
				{ 
					texToUse = currentInventoryItem.texRepresentation;
				} 
				
				//Fill [i][k] of the array with a dynamic rectangle.  Then draw the rectangle position and use the correct texture.
				windowRecArray[i][k] = new Rect( offSet.x+k*(iconWidthHeight+spacing), offSet.y+i*(iconWidthHeight+spacing), iconWidthHeight, iconWidthHeight );
				GUI.DrawTexture(windowRecArray[i][k], texToUse);
				
				if(!itemDropConfirmation)
				{
				
					//Mouse Event Detection Code-------------------------------------------------------------------------------------------------------------------------------------
					if(Event.current.type == EventType.MouseUp && Event.current.button == 1 && windowRecArray[i][k].Contains(Event.current.mousePosition)){
						if(actionBarSelectionMode){
							//ACTION BAR MODE
							//Send info to the action bar about the selected item. [0]=actual Item, [1]=location as Vector2, [2]=requestedActionBarSlot
							var locationVector : Vector2 = Vector2( i, k);
							var chosenItemArray : Array = new Array( inventory[i][k], locationVector, requestedActionBarSlot);
							NotificationCenter.DefaultCenter().PostNotification(this, "InventoryItemChosen", chosenItemArray);

						} else {
							//RIGHT CLICKING AN INVENTORY SPOT WILL ACTIVATE THAT ITEM HERE
							if( currentInventoryItem != null ) {
								//record the location if right clicked and not null
								arrayLocInUse.x = i;
								arrayLocInUse.y = k;
								
								InventoryItemActivate(currentInventoryItem, arrayLocInUse);
							}
						}
					}
					if(Event.current.type == EventType.MouseDown && Event.current.button == 0 && windowRecArray[i][k].Contains(Event.current.mousePosition)){
							currentlyDraggedRect = windowRecArray[i][k];
							currentlyDraggedTex = texToUse;
							//Record the array I and K values of the dragged item in case it will be swapped later.
							arrayLocInUse.x = i;
							arrayLocInUse.y = k;
					}
					else if(Event.current.type == EventType.MouseDrag && Event.current.button == 0 && currentlyDraggedRect != null){
						currentlyDraggedRect = new Rect(Event.current.mousePosition.x, Event.current.mousePosition.y, currentlyDraggedRect.width, currentlyDraggedRect.height );
					}
					else if( Event.current.type == EventType.MouseUp && Event.current.button == 0 && currentlyDraggedRect != null ){
						if(windowRecArray[i][k].Contains(Event.current.mousePosition)){
							//Record the I and K values of the array position we will swap the dragged item onto.
							arrayLocForSwap.x = i;
							arrayLocForSwap.y = k;
							
							ItemSwap(arrayLocInUse, arrayLocForSwap);
							//Clear all stored array location numbers, storred positions and storred texture info.
							currentlyDraggedRect = null;
							currentlyDraggedTex = null;
							arrayLocForSwap.x = -1;
							arrayLocForSwap.y = -1;
							arrayLocInUse.x = -1;
							arrayLocInUse.y = -1;
							
						 } else if(windowRecArray[i][k] == windowRecArray[inventorySizeX-1][inventorySizeY-1]){
							//The above check makes sure we have tried each position in the array before giving up and not attempting an item swap.  Each time through the loop the chance is high that the square we 
							//have the mouse over is not the one that is currently being drawn and tested.
							
								if(inventory[arrayLocInUse.x][arrayLocInUse.y] != null)
								{
									//This command will drop the item in question
									itemDropConfirmation = true;
									//We dont need to visually keep the dragged square at this point
									currentlyDraggedRect = null;
									currentlyDraggedTex = null;
								} else {
									//The dragged square to be dropped is NULL and doesn't deserve to open a confirmation box.
									arrayLocInUse.x = -1;
									arrayLocInUse.y = -1;
									currentlyDraggedRect = null;
									currentlyDraggedTex = null;
									print("NULL item spot will not be dropped");
								}
						 }
						 
					}
					
				} else {
				
					//Drop Confirmation is true and something is asking to be dropped.
					GUI.Box ( new Rect((Screen.width /2) - 200, (Screen.height/2) - 200, 225, 100), "Are you sure you want to drop this?");
					if( GUI.Button( new Rect((Screen.width /2) - 200 + spacing, (Screen.height/2) - 200 + 40, 100, 50), "Yes") )
					{
						//Begin the drop item function
						DropItem(arrayLocInUse);
						
						//Turn off the drop confirmation and flush the array variables
						itemDropConfirmation = false;
						arrayLocInUse.x = -1;
						arrayLocInUse.y = -1;
					}
					else if( GUI.Button( new Rect((Screen.width /2) - 200 + spacing + 115, (Screen.height/2) - 200 + 40, 100, 50), "No") )
					{
						//Turn off the drop confirmation and flush the array variables
						itemDropConfirmation = false;
						arrayLocInUse.x = -1;
						arrayLocInUse.y = -1;
					}
				}
			} 
		} 
		if(currentlyDraggedRect != null)
		{
			//This Draws the dragged texture as it is dragged. (VISUAL use only)
			GUI.DrawTexture(currentlyDraggedRect, currentlyDraggedTex);
		}
	}
	
	//This handles a gui box that displays all currently lootable objects in the area GIVEN BY lootList.  Right clicking will attempt to add that item to inventory via a function.
	if(lootList.length != 0)
	{
		//In the update function there is also code to loot the top item usin "LootTopItem" = e.
	
		for(var m = 0; m < lootList.length; m++ )
		{
			if(lootList[m] != null && m < maxLootBoxes)
			{
				//This converts the GameObject into a STRING of its name.
				var lootableItemString : String = lootList[m].gameObject.name;
				
				//THIS RIGHT HERE IS A MIRACLE ON TOP OF A MIRACLE AND YOU MUST NEVER FORGET HOW CRAZY THIS LINE OF CODE IS!
				//This right here digs into another script in THIS object, finds the INVENTORYITEM based on a STRING name and then brings that INFO back!
				var currentLootableItem : InventoryItem = this.GetComponent(GameItemsList).GetType().GetField(lootableItemString).GetValue(this);
				
				var lootableItemTex : Texture = emptyTex;
				
				if(currentLootableItem.texRepresentation != null)
				{
					lootableItemTex = currentLootableItem.texRepresentation;
				}
				
				lootTableRecArray[m] = new Rect(lootTableOffset.x, lootTableOffset.y+m*(iconWidthHeight+spacing), iconWidthHeight, iconWidthHeight);
				
				GUI.DrawTexture(lootTableRecArray[m], lootableItemTex);
				
				if(Event.current.type == EventType.MouseUp && lootTableRecArray[m].Contains(Event.current.mousePosition)){
					if (Event.current.button == 1)
					{
						//Right clicked the lootable Box.  Attempt to put inventory item in inventory via function
						if(LootItem(currentLootableItem))
						{
							//LootItem function is TRUE and we must DESTROY the gameobject now.  If this does not trigger there was no room for the item in inventory.
							Destroy(lootList[m].gameObject);
						}
						
					}
							
				}
			}
		}
	}
} 

// *** BEGIN BRANDON EDIT *** //

// Here we process the information from the notification
function beATypeWriter(notification: Notification){
	messageText = notification.data; // store the message text
	messageLength = messageText.length; // store the message length
	
	keepGoing = true; // time to progress through a message
	messageBoxIsOn = true; // gotta have a container to put it in
}
// *** END BRANDON EDIT *** //

function CanIEquipWeapons(notification : Notification){
	//This determines if it is currently OKAY to EQUIP/UNEQUIP a weaopon.  It is a boolean.
	canIEquipWeapons = notification.data;
}

function ActionBarSelectionRequest(notification : Notification){
	//The input is an array of [0]=Boolean on or off, and [1]= number location requesting input
	actionBarSelectionMode = notification.data[0];
	requestedActionBarSlot = notification.data[1];
}

function ActionBarInventoryActivate(notification : Notification){
	//notification holds a Vector2 containing an inventory[i][k] location notification.data.x= i and notification.data.y= k  Activate the item requested.
	
	//if the item is not null call the InventoryItemActivate function on it.
	if(inventory[notification.data.x][notification.data.y] != null){
		var itemLocationVector : Vector2 = Vector2( notification.data.x, notification.data.y);
		InventoryItemActivate(inventory[notification.data.x][notification.data.y], itemLocationVector);
	}
}

function BaseStatsInitiated(notification : Notification)
{
	//If this is called then the base stats have been set up and are ready for use. 
	
	if(currentHealth <= 0.0)
	{
		currentHealth = playerStaticStats.currentPlayerHealth;
	}
	if(currentMana <= 0.0)
	{
		currentMana = playerStaticStats.currentPlayerMana;
	}
	if(currentStamina <= 0.0)
	{
		currentStamina = playerStaticStats.currentPlayerStamina;
	}
	
	//Call the adjustCurrentHealth code to setup the Health Bar.
	adjustCurrentHealth(0.0);
	//Call the adjustCurrentMana code to setup the Mana Bar.
	adjustCurrentMana(0.0);
	//Call the adjustCurrentStamina code to setup the Stamina Bar.
	adjustCurrentStamina(0.0);
}
//CONSIDER consolidating THEM into JUST one. (THIS WILL ONLY BE AN OPTION IF I CAN GET RID OF the need for adjustCurrentHealth(0.0)
function modifyCurrentHealth(notification: Notification)
{
	//notification type INT.  will be the ammount the health should be modified by.  LATER ON MAKE THIS CONTAIN THE GAMEOBJECT and do a COMPARE to make sure its this one.
	adjustCurrentHealth(notification.data);
}

function adjustCurrentHealth (healthAdjustment : float)
{
	//This will be called after a message is send from char_stats.  Also will be called every time a message is sent about health adjustment.
	var maxHealth : float = this.GetComponent(Char_Stats).heroMaxHealth;
	
	if(healthAdjustment != 0.0){
		currentHealth = playerStaticStats.currentPlayerHealth;
	}
	
	if(maxHealth <= 0.0)
	{
		//MaX HEALTH is still initializing and needs a second or it will divide by zero and explode.
		healthBarLength = healthBarMaxLength;
	}else{
		//length times a percentage (current/max) -- THE REAL DEAL
		healthBarLength = healthBarMaxLength * (currentHealth / maxHealth);
	}
}

function modifyCurrentMana(notification: Notification)
{
	//notification type INT.  will be the ammount the Mana should be modified by.  LATER ON MAKE THIS CONTAIN THE GAMEOBJECT and do a COMPARE to make sure its this one.
	adjustCurrentMana(notification.data);
}

function adjustCurrentMana (manaAdjustment : float)
{
	//This will be called after a message is send from char_stats.  Also will be called every time a message is sent about mana adjustment.
	var maxMana : float = this.GetComponent(Char_Stats).heroMaxMana;
	
	if(manaAdjustment != 0.0){
		currentMana = playerStaticStats.currentPlayerMana;
	}

	if(maxMana <= 0.0)
	{
		//MaX Mana is still initializing and needs a second or it will divide by zero and explode.
		manaBarLength = manaBarMaxLength;
	}else{
		//length times a percentage (current/max) -- THE REAL DEAL
		manaBarLength = manaBarMaxLength * (currentMana / maxMana);
	}
}

function modifyCurrentStamina(notification: Notification)
{
	//notification type INT.  will be the ammount the Stamina should be modified by.  LATER ON MAKE THIS CONTAIN THE GAMEOBJECT and do a COMPARE to make sure its this one.
	adjustCurrentStamina(notification.data);
}

function adjustCurrentStamina (staminaAdjustment : float)
{
	//This will be called after a message is send from char_stats.  Also will be called every time a message is sent about Stamina adjustment.
	var maxStamina : float = this.GetComponent(Char_Stats).heroMaxStamina;
	
	if(staminaAdjustment != 0.0){
		currentStamina = playerStaticStats.currentPlayerStamina;
	}
	
	if(maxStamina <= 0.0)
	{
		//MaX Stamina is still initializing and needs a second or it will divide by zero and explode.
		staminaBarLength = staminaBarMaxLength;
	}else{
		//length times a percentage (current/max) -- THE REAL DEAL
		staminaBarLength = staminaBarMaxLength * (currentStamina / maxStamina);
	}
}

function runStatWindow(windowID : int)
{
	//LATER ON THIS WILL BE FOR THE FULL STATS ON THE HERO: LEVEL CLASS EVERYTHING and the major stats are also in equipment gui
	GUI.DragWindow (Rect(0, 0, 200, 20));

	GUI.Label(Rect(4, 20, 176, 20), "Max Health: " + this.GetComponent(Char_Stats).heroMaxHealth);
	GUI.Label(Rect(4, 35, 176, 20), "Max Mana: " + this.GetComponent(Char_Stats).heroMaxMana);
	GUI.Label(Rect(4, 50, 176, 20), "Max Stamina: " + this.GetComponent(Char_Stats).heroMaxStamina);
	//===================================================================================================================
	GUI.Label(Rect(5, 65, 165, 20), "======================================");
	GUI.Label(Rect(4, 80, 176, 20), "Phys Attack: " + this.GetComponent(Char_Stats).heroPhysicalAttack);
	GUI.Label(Rect(4, 95, 176, 20), "Magic Attack: " + this.GetComponent(Char_Stats).heroMagicAttack);
	GUI.Label(Rect(4, 110, 176, 20), "Phys Defense: " + this.GetComponent(Char_Stats).heroPhysicalDefense);
	GUI.Label(Rect(4, 125, 176, 20), "Magic Defense: " + this.GetComponent(Char_Stats).heroMagicDefense);
	//------------------------------------------------------------------------------------------------------------------------------------------
	GUI.Label(Rect(5, 140, 165, 20), "------------------------------------------------");
	GUI.Label(Rect(4, 155, 176, 20), "Strength: " + this.GetComponent(Char_Stats).heroStrength);
	GUI.Label(Rect(4, 170, 176, 20), "Wisdom: " + this.GetComponent(Char_Stats).heroWisdom);
	GUI.Label(Rect(4, 185, 176, 20), "Dexterity: " + this.GetComponent(Char_Stats).heroDexterity);
}

function InventoryItemActivate(activatedItem : InventoryItem, inventoryArrayLoc : Vector2)
{
	var doIDestroyThis : boolean = false;
	var inventoryNotificationArray : Array;
	
	if(activatedItem.use > (maxEquippedItems-1))
	{
		//Item is NOT EQUIPPABLE.
		if(activatedItem.use == 20)
		{
			//SEND A MESSAGE TO THE MESSAGE CONSTRUCT TO UPDATE THE STATS AND EFFECTS-=-=-=-=-=-=-=-=-=-=-=-=-
			NotificationCenter.DefaultCenter().PostNotification(this, "ItemActivated", activatedItem);
			
			//Return true and remove the item from inventory
			doIDestroyThis = true;
		} 
		else 
		{	
			//if it's 30 its a quest item and will not be removed.
			doIDestroyThis = false;
		}
	}
	else if(activatedItem.use == 0 && canIEquipWeapons == false){
			//The item is a weapon BUT we are not currently allowed to equip weapons (the previous weapon is not done being equipped: It will send a CanIEquipWeapons message when done)
			//So we do nothing.
			doIDestroyThis = false;
	}
	else
	{	
		//Looks like the item is equipment and even if it is a weapon it is allowed to be equipped.
			
		if(activatedItem.use == 0){
			//Item is type 0: A weapon -- Let it equip but just this one.
			//Make sure we CANNOT EQUIP WEAPONS until the current one is FINISHED EQUIPPING (this solves twitch bugs)
			canIEquipWeapons = false;
		}
		
		//Check to make sure the equipment slot is open. if not it must be swapped with the activated item.
		if(equippedItemsArray[activatedItem.use] == null){
			//The Item is equipable and will go into the same equipArray slot as the .use number. NO NEED FOR A SWAP
			equippedItemsArray[activatedItem.use] = activatedItem;
			
			//Return true and remove the item from inventory
			doIDestroyThis = true;
		} else {
			//The item will need to be swapped with one already equipped.
			var tempEquipItem = equippedItemsArray[activatedItem.use];
		
			equippedItemsArray[activatedItem.use] = activatedItem;
		
			inventory[inventoryArrayLoc.x][inventoryArrayLoc.y] = tempEquipItem;
			
			//Send message to actionBar script about this change vars are [0]=actual inventory item, [1]=location .x, [2]=location.y --- WE ONLY NEED TO GATHER INFO ON THE ITEM GOING TO INVENTORY
			inventoryNotificationArray = new Array( inventory[inventoryArrayLoc.x][inventoryArrayLoc.y], inventoryArrayLoc.x, inventoryArrayLoc.y);
			NotificationCenter.DefaultCenter().PostNotification(this, "InventoryLocationUpdate", inventoryNotificationArray);
			
			//NOTHING SHOULD BE NULLIFIED; We DID A SWAP ALREADY!
			doIDestroyThis = false;
		}

		//SEND A MESSAGE TO THE MESSAGE CONSTRUCT TO UPDATE THE STATS AND THE VISUAL CHARACTER MODEL-=-=-=-=-=-=-=-=-=-=-=-=-

		//Fill the array with the location of the updated equipment AND what the new equipment is.
		var updatedEquipmentArray : Array = new Array(activatedItem.use, activatedItem);
		
		NotificationCenter.DefaultCenter().PostNotification(this, "EquipmentUpdated", updatedEquipmentArray );
	}
	
	if(doIDestroyThis){
			//NULLIFY THE ITEM BEFORE RETURN and SEND MESSAGE ABOUT IT
			inventory[inventoryArrayLoc.x][inventoryArrayLoc.y] = null;
									
			//Send message to actionBar script about this change vars are [0]=actual inventory item, [1]=location .x, [2]=location.y --- WE ONLY NEED TO GATHER INFO ON THE ITEM GOING TO INVENTORY
			inventoryNotificationArray = new Array( inventory[inventoryArrayLoc.x][inventoryArrayLoc.y], inventoryArrayLoc.x, inventoryArrayLoc.y);
			NotificationCenter.DefaultCenter().PostNotification(this, "InventoryLocationUpdate", inventoryNotificationArray);
	}
	
	return;
}

function LootItem(itemToLoot : InventoryItem)
{
	//Go through each row 
    for( var i = 0; i < inventory.length; i ++ ) 
    { 
        // and each column 
        for( var k = 0; k < inventory[i].length; k ++ ) 
        { 
        	//If the inventory position is empty add the item and return TRUE so the object may be deleted from the ground
        	if( inventory[i][k] == null ) 
            {
            	 inventory[i][k] = itemToLoot;
				 
				 //Send message to actionBar script about this change. vars are [0]=actual inventory item, [1]=location .x, [2]=location.y
				var inventoryNotificationArray = new Array( inventory[i][k], i, k);
				NotificationCenter.DefaultCenter().PostNotification(this, "InventoryLocationUpdate", inventoryNotificationArray);
				 				 
            	 return true;
            }
        }
    }	
    //Array was checked and is full -- Return FALSE so the object will not be deleted from the ground
    return false;	
}

function DropItem( droppedItemArrayLocation : Vector2 )
{
	var itemToBeDropped : InventoryItem;
	itemToBeDropped = inventory[droppedItemArrayLocation.x][droppedItemArrayLocation.y];
	
	var gameObjectToPlace : GameObject;
	gameObjectToPlace = itemToBeDropped.worldObject;
	
	if(gameObjectToPlace != null){
	//Place the item.GameObject on the ground at the feet of the player
	Instantiate(gameObjectToPlace, GameController.playerTransform.transform.position, GameController.playerTransform.transform.rotation);
	
	//Remove the item from the inventory array.
	inventory[droppedItemArrayLocation.x][droppedItemArrayLocation.y] = null;
	
	//Send message to actionBar script about this change vars are [0]=actual inventory item, [1]=location .x, [2]=location.y
	var inventoryNotificationArray = new Array(inventory[droppedItemArrayLocation.x][droppedItemArrayLocation.y], droppedItemArrayLocation.x, droppedItemArrayLocation.y);
	NotificationCenter.DefaultCenter().PostNotification(this, "InventoryLocationUpdate", inventoryNotificationArray);
	}
}

function ItemSwap( draggedArrayLoc : Vector2, swappedArrayLoc : Vector2)
{
	if(inventory[draggedArrayLoc.x][draggedArrayLoc.y] != inventory[swappedArrayLoc.x][swappedArrayLoc.y])
	{		
		//Item is not itself.  Perform the swap
		var tempItem = inventory[swappedArrayLoc.x][swappedArrayLoc.y];
		
		inventory[swappedArrayLoc.x][swappedArrayLoc.y] = inventory[draggedArrayLoc.x][draggedArrayLoc.y];
		
		inventory[draggedArrayLoc.x][draggedArrayLoc.y] = tempItem;
		
		//Send message to actionBar script about this change vars are [0]=actual inventory item, [1]=location .x, [2]=location.y ----------- FIRST FOR THE DRAGGED ONE---------
		var inventoryNotificationArray = new Array( inventory[draggedArrayLoc.x][draggedArrayLoc.y], draggedArrayLoc.x, draggedArrayLoc.y);
		NotificationCenter.DefaultCenter().PostNotification(this, "InventoryLocationUpdate", inventoryNotificationArray);
		//Send message to actionBar script about this change vars are [0]=actual inventory item, [1]=location .x, [2]=location.y ----------- THEN FOR THE  SWAPPED ONE------------------
		inventoryNotificationArray = new Array( inventory[swappedArrayLoc.x][swappedArrayLoc.y], swappedArrayLoc.x, swappedArrayLoc.y);
		NotificationCenter.DefaultCenter().PostNotification(this, "InventoryLocationUpdate", inventoryNotificationArray);
	}
}

//This actually Adds an item to the inventory array at the first available null location.
//THIS MAY ONLY HAVE USE LATER FOR NPC QUEST GIVEN ITEMS
function AddItemToInventory( item : InventoryItem )
{
	 //Go through each row 
    for( var i = 0; i < inventory.length; i ++ ) 
    { 
        // and each column 
        for( var k = 0; k < inventory[i].length; k ++ ) 
        { 
        	//If the position is empty, add the new item and exit the function
        	if( inventory[i][k] == null ) 
            {
            	 inventory[i][k] = item;
				 
				 //Send message to actionBar script about this change vars are [0]=actual inventory item, [1]=location .x, [2]=location.y
				var inventoryNotificationArray = new Array( inventory[i][k], i, k);
				NotificationCenter.DefaultCenter().PostNotification(this, "InventoryLocationUpdate", inventoryNotificationArray);
				
            	 return;
            }
        }
    }	
    
    //If we got this far, the inventory is full, do somethign appropriate here	
}


//Toggles inventoryIsOn and equipScreenIsOn off and on.  Inventory = 1 Equipment = 2 Stats = 3
function displayGUIWindow(screenToToggle : int){
	if(screenToToggle == 1)
	{
		if (inventoryIsOn){
			inventoryIsOn = false;
		}else{
			inventoryIsOn = true;
		}
	}
	else if(screenToToggle == 2)
	{
		if (equipScreenIsOn){
			equipScreenIsOn = false;
		}else{
			equipScreenIsOn = true;
		}
	} 
	else 	if(screenToToggle == 3)
	{
		if (statsScreenIsOn){
			statsScreenIsOn = false;
		}else{
			statsScreenIsOn = true;
		}
	} else {
	//Do nothing
	}
}

function Update()
{
	currentHealth = playerStaticStats.currentPlayerHealth;

	if(Input.GetButtonUp ("Inventory")){
		displayGUIWindow(1);
	}
	
	if(Input.GetButtonUp ("Equipment")){
		displayGUIWindow(2);
	}
	
	if(Input.GetButtonUp ("PlayerStats")){
		displayGUIWindow(3);
	}
	
// *** BEGIN BRANDON EDIT *** //

	// If we should be displaying a message, then lets keep displaying it
	if(keepGoing){
		if(messageBoxCurrPos <= messageLength){ // Do we have more letters to write?
			// Grab the substring (from the beginning to the current position) and put it into the message box display var
			messageBoxCurrMsg = messageText.Substring(0,messageBoxCurrPos);
			timeTracker = Time.time; // Update our timer
		}
		// If we don't have more letters AND we've reached the display time limit, it's time to make it go away
		else if(timeTracker < (Time.time - messageDisplaySecs)){
			// So turn it off, and reset CurrPos.
			keepGoing = false;
			messageBoxIsOn = false;
			messageBoxCurrPos = 0;		
		}
	}
	
	// This keeps track of time.
	// timeTracker is set when the last letter was displayed.  So...
	// if the time when it was last displayed is earlier than the
	// current time minus our rate interval, then it's time to display
	// the next letter.  So we increase messageBoxCurrPos and reset timeTracker.
	if(timeTracker <= (Time.time - messageDisplayInterval) && keepGoing){
		messageBoxCurrPos++;
		//timeTracker = Time.time;timeTracker = Time.time;
	}
// *** END BRANDON EDIT *** //
		
	//Attempts to grab the top item in the lootList array.  For some reason putting this code with its right click brother in OnGUI made it run TWICE -- a No No.
	if(Input.GetButtonUp ("LootTopItem") && lootList.length > 0){
		
	var topLootableItemString : String = lootList[0].gameObject.name;
	var topLootableItem : InventoryItem = this.GetComponent(GameItemsList).GetType().GetField(topLootableItemString).GetValue(this);
	
		if(LootItem(topLootableItem))
		{
			//LootItem function is TRUE and we must DESTROY the gameobject now.  If this does not trigger there was no room for the item in inventory.
			Destroy(lootList[0].gameObject);
		}
		
	}
	
	//This will grab the current lootable object(s) nearby: as long as this array is greater than 0 it will ping an ONGUI event to display the results.
	lootList = Physics.OverlapSphere(GameController.playerTransform.transform.position, lootableRange, lootLayer);	
}
