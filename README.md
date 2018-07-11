# Merit Explorer SQL

A tool made with Javascript and SQLite to run queries over the merit data on the forum Bitcointalk.

**Live version:**
https://albertoit.github.io/Merit-Explorer-SQL/

**Tables:**

```
MeritData(
  "Date" TEXT,
  "Merit" Integer,
  "Msg" TEXT,
  "FromID" Integer,
  "ToID" Integer,
  "Board" TEXT,
  "SubBoard" TEXT,
  "TitleThread" TEXT
)

UserData(
   UserId Integer PRIMARY KEY,
   UserName TEXT,
   Rank TEXT,
   Trust TEXT,
   Location TEXT
)
```

**Script functions:**

* **PrintTableResult**(*query_result_data*): Draw a tabulated version of the data coming from a SQL query.
* **RunSQLSynch**(*sql_command*): Execute the SQL command specified and return an object containing the data
* **RunSQLAsynch**(*sql_command*): Execute the SQL command in asynchronous mode, the output cannot be captured back and just show the result of the query on table
* **GetDataField**(*query_result_data,row_index,coulmn_index*)
* **GetCoulmHeader**(*query_result_data,coulmn_index*)
* **Length**(*query_result_data*,): number of rows we got
* **WriteLine**(*text*): output anything you want to show as a result of your operations
* **Clear**(): clear the output

**Example SQL:**

Html links formatting:

```SQL
SELECT 
date,
'<a href=https://bitcointalk.org/index.php?action=profile;u=' || fromid || '>' || fromid || '</a>' as Sender,
'<a href=https://bitcointalk.org/index.php?action=profile;u=' || toid || '>' || toid || '</a>' as Receiver,
merit,
'<a href=https://bitcointalk.org/index.php?topic=' || msg || '#' || substr(msg,instr(msg,'.')+1) || '>Link Merited post</a>' as MeritedPost
FROM meritdata
Inner Join UserData on UserData.userid = meritdata.fromid
WHERE UserData.Username like "theymos"
```

We can easily get the Top Receiver for any local section simply using this:

```SQL
SELECT MAX(result.total) as "Total Merit", result.toid as "Top merit receiver", result.SubBoard as "Local board" FROM (
	SELECT toid, SubBoard, SUM(Merit) AS total
	FROM meritdata as m
	WHERE m.Board in (SELECT Board FROM meritdata Where Board like "Local%" GROUP BY Board)
	GROUP BY toid, Board
	ORDER BY Board,total Desc) AS result
GROUP BY SubBoard
ORDER BY result.total Desc
```
or for any board:

```SQL
SELECT MAX(result.total) as "Total Merit", result.toID as "Top merit receiver", result.SubBoard as "Board" FROM (
	SELECT toid, SubBoard, SUM(Merit) AS total
	FROM meritdata as m
	WHERE m.SubBoard in (SELECT SubBoard FROM meritdata GROUP BY SubBoard)
	GROUP BY toid, SubBoard
	ORDER BY SubBoard,total Desc) AS result
GROUP BY SubBoard
ORDER BY result.total Desc;
```

Similarly we can find out the Top Giver:

```SQL
SELECT MAX(result.total) as "Total Merit", result.fromid as "Top merit giver", result.SubBoard as "Local board" FROM (
	SELECT fromid, SubBoard, SUM(Merit) AS total
	FROM meritdata as m
	WHERE m.Board in (SELECT Board FROM meritdata Where Board like "Local%" GROUP BY Board)
	GROUP BY fromid, Board
	ORDER BY Board,total Desc) AS result
GROUP BY SubBoard
ORDER BY result.total Desc;
```

or for any any board:

```SQL
SELECT MAX(result.total) as "Total Merit", result.fromID as "Top merit giver", result.SubBoard as "Board" FROM (
	SELECT fromid, SubBoard, SUM(Merit) AS total
	FROM meritdata as m
	WHERE m.SubBoard in (SELECT SubBoard FROM meritdata GROUP BY SubBoard)
	GROUP BY fromID, SubBoard
	ORDER BY SubBoard,total Desc) AS result
GROUP BY SubBoard
ORDER BY result.total Desc;
```

Find out the total merit awarded so far: 

```SQL
SELECT Sum(Merit) FROM MeritData;
```

Want the full history for a particular user?

```SQL
SELECT * FROM MeritData WHERE toID=35 OR fromID=35 ORDER BY fromid,toid;
```

Now we can show the user information instead of the user id:
 
```SQL
SELECT MAX(result.total) as "Total Merit", UserData.UserName, UserData.Rank as "Top merit receiver", result.SubBoard as "Local board" FROM (
    SELECT toid, SubBoard, SUM(Merit) AS total
    FROM meritdata as m
    WHERE m.Board in (SELECT Board FROM meritdata Where Board like "Local%" GROUP BY Board)
    GROUP BY toid, Board
    ORDER BY Board,total Desc) AS result
INNER JOIN UserData ON UserData.UserId = result.toid
GROUP BY SubBoard
ORDER BY result.total Desc
```
 
Selecting data by a particular time frame is quite easy (all merit transaction happened the 1/06/2018):
 
```SQL
SELECT * FROM MeritData
WHERE strftime('%m', date) = "06" AND strftime('%d', date) = "01" AND strftime('%y', date) = "2018";
```
 
Select by a time frame (from 2018 to 15/06/2018):
 
```SQL
SELECT * FROM MeritData
WHERE date BETWEEN '2018-06-14' AND '2018-06-15';
```
 
You can also use hour minutes (and seconds) to check a 30 minutes interval:
 
```SQL
SELECT * FROM MeritData
WHERE date BETWEEN '2018-06-14T15:00:00' AND '2018-06-14T15:30:00';
```
 
How many merits sent for each rank?

```SQL
SELECT UserData.Rank, SUM(MeritData.Merit) as Total
FROM MeritData
INNER JOIN UserData ON UserData.UserId = MeritData.fromid
GROUP BY UserData.Rank;
 ```
 
How may merits sent from one rank to another?
Full member to Legendary
 
```SQL
SELECT UserFullMember.Rank, UserLegendary.Rank, SUM(MeritData.Merit) as Total
FROM MeritData
INNER JOIN UserData as UserFullMember ON UserFullMember.UserId = MeritData.fromid AND UserFullMember.Rank like "full mem%"
INNER JOIN UserData as UserLegendary ON UserLegendary.UserId = MeritData.toid AND UserLegendary.Rank like "lege%"
GROUP BY UserFullMember.Rank,UserLegendary.Rank;
```

Legendary to Full member

```SQL
SELECT UserFullMember.Rank, UserLegendary.Rank, SUM(MeritData.Merit) as Total
FROM MeritData
INNER JOIN UserData as UserFullMember ON UserFullMember.UserId = MeritData.toid AND UserFullMember.Rank like "full mem%"
INNER JOIN UserData as UserLegendary ON UserLegendary.UserId = MeritData.fromid AND UserLegendary.Rank like "lege%"
GROUP BY UserFullMember.Rank,UserLegendary.Rank;
```

**Example Script:**
```Javascript
// Variable holding the sum of unspent merits for each user.
var total_unspent_merits=0;

// List of username and total merit received for every user.
var merit_received = RunSQLSynch('SELECT username,  coalesce(tot,0) From userdata Left join (select toid, sum(merit)  as tot from meritdata group by toid)   on userid = toid;');

// List of username and total merit given for every user.
var merit_given = RunSQLSynch('SELECT username,  coalesce(tot,0) From userdata Left join (select fromid, sum(merit)  as tot from meritdata group by fromid)   on userid = fromid;');

// We go through the lists (they have the same lenght and already ordered in the same way).
for (var i=0;i<Length(merit_received);i++){	
  		
  		// Just to be safe we check if the Username match, by getting the first coulmn of the current row.
		if (GetDataField(merit_received,i,0) == GetDataField(merit_given,i,0)){
          
          // Calculate the unspent merits (using the forumula (Total Merit Receive/2) - Total Merit Given)
          var user_unspent_merits = (GetDataField(merit_received,i,1)/2) - GetDataField(merit_given,i,1);
         
		  // If it’s positive add it to the total.
          if (user_unspent_merits > 0)
          	total_unspent_merits += user_unspent_merits;         
        }    
}

// Clear the output information and write the result.
Clear();
WriteLine("\nTOTAL MERIT UNSPENT:" + total_unspent_merits + "\n");
```
For more information and discussion: https://bitcointalk.org/index.php?topic=4551881.0
