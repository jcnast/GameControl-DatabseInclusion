#pragma strict

var db : dbAccess;

var character_ID : int;
var aquaintance_ID : int;
var time_start : float;
var time_tick : float;

function Start () {
	character_ID = System.Convert.ToInt32(gameObject.tag);
	time_start = Time.time;
	time_tick = 0.0;
}

function Update () {
	if (Time.time > time_start+time_tick)
	{
		time_tick += 0.05;
		aquaintance_ID = Random.Range(1,5); // select a random character
		var impact_det = Random.Range(0,2);
		var impact : String; // determine what impact will be had
		if (impact_det == 0)
		{
			impact = 'negative';
		}
		else
		{
			impact = 'positive';
		}
		if (aquaintance_ID != character_ID) // only interact if character is not self
		{
			db = new dbAccess();
			db.OpenDB('InteractionDB.sqdb');
			// get the relationship that will be impacted
			var relationship = db.BasicQuery("SELECT relationship_ID FROM relationships WHERE character_ID = "+character_ID+" AND aquaintance_ID = "+aquaintance_ID, true);
			var relationship_IDs = new Array();
			var relationship_ID : int;
			while(relationship.Read())
			{
				relationship_IDs.Push(relationship.GetValue(0));
			}
			relationship_ID = relationship_IDs[Random.Range(0,relationship_IDs.length)];
			db.CloseDB();
			// impact the relationship
			Relationship_Update(relationship_ID, impact);
		}
	}

	db = new dbAccess();
	db.OpenDB('InteractionDB.sqdb');
	var ally_list = db.BasicQuery("SELECT allies, enemies FROM characters WHERE character_ID = "+character_ID, true);
	var allies = new Array(); // character's allies
	var enemies = new Array(); // character's enemies
	while(ally_list.Read())
	{
		if (ally_list.GetValue(0) == null)
		{
			allies = ''.Split(','[0]);
		}
		else
		{
			allies = ally_list.GetValue(0).ToString().Split(','[0]);	
		}
		if (ally_list.GetValue(1) == null)
		{
			enemies = ''.Split(','[0]);
		}
		else
		{
			enemies = ally_list.GetValue(1).ToString().Split(','[0]);	
		}
	}
	db.CloseDB();
	var direction : Vector3;
	if (allies.length > 1)
	{
		var ally = GameObject.FindWithTag(allies[1]);
		direction = (ally.transform.position-transform.position).normalized;
		transform.Translate(direction*Time.deltaTime);
	}
	if (enemies.length > 1)
	{
		var enemy = GameObject.FindWithTag(enemies[1]);
		direction = (enemy.transform.position-transform.position).normalized;
		transform.Translate(direction*Time.deltaTime);
	}
}

// Updates the relationship based on an interaction
// Relationship_Update(1, 'positive'); <- sample call (1 = relationship_ID, 'positive' = latest_impact)
function Relationship_Update(relationship_ID : int, impact : String)
{
	db = new dbAccess();
	db.OpenDB("InteractionDB.sqdb");
	var tick_change : float;
	// determine tick change based on impact
	if (impact == 'negative')
	{
		tick_change = 1.0;
	}
	else if (impact == 'positive')
	{
		tick_change = -1.0;
	}
	else
	{
		Debug.Log('Not a valid impact');
		return false;
	}
	var characters = db.BasicQuery("SELECT character_ID, aquaintance_ID FROM relationships WHERE relationship_ID = "+relationship_ID, true);
	var character_ID : int;
	var aquaintance_ID : int;
	while(characters.Read())
	{
		character_ID = characters.GetValue(0);
		aquaintance_ID = characters.GetValue(1);
	}
	// update relationship
	var ramp : String = "SELECT ramp FROM opinions WHERE opinion_ID = relationships.opinion_ID"; // get the ramp to change teh aggravation accordingly
	var update : String = "ticks = ticks + "+tick_change+", latest_impact = '"+impact+"', aggravation = aggravation + (ticks+"+tick_change+"+abs(ticks+"+tick_change+")*("+ramp+"))";
	db.BasicQuery("UPDATE relationships SET "+update+" WHERE relationship_ID = "+relationship_ID, false);
	db.CloseDB();

	Calculate_Favour(character_ID, aquaintance_ID);
}

function Calculate_Favour(character_ID : int, aquaintance_ID : int)
{
	db = new dbAccess();
	db.OpenDB("InteractionDB.sqdb");
	// get the tolerance and leeway of the character
	var character_info = db.BasicQuery("SELECT tolerance_level, leeway, allies, enemies FROM characters WHERE character_ID = "+character_ID, true);
	var character_tolerance : float = 0.0; // how much total tolerance the character has
	var character_leeway : float = 0.0; // how much leeway the character has
	var allies = new Array(); // character's allies
	var enemies = new Array(); // character's enemies
	while(character_info.Read())
	{
		character_tolerance = character_info.GetValue(0);
		character_leeway = character_info.GetValue(1);
		if (character_info.GetValue(2) == null)
		{
			allies = ''.Split(','[0]);
		}
		else
		{
			allies = character_info.GetValue(2).ToString().Split(','[0]);	
		}
		if (character_info.GetValue(3) == null)
		{
			enemies = ''.Split(','[0]);
		}
		else
		{
			enemies = character_info.GetValue(3).ToString().Split(','[0]);	
		}
	}
	// get character's current tolerance level
	var opinion_tolerance = "SELECT tolerance FROM opinions WHERE opinion_ID = relationships.opinion_ID";
	var opinion_enjoyment = "SELECT enjoyment FROM opinions WHERE opinion_ID = relationships.opinion_ID";
	var selects = "aggravation, ("+opinion_tolerance+"), ("+opinion_enjoyment+")";
	var relationships = db.BasicQuery("SELECT "+selects+" FROM relationships WHERE character_ID = "+character_ID+" AND aquaintance_ID = "+aquaintance_ID, true);
	var relationship_array = new Array();
	while(relationships.Read())
	{
		var i_row = new Array(); // The ith row that matches the requirements
		for (var i = 0; i < relationships.FieldCount; i++)
		{ // get the desired info about each character
			i_row.Push(relationships.GetValue(i)); // Add each element of the row to the row data
		}
		relationship_array.Push(i_row); // Add each row of matches to the overall group of matches
	}
	var tolerance_level : float = 0;
	for (var j = 0; j < relationship_array.length; j++)
	{
		var aggravation : float = Array(relationship_array[j])[0];
		var tolerance : float = Array(relationship_array[j])[1];
		var enjoyment : float = Array(relationship_array[j])[2];
		if (aggravation >= tolerance)
		{
			tolerance_level += aggravation/tolerance;
		}
		else if (aggravation <= enjoyment)
		{
			tolerance_level += aggravation/enjoyment;
		}
	}
	// asign aquaintance according to criteria
	if (tolerance_level/relationship_array.length >= character_tolerance+character_leeway) // if they are hated
	{
		if (!(aquaintance_ID.ToString() in enemies))
		{
			enemies.Push(aquaintance_ID.ToString()); // make them an enemy if they weren't already
		}
		if (aquaintance_ID.ToString() in allies)
		{
			allies.Remove(aquaintance_ID.ToString()); // make sure they are not an ally
		}
	}
	else if (tolerance_level/relationship_array.length <= character_tolerance-character_leeway) // if they are liked
	{
		if (!(aquaintance_ID.ToString() in allies))
		{
			allies.Push(aquaintance_ID.ToString()); // make them an ally if they weren't already
		}
		if (aquaintance_ID.ToString() in enemies)
		{
			enemies.Remove(aquaintance_ID.ToString()); // make sure they are not an enemy
		}
	}
	else // if they are neither
	{
		if (aquaintance_ID.ToString() in enemies)
		{
			enemies.Remove(aquaintance_ID.ToString()); // make sure they are not an enemy
		}
		else if (aquaintance_ID.ToString() in allies)
		{
			allies.Remove(aquaintance_ID.ToString()); // make sure they are not an ally
		}
	}
	// make the changes to the database
	var update : String = "allies = '"+allies.ToString()+"', enemies = '"+enemies.ToString()+"'";
	db.BasicQuery("UPDATE characters SET "+update+" WHERE character_ID = "+character_ID, false);

	db.CloseDB();
}