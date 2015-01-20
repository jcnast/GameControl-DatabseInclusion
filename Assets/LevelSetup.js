#pragma strict

var db : dbAccess;
var tableName : String;
var columnNames : Array;
var columnValues : Array;

var character_object : GameObject;

function Start()
{
	if (System.IO.File.Exists("InteractionDB.sqdb")) // if the database exists, only create the tables if they do not exist
  	{	// Just make the lists comma-seperated elements of strings to turn into lists
  		if (!Check_Table('characters')) // Only make the table if it does not exist already
  		{ // Create character database
			db = new dbAccess();
			db.OpenDB("InteractionDB.sqdb");
			tableName = "characters";
			// maybe do mom/dad instead of family
			columnNames = new Array("character_ID","first_name","last_name","age","gender","health","allies","enemies","family","tolerance_level","leeway");
			columnValues = new Array("integer","text","text","integer","text","integer","text","text","text","real","real");
			db.CreateTable(tableName,columnNames,columnValues);
			db.CloseDB();
		}

		if (!Check_Table('opinions')) // Only make the table if it does not exist already
  		{ // Create opinion database
			db = new dbAccess();
			db.OpenDB("InteractionDB.sqdb");
			tableName = "opinions";
			columnNames = new Array("opinion_ID","character_ID","topic","likes","dislikes","ramp","tolerance","enjoyment");
			columnValues = new Array("integer","integer","text","text","text", "real","real","real");
			db.CreateTable(tableName,columnNames,columnValues);
			db.CloseDB();
		}

		if (!Check_Table('relationships')) // Only make the table if it does not exist already
		{ // Create relationship database
			db = new dbAccess();
			db.OpenDB("InteractionDB.sqdb");
			tableName = "relationships";
			columnNames = new Array("relationship_ID","opinion_ID","character_ID","aquaintance_ID","latest_impact","ticks","aggravation");
			columnValues = new Array("integer","integer","integer","integer","text","real","real");
			db.CreateTable(tableName,columnNames,columnValues);
			db.CloseDB();
		}
	}
	else 
	{ // If the database does not exist, create all the tables
  		{ // Create character database
			db = new dbAccess();
			db.OpenDB("InteractionDB.sqdb");
			tableName = "characters";
			columnNames = new Array("character_ID","first_name","last_name","age","gender","health","allies","enemies","family","tolerance_level","leeway");
			columnValues = new Array("integer","text","text","integer","text","integer","text","text","text","real","real");
			db.CreateTable(tableName,columnNames,columnValues);
			db.CloseDB();
		}

  		{ // Create opinion database
			db = new dbAccess();
			db.OpenDB("InteractionDB.sqdb");
			tableName = "opinions";
			columnNames = new Array("opinion_ID","character_ID","topic","likes","dislikes","ramp","tolerance","enjoyment");
			columnValues = new Array("integer","integer","text","text","text", "real","real","real");
			db.CreateTable(tableName,columnNames,columnValues);
			db.CloseDB();
		}

		{ // Create relationship database
			db = new dbAccess();
			db.OpenDB("InteractionDB.sqdb");
			tableName = "relationships";
			columnNames = new Array("relationship_ID","opinion_ID","character_ID","aquaintance_ID","latest_impact","ticks","aggravation");
			columnValues = new Array("integer","integer","integer","integer","text","real","real");
			db.CreateTable(tableName,columnNames,columnValues);
			db.CloseDB();
		}
	}
	
	// Creat the starting people
	Default_People();
	Create_Character_Objects();
}

function Update () {

}

// See if a table exists
function Check_Table(table)
{
	db = new dbAccess();
	db.OpenDB("InteractionDB.sqdb");
	var result = db.BasicQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='"+table+"'", true);
	var result_array = new Array();
	while(result.Read())
	{
		result_array.Push(result.GetString(0)); // Fill array with all matches
	}
	var table_result : boolean;
	if (result_array != [])
	{
		table_result = true;
	}
	else
	{
		table_result = false;
	}
	db.CloseDB();
	return table_result;
}

// Get max element from column
function Max_Element(table,column)
{
	db = new dbAccess();
	db.OpenDB("InteractionDB.sqdb");
	var result = db.BasicQuery("SELECT max("+column+") FROM "+table, true);
	var result_array = new Array();
	while(result.Read())
	{
		result_array.Push(result.GetValue(0)); // Fill array with all matches
	}
	db.CloseDB();
	return result_array;
}

// Create people
function Default_People()
{
	var first_names = new Array('Thalk', 'Morden', 'Laena', 'Crysten', 'Sonya', 'Marissa', 'Jagger', 'Thyra', 'Brawn');
	var last_names = new Array('Smith', 'Stone', 'Seestern', 'Carp', 'Fisher', 'Butch');
	// Get the number of characters currently in database for character_IDs
	var character_ID_start = Max_Element('characters','character_ID')[0];
	if (typeof(character_ID_start) == System.DBNull) // If there is nothing in the database
	{
		character_ID_start = 1;
	}
	// Generate new characters
	if (System.Convert.ToInt32(character_ID_start) < 4) // CHARACTER NUMBER For now I only want to deal with 4 people at a time (so no more are created after the first batch)
	{
		db = new dbAccess();
		db.OpenDB("InteractionDB.sqdb");
		var char_tableName = "characters";
		for (var i = 0; i < 4; i++) // make 10 people CHARACTER NUMBER
		{
			var character_ID = System.Convert.ToInt32(character_ID_start)+i; // Unique to each character for easy finding
			var first_name = first_names[Random.Range(0,first_names.length)]; // character's first_name
			var last_name = last_names[Random.Range(0,last_names.length)]; // character's last_name -how families are determined
			var age = Random.Range(1,41); // character's age -can be randomized or not
			var gender : String; // character's gender
			if (Random.Range(0,2) == 0)
			{
				gender = 'Male';
			}
			else
			{
				gender = 'Female';
			}
			var values = new Array(""+character_ID+"","'"+first_name+"'","'"+last_name+"'","'"+age+"'", "'"+gender+"'","100","null","null","null","2","3");
			// Add elements to database
			db.InsertInto(char_tableName, values);
		}
		db.CloseDB();
		Create_Families();
		Default_Opinions();
		Default_Relations();
	}
}

function Create_Families()
{
	db = new dbAccess();
	db.OpenDB("InteractionDB.sqdb");
	// Get each character_ID to iterate through
	var result = db.BasicQuery("SELECT character_ID, last_name FROM characters", true);
	var result_array = new Array();
	while(result.Read())
	{
		var j_row = new Array(); // The ith row that matches the requirements
		for (var j = 0; j < result.FieldCount; j++)
		{ // get the desired info about each character
			j_row.Push(result.GetValue(j)); // Add each element of the row to the row data
		}
		result_array.Push(j_row); // Add each row of matches to the overall group of matches
	}
	for (var i = 0; i < result_array.length; i++) // Create each character's families
	{ // Get the character's info and find their family members based on shared last name
		var character = Array(result_array[i])[0];
		var last_name = Array(result_array[i])[1];
		var fam_characters = db.BasicQuery("SELECT character_ID FROM characters WHERE last_name='"+last_name+"'", true);
		var family = new Array();
		while(fam_characters.Read())
		{ // add each person with the same last name to the character's family
			family.Push(fam_characters.GetValue(0)); // Add each row of matches to the overall group of matches
		}
		var other_family : String = ''; // family memebers that are not the character
		for (var k = 0; k < family.length; k++)
		{ // do not add the character to his own family list
			if (family[k] != character)
			{ // Create the family 'list' (in string form)
				if (other_family.length > 0)
				{
					other_family += ','+family[k];					
				}
				else
				{
					other_family += family[k];
				}
			}
		}
		// Set the family to be as determined
		db.BasicQuery("UPDATE characters SET family='"+other_family+"' WHERE character_ID="+character,false);
	}
	db.CloseDB();
}

function Default_Opinions()
{
	var opinion_ID_start = Max_Element('opinions','opinion_ID')[0];
	if (typeof(opinion_ID_start) == System.DBNull) // If there is nothing in the database
	{
		opinion_ID_start = 0;
	}
	db = new dbAccess();
	db.OpenDB("InteractionDB.sqdb");
	// Get each character_ID to iterate through
	var characters = db.BasicQuery("SELECT character_ID FROM characters", true);
	var character_array = new Array(); // Every character's ID
	while(characters.Read())
	{ // add each person with the same last name to the character's family
		character_array.Push(characters.GetValue(0)); // Add each row of matches to the overall group of matches
	}

	// Create each character's opinions
	var topics = new Array('race', 'religion', 'politics', 'family'); // posible topics for opinions

	var opinion_ID = System.Convert.ToInt32(opinion_ID_start); // opinion IDs are unique to each opinion
	for (var i = 0; i < character_array.length; i++)
	{
		for (var j = 0; j < topics.length; j++)
		{
			opinion_ID += 1; // tick up what opinion ID we are at
			var character_ID = character_array[i]; // for reference to which character holds this opinion
			var ramp : float = 0.1; // how much more each tick affects the relationship (can/should be randomized)
			var tolerance : float = 2; // amount of ticks until they are against you (can/should be randomized)
			var enjoyment : float = 2; // amount of ticks until they like you (can/should be randomized)
			var topic = topics[j]; // what they care about
			var likes : String; // what they likes about this care
			var dislikes : String; // what they dislike about this care
			if (topic == 'race')
			{ // if they care about race, determine their likes/dislikes
				var targets_race = new Array('black', 'white', 'asian', 'brown'); // posible targets for likes/dislikes per opinion target
				likes = targets_race[Random.Range(0,targets_race.length)];
				targets_race.Remove(likes);
				dislikes = targets_race[Random.Range(0,targets_race.length)];
			}
			else if (topic == 'religion')
			{// if they care about religion, determine their likes/dislikes
				var targets_religion = new Array('catholic', 'muslim', 'atheist', 'budhist', 'satanist', 'pastafarian'); // posible targets for likes/dislikes per opinion target
				likes = targets_religion[Random.Range(0,targets_religion.length)];
				targets_religion.Remove(likes);
				dislikes = targets_religion[Random.Range(0,targets_religion.length)];
			}
			else if (topic == 'politics')
			{// if they care about politics, determine their likes/dislikes
				var targets_politics = new Array('conservative', 'liberal', 'dictatorship', 'other'); // posible targets for likes/dislikes per opinion target
				likes = targets_politics[Random.Range(0,targets_politics.length)];
				targets_politics.Remove(likes);
				dislikes = targets_politics[Random.Range(0,targets_politics.length)];
			}
			else if (topic == 'family')
			{// if they care about family, determine their likes/dislikes
				var targets_family = new Array('yes', 'no', 'indifferent'); // posible targets for likes/dislikes per opinion target
				likes = targets_family[Random.Range(0,targets_family.length)];
				targets_family.Remove(likes);
				dislikes = targets_family[Random.Range(0,targets_family.length)];
			}
			var values : String = ""+opinion_ID+", "+character_ID+", '"+topic+"', '"+likes+"', '"+dislikes+"', "+ramp+", "+tolerance+", "+enjoyment+"";
			db.BasicQuery("INSERT INTO opinions VALUES ("+values+")", false); // create the opinion in the database
		}
	}

	db.CloseDB();
}

function Default_Relations()
{	// Get starting point for relationship_IDs
	var relation_ID_start = Max_Element('relationships','relationship_ID')[0];
	if (typeof(relation_ID_start) == System.DBNull) // If there is nothing in the database
	{
		relation_ID_start = 0;
	}

	// Get each character to create the relationships properly
	db = new dbAccess();
	db.OpenDB("InteractionDB.sqdb");
	// Get each character_ID to iterate through
	var characters = db.BasicQuery("SELECT character_ID FROM characters", true);
	var character_array = new Array(); // Every character's ID
	while(characters.Read())
	{ // add each person with the same last name to the character's family
		character_array.Push(characters.GetValue(0)); // Add each row of matches to the overall group of matches
	}
	var relation_ID = System.Convert.ToInt32(relation_ID_start); // opinion IDs are unique to each opinion
	for (var i = 0; i < character_array.length; i++)
	{
		var character_ID = character_array[i]; // the current character we are creating relationships for
		var other_characters = new Array(character_array);
		other_characters.Remove(character_ID); // the other characters
		var opinions = db.BasicQuery("SELECT opinion_ID FROM opinions WHERE character_ID="+character_array[i], true);
		var opinion_array = new Array(); // Every opinion the character has
		while(opinions.Read())
		{ // get each opinion that the person has in the database
			opinion_array.Push(opinions.GetValue(0)); // Add each row of matches to the overall group of matches
		}
		for (var j = 0; j < opinion_array.length; j++)
		{ // create a relationship with every other person for every other character
			var opinion_ID = opinion_array[j];
			for (var k = 0; k < other_characters.length; k++)
			{
				relation_ID += 1; // tick up how many relationships are made
				var aquaintance_ID = other_characters[k]; // who they are interacting with
				var latest_impact = "null"; // initially there is no most recent impact
				var ticks = 0; // relationships start with a clean slate
				var aggravation = 0; // relationships start with a clean slate
				var values = ""+relation_ID+", "+opinion_ID+", "+character_ID+", "+aquaintance_ID+", "+latest_impact+", "+ticks+", "+aggravation+"";
				db.BasicQuery("INSERT INTO relationships VALUES ("+values+")", false); // create the relationship in the database
			}
		}
	}
	db.CloseDB();
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
			tolerance_level -= aggravation/enjoyment;
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

function Create_Character_Objects()
{
	db = new dbAccess();
	db.OpenDB("InteractionDB.sqdb");
	// Get each character_ID to iterate through
	var characters = db.BasicQuery("SELECT character_ID FROM characters", true);
	var character_array = new Array(); // Every character's ID
	while(characters.Read())
	{ // add each person with the same last name to the character's family
		character_array.Push(characters.GetValue(0)); // Add each row of matches to the overall group of matches
	}
	db.CloseDB();
	var number_char = character_array.length;
	var per_row = Mathf.Sqrt(number_char);
	var cur_row = 1;
	var cur_col = 1;
	for (var i = 0; i < number_char; i++)
	{
		var position_x : float;
		var position_z : float;
		// assign square coordinates
		if (i > per_row*cur_row)
		{
			cur_row += 1;
			cur_col = 1;
		}
		position_x = -20+cur_col*(40/per_row);
		position_z = -20+cur_row*(40/per_row);
		var current_character = Instantiate(character_object, Vector3(position_x,0,position_z), Quaternion.identity);
		current_character.tag = character_array[i].ToString();
		current_character.AddComponent('Character_Behaviour');
		cur_col += 1;
	}
}