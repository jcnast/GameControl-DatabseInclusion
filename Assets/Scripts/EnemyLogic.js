#pragma strict

var object : Transform;
var health : float = 100;
var movespeed : float = 5;

var aa_damage : float = 20;
var aa_speed : float = 1;
var aa_time : float = 0;

var search_range : float = 20;
var chase_range : float = 10;
var attack_range : float = 4;

function Update()
{	// Get all objects within this character's search radius
	// attack must finish before character can do anything else (aside from ability activations)
	if (!object.animation["Attack"].enabled == true)
	{
		var allObjects = Physics.OverlapSphere(transform.position, search_range);
		for (var i = 0; i < allObjects.Length; i++)
		{	// Only persue the player
			if (allObjects[i].tag == 'Player')
			{
				var player = allObjects[i].transform.parent.gameObject;
				object.LookAt(player.transform);
				var distance = Vector3.Distance(allObjects[i].transform.position, transform.position);
				if (distance < attack_range)
				{ // only hit the character if enough time has passed
					if (Time.time >= aa_time+aa_speed)
					{
						auto_attack(player);
					}
				}
				else if (distance <= chase_range && distance >= 1)
				{
					var direction : Vector3 = (player.transform.position-transform.position).normalized;
					transform.Translate(direction*Time.deltaTime*movespeed);
				}
			}
		}
	}
}

function auto_attack(character : GameObject)
{
	// Attack animation
	object.animation.CrossFade("Attack");
	
	// Attack Function		
	Debug.Log(character.transform);
	character.SendMessage("ApplyDamage", aa_damage, SendMessageOptions.DontRequireReceiver);
	aa_time = Time.time;
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