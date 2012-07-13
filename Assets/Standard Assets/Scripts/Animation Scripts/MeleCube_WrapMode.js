#pragma strict

function Start () {
	//Set the ranged attack to wrap only once
	animation["Attack_Mele_1"].wrapMode = WrapMode.Once;
	animation["Attack_Mele_2"].wrapMode = WrapMode.Once;
}
