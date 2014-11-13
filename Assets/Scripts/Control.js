// Object
var object : Transform;
var health : float = 100;
var movespeed = 10;

// Basic Attacks
var aa_range : float = 7;
var aa_damage : float = 25;

// AOE ability
var aoe_particles : ParticleSystem;
var aoe_range : float = 4;
var aoe_damage : float = 25;
var aoe_duration : float = 3;
var aoe_start : float;
var aoe_ticks : float;

// Targeted ability
var r_aoe_object : GameObject;
var r_aoe_clone : GameObject;
var r_aoe_exists : boolean = false;
var r_aoe_range : float = 4;
var r_aoe_damage : float = 10;
var r_aoe_duration : float = 3;
var r_aoe_start : float;
var r_aoe_ticks : float;

function Update () {

	// Movement

	// attack must finish before character can do anything else (aside from ability activations)
	if (!object.animation["Attack"].enabled == true)
	{	// turn object to face direction (can't go diagonal);
		// only walk if told to
		var walk = false;
		if (Input.GetKey('w'))
		{
			if (transform.rotation.eulerAngles.y != 0)
			{
				transform.rotation = Quaternion.AngleAxis(0, Vector3.up);
			}
			walk = true;
		}
		else if (Input.GetKey('s'))
		{
			if (transform.rotation.eulerAngles.y != 180)
			{
				transform.rotation = Quaternion.AngleAxis(180, Vector3.up);
			}
			walk = true;
		}

		if (Input.GetKey('a'))
		{
			if (transform.rotation.eulerAngles.y != 270)
			{
				transform.rotation = Quaternion.AngleAxis(270, Vector3.up);
			}
			walk = true;
		}
		else if (Input.GetKey('d'))
		{
			if (transform.rotation.eulerAngles.y != 90)
			{
				transform.rotation = Quaternion.AngleAxis(90, Vector3.up);
			}
			walk = true;
		}
		if (walk == true)
		{
			transform.Translate(Vector3.forward*Time.deltaTime*movespeed);
			object.animation.CrossFade('Walk');
		}
	}

	// Basic Attack

	if (Input.GetButtonDown("Fire1"))
	{	// Auto attack
		auto_attack();		
	}

	// AOE ability

	// Playing the particle system

	if (!aoe_particles.isPlaying)
	{	// If the particles are not playing, play them
		if(Input.GetKeyDown('e'))
		{
			aoe_particles.Play();
			aoe_start = Time.time;
			aoe_ticks = 0.5; // 0.5 to put a slight delay to the initial damage tick
		}
	}
	else
	{	// If it is not already going, continue the aoe attack
		aoe_attack();
	}

	// Ranged AOE attack
	if (!r_aoe_exists)
	{ // if the particles are not in existance, create them at location
		if (Input.GetKeyDown('q'))
		{
			r_aoe_exists = true;
			var ray = Camera.main.ScreenPointToRay (Input.mousePosition);
			var hit : RaycastHit;
			if (Physics.Raycast (ray, hit, 1000)) 
			{
			  r_aoe_clone = Instantiate(r_aoe_object, hit.point, Quaternion.identity);
			}
			r_aoe_start = Time.time;
			r_aoe_ticks = 0.5; // slight delay to damage application
		}
	}
	else
	{	// if they are currently alive, continue the aoe attack
		r_aoe_attack();
	}

	// Default

	// attack must finish before character can do anything else (aside from ability activations)
	if (!object.animation["Attack"].enabled == true)
	{
		if (Input.anyKey == false)
		{
			object.animation.CrossFade('Stand');
		}
	}
}

function auto_attack()
{
	// Attack animation
	object.animation.CrossFade("Attack");
	
	// Attack Function		
	var aa_enemy : RaycastHit;
	// Find first enemy infront of character
	if (Physics.Raycast(transform.position, transform.TransformDirection(Vector3.forward), aa_enemy)) {
		
		Distance = aa_enemy.distance;
		//  If the distance is within range, apply the damage
		if (Distance < aa_range){
			var aa_enemy_object = aa_enemy.transform.parent.gameObject;
			aa_enemy_object.SendMessage("ApplyDamage", aa_damage, SendMessageOptions.DontRequireReceiver);
	
		}
	}
}

function aoe_attack()
{
	// If the particles are playing, apply the effects
	if (Time.time < aoe_start + aoe_duration)
	{
		// Causing the effect to take place
		if (Time.time >= aoe_start + aoe_ticks && aoe_ticks < 3) // +0.5 to keep in mind the slight delay and to ensure only 3 ticks go off
		{	// count a tick and apply the effects that occur per tick
			aoe_ticks += 1;
			var allObjects = Physics.OverlapSphere(transform.position, aoe_range);
			for (var i = 0; i < allObjects.Length; i++)
			{
				if (allObjects[i].tag == 'Enemy')
				{
					var aoe_enemy = allObjects[i].transform.parent.gameObject;
					aoe_enemy.SendMessage("ApplyDamage", aoe_damage, SendMessageOptions.DontRequireReceiver);
				}
			}
		}
	}
	else
	{	// Stop if the time limit has been reached
		aoe_particles.Stop();
	}
}

function r_aoe_attack()
{
	// If the particles are playing, apply the effects
	if (Time.time < r_aoe_start + r_aoe_duration)
	{
		// Causing the effect to take place
		if (Time.time >= r_aoe_start + r_aoe_ticks)
		{	// count a tick and apply the effects that occur per tick		
			r_aoe_ticks += 1;
			var allObjects = Physics.OverlapSphere(r_aoe_clone.transform.position, r_aoe_range);
			for (var i = 0; i < allObjects.Length; i++)
			{
				if (allObjects[i].tag == 'Enemy')
				{
					var r_aoe_enemy = allObjects[i].transform.parent.gameObject;
					r_aoe_enemy.SendMessage("ApplyDamage", r_aoe_damage, SendMessageOptions.DontRequireReceiver);
				}
			}
		}
	}
	else
	{	// Stop if the time limit has been reached
		DestroyImmediate(r_aoe_clone.gameObject, true);
		r_aoe_exists = false;
	}
}

function ApplyDamage(damage : float)
{
	health -= damage;
	if (health <= 0)
	{
		Dead();
	}
}

function Dead()
{
	Destroy(gameObject);
}