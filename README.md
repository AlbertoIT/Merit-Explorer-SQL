# Merit-Explorer-SQL

A tool made with Javascript and SQLite to run queries over the merit data on the forum Bitcointalk.

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

For more information and discussion: https://bitcointalk.org/index.php?topic=4551881.0
