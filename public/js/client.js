function initialize(){
	var serverURL = document.domain;
	//console.log(s);

	var socket = io.connect(serverURL + ':8080');

	var sessionId = '';

 function updateParticipants(participants) {
    $('#participants').html('');
    for (var i = 0; i < participants.length; i++) {
      $('#participants').append('<span id="' + participants[i].id + '">' +
        participants[i].name + ' ' + (participants[i].id === sessionId ? '(You)' : '') + '<br /></span>');
    }
  }

	socket.on('connect', function(){
		sessionId = socket.io.engine.id;
		console.log('connected to: ' + sessionId);
		socket.emit('newUser', {id:sessionId, name: $('#name').val()});
	});

	socket.on('newConnection', function(data){
		updateParticipants(data.participants);
	});

	socket.on('userDisconnected', function(data){
		$('#' + data.id).remove();
	});

	socket.on('nameChanged', function(data){
		$('#' + data.id).html(data.name + ' ' + (data.id === sessionId ? '(You)' : '') + '<br />');;
	});

	socket.on('incomingMessage', function(data){
		var message = data.message;
    	var name = data.name;
    	 $('#messages').prepend('<b>' + name + '</b><br />' + message + '<hr />');;
	});

	socket.on('error', function(reason){
		console.log('unable to connect to server', reason);
	})

function sendMessage() {
    var outgoingMessage = $('#outgoingMessage').val();
    var name = $('#name').val();
    $.ajax({
      url:  '/message',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({message: outgoingMessage, name: name})
    });
  }

  /*
 If user presses Enter key on textarea, call sendMessage if there
 is something to share
  */
  function outgoingMessageKeyDown(event) {
    if (event.which == 13) {
      event.preventDefault();
      if ($('#outgoingMessage').val().trim().length <= 0) {
        return;
      }
      sendMessage();
      $('#outgoingMessage').val('');
    }
  }

  /*
 Helper function to disable/enable Send button
  */
  function outgoingMessageKeyUp() {
    var outgoingMessageValue = $('#outgoingMessage').val();
    $('#send').attr('disabled', (outgoingMessageValue.trim()).length > 0 ? false : true);
  }

  /*
 When a user updates his/her name, let the server know by
 emitting the "nameChange" event
  */
  function nameFocusOut() {
    var name = $('#name').val();
    socket.emit('nameChange', {id: sessionId, name: name});
  }

  /* Elements setup */
  $('#outgoingMessage').on('keydown', outgoingMessageKeyDown);
  $('#outgoingMessage').on('keyup', outgoingMessageKeyUp);
  $('#name').on('focusout', nameFocusOut);
  $('#send').on('click', sendMessage);	
}

$(document).on('ready', initialize);