var execBtnSql = document.getElementById("executeSql");
var execBtnScript = document.getElementById("executeScript");
var outputElm = document.getElementById('output');
var errorElm = document.getElementById('error');
var commandsElm = document.getElementById('sqlarea');
var scriptElm = document.getElementById('scriptarea');
var editorScript;
var editorSql;
var synchExec; // to execute sql asynchronously

// Start the worker in which sql.js will run
var worker = new Worker("Js/worker.sql.js");
//var scriptWorker = new Worker("Js/worker.script.js");

worker.onerror = error;

// Open a database
worker.postMessage({action:'open'});

function Init(){
	openTab(null, 'SQL');
	xhr = new XMLHttpRequest();
	xhr.open('GET', 'Data/btctalk.db', true);
	xhr.responseType = 'arraybuffer';
	console.log("rading DB!");
	xhr.onload = function(e) {
	  
		synchExec = new SQL.Database(new Uint8Array(xhr.response));
		
		worker.onmessage = function () {
			toc("Loading database from file");
			// Show the schema of the loaded database
			editorSql.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
			execEditorContents();
		};
		tic();
		try {
			worker.postMessage({action:'open',buffer:xhr.response}, [xhr.response]);
		}
		catch(exception) {
			worker.postMessage({action:'open',buffer:xhr.response});
		}

	};
	xhr.send();
	
}
// Connect to the HTML element we 'print' to
function print(text) {
    outputElm.innerHTML = text.replace(/\n/g, '<br>');
}
function error(e) {
  console.error(e);
	errorElm.style.height = '2em';
	errorElm.textContent = e.message;
}

function noerror() {
		errorElm.style.height = '0';
}

// Run a command in the database
function execute(commands) {
	tic();
	worker.onmessage = function(event) {
		var results = event.data.results;
		toc("Executing SQL");

		tic();
		outputElm.innerHTML = "";
		for (var i=0; i<results.length; i++) {
			outputElm.appendChild(tableCreate(results[i].columns, results[i].values));
		}
		toc("Displaying results");
	}
	worker.postMessage({action:'exec', sql:commands});
	outputElm.textContent = "Fetching results...";
}

// Run script
function executeScript(commands) {
	outputElm.textContent = "Executing script...";
	execudeCode(commands);
}

// Create an HTML table
var tableCreate = function () {
  function valconcat(vals, tagName) {
    if (vals.length === 0) return '';
    var open = '<'+tagName+'>', close='</'+tagName+'>';
    return open + vals.join(close + open) + close;
  }
  return function (columns, values){
    var tbl  = document.createElement('table');
    var html = '<thead>' + valconcat(columns, 'th') + '</thead>';
    var rows = values.map(function(v){ return valconcat(v, 'td'); });
    html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
	  tbl.innerHTML = html;
    return tbl;
  }
}();

// Execute the SQL commands when the button is clicked
function execEditorContents () {
	noerror()
	execute (editorSql.getValue() + ';');
}

// Execute the Script when the button is clicked
function execEditorScriptContents () {
	noerror()
	executeScript (editorScript.getValue() + ';');
}
execBtnSql.addEventListener("click", execEditorContents, true);
execBtnScript.addEventListener("click", execEditorScriptContents, true);
// Performance measurement functions
var tictime;
if (!window.performance || !performance.now) {window.performance = {now:Date.now}}
function tic () {tictime = performance.now()}
function toc(msg) {
	var dt = performance.now()-tictime;
	console.log((msg||'toc') + ": " + dt + "ms");
}
function codemirrorSqlTextArea(){
	// Add syntax highlihjting to the SQL textarea
	if (editorSql != null)
		return;
	
  editorSql = CodeMirror.fromTextArea(commandsElm, {
    mode: 'text/x-mysql',
    indentWithTabs: true,
    smartIndent: true,
    lineNumbers: true,
    matchBrackets : true,
    autofocus: true,
    extraKeys: {
				"Ctrl-Enter": execEditorContents,
				"F5": execEditorContents
			}
  });
}
function codemirrorScriptTextArea(){
	// Add syntax highlihjting to the Script textarea
	if (editorScript != null)
		return;
	
	editorScript = CodeMirror.fromTextArea(scriptElm, {
	  lineNumbers: true,
	  extraKeys: {"Ctrl-Space": "autocomplete"},
	  mode: {name: "javascript", globalVars: true}
	});
	

	//editorScript.setValue("\nvar result = RunSQLSynch('SELECT * FROM UserData LIMIT 10')\nPrintTableResult(result);\nfor (var i=0;i<result[0].values.length;i++)\n\tappendResult(result[0].values[i]);");
}
function openTab(evt, tabName) {
	
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    
    if (evt != null)
	evt.currentTarget.className += " active";
	
    if (tabName == "SQL")
	codemirrorSqlTextArea();
    else if (tabName == "Script")
	codemirrorScriptTextArea();
}

Init();
