function getTopology() {
  console.log("Getting topology...");
  $.ajax({
    type: 'GET',
    url: 'https://directory.nymtech.net/api/presence/topology',
    success: function(data) {
      updateDom(data);
    }
  });
}

function updateDom(data) {
  updateMixNodes(data.MixNodes);
  updateMixProviderNodes(data.MixProviderNodes);
  updateCocoNodes(data.CocoNodes);
}

function updateMixNodes(mixNodes) {
  $.each(mixNodes, function(_, node) {
    var $tr = $('<tr>').append(
      $('<td>').text(node.host),
      $('<td>').text(node.layer),
      $('<td>').text(node.pubKey),
      $('<td id="' + "received-" + node.pubKey.replace('=', '') + '">').text("0"),
      $('<td id="' + "sent-" + node.pubKey.replace('=', '') + '">').text("0")
    ).appendTo('#mixnodes-list');
  });
}

function updateMixProviderNodes(mixProviderNodes) {
  $.each(mixProviderNodes, function(_, node) {
    var clients = [];
    $.each(node.registeredClients, function(i, c) {
      clients[i] = c.pubKey;
    });
    var $tr = $('<tr>').append(
      $('<td>').text(node.host),
      $('<td>').text(node.pubKey),
      $('<td>').text(clients)
    ).appendTo('#mixprovidernodes-list');
  });
}

function updateCocoNodes(cocoNodes) {
  $.each(cocoNodes, function(_, node) {
    var $tr = $('<tr>').append(
      $('<td>').text(node.host),
      $('<td>').text(node.pubKey)
    ).appendTo('#coconodes-list');
  });
}

function connectWebSocket() {
  var conn;
  conn = new WebSocket("wss://directory.nymtech.net/ws");
  conn.onmessage = function(evt) {
    var messages = evt.data.split('\n');
    for (var i = 0; i < messages.length; i++) {
      var msg = jQuery.parseJSON(messages[i]);
      var recCell = "#received-" + msg.pubKey.replace('=', '');
      $(recCell).html(msg.received);

      var sentCell = "#sent-" + msg.pubKey.replace('=', '');
      var sent = 0;
      for (var key in msg.sent) {
        s = msg.sent[key];
        sent += s;
      }
      $(sentCell).html(sent);
    }
  };
}

$(document).ready(function() {
  getTopology();
  connectWebSocket();
});
