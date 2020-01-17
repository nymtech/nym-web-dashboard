function directoryUrl() {
  if ($(location).attr("href").startsWith("https://qa-dashboard")) {
    return "qa-directory.nymtech.net";
  } else {
    return "directory.nymtech.net";
  }
}

function getTopology() {
  console.log("Getting topology...");
  var topologyUrl = "https://" + directoryUrl() + "/api/presence/topology";
  $.ajax({
    type: 'GET',
    url: topologyUrl,
    success: function (data) {
      updateDom(data);
    }
  });
}

function updateDom(data) {
  updateMixNodes(data.mixNodes);
  updateMixProviderNodes(data.mixProviderNodes);
  updateCocoNodes(data.cocoNodes);
}

function updateMixNodes(mixNodes) {
  $.each(mixNodes, function (_, node) {
    pk = node.pubKey;
    stripped = pk.replace('=', '');
    var $tr = $('<tr>').append(
      $('<td>').text(DOMPurify.sanitize(node.version)),
      $('<td>').text(DOMPurify.sanitize(node.host)),
      $('<td>').text(DOMPurify.sanitize(node.layer)),
      $('<td>').text(DOMPurify.sanitize(node.pubKey)),
      $('<td id="' + "received-" + DOMPurify.sanitize(stripped) + '">').text("0"),
      $('<td id="' + "sent-" + DOMPurify.sanitize(stripped) + '">').text("0")
    ).appendTo('#mixnodes-list');
  });
}

function updateMixProviderNodes(mixProviderNodes) {
  $.each(mixProviderNodes, function (_, node) {
    var clients = [];
    $.each(node.registeredClients, function (i, c) {
      clients[i] = c.pubKey;
    });
    var $tr = $('<tr>').append(
      $('<td>').text(DOMPurify.sanitize(node.version)),
      $('<td>').text(DOMPurify.sanitize(node.mixnetListener)),
      $('<td>').text(DOMPurify.sanitize(node.pubKey)),
      $('<td>').text(DOMPurify.sanitize(clients))
    ).appendTo('#mixprovidernodes-list');
  });
}

function updateCocoNodes(cocoNodes) {
  $.each(cocoNodes, function (_, node) {
    var $tr = $('<tr>').append(
      $('<td>').text(DOMPurify.sanitize(node.version)),
      $('<td>').text(DOMPurify.sanitize(node.host)),
      $('<td>').text(DOMPurify.sanitize(node.pubKey))
    ).appendTo('#coconodes-list');
  });
}

function connectWebSocket() {
  var conn;
  var url;
  url = "wss://" + directoryUrl() + "/ws";
  console.log("connecting to: " + url);
  conn = new WebSocket(url);
  conn.onmessage = function (evt) {
    var messages = evt.data.split('\n');
    for (var i = 0; i < messages.length; i++) {
      var msg = jQuery.parseJSON(messages[i]);
      var recCell = "#received-" + DOMPurify.sanitize(msg.pubKey).replace('=', '');

      var sentCell = "#sent-" + DOMPurify.sanitize(msg.pubKey).replace('=', '');
      var sent = 0;
      for (var key in msg.sent) {
        s = msg.sent[key];
        sent += s;
      }

      let newRecVal = DOMPurify.sanitize(msg.received).length > 0 ? DOMPurify.sanitize(msg.received) : "0";
      let newSentVal = DOMPurify.sanitize(sent).length > 0 ? DOMPurify.sanitize(sent) : "0";

      $(recCell).html(newRecVal);
      $(sentCell).html(newSentVal);
    }
  };
}

$(document).ready(function () {
  getTopology();
  connectWebSocket();
});
