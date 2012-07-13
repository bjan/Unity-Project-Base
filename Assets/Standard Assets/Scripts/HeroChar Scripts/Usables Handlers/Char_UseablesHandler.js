//Detects ItemActivated Messages // Strips info from Useable class and then does what it's told by the info.

function Awake() {
	NotificationCenter.DefaultCenter().AddObserver(this, "ItemActivated");
}

function ItemActivated (notification: Notification) {
	//The notification is an Item class object.  Take it and convert it to its Useable class counterpart.
	convertItemToUseable(notification.data);
}

function convertItemToUseable(currentItem : InventoryItem){
	var convertedUseable : Useable;
	var useableStatsName : String;
	
	useableStatsName = currentItem.itemLookupName;
	convertedUseable = GameObject.Find("HeroCube/Main Camera").GetComponent(UseablesInfoList).GetType().GetField(useableStatsName).GetValue(this);
	
	activateUseable(convertedUseable);
}

function activateUseable(currentUseable : Useable)
{	
	//0=Health 1=Mana 2=Stamina

	//Send messages depending on what the .Useable info tells us.
	if(currentUseable.statEffected == 0){
		//Post the notification to modify healthMod
		var healthMod : float = currentUseable.augmentationAmmount;
		NotificationCenter.DefaultCenter().PostNotification(this, "modifyCurrentHealth", healthMod);
	}


}



