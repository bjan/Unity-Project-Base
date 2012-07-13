//[FILE IS USED IN ALL ENEMY STANDARD TYPES]
//THERE WILL BE MORE THAN ONE ATTACK TYPE: STRAIGHT FORWARD(Kamikaze?).  MELE ATTCK,  RANGED ATTACK.
//MUST SOLVE ISSUE WHERE TALLER AI WILL BEND DOWM TO LOOK AT SMALLER PLAYER. <--- ISSUE WITH Transform.LootAt
private var gravity : float = 20.0;

var idleBehavior : String;
private var enemyMoveSpeed : float; //------------------------------# Get From Other Script
//Field of view enemy can use to see player
private var fieldOView : float; //---------------------------------# Get From Other Script
var agroRange : float;
var returnHomeRange : float;
private var nameOfStatsScript : String;

//Patrol variables
var homeWaypoint : GameObject;
var maxWaypoints : int = 30;
var patrolDirection : String = "forward";
@HideInInspector
var arrivalMargin : float = 0.5;

//Private Patrol variables
private var patrolLocationsArray : Array;
private var waypointObjToBeAdded : GameObject;
private var numOfValidWaypoints : int = 0;
private var curPatrolDestination : int = 0; 

private var teleportHome : boolean = false;
private var returningHome : boolean = false;
private var alreadyEngaged : boolean = false;
private var atHome : boolean = false;
private var startPosition : Vector3;
private var startRotation : Vector3;
private var homePosition : Vector3;
private var enemyBehavior : String = "none";
private var playerPos : Vector3;
private var controller : CharacterController;
private var gameControllerScript;
private var moveDirection : Vector3;


//Stuck in place variables
private var timeSinceLastMove : float = 0;
private var timeUntilStuck : float = 1.0;
private var oldPos : Vector3;
@HideInInspector
var justGoHome : boolean = false;
@HideInInspector
var consecutiveLostStuckPings : int = 0;
private var maxConsecutiveStuckPings : int = 5;

//Breadcrumb exclusive variables
private var crumbLocArray : Array;
private var colapsedCrumbArray: Array;
private var crumbStoredRotation : Vector3;
//Currently set to 15 degreees, but this may change.
private var crumbRotationThreshold : float = 15.0;
private var curCrumbArrayMax : int = 0;
private var curColapsedArrayMax : int = -99;
//Currently set to 300 but it may need to be higher (WHO KNOWS YET)
private var maxCrumbs : int = 300;
private var currentAssuredLocation : int = 0;
private var crumbArrayHasColpased : boolean = false;

var demonstrationObject : GameObject;


//Awake() happens before Start()
function Awake(){
	if(idleBehavior != "guard" && idleBehavior != "patrol"){
		//If idleBehavior is not an acceptable string it auto-sets to guard
		idleBehavior = "guard";
	}
	
	enemyBehavior = idleBehavior;
	
	if(patrolDirection != "forward" && patrolDirection != "reverse"){
		//no acceptable direction is set so default to forward
		patrolDirection = "forward";
	}
}


function Start(){
	//Determine where AI starts and record this location
	startPosition = transform.position;
	startRotation = transform.eulerAngles;
	
	//Set location Arrays as arrays with a predefined max
	crumbLocArray = new Array(maxCrumbs);
	colapsedCrumbArray = new Array(maxCrumbs);
	
	controller = GetComponent(CharacterController);
	
	//This references the SCRIPT where the MainPlayer position STATIC variable is housed.
	gameControllerScript = GameObject.FindWithTag("MainPlayer").GetComponent(GameController);
	
	//Set homePosition either to startPosition or HomeWaypoint depending in idleBehavior
	homePosition = startPosition;
	if(idleBehavior == "patrol"){
		//Change homePosition from "startPosition" to "homeWaypoint.transform.position" since idleBehavior = patrol
		homePosition = homeWaypoint.transform.position;
		
		//Set PatrolLocationsArray to [maxWaypoints]
		patrolLocationsArray = new Array[maxWaypoints];
	}
	
	//Get stats from Enemy_PersonalityStats file. -- But first get the name of that file from Engagement_Tactics
	nameOfStatsScript = this.GetComponent("Engagement_Tactics").nameOfStatsScript;
	
	fieldOView = this.GetComponent(nameOfStatsScript).fieldOView;
	enemyMoveSpeed = this.GetComponent(nameOfStatsScript).enemyMoveSpeed;
}


function Update () {	

	if(enemyBehavior == "guard"){
		Guard();
	}
	else if(enemyBehavior == "patrol"){
		Patrol();
	}
	else if(enemyBehavior == "pursue"){
		PursueEnemy();
	}
	else if(enemyBehavior == "dead"){
		//Yo dead sucka!
	}
	
}

function LateUpdate(){
	// Apply gravity
	if(enemyBehavior == "guard" && atHome == true){
		//Do not use gravity, it messes up the guards position and he glitches out.
	}else{
		moveDirection.y -= gravity * Time.deltaTime;
		controller.Move(moveDirection * Time.deltaTime);
	}
	
	//Clamp AI from ROTATION on X and Z.  (Otherwise taller enemies bend to look down at the player, and look down to face waypoints.)
	transform.eulerAngles = Vector3(0.0, transform.eulerAngles.y, 0.0);
}

function PursueEnemy(){
	//update PLAYER POSITION and DISTANCE FROM HOME------------------------
	playerPos = gameControllerScript.playerTransform.transform.position;
	var distanceFromHome : float = Vector3.Distance(transform.position, homePosition);

	//check to see if AI is within returnHomeRange
	//--justGoHome can be updated from Engagement_Tactics when a misfire in the tracker means AI must go home
	if(distanceFromHome < returnHomeRange && !justGoHome){
		
		if(crumbArrayHasColpased){
			//If we are pursuing then we must lay crumbs so this (if true) becomes false!
			crumbArrayHasColpased = false;
		}
		
		//Running this funcion as false means it is NOT the final time it runs.
		BreadCrumbSystem(false);
		
		//if not already on, BEGIN Engagement_Tactics.java and start Attackin!
		if(!alreadyEngaged){
			this.GetComponent(Engagement_Tactics).engage = true;
			//Adds one to the player agro counter
			NotificationCenter.DefaultCenter().PostNotification(this, "EnemyAgro", true);
			alreadyEngaged = true;
			atHome = false;
		}
		
		if(this.GetComponent(Engagement_Tactics).lostPlayer){
		//If lostPlayer is true, run the stuck function within pursueEnemy.
			//Check if we are STUCK -- a function.
			if(SeeIfStuck() == true){
				justGoHome = true;
			}
			//print("Checking if STUCK from within PersueEnemy!");
		}
	
	}
	else{
		//AI is OUTSIDE of the home range!  (Set it back to its idleBehavior so it can go home) ** CONSIDER ADDING AN INVINCIBILITY VARIABLE WHEN HEADING HOME!
		returningHome = true;
		
		//Run the breadcrumb system to (lastTimeRunning =TRUE) <-- meaning add the final location.
		BreadCrumbSystem(true);
		
		justGoHome = false;
		
		//END Engagement_Tactics.java and return home.
		if(alreadyEngaged){
			this.GetComponent(Engagement_Tactics).engage = false;
			NotificationCenter.DefaultCenter().PostNotification(this, "EnemyAgro", false);
			alreadyEngaged = false;
		}
		
		enemyBehavior = idleBehavior;
	}
	
	
}


function Guard(){
	//update PLAYER POSITION and PLAYER DISTANCE and DISTANCE FROM HOME------------------------
	playerPos = gameControllerScript.playerTransform.transform.position;
	var distanceFromPlayer : float = Vector3.Distance(transform.position, playerPos);
	var distanceFromHome : float = Vector3.Distance(transform.position, homePosition);
	
	//THIS agro check does not need to be as complex as the patrol check.
	if(distanceFromPlayer < agroRange && distanceFromHome < (returnHomeRange/2) ){
		//Player is within agro range AND AI is within (returnHomeRange/2) [This is a SMALLER range so the AI has time to head back and not get caught between Returning and Re-agroing]
		//Check if we have visibility for agro.
		AgroVisibilityTest();
	}
	
	if(distanceFromHome > arrivalMargin){
	//distanceFromHome is ALLWAYS SLIGHTLY FARTHER THAN arrivalMargin NO MATTER WHAT I SET IT TO.
		//AI (is not agroed or we wouldnt be here) is not close enough to homePosition and must be moved closer.
		if(teleportHome == true){
			TeleportHome(homePosition);
		}
		else if(returningHome == true){
			if(crumbArrayHasColpased == false){
				//The crumb array is not finished colapsing.
				ColapseBreadCrumbArray(curCrumbArrayMax);
			}
			else{
				FollowCrumbsHome();
			}
		}
	}
	else if(Mathf.Abs(transform.eulerAngles.y - startRotation.y) > arrivalMargin){
		//We are not rotated on Y in the direction we should be (startRotation.y).
		//Reorient to starting rotation. (We dont want a guard facing a wall)
			//print("Re-orienting Y rotation -- Remove this after you're convinced its not flooding");
		transform.eulerAngles.y = startRotation.y;
		//We have made it home so this becomes true.
		atHome = true;
	}
	else if(crumbArrayHasColpased){
		//the old colapsed crumb array got us home.  Now it becomes false again.
		returningHome = false;
		crumbArrayHasColpased = false;
		//Reset health in Stats.js File.
		this.gameObject.SendMessage("ResetHealth");
	}
}


function Patrol(){
	//update PLAYER POSITION and PLAYER DISTANCE and DISTANCE FROM HOME------------------------
	playerPos = gameControllerScript.playerTransform.transform.position;
	var distanceFromPlayer : float = Vector3.Distance(transform.position, playerPos);
	var distanceFromHome : float = Vector3.Distance(transform.position, homePosition);

	if(distanceFromPlayer < agroRange){
		//Due to the variability of where the next waypoint is this agro check is more complex than GUARDs.
		if(returningHome == true && distanceFromHome < (returnHomeRange/2) ){
		//Player is within agro range AND AI is within (returnHomeRange/2) [This is a SMALLER range so the AI has time to head back and not get caught between Returning and Re-agroing]
		//Check if we have visibility for agro.
		AgroVisibilityTest();

		//enemyBehavior = "pursue";
		}
		else if(returningHome == false){
			//player is within agro range and AI is not returning home so Check if we have visibility for agro.
			AgroVisibilityTest();
		}
		else{
			//Do nothing.
		}
	}
	
	//Check to see if patrolLocationsArray[0] is NULL (it is set to null whenever it needs recalculation)
	if(patrolLocationsArray[0] == null){
		//Fill patrolArray with the locations to patrol
		CompileWaypointArray();
	}
	else if(curPatrolDestination < numOfValidWaypoints){
		//Check if we have reached patrolLocationsArray[curPatrolDestination] or not (Ignores position on Y)
		if(Vector3.Distance( Vector3(transform.position.x, 0.0, transform.position.z), Vector3(patrolLocationsArray[curPatrolDestination].x, 0.0, patrolLocationsArray[curPatrolDestination].z)) > arrivalMargin){
			
			if(teleportHome == true){
				TeleportHome(homePosition);
			}
			else if(returningHome == true){
				if(crumbArrayHasColpased == false){
					//The crumb array is not finished colapsing.
					ColapseBreadCrumbArray(curCrumbArrayMax);
				}
				else{
					FollowCrumbsHome();
				}
			}
			else if(returningHome == false){
				//We have not yet reached curPatrolDestination.  Continue heading there.
				transform.LookAt(patrolLocationsArray[curPatrolDestination]);
					moveDirection = transform.TransformDirection(Vector3.forward);
				controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
			}
		}
		else{
			//We have reached curPatrolDestination, so set homePosition to the destination reached, and incriment it to head to the next location.
			if(returningHome == true){
				//This is here because returningHome must be set to false after reaching home!
				returningHome = false;
				
				//Reset health in Stats.js File.
				this.gameObject.SendMessage("ResetHealth");
				print("AI has made it home properly");
			}
			curPatrolDestination += 1;
			
			if(curPatrolDestination < numOfValidWaypoints){
				homePosition = patrolLocationsArray[curPatrolDestination];
			}
		}
	}
	else{
		//The full shebang of patrolDestinations has been attained.  It's time to recompile the waypointArray.
		patrolLocationsArray[0] = null;
	}
}


//THIS NEEDS TO BE 10 TIMES MORE ROBUST.. SHIT GETS "Stuck" All the time and this may mean it floats or glides stupidly to the side I consider this stuck.

function SeeIfStuck(){
	//Checks if stuck based on arrivalMargin distance and timeUntilStuck time.
	if(timeSinceLastMove == 0){
		consecutiveLostStuckPings = 0;
		timeSinceLastMove = Time.time;
		oldPos = transform.position;
	}
	else if(Mathf.Abs(Time.time-timeSinceLastMove) <= timeUntilStuck){
		//There is still time before stuck! update timeSinceLastMove
		if(Vector3.Distance(oldPos, transform.position) > arrivalMargin ){
			//We have moved! -- A combo breaker for consecutiveLostStuckPings
			consecutiveLostStuckPings = 0;
			timeSinceLastMove = Time.time;
			oldPos = transform.position;
			//print("Movement Updated, Not Stuck");
		}
	}
	else{

		//We haven't moved for more than timeUntilStuck seconds! We are stuck! IF WE HAVE ALSO LOST SIGHT OF THE PLAYER: we are officially stuck.
		if(this.GetComponent(Engagement_Tactics).lostPlayer == true){
			if(consecutiveLostStuckPings >= (maxConsecutiveStuckPings - 1) ){
				//We have proven stuck the max number of times for sending AI home while trying to persue the enemy.
				timeSinceLastMove = 0;
				print("Enemy Stuck "+maxConsecutiveStuckPings+" times in a row while LOST, heading home.");
				return true;
			}
			else{
				//We add another ping to the list for being lost another iteration. Reset the timer for more pings to come!
				consecutiveLostStuckPings += 1;
				print("ADDING TO LOST&STUCK QUEUE now at: "+consecutiveLostStuckPings);
				//We must continue on!
				timeSinceLastMove = Time.time;
				oldPos = transform.position;
				/*
				if(consecutiveLostStuckPings == 2){
					//The first REAL stuck ping (aka second ping)
					//Flip character 180 degrees. See if that helps.
					print("ROTATING 180 Degrees"); DIDNT WORK.
					transform.rotation.y += 180;
				}
				*/
			}
		}
		else if(returningHome == true){
			//We are more lax here so just send the AI home.
			timeSinceLastMove = 0;
			//If we are going home we are no longer "lost" and must reset this counter.
			consecutiveLostStuckPings = 0;
			print("Enemy Stuck while returningHome, heading home.");
			return true;
		}
		else
		{
			//If we are here we are no longer "lost" and must reset this counter.
			consecutiveLostStuckPings = 0;
			
			//We must continue on!
			timeSinceLastMove = Time.time;
			oldPos = transform.position;
		}
	}
}


function JustGotDamaged(){
var distanceFromHome : float = Vector3.Distance(transform.position, homePosition);

	if(enemyBehavior != "pursue"){
		//We are not already attacking. See if we are heading home.
		if(returningHome == true && distanceFromHome < (returnHomeRange/2) ){
			enemyBehavior = "pursue";
			returningHome = false;
		}
		else if(returningHome == false){
			enemyBehavior = "pursue";
		}
	}
}


function JustGotKilled(){
	//The enemy has just been informed by Enemy_Controller that it has DIED.
	//Stop all action in the file.
	enemyBehavior = "dead";
	//Send a message to the player handlder that one less enemy has agro on it.
	NotificationCenter.DefaultCenter().PostNotification(this, "EnemyAgro", false);
}


function TeleportHome(whereHomeIs : Vector3){
	//Send AI instantly home and set teleportHome to false
	teleportHome = false;
	transform.position = whereHomeIs;
}

function AgroVisibilityTest(){
	playerPos = gameControllerScript.playerTransform.transform.position;
	var layerMask = 1<<10;
	//See if AI can draw a line to the enemy without hitting an obstacle (Line of Sight Test)
	if( Physics.Linecast(transform.position, playerPos, layerMask) ){
		//Something is in the way!
		return false;
	}
	else{
		var targetDir = playerPos - transform.position;
		var forward = transform.forward;
		var angle = Vector3.Angle(targetDir, forward);
		
		if(angle <= fieldOView){
			//We have line of sight and are within FOV! WE HAVE AGRO.
			enemyBehavior = "pursue";
			returningHome = false;
			return true;
		}
		else{
			//Agro failed, go back to idleBehavior
			enemyBehavior = idleBehavior;
			return false;
		}
	}
}


function CompileWaypointArray(){

	var possibleNextWP : GameObject;
	
	if(waypointObjToBeAdded == null){
		//the waypoints have yet to be compiled for the first time: Set waypointObjToBeAdded to homeWaypoint
		waypointObjToBeAdded = homeWaypoint;
	}
	//Reset this counter of valid waypoints and curPatrolDestination(so it later starts at 0 when it runs through the array)
	numOfValidWaypoints = 0;
	curPatrolDestination = 0;
	
	if(patrolDirection == "forward"){
		for(var i : int = 0; i < maxWaypoints; i++){
			//1: set waypointObjToBeAdded's position as place i's position (we start from the last known waypoint)
			patrolLocationsArray[i] = waypointObjToBeAdded.transform.position;
			numOfValidWaypoints += 1;
			
			//2: We check if there is a NEXT waypoint in the chain, and also make sure that it isn't homeWaypoint
			possibleNextWP = waypointObjToBeAdded.GetComponent(WaypointMarker_Controller).adjacentWP1;
			
			if(possibleNextWP == null){
				//Next waypoint does not exist.  change direction to "reverse" DO NOT change waypointObjToBeAdded then break.
				patrolDirection = "reverse";
				break;
			}
			else if(Vector3.Distance(possibleNextWP.transform.position, homePosition) < 0.01){
				//The two places are most likely homePosition (1% difference or less) Add it, Change waypointObjToBeAdded, keep direction, then break [We have gone in a complete circiut]
				waypointObjToBeAdded = possibleNextWP;
				patrolLocationsArray[i+1] = waypointObjToBeAdded.transform.position;
				numOfValidWaypoints += 1;
				break;
			}
			else {
				//The chain goes on: Change waypointObjToBeAdded and let the for loop continue.
				waypointObjToBeAdded = possibleNextWP;
			}
		}
	}
	else if(patrolDirection == "reverse"){
		//THERE IS A CHANCE THAT A WAYPOINT THAT DOESNT CONNECT FORWARD WILL STILL LOOP GOING BACKWARD: Try not to do this as reverse does not account for this case.
		for(var k : int = 0; i < maxWaypoints; k++){
			//1: set waypointObjToBeAdded's position as place i's position (we start from the last known waypoint)
			patrolLocationsArray[k] = waypointObjToBeAdded.transform.position;
			numOfValidWaypoints += 1;
			
			//2: We check if there is a NEXT waypoint in the chain
			possibleNextWP = waypointObjToBeAdded.GetComponent(WaypointMarker_Controller).adjacentWP2;
			
			if(possibleNextWP == null){
				//Next waypoint does not exist.  change direction to "forward" DO NOT change waypointObjToBeAdded then break.
				patrolDirection = "forward";
				break;
			}
			else {
				//The chain goes on: Change waypointObjToBeAdded and let the for loop continue.
				waypointObjToBeAdded = possibleNextWP;
			}
		}
	}

	//WE CAN ALSO HAVE "trueRandom" and "randomNoBackwards"
}


function BreadCrumbSystem(lastTimeRunning : boolean){
	//Stop laying breadcrumbs if you're already supposed to be teleporting home!
	if(!teleportHome){
	
		//check if AI did not make it to the end of a colapsedCrumbArray
		if(curColapsedArrayMax >= 0){
			//We NEVER FINISHED going home, and there are still locations recorded in the colapsedCrumbArray.
			//Add the colapsed locations onto the beginning and continue adding locations from there.

			for(var t : int = 0; t <= curColapsedArrayMax; t++){
				crumbLocArray[t] = colapsedCrumbArray[t];
			}
			//Start the crumbArrayMax where colapsed array ended. -- the array incriments BEFORE it adds the next loc.  So no need to put +1 here.
			curCrumbArrayMax = curColapsedArrayMax;
			//Reset curColapsedArrayMax so when it colapses again it will do so from the beginning (0)
			curColapsedArrayMax = -99;
		}
	
		if(crumbStoredRotation == null || crumbStoredRotation == Vector3(-1,-1,-1)){
			crumbStoredRotation = transform.eulerAngles;
		}
		if(curCrumbArrayMax == 0){
			crumbLocArray[0] = homePosition;
			//Grab first location (in case it isn't the same as homePosition
			curCrumbArrayMax +=1;
			crumbLocArray[curCrumbArrayMax] = transform.position;
		}
		
		//Add the final location into the array which we will start from when heading back.
		if(lastTimeRunning == true){
			
			//Set storedRotation back to null for next time we need to run breadcrumbs
			crumbStoredRotation = Vector3(-1,-1,-1);
			
			if(curCrumbArrayMax < maxCrumbs){
				curCrumbArrayMax +=1;
				crumbLocArray[curCrumbArrayMax] = transform.position;
			}
			else{
				//We have exausted the length of the crumbLocArray!  teleportHome = true when out of homeRange.
					curCrumbArrayMax = 0;
				teleportHome = true;
				return;
			}
		}
		//Continue to add breadcrumbs when AI makes sufficient turns. 1st: Compare stored rotation.y to current.y
		else if(Mathf.Abs(crumbStoredRotation.y-transform.eulerAngles.y) > crumbRotationThreshold){
			
			//Set currentRotation as crumbStoredRotation
			crumbStoredRotation = transform.eulerAngles;
			
			//If there is room in the array: Record the location of the breadcrumb and incriment the location.
			if(curCrumbArrayMax < maxCrumbs){
				curCrumbArrayMax +=1;
				crumbLocArray[curCrumbArrayMax] = transform.position;
				
				//Drop demonstrationObject __ THIS WILL BE REMOVED AFTER IM CONVINED IT WORKS PROPERLY
				//var instantiatedCrumb : GameObject = Instantiate(demonstrationObject, transform.position, transform.rotation);
				
			}
			else{
				//We have exausted the length of the crumbLocArray!  teleportHome = true when out of homeRange.
					curCrumbArrayMax = 0;
				teleportHome = true;
				return;
			}
		}
		
	}
}


function ColapseBreadCrumbArray(arrayAmmtFilled : int){
//colapse the array into its most basic connected (without physical interruption) waypoints. -- If a pathway cannot be made then teleportHome = true.
//Array is considered collapsed once (currentAssuredLocation == arrayAmmtFilled)  <-- last place.
	
	//THIS << is a bit-shift.  I am told it inverses the layer on the right (10) so instead of not looking for that layer it ONLY looks for that layer in linecast.
	var layerMask = 1<<10;
	
	var trailRanCold : boolean = false;
	
	if(curColapsedArrayMax < 0){
		curColapsedArrayMax = 0;
	}
	
	if(currentAssuredLocation != arrayAmmtFilled){
		
		//crumbLocArray[currentAssuredLocation] is added to the colapsedCrumbArray[curColapsedArrayMax],
		colapsedCrumbArray[curColapsedArrayMax] = crumbLocArray[currentAssuredLocation];
		
		//colapsedCrumbArray[currentAssuredLocation] is linecasted against crumbLocArray[g]. (Start at the end and crawl backwards)
		for(var g : int = arrayAmmtFilled; g > curColapsedArrayMax; g--){
	
			if( Physics.Linecast(colapsedCrumbArray[curColapsedArrayMax], crumbLocArray[g], layerMask) ){
				//Something ON THE OBSTACLE LAYER is in the way!  These two locations DO NOT connect.
				
				//Check if g is at the last location before currentAssuredLocation(We dont want to check it against itself)
				if(g == (currentAssuredLocation+1) ){
					//The trail just ran cold without a connection!
					trailRanCold = true;
					break; 
				}
			}
			else{
				//Nothing on the OBSTACLE layer stops these locatons from connecting.  We have the next assuredLocation.
				currentAssuredLocation = g;

				//Incriment the arrayMax so the next stored position will be one higher.
				curColapsedArrayMax += 1;
				
				break;
			}
			
		}
		
		if(trailRanCold){
			//Scrub ALL the work done here and teleportHome
			teleportHome = true;
			//CrumbArray colpased is checked AFTER the teleport home check so it doesn't have to be set TRUE. -- Later CONSIDER SETTING IT FALSE AND REMOVING THE FALSE STATEMENT FROM TP HOME CODE ABOVE.
			crumbArrayHasColpased = true;
			currentAssuredLocation = 0;
			curCrumbArrayMax = 0;
			curColapsedArrayMax = -99;
			return;
		}
	}
	else{		
		//Put the last position into the array because crumbArrayHasColpased = true, and we will not return to the top again for standard array insertion.  We do not incriment arrayMax as this is the last addition.
		colapsedCrumbArray[curColapsedArrayMax] = crumbLocArray[currentAssuredLocation];
		
		crumbArrayHasColpased = true;
		curCrumbArrayMax = 0;
		currentAssuredLocation = 0;
	}
}


function FollowCrumbsHome(){
	//Takes the colapsedCrumbArray and follows it back to home. (CONSIDER ADDING A TIMER THAT TELEPORTS THE AI AFTER A SET AMOUNT OF TIME)
	
	if(curColapsedArrayMax >= 0){
		//Check if we have reached the current crumb location or not (Ignore the Y axis)
		if(Vector3.Distance( Vector3(transform.position.x,0.0,transform.position.z), Vector3(colapsedCrumbArray[curColapsedArrayMax].x,0.0,colapsedCrumbArray[curColapsedArrayMax].z) ) > arrivalMargin){
			//We have not yet reached curPatrolDestination.  Continue heading there.
			transform.LookAt(colapsedCrumbArray[curColapsedArrayMax]);
				moveDirection = transform.TransformDirection(Vector3.forward);
			controller.Move(moveDirection * Time.deltaTime * enemyMoveSpeed);
			
			if(SeeIfStuck() == true){
				//Teleport home and set the arraymax to -99
				teleportHome = true;
				curColapsedArrayMax = -99;
			}
		}
		else{
			//For each breadcrumb loc reached we move backward one step in the curColapsedArrayMax count toward home.
					//print("REACHED POSITION "+curColapsedArrayMax);
			curColapsedArrayMax -= 1;
		}
	}
	else{
		//You have come here when the curColapsedArrayMax is UNSET so go away.
		curColapsedArrayMax = -99;
	}
}