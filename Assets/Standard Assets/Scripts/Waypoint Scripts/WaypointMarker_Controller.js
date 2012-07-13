private var backwardWaypointColor : Color = Color.black;
var waypointColor : Color = Color.blue;

//Forward Waypoint
var adjacentWP1 : GameObject;

//BackwardWaypoint
var adjacentWP2 : GameObject;

//Left of Forward Waypoint
var adjacentWP3 : GameObject;

//Right of Forward Waypoint
var adjacentWP4 : GameObject;

//NW of Forward Waypoint
var adjacentWP5 : GameObject;

//NE of Forward Waypoint
var adjacentWP6 : GameObject;

//SE of Forward Waypoint
var adjacentWP7 : GameObject;

//SW of Forward Waypoint
var adjacentWP8 : GameObject;

var waypointList : Array;

function OnDrawGizmos(){
	Gizmos.color = waypointColor;
	Gizmos.DrawSphere(transform.position, 0.5);
}

function OnDrawGizmosSelected(){
	//Draw lines between this selected object and the connected waypoints
	if(adjacentWP1 != null){
		Gizmos.color = waypointColor;
		Gizmos.DrawLine(transform.position, adjacentWP1.transform.position);
	}
	if(adjacentWP2 != null){
		//This one is colored black to indicate back
		Gizmos.color = backwardWaypointColor;
		Gizmos.DrawLine(transform.position, adjacentWP2.transform.position);
	}
	if(adjacentWP3 != null){
		Gizmos.color = waypointColor;
		Gizmos.DrawLine(transform.position, adjacentWP3.transform.position);
	}
	if(adjacentWP4 != null){
		Gizmos.color = waypointColor;
		Gizmos.DrawLine(transform.position, adjacentWP4.transform.position);
	}
	if(adjacentWP5 != null){
		Gizmos.color = waypointColor;
		Gizmos.DrawLine(transform.position, adjacentWP5.transform.position);
	}
	if(adjacentWP6 != null){
		Gizmos.color = waypointColor;
		Gizmos.DrawLine(transform.position, adjacentWP6.transform.position);
	}
	if(adjacentWP7 != null){
		Gizmos.color = waypointColor;
		Gizmos.DrawLine(transform.position, adjacentWP7.transform.position);
	}
	if(adjacentWP8 != null){
		Gizmos.color = waypointColor;
		Gizmos.DrawLine(transform.position, adjacentWP8.transform.position);
	}
	
}