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
      $('<td>').text("0"),
      $('<td>').text("0")
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

function connectWebSocket () {
  var conn;
  var msg = document.getElementById("msg");
  var log = document.getElementById("log");

  function appendLog(item) {
    var doScroll = log.scrollTop > log.scrollHeight - log.clientHeight - 1;
    log.appendChild(item);
    if (doScroll) {
      log.scrollTop = log.scrollHeight - log.clientHeight;
    }
  }

  console.log("connecting to websocket");
  conn = new WebSocket("wss://directory.nymtech.net/ws");
  conn.onopen = function(evt) {
    console.log("Received evt: " + evt);
  };
  conn.onclose = function(evt) {
    var item = document.createElement("div");
    item.innerHTML = "<b>Connection closed.</b>";
    appendLog(item);
  };
  conn.onmessage = function(evt) {
    var messages = evt.data.split('\n');
    for (var i = 0; i < messages.length; i++) {
      var item = document.createElement("div");
      item.innerText = messages[i];
      appendLog(item);
    }
  };
}

$(document).ready(function() {
  getTopology();
  connectWebSocket();
});
