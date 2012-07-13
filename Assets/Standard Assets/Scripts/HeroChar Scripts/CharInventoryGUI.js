private var windowRect : Rect = Rect (30, 30, 500, 500);
//This GameObject array will be usefull one day!
//var inventory : GameObject = new GameObject[25];
var inventory : int[] = new int[25];
//var currentInventoryItem : int;
private var rowLength : int = 5;
private var rowModifier : int = 0;
private var currentSpaceHorizontal : int = 0;
private var currentSpaceVertical : int = 0;
private var inventorySpaceHeight : int = 50;
private var inventorySpaceWidth : int = 50;
private var paddingSpace : int = 20;

//SELECTION GRID TESTS
var selectedGridInt : int = 0;
var selStrings : String[] = ["Grid 1", "Grid 2", "Grid 3", "Grid 4"];

function Start(){

var i : int;

for(i = 0; i < inventory.length; i++){

		inventory[i] = i;
		
	}
	
	inventory[7] = 7;
	inventory[9] = 9;
	inventory[14] = 94;
	inventory[24] = 25;
}

function OnGUI () {
	GUI.backgroundColor = Color.green;
	GUI.contentColor = Color.white;
	windowRect = GUI.Window(0, windowRect, WindowFunction, "Inventory");
	
	
	

	//THIS MAY CREATE A BEAUTIFUL INVENTORY GRID USING A 1 DIM ARRAY
	for(var i : int = 0; i < inventory.length; i++){
		
		
		if( ((i +1) / rowLength) >= 1 ){
			//Double the row length so it wont hit 1 again until 10. instead of 5 etc.
			rowLength = rowLength + rowLength;
			
			rowModifier += 1;
		}
		
		var invRect : Rect = Rect(i*50+20, rowModifier*50+20, 50, 50);
		
		if(GUI.Button(invRect, inventory[i].ToString())){
		
		}
		
		
		//currentSpaceHorizontal = currentSpaceHorizontal + paddingSpace + inventorySpaceWidth;
	}
	
	
}

function WindowFunction (windowID : int) {
	//GUI.DragWindow(); would make the entire window dragable.
	//This will make the top 20 pixels dragable all the way 100 pixels acroos.
	GUI.DragWindow(Rect(0,0, 500, 20));
	
	selectedGridInt = GUI.SelectionGrid (Rect (20, 20, 50, 50), selectedGridInt, selStrings, 5);
}
