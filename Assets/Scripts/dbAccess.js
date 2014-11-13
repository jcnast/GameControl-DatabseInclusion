import System.Data;
import Mono.Data.Sqlite;
import System.Collections.Generic;

class dbAccess
{
	// variables for basic query access
	private var connection : String;
	private var dbcon : IDbConnection;
	private var dbcmd : IDbCommand;
	private var reader : IDataReader;
 
	function OpenDB(p : String)
	{
		connection = "URI=file:" + p; // we set the connection to our database
		dbcon = new SqliteConnection(connection);
		dbcon.Open();
	}
 
	function BasicQuery(q : String, r : boolean)
	{ // run a baic Sqlite query
		dbcmd = dbcon.CreateCommand(); // create empty command
		dbcmd.CommandText = q; // fill the command
		reader = dbcmd.ExecuteReader(); // execute command which returns a reader
		if(r)
		{ // if we want to return the reader
			return reader; // return the reader
		}
	}
 
	function CreateTable(name : String, col : Array, colType : Array)
	{ // Create a table, name, column array, column type array
		var query : String;
		query  = "CREATE TABLE " + name + "(" + col[0] + " " + colType[0];
		for(var i=1; i<col.length; i++)
		{
			query += ", " + col[i] + " " + colType[i];
		}
		query += ")";
		dbcmd = dbcon.CreateCommand(); // create empty command
		dbcmd.CommandText = query; // fill the command
		reader = dbcmd.ExecuteReader(); // execute command which returns a reader
	}
 
	function InsertIntoSingle(tableName : String, colName : String, value : String)
	{ // single insert
		var query : String;
		query = "INSERT INTO " + tableName + "(" + colName + ") " + "VALUES (" + value + ")";
		dbcmd = dbcon.CreateCommand(); // create empty command
		dbcmd.CommandText = query; // fill the command
		reader = dbcmd.ExecuteReader(); // execute command which returns a reader
	}
 
	function InsertIntoSpecific(tableName : String, col : Array, values : Array)
	{ // Specific insert with col and values
		var query : String;
		query = "INSERT INTO " + tableName + "(" + col[0];
		for(var i=1; i<col.length; i++)
		{
			query += ", " + col[i];
		}
		query += ") VALUES (" + values[0];
		for(i=1; i<values.length; i++)
		{
			query += ", " + values[i];
		}
		query += ")";
		dbcmd = dbcon.CreateCommand();
		dbcmd.CommandText = query;
		reader = dbcmd.ExecuteReader();
	}
 
	function InsertInto(tableName : String, values : Array)
	{ // basic Insert with just values
		var query : String;
		query = "INSERT INTO " + tableName + " VALUES (" + values[0];
		for(var i=1; i<values.length; i++)
		{
			query += ", " + values[i];
		}
		query += ")";
		dbcmd = dbcon.CreateCommand();
		dbcmd.CommandText = query;
		reader = dbcmd.ExecuteReader();
	}
 
	function SelectWhere(tableName : String, itemToSelect : String, wCol : String, wPar : String, wValue : String)
	{ // Selects a single Item
		var query : String;
		query = "SELECT " + itemToSelect + " FROM " + tableName + " WHERE " + wCol + wPar + wValue;
		dbcmd = dbcon.CreateCommand();
		dbcmd.CommandText = query;
		reader = dbcmd.ExecuteReader();
		var readArray = new Array();
		while(reader.Read())
		{
			// readArray.Push(reader.GetString(0)); // Fill array with all matches
			var i_row = new Array(); // The ith row that matches the requirements
			for (var i = 0; i < reader.FieldCount; i++)
			{
				i_row.Push(reader.GetValue(i)); // Add each element of the row to the row data
			}
			readArray.Push(i_row); // Add each row of matches to the overall group of matches
		}
		return readArray; // return matches
	}

	function CloseDB()
	{
		reader.Close(); // clean everything up
		reader = null;
		dbcmd.Dispose();
		dbcmd = null;
		dbcon.Close();
		dbcon = null;
	}
}