//https://github.com/kripken/sql.js/

function execudeCode(code){
	try {
		eval(code);
		noerror();
	}
	catch(err) {
		error(err);
	}
	

}

function RunSQLAsynch(command){
	try {
		worker.onmessage = function(event) {
			var results = event.data.results;
			PrintTableResult(results);
			noerror();
		}
		worker.postMessage({action:'exec', sql:command});
	}
	catch(err) {
		error(err);
	}
	
}

function RunSQLSynch(command){
	//result is now [{columns:['col1','col2',...], values:[[first row], [second row], ...]}]
	return synchExec.exec(command);
}

function PrintTableResult(result){
	try {
		tic();		
		outputElm.innerHTML = "";
		for (var i=0; i<result.length; i++) {
			var columns = result[i].columns
			var values = result[i].values;
			var tbl  = document.createElement('table');
			var html = '<thead>' + valconcat(columns, 'th') + '</thead>';
			var rows = values.map(function(v){ return valconcat(v, 'td'); });
			html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
			tbl.innerHTML = html;
			outputElm.appendChild(tbl);
		}
		toc("Displaying results");
		noerror();
	}
	catch(err) {
		error(err);
	}
}

function GetDataField(sql_data, row_index, coulmn_index){
	try {
		return sql_data[0].values[row_index][coulmn_index];
	}
	catch(err) {
		error(err);
	}
}

function GetCoulmHeader(sql_data,coulmn_index){
	try {
		return sql_data[0].columns[0][coulmn_index];
	}
	catch(err) {
		error(err);
	}
}

function Length(sql_data){
	try {
		return sql_data[0].values.length;
	}
	catch(err) {
		error(err);
	}
}

function WriteLine(data){
	outputElm.innerHTML += data + "\n";
}

function Clear(){
	outputElm.innerHTML = "";
}

function valconcat(vals, tagName) {
	if (vals.length === 0) return '';
	var open = '<'+tagName+'>', close='</'+tagName+'>';
	return open + vals.join(close + open) + close;
}

