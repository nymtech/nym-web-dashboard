function getTopology() {
  console.log("Getting topology...");
  $.ajax({
    type: 'GET',
    url: 'http://directory.nymtech.net:8080/api/presence/topology',
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

getTopology();
