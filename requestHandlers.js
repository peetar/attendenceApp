var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable");
	util = require('util');


function start(response,  request, connection) {
	var form = new formidable.IncomingForm();
	console.log("about to parse");
	form.parse(request, function(error, fields, files) {
	console.log(util.inspect(fields));
    console.log("parsing done FIELDS>GROUPLEADER:");
	
    var grLead = fields.groupLeader.toString();
	console.log(grLead);
	var wk = parseInt(fields.week);
	connection.query('SELECT * FROM BSF.members where groupLeader = "' + grLead +'"', function(err, rows, fields) {
	if (err) throw err;
	var cbString = '';
	for (i=0; i<rows.length; i++) {
	var name1 = rows[i].name;
	cbString += '<input type="checkbox" name="member" value=' + name1+ ' /> ' + unescape(name1) + '<br />';
	}
  var submitLabel = unescape(grLead) + ' for week ' + wk.toString();
  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
	'<form action="/logAttend" '+
    'method="post">'+
	cbString +
	'<INPUT TYPE=hidden NAME="week" VALUE=' + wk + '>' +
	'<INPUT TYPE=hidden NAME="groupLeader" VALUE=' + grLead + '>' +
	'<input type="submit" value="' + submitLabel + '" />'
    '</form>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
  
  });
	
});

  
}

function login(response,  request, connection) {
	
  console.log("Request handler 'login' was called.");
	connection.query('SELECT DISTINCT groupLeader FROM BSF.members;', function(err, rows, fields) {
  if (err) throw err;
	var cbString = '';
	for (i=0; i<rows.length; i++) {
	var name1 = rows[i].groupLeader;
	cbString += '<input type="radio" name= "groupLeader" value=' + name1 + '> '+ unescape(name1) +'<br>';
	}
  
  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
	'<form action="/start" '+
    'method="post">'+
	cbString +
	'<input type ="text" value = "week" name = "week"/></br>' +
	'<input type="submit" value="Select Leader & Week" />'
    '</form>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
  
});

}

function logAttend(response,  request, connection) {
	console.log("Request handler 'logTTEND' was called.");
	//console.log(util.inspect(request));
  var form = new formidable.IncomingForm();
  
  form.parse(request, function(error, formFields, files) {
  console.log("typeOF for member: " + typeof(formFields.member));
	var memberObject = new Array();
	if (typeof(formFields.member) == 'string') {
		console.log("members was a string");
		memberObject[0] = formFields.member;
		}
	else {
	console.log("members was a object");
	memberObject = formFields.member;
	}
	var wk = parseInt(formFields.week);
	var gl = formFields.groupLeader.toString();
	console.log("wk" + wk.toString());
	console.log("gl " + gl);
	console.log("memobject: " + memberObject.length);
	for (i = 0; i< memberObject.length; i++) {
	var memName = memberObject[i];
	connection.query('INSERT INTO `BSF`.`attendance` (`memberName`, `leaderName`, `week`) VALUES ("' + memName + '", "'+ gl +'", "'+wk+'");', function(err, rows, fields) {
    
		});
		}
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(util.inspect(formFields));
	response.end();
  });
}

function upload(response, connection, request) {
  console.log("Request handler 'upload' was called.");

  var form = new formidable.IncomingForm();
  console.log("about to parse");
  form.parse(request, function(error, fields, files) {
    console.log("parsing done");

    /* Possible error on Windows systems:
       tried to rename to an already existing file */
    fs.rename(files.upload.path, "./tmp/test.png", function(err) {
      if (err) {
        fs.unlink("./tmp/test.png");
        fs.rename(files.upload.path, "./tmp/test.png");
      }
    });
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("received image:<br/>");
    response.write("<img src='/show' />");
    response.end();
  });
}

function show(response) {
  console.log("Request handler 'show' was called.");
  fs.readFile("./tmp/test.png", "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
}

exports.start = start;
exports.upload = upload;
exports.show = show;
exports.logAttend = logAttend;
exports.login = login;