private var speed : float = 15.0;
var jumpSpeed : float = 8.0;
var gravity : float = 20.0;
private var currentSpeed : float;
//This and speed might be later based on a character STATS
private var sprintModifier : float = 0.65;
private var staminaDrainAmmt : float = -0.05;

private var moveDirection = Vector3.zero;
private var oldMoveDirection : Vector3;
private var grounded : boolean = false;
private var weaponReadied : boolean = false;
private var sprintActive : boolean = false;
private var staminaAvailable : boolean = true;


function Awake(){
	//subscribe to messaging system when these messages are sent
	NotificationCenter.DefaultCenter().AddObserver(this, "WeaponReadied");
	NotificationCenter.DefaultCenter().AddObserver(this, "StaminaAvailable");
	currentSpeed = speed;
}

function Update(){
	if(weaponReadied){
		//Move at half speed when weapon is readied. (MELE WEAPONS WILL NOT HAVE THIS LIMIT)
		currentSpeed = (speed/2);
	}
	else if(sprintActive){
		currentSpeed = speed+(speed*sprintModifier);
	}
	else{
		currentSpeed = speed;
	}
	//Detect if we are moving WHILE sprinting.  If ture send message to modify stamina.
	if(Input.GetAxis("Horizontal") != 0 && sprintActive || Input.GetAxis("Vertical") != 0 && sprintActive){
		NotificationCenter.DefaultCenter().PostNotification(this, "modifyCurrentStamina", staminaDrainAmmt);
	}
}

function FixedUpdate() {
	if (grounded) {	
		// We are grounded, so recalculate movedirection directly from axes
		moveDirection = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
		moveDirection = transform.TransformDirection(moveDirection);
		moveDirection *= currentSpeed;
				
		//THIS WILL BE REPLACED WITH A ROLL/TUMBLE ABILITY
		if (Input.GetButton ("Jump")) {
			moveDirection.y = jumpSpeed;
		}
		
		//Activates/ Deactivates sprint as long as hero isn't aiming a gun
		if(Input.GetButton ("Sprint") && !weaponReadied && staminaAvailable) {
			sprintActive = true;
		} 
		else if(sprintActive) {
			sprintActive = false;
		}
	}

	// Apply gravity
	moveDirection.y -= gravity * Time.deltaTime;
	
	// Move the controller
	var controller : CharacterController = GetComponent(CharacterController);
	var flags = controller.Move(moveDirection * Time.deltaTime);
	grounded = (flags & CollisionFlags.CollidedBelow) != 0;
	
} 

function WeaponReadied(notification : Notification){
	//Notification will be a boolean.  True means the weapon is readied for shooting.
	weaponReadied = notification.data;
}

function StaminaAvailable(notification : Notification){
	//Gains info from GUI_Inventory; True=Stamina available for some sprinting. False=stamina depleted
	staminaAvailable = notification.data;
}

@script RequireComponent(CharacterController)