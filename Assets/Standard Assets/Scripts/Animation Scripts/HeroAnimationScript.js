var Controller : CharacterController;


function Start()
{
	// Set all animations to loop
   animation.wrapMode = WrapMode.Loop;
   
	 // except these
	animation["toeStand"].wrapMode = WrapMode.Once;
	animation["Jump"].wrapMode = WrapMode.ClampForever;
	animation["HipTurn_R"].wrapMode = WrapMode.ClampForever;
	animation["HipTurn_L"].wrapMode = WrapMode.ClampForever;
	
	
	//Layers; unspecified anims are defaulted to layer 0
	animation["toeStand"].layer = 1;
	animation["Jump"].layer = 1;
	//animation["JumpIdle"].layer = 0;
	
	
	//Additive animations setup
	animation["HipTurn_R"].layer = 5;
	animation["HipTurn_R"].blendMode = AnimationBlendMode.Additive;
	
	
	animation["HipTurn_L"].layer = 5;
	animation["HipTurn_L"].blendMode = AnimationBlendMode.Additive;
	



	animation.Stop();
	//Funny little start anim
	animation.CrossFade("toeStand");
}



function Update () 
{
	var Falling : boolean = false;

	
	/////////
	//Jumping
	//////////	
	if(FPSWalker.heroJumping == true)
	{
		if (Controller.velocity.y > 0.01)
		{		
			animation.Play("Jump");
		}
		else
		{
			//This is the apex of the jump
			animation.Stop("Jump");
			animation.Play("JumpIdle");
			
		}
	}
	else
	{
		animation.Stop("Jump");
	}
	
	/////////
	//Walking
	//////////
	if(FPSWalker.heroJumping == false)
	{	
		//If pressing forward or backward
		if(Input.GetAxis("Vertical") > 0.1 || Input.GetAxis("Vertical") < -0.1)
		{
			if(Input.GetAxis("Vertical") > 0.1)
			{
				if(FPSWalker.heroRunning == true)
				{
					//Make sure the additive anims are off!
							animation.Stop ("HipTurn_R");
							animation.Stop ("HipTurn_L");
							
					animation.CrossFade ("Run");
				}
				
				else 
				{
					//Walk Forward
					animation.CrossFade ("Walking");
					
						//Forward Angled Walking
						if(Input.GetAxis("Horizontal") < - 0.1)
						{
							//Additive Hip shift
							animation.CrossFade ("HipTurn_R");
							
								//Make sure other hip is turned off!
								animation.Stop ("HipTurn_L");
						}
						else if(Input.GetAxis("Horizontal") > 0.1)
						{
							//Additive Hip shift
							animation.CrossFade ("HipTurn_L");
							
								//Make sure other hip is turned off!
								animation.Stop ("HipTurn_R");
						}
						else
						{
							//Make sure the additive anims are off!
							animation.Stop ("HipTurn_R");
							animation.Stop ("HipTurn_L");
						}
				}
			}
			
			else if(Input.GetAxis("Vertical") < -0.1)
			{
				//Walk Backward
				animation.CrossFade("BackWalk");
				
					//Backward Angled Walking
					if(Input.GetAxis("Horizontal") < - 0.1)
					{
						//Additive Hip shift
						animation.CrossFade ("HipTurn_L");
						
							//Make sure other hip is turned off!
							animation.Stop ("HipTurn_R");
					}
					else if(Input.GetAxis("Horizontal") > 0.1)
					{
						//Additive Hip shift
						animation.CrossFade ("HipTurn_R");
							
							//Make sure other hip is turned off!
							animation.Stop ("HipTurn_L");
					}
					else
					{
						//Make sure the additive anims are off!
						animation.Stop ("HipTurn_R");
						animation.Stop ("HipTurn_L");
					}
			}
		}
		
		else if(Input.GetAxis("Horizontal") > 0.1)
		{
			//Right Shuffle
			animation.CrossFade("SideStep_R");
			
				//Make sure the additive anims are off!
				animation.Stop ("HipTurn_R");
		}
		
		else if(Input.GetAxis("Horizontal") < -0.1)
		{
			//Left Shuffle
			animation.CrossFade("SideStep_L");
			
				//Make sure the additive anims are off!
				animation.Stop ("HipTurn_R");
				animation.Stop ("HipTurn_L");
		}
		
		else
		{
			animation.CrossFade("Idle");
			
				//Make sure the additive anims are off!
				animation.Stop ("HipTurn_R");
				animation.Stop ("HipTurn_L");
		}
	}
	else
	{
		//Disable Sideways Additive Animations
		animation["HipTurn_R"].enabled = false;
		animation["HipTurn_L"].enabled = false;
	}
		/*
	/////////
	//Falling
	//////////
	if (Controller.velocity.y < -0.1)
	{
		Falling = true;
	
		//animation.WrapMode = WrapMode.Loop;
		animation.CrossFade("JumpIdle");
	} 
	else
	{
		Falling = false;
	}
	*/

	
	 
	
	
	
	//////////
	// Shoot
	///////////
	if (Input.GetButtonDown ("Fire1"))
	{
	
	}
	  

}