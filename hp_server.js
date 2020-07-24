"use strict";
// Optional. You will see this name in eg. 'ps' or 'top' command
const fs = require('fs');

process.title = 'hp_trivia_server';
// Port where we'll run the websocket server
let webSocketsServerPort = 1337;
// websocket and http servers
let webSocketServer = require('websocket').server;
let http = require('http');
/**
 * Global variables
 */
// latest 100 messages
let history = [ ];
// list of currently connected clients (users)
let clients = [ ];
let db = [];
let team
let qScores = {}
let totalScore
let gradedAnswers
let currentGradedAnswers
let admins = new Set();
let adminCheck
var token = 'Wizard';
const adminToken = 'Admin';
let adminCount = 0;


/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
  return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function searchData(key, array){
  for (let i = 0; i < array.length; i++ ){
    if (array[i].TeamName === key){
      return i}
  }
}

function searchGradedAnswers(key, array){
  for (let i = 0; i < array.length; i++ ){
    if (array[i].name === key){
      return i}
  }
}

function findAdmins(key, array){
  for (let i = 0; i < array.length; i++ ){
    if (array[i].id.includes(key)){
      admins.add(i);
      }
  }
  if(admins.size){
    return true
  } else {
    return false
  }

}
// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );
/* ... */

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
  console.log((new Date()) + ' HTTP server. URL'
      + request.url + ' requested.');

  if (request.url === '/status') {
    response.writeHead(200, {'Content-Type': 'application/json'});
    var responseObject = {
      currentClients: clients.length,
      totalHistory: history.length
    };
    response.end(JSON.stringify(responseObject));
  } else {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('Sorry, unknown url');
  }
});
server.listen(webSocketsServerPort, function() {
  console.log((new Date())
      + " Server is listening on port " + webSocketsServerPort);
});

/* ... */
/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket
  // request is just an enhanced HTTP request. For more info
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server
});
// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin '
      + request.origin + '.');
  // accept connection - you should check 'request.origin' to
  // make sure that client is connecting from your website
  // (http://en.wikipedia.org/wiki/Same_origin_policy)
  var connection = request.accept(null, request.origin);
  // we need to know client index to remove them on 'close' event
  var index = clients.push(connection) - 1;
  var userName = false;
  var userColor = false;
  console.log((new Date()) + ' Connection accepted.');


  //Send hello message
  connection.sendUTF(JSON.stringify('Welcome Wizard!'));

  // user sent some message
  connection.on('message', function(message) {
    if (message.type === 'utf8') { // accept only text
      console.log(message);
      var msg = JSON.parse(message.utf8Data);

    if (msg.type === 'Auth'){
      if(msg.data === adminToken){

        //Get Rid of the Previous Admin connection
        /*let adminExists = findAdmin('Admin', clients);
        if(adminExists >= 0){
          clients.splice(adminExists,1);
          console.log('Old Admin Kicked For A New King')
        }*/

        connection.id = 'Admin' + adminCount;
        adminCount = adminCount + 1;
        console.log(connection.id + ' has connected.')
        if (gradedAnswers){
          connection.sendUTF(JSON.stringify({Type: 'GradedData', Data: gradedAnswers}));
          console.log('good show')
        } else {
          connection.sendUTF(JSON.stringify({Type: 'Answers', Data: db}));
        }
      } else {
          if(msg.data === token){
            connection.sendUTF(JSON.stringify({ Type: 'Auth', Data: 'Accepted'}))
          } else {
            connection.sendUTF(JSON.stringify({ Type: 'Auth', Data: 'Failed'}))
          }
        }
    }


    if (msg.type === 'Submit') {
      connection.id = msg.data.TeamName;
      team = searchData(msg.data.TeamName, db)
      //console.log(team);

      if(!team && team != 0){
        console.log('append');
        db.push(msg.data);
      } else {
        console.log('update');
        db[team] = msg.data;
      }
      //console.log(db)
      console.log('Answers submitted from team:'+msg.data.TeamName)

      //Check if any Graded Answers have been submitted by Admins
      if(gradedAnswers){
        let sTeam
        console.log('gradedAnswers Starting')
        console.log('TeamCheck: ')

        for (let i = 0; i < db.length; i++) {
          sTeam = {}
          sTeam.name = db[i].TeamName
          sTeam.answers = []

          // This is to save the scoring already done.
          const teamCheck = searchGradedAnswers(db[i].TeamName, gradedAnswers)

          if (teamCheck >= 0) {
            qScores = {}
            totalScore = 0
            for (let o = 0; o < gradedAnswers[teamCheck].answers.length; o++ ){
              let q = gradedAnswers[teamCheck].answers[o][0]
              let s = gradedAnswers[teamCheck].answers[o][2];
              qScores[q] = s
              s = s ? s: 0;
              totalScore = totalScore + s;
              //console.log(totalScore)
            }
            sTeam.score = totalScore
            sTeam.certified = gradedAnswers[teamCheck].certified
          } else {
            sTeam.score = 0
            sTeam.certified = false
          }
          const sections = Object.keys(db[i].TrivSections).length
          //  let obj = Object.values(data[i].TrivSections)

          for (let p = 0; p < sections; p++) {
            const obj = Object.entries(db[i].TrivSections[p + 1])

            for (let q = 0; q < obj.length; q++) {
               if (teamCheck >= 0) {
                  let s = qScores[obj[q][0]]

                  s = s ? s: ""
                  obj[q].push(s)
               }
              //obj[q].push(5);
              //console.log(obj[q])
              sTeam.answers.push(obj[q])
            }
          }
          if (teamCheck >= 0) {
            gradedAnswers[teamCheck] = sTeam
            //console.log('beep')
          } else {
            gradedAnswers.push(sTeam)
            //console.log('boop')
          }

          //console.log(team.answers)
        }
        gradedAnswers.sort((a, b) => (a.name > b.name) ? 1 : -1)

        fs.writeFile('data/gradedAnswers.json', JSON.stringify(gradedAnswers), function (err) {
          if (err) return console.log(err);
          console.log('Graded Answers written to file!');
        });

        //console.log(JSON.stringify(gradedAnswers))
        console.log('gradedAnswers Ending')
      }

      //Check if any Admins have connected
        adminCheck = findAdmins('Admin', clients);
        console.log('Admins Exist: ' + adminCheck);
        console.log(admins)


      //If Admin Has connected, send answers to Admin.
        if (adminCheck) {
          for (let admin of admins.keys()) {
            clients[admin].sendUTF(JSON.stringify({ Type: 'Answers', Data: db}))
            }
          console.log('Sent Answers to Admin')
          //console.log(clients.length);
        }

      fs.writeFile('data/db.json', JSON.stringify(db), function (err) {
        if (err) return console.log(err);
        console.log('db written to file!');
      });
    }

    if (msg.type === 'Graded') {
      gradedAnswers = msg.data;

      //Check if any Admins have connected
        adminCheck = findAdmins('Admin', clients);
        console.log('Admins Exist: ' + adminCheck);
        console.log(admins)

      //If Admin Has connected, send answers to Admin.
        if (adminCheck) {
          for (let admin of admins.keys()) {
            clients[admin].sendUTF(JSON.stringify({ Type: 'GradedData', Data: gradedAnswers}))
          }
          console.log('Sent Graded Answers to Admin')

          fs.writeFile('data/gradedAnswers.json', JSON.stringify(gradedAnswers), function (err) {
            if (err) return console.log(err);
            console.log('Graded Answers written to file!');
          });
        }
    }






      //db.push(JSON.parse(message.data));
      //console.log(db);

    // first message sent by user is their name
  /*   if (userName === false) {
        // remember user name
        userName = htmlEntities(message.utf8Data);
        // get random color and send it back to the user
        userColor = colors.shift();
        connection.sendUTF(
            JSON.stringify({ type:'color', data: userColor }));
        console.log((new Date()) + ' User is known as: ' + userName
                    + ' with ' + userColor + ' color.');
      } else { // log and broadcast the message
        console.log((new Date()) + ' Received Message from '
                    + userName + ': ' + message.utf8Data);

        // we want to keep history of all sent messages
        var obj = {
          time: (new Date()).getTime(),
          text: htmlEntities(message.utf8Data),

        };
        history.push(obj);
        history = history.slice(-100);
        // broadcast message to all connected clients
        var json = JSON.stringify({ type:'message', data: obj });
        for (var i=0; i < clients.length; i++) {
          clients[i].sendUTF(json);
        }
      }*/
    }
  });
  // user disconnected
  connection.on('close', function(connection) {
    if (userName !== false && userColor !== false) {
      console.log((new Date()) + " Peer "
          + connection.remoteAddress + " disconnected.");
      // remove user from the list of connected clients
      clients.splice(index, 1);
      // push back user's color to be reused by another user
      colors.push(userColor);
    }
  });
});
