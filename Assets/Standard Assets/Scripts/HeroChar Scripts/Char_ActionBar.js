//STEP 3:  When the above is done, make the function for using an actionBar item.  If the item is not null then send a message that will trigger the correct response in either the GameItem script or the skills script(when it exists)


//This will hold the 10 actions/items/spells/etc that correspond to the keyboard numbers
private var actionBarWidthHeight  : int  = 40;
private var iconWidthHeight : int = 50;
private var spacing : int = 4;
private var actionBarList : Array;
private var actionBarRecArray : Array;
private var actionBarLength : int = 10;
private var equippedItem : InventoryItem;
private var actionBarOffset : Vector2 = Vector2((Screen.width/2)-((actionBarLength*(actionBarWidthHeight)+(actionBarLength*spacing)-spacing)/2), Screen.height-(actionBarWidthHeight+spacing));
var emptyTex : Texture;
var actionBarBackground : Texture;
var  aBarHighlightTex : Texture;

private var startTime : float = 0.0;
private var timeForHoldStatus : float = 0.4;
private var holdTimerResults : boolean = false;
private var selectedNumber : int = -1;
var turnOffMessageArray : Array;
var curMonitoredLocsArray : Array;

function Awake(){
	//Listen for at least item equip/unequiping
	NotificationCenter.DefaultCenter().AddObserver(this, "EquipmentUpdated");
	NotificationCenter.DefaultCenter().AddObserver(this, "InventoryLocationUpdate");
	NotificationCenter.DefaultCenter().AddObserver(this, "InventoryItemChosen");
	actionBarList = new Array(actionBarLength);
	actionBarRecArray = new Array(actionBarLength);
	curMonitoredLocsArray = new Array(actionBarLength);
	turnOffMessageArray = new Array(false, -1);
	
	//LATER ON I CAN HAVE THIS BE A FUNCTION THAT GRABS INFO FROM A CONFIGURATION LIST-- RIGHT NOW IT JUST MAKES ALL MONTORED LOCATIONS -1
	for(var n:int=0; n<actionBarLength; n++){
		actionBarList[n] = null;
		curMonitoredLocsArray[n]= Vector2(-1,-1);
	}
}

function Update(){
	//I still need to make a variable to store which button is selected and to make sure that only the first button held is stored and NOT replaced until button UP.

	if(Input.GetButtonDown ("Number1")){
		if(selectedNumber ==-1){
			startTime = Time.time;
			selectedNumber = 0;
		}
	}
	if(Input.GetButtonDown ("Number2")){
		 if(selectedNumber ==-1){
			startTime = Time.time;
			selectedNumber = 1;
		}
	}
	if(Input.GetButtonDown ("Number3")){
		if(selectedNumber ==-1){
			startTime = Time.time;
			selectedNumber = 2;
		}
	}
	if(Input.GetButtonDown ("Number4")){
		 if(selectedNumber ==-1){
			startTime = Time.time;
			selectedNumber = 3;
		}
	}if(Input.GetButtonDown ("Number5")){
		 if(selectedNumber ==-1){
			startTime = Time.time;
			selectedNumber = 4;
		}
	}
	if(Input.GetButtonDown ("Number6")){
		if(selectedNumber ==-1){
			startTime = Time.time;
			selectedNumber = 5;
		}
	}if(Input.GetButtonDown ("Number7")){
		if(selectedNumber ==-1){
			startTime = Time.time;
			selectedNumber = 6;
		}
	}
	if(Input.GetButtonDown ("Number8")){
		if(selectedNumber ==-1){
			startTime = Time.time;
			selectedNumber = 7;
		}
	}
	if(Input.GetButtonDown ("Number9")){
		if(selectedNumber ==-1){
			startTime = Time.time;
			selectedNumber = 8;
		}
	}
	if(Input.GetButtonDown ("Number0")){
		if(selectedNumber ==-1){
			startTime = Time.time;
			selectedNumber = 9;
		}
	}
	
	if(Input.GetButtonUp ("Number1")||Input.GetButtonUp ("Number2")||Input.GetButtonUp ("Number3")||Input.GetButtonUp ("Number4")||Input.GetButtonUp ("Number5")||Input.GetButtonUp ("Number6")||Input.GetButtonUp ("Number7")||Input.GetButtonUp ("Number8")||Input.GetButtonUp ("Number9")||Input.GetButtonUp ("Number0")){
		startTime = 0.0;
		//Check for holdTimerResults. TRUE = held &  FALSE = tapped
		if(holdTimerResults == true){
			//It was held and is now released.
			holdTimerResults = false;
			//SEND MESSAGE TO STOP SUPPLYING INFORMATION AND GO BACK TO BUSINESS AS USUAL
			NotificationCenter.DefaultCenter().PostNotification(this, "ActionBarSelectionRequest", turnOffMessageArray );
		} else {
			//button was tapped. Begin function to activate the item or skill selected.
			if(selectedNumber != -1){
				if(actionBarList[selectedNumber] != null){
					//Take the location Vector2 and send it as a message "ActionBarInventoryActivate" to be read by Inventory.  LATER ON "ActionBarSkillActivate" Will be available and tested for.
					NotificationCenter.DefaultCenter().PostNotification(this, "ActionBarInventoryActivate", curMonitoredLocsArray[selectedNumber] );
				}
			}
		}

		//reset selected number to -1
		selectedNumber = -1;

	}
	
	if(startTime != 0.0)
	{
		if(Time.time-timeForHoldStatus > startTime){
			startTime = 0.0;
			//holdTimerResults are set to true when the timer has finished counting hold length.
			holdTimerResults = true;
			//Create boolean for message [0]= True or False,  [1]= selectedNumber
			var boolAndSelectedNumber : Array = new Array(true, selectedNumber);
			//SEND MESSAGE TO LISTENERS THAT THEY MUST SUPPLY INFO ON ANY TIEM/LOCATION THAT IS CLICKED UNTIL THE COAST IS CLEAR.
			NotificationCenter.DefaultCenter().PostNotification(this, "ActionBarSelectionRequest", boolAndSelectedNumber );
		}
	}
}

function InventoryItemChosen(notification : Notification){
	//Adds chosen item to the action bar list.    variables are : [0]=actual Item, [1]=location as Vector2, [2]=requestedActionBarSlot

	//Place the item at the actionBarList[requestedBarSlot] location.
	actionBarList[notification.data[2]] = notification.data[0];
	//Add the location to the location list at the same placed
	curMonitoredLocsArray[notification.data[2]] = notification.data[1];
}

function EquipmentUpdated(notification : Notification) {
	//Notification will be an array, containing the item slot at [0] and the actual InventoryItem at [1]
	if(notification.data[0] == 0){
		//Item is a weapon slot type so record it. Even if its null!
		equippedItem = notification.data[1];
	}
}

function InventoryLocationUpdate(notification : Notification){
	//[0]= Actual InventoryItem, [1]=InventoryItemLocation.x, [2]=InventoryItemLocation.y
	var inventoryItemLoc : Vector2 = new Vector2(notification.data[1], notification.data[2]);
	//run through and search the array to determine if a relevant location needs updating
	for(var i:int = 0; i < actionBarLength; i++){
		if((curMonitoredLocsArray[i] - inventoryItemLoc).sqrMagnitude < 0.1){
			//Update the item at this location.
			actionBarList[i] = notification.data[0];
		} 
	}
}

function OnGUI(){
	var currentActionBarTex : Texture;
	
	//Draw Action Bar Background
	GUI.DrawTexture(new Rect(actionBarOffset.x-spacing, actionBarOffset.y-spacing, actionBarLength*(actionBarWidthHeight+spacing)+(spacing), actionBarWidthHeight+spacing+spacing), actionBarBackground);
	
	//If hold status is true draw a rectangle around selectedNumber to show it has been selected.
	if(holdTimerResults == true){
		
		GUI.DrawTexture(new Rect(actionBarOffset.x+(selectedNumber*(actionBarWidthHeight + spacing)-5), actionBarOffset.y-5, actionBarWidthHeight+10, actionBarWidthHeight + 10 ), aBarHighlightTex);
	}
	
	//Build the 10 slot bar, Center it on the bootom of the screen
	for(var i : int = 0; i < actionBarLength; i++){
	
	currentActionBarTex = emptyTex;
	
	//Array holds InventoryItem Class objects
		if(actionBarList[i] != null){		
			currentActionBarTex = actionBarList[i].texRepresentation;		
		}

		actionBarRecArray[i] = new Rect(actionBarOffset.x+i*(actionBarWidthHeight + spacing), actionBarOffset.y, actionBarWidthHeight, actionBarWidthHeight );
		
		GUI.DrawTexture(actionBarRecArray[i], currentActionBarTex);
		var boxNumber : int = i+1;
		GUI.Label( Rect(actionBarOffset.x+(i*(actionBarWidthHeight + spacing)),actionBarOffset.y-4,20 ,20), boxNumber.ToString());
	}
	//Build a separate box to the left of the 10 slot bar for the currently equipped Item.
	var equippedItemTex : Texture;
	equippedItemTex = emptyTex;
	
	if(equippedItem != null){
		equippedItemTex = equippedItem.texRepresentation;
		GUI.Box(new Rect(actionBarOffset.x-(iconWidthHeight+spacing+spacing+spacing), actionBarOffset.y-(iconWidthHeight-actionBarWidthHeight)-spacing, iconWidthHeight+spacing+spacing, iconWidthHeight+spacing+spacing), "");
		GUI.DrawTexture(new Rect(actionBarOffset.x-(iconWidthHeight+spacing+spacing), actionBarOffset.y-(iconWidthHeight-actionBarWidthHeight), iconWidthHeight, iconWidthHeight), equippedItemTex);
	}
	
	//Put bullet count / maxbullets somewhere on the bottom or TOP right. not sure which.
}
