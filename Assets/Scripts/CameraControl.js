#pragma strict

var target: Transform;
var distance = -10;
var lift = 8;

function Update () {

	transform.position = target.position + Vector3(0, lift, distance);
	
	transform.LookAt(target);

}