function directoryUrl() {
  if ($(location).attr("href").startsWith("http://localhost")) {
    return "http://localhost:8080";
  } else if ($(location).attr("href").startsWith("https://qa-dashboard")) {
    return "https://qa-directory.nymtech.net";
  } else {
    return "https://directory.nymtech.net";
  }
}

function websocketUrl() {
  if ($(location).attr("href").startsWith("http://localhost")) {
    return "ws://127.0.0.1";
  } else if ($(location).attr("href").startsWith("https://qa-dashboard")) {
    return "wss://qa-directory.nymtech.net";
  } else {
    return "wss://directory.nymtech.net";
  }
}

function getTopology() {
  console.log("Getting topology...");
  var topologyUrl = directoryUrl() + "/api/presence/topology";
  $.ajax({
    type: 'GET',
    url: topologyUrl,
    success: function (data) {
      createDisplayTable(data);
    }
  });
}

function getStandbyNodes() {
  console.log("Checking for badnodes...");
  var badNodesUrl = directoryUrl() + "/api/presence/disallowed";
  $.ajax({
    type: 'GET',
    url: badNodesUrl,
    success: function (data) {
      createStandbyNodeRows(data);
    }
  });
}

function createDisplayTable(data) {
  createMixnodeRows(data.mixNodes);
  createValidatorRows(data.cocoNodes);
  createGatewayRows(data.gatewayNodes);
}

function createMixnodeRows(mixNodes) {
  mixNodes.sort((a, b) => a.version < b.version ? 1 : (a.version === b.version) ? ((a.layer > b.layer) ? 1 : -1) : -1);
  $.each(mixNodes, function (_, node) {
    cleanup(node);

    var $tr = $('<tr>').append(
      $('<input type="hidden" id="prev-timestamp-' + node.pubKey + '" value="' + node.timestamp + '"> '),
      $('<td>').text(DOMPurify.sanitize(node.version)),
      $('<td>').text(DOMPurify.sanitize(node.location)),
      $('<td>').text(DOMPurify.sanitize(node.host)),
      $('<td>').text(DOMPurify.sanitize(node.layer)),
      $('<td>').text(DOMPurify.sanitize(node.pubKey)),
      $('<td id="' + "received-" + DOMPurify.sanitize(node.pubKey) + '">').text("0"),
      $('<td id="' + "sent-" + DOMPurify.sanitize(node.pubKey) + '">').text("0")
    ).appendTo('#mixnodes-list');
  });
}

function createStandbyNodeRows(mixNodes) {
  mixNodes.sort((a, b) => a.version < b.version ? 1 : (a.version === b.version) ? ((a.layer > b.layer) ? 1 : -1) : -1);
  $.each(mixNodes, function (_, node) {
    cleanup(node);

    var $tr = $('<tr>').append(
      $('<input type="hidden" id="prev-timestamp-' + node.pubKey + '" value="' + node.timestamp + '"> '),
      $('<td>').text(DOMPurify.sanitize(node.version)),
      $('<td>').text(DOMPurify.sanitize(node.location)),
      $('<td>').text(DOMPurify.sanitize(node.host)),
      $('<td>').text(DOMPurify.sanitize(node.layer)),
      $('<td>').text(DOMPurify.sanitize(node.pubKey)),
      $('<td id="' + "received-" + DOMPurify.sanitize(node.pubKey) + '">').text("0"),
      $('<td id="' + "sent-" + DOMPurify.sanitize(node.pubKey) + '">').text("0")
    ).appendTo('#standby-list');
  });
}

function createGatewayRows(gatewayNodes) {
  $.each(gatewayNodes, function (_, node) {
    var $tr = $('<tr>').append(
      $('<td>').text(DOMPurify.sanitize(node.version)),
      $('<td>').text(DOMPurify.sanitize(node.location)),
      $('<td>').text(DOMPurify.sanitize(node.mixnetListener)),
      $('<td>').text(DOMPurify.sanitize(node.pubKey)),
    ).appendTo('#gatewaynodes-list');
  });
}

function createValidatorRows(cocoNodes) {
  $.each(cocoNodes, function (_, node) {
    var $tr = $('<tr>').append(
      $('<td>').text(DOMPurify.sanitize(node.version)),
      $('<td>').text(DOMPurify.sanitize(node.location)),
      $('<td>').text(DOMPurify.sanitize(node.host)),
      $('<td>').text(DOMPurify.sanitize(node.pubKey))
    ).appendTo('#coconodes-list');
  });
}

function connectWebSocket() {
  var conn;
  var url;
  url = websocketUrl() + "/ws";
  console.log("connecting to: " + url);
  conn = new WebSocket(url);
  conn.onmessage = function (evt) {
    processMessage(evt);
  };
}

function processMessage(evt) {
  var messages = evt.data.split('\n');
  for (var i = 0; i < messages.length; i++) {
    var msg = jQuery.parseJSON(messages[i]);
    cleanup(msg);

    prevTimestamp = updateTimeStampStorage(msg);

    timeDiff = (msg.timestamp - prevTimeStamp) / 1000000000;

    displayReceivedPackets(msg, timeDiff);
    displaySentPackets(msg, timeDiff);
  }
}

function displaySentPackets(msg, timeDiff) {
  var sentCell = "#sent-" + DOMPurify.sanitize(msg.pubKey);
  var sent = 0;
  for (var key in msg.sent) {
    s = msg.sent[key];
    sent += s;
  }
  sentPerSecond = Math.floor(sent / timeDiff);
  let sentVal = DOMPurify.sanitize(sentPerSecond).length > 0 ? DOMPurify.sanitize(sentPerSecond) : "0";
  $(sentCell).html(sentVal);
}

function displayReceivedPackets(msg, timeDiff) {
  receivedPerSecond = Math.floor(msg.received / timeDiff);
  var recCell = "#received-" + DOMPurify.sanitize(msg.pubKey);
  let recVal = DOMPurify.sanitize(receivedPerSecond).length > 0 ? DOMPurify.sanitize(receivedPerSecond) : "0";
  $(recCell).html(recVal);
}

/* 
  Hahahaha this has to be the crappiest code I've written since learning to code.

  On the upside, it'll save a few weeks messing with React or Angular to do
  basically the same thing.
*/
function updateTimeStampStorage(msg) {
  // get the timestamp stored during the last loop
  prevTimeStamp = ($("#prev-timestamp-" + msg.pubKey).val())

  // store the current timestamp
  $('#prev-timestamp-' + msg.pubKey).val(msg.timestamp);

  // return the previous timestamp
  return prevTimeStamp;
}

$(document).ready(function () {
  getTopology();
  getStandbyNodes();
  connectWebSocket();
});


// msg.pubKey from old nodes (before 0.5.0ish ) are sent from the server with 
// an '=' at the end, which breaks jQuery. 
//
// This cleans it up so we don't get console errors. We can remove this once 
// those old nodes are gone. 
function cleanup(msg) {
  msg.pubKey = msg.pubKey.replace('=', '');
  return msg;
}
