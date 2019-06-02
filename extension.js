// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// Example: https://riteshpatel.silvrback.com/content-provider-tutorial-for-vscode

var vscode = require('vscode');
var request, options;
request = require('request');
var json2html = require('node-json2html');
const psconfeuuri = 'https://raw.githubusercontent.com/psconfeu/2019/master/sessions.json';
var transform = {
    "<>": "ul", "style": "font-family: Verdana, Arial, Helvetica, sans-serif", "html": [
        { "<>": "li", "style": "background:green", "html": "Name: ${Name}" },
        { "<>": "li", "html": "Description: ${Description}" },
        { "<>": "li", "style": "font:arial", "html": "Speaker: ${Speaker}" },
        { "<>": "li", "html": "Company: ${Company}" },
        { "<>": "li", "html": "Starts: ${Starts}" },
        { "<>": "li", "html": "Ends ${Ends}" },
        { "<>": "li", "html": "Track: ${Track}" },
        { "<>": "li", "html": "Twitter: <a href=\"https://twitter.com/${Twitter}\" target=\"_blank\" rel=\"noopener\">${Twitter}</a>" },
    ]
}

var dd = (new Date().getDate()).toString().padStart(2, '0')
var mm = (new Date().getMonth()).toString().padStart(2, '0')
var yyyy = (new Date().getFullYear().toString());

var toDay = mm + '/' + dd + '/' + yyyy;

// Load PSConfEU Agenda from 'https://raw.githubusercontent.com/psconfeu/2019/master/sessions.json'
function loadAgenda(uri) {
    options = {
        url: uri,
        value: 'application/json'
    };
    //Start the request
    request(options, agendaLoaded);
}

// Format result from web request to html using node-json2html module
function agendaLoaded(error, response, body) {
    // json2html transform template
    var jsonData = eval(body);
    var panel = vscode.window.createWebviewPanel(
        'agenda',
        'PSConfEu Agenda',
        vscode.ViewColumn.One,
        {}
    );

    // And set its HTML content
    panel.webview.html = json2html.transform(jsonData, transform);
}

function loadfilteredAgenda(uri) {
    options = {
        url: uri,
        value: 'application/json'
    };
    //Start the request
    request(options, filterAgendaLoaded);
}

function filterAgendaLoaded(error, response, body) {
    vscode.window.showInputBox({ prompt: "Please enter [search string]" }).then(
        function (filter) {
            vscode.window.showInformationMessage('Search String used: ' + filter)
            var jsonData = eval(body);
            //Empty array
            var newArray = [];
            jsonData.filter(function (el) {
                if (el.Speaker.match(new RegExp(filter, "i"))) { newArray.push(el) }
                else if (el.Name.match(/filter/i)) { newArray.push(el) }
                else if (el.Starts.match(new RegExp(filter, "i"))) { newArray.push(el) }
                else if (el.Ends.match(new RegExp(filter, "i"))) { newArray.push(el) }
                else if (el.Track.match(new RegExp(filter, "i"))) { newArray.push(el) }
                else if (el.Description.match(new RegExp(filter, "i"))) { newArray.push(el) }
                else if (el.Twitter.match(new RegExp(filter, "i"))) { newArray.push(el) };
            });

            var panel = vscode.window.createWebviewPanel(
                'filteredAgenda',
                'PSConfEu filtered Agenda',
                vscode.ViewColumn.One,
                {}
            );

            // And set its HTML content and filter color blue
            var html = json2html.transform(newArray, transform);
            var find = "(?<!twitter.com/[a-z]*[0-9]*)" + filter;
            var re = new RegExp(find, 'gi');
            var blue = "<span style=\"background-color: #0000ff;\">" + filter + "</span>"
            var res = html.replace(re, blue)
            // var result = ("<body bgcolor=\"#1e1e1e\">").concat(res).concat("\\<body>")
            panel.webview.html = res
        })
}


function loadtoDaysAgenda(uri) {
    options = {
        url: uri,
        value: 'application/json'
    };
    //Start the request
    request(options, toDaysAgendaLoaded);
}

function toDaysAgendaLoaded(error, response, body) {
    var jsonData = eval(body);
    var filter = toDay;
    //Empty array
    var newArray = [];
    jsonData.filter(function (el) {
        if (el.Starts.match(new RegExp(filter, "i"))) { newArray.push(el) }
    });

    var panel = vscode.window.createWebviewPanel(
        'todaysAgenda',
        'PSConfEu Agenda for today',
        vscode.ViewColumn.One,
        {}
    );

    //if not sessions are found show information message
    if (typeof newArray !== 'undefined' && newArray.length > 0) {
        // And set its HTML content
        panel.webview.html = json2html.transform(newArray, transform);
    }
    else {
        vscode.window.showInformationMessage('No sessions found for ' + toDay);
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-psconfeu" is now active!');
    // Retrieve total Agenda info
    var psconfeuagenda = vscode.commands.registerCommand('extension.getPSConfEUAgenda', () => loadAgenda(psconfeuuri));
    context.subscriptions.push(psconfeuagenda);
    // Filter Agenda
    var filterpsconfeuagenda = vscode.commands.registerCommand('extension.filterPSConfEUAgenda', () => loadfilteredAgenda(psconfeuuri));
    context.subscriptions.push(filterpsconfeuagenda);
    // Today's Agenda
    var toDayspsconfeuagenda = vscode.commands.registerCommand('extension.toDaysPSConfEUAgenda', () => loadtoDaysAgenda(psconfeuuri));
    context.subscriptions.push(toDayspsconfeuagenda);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate; 3