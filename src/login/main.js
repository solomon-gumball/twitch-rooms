var createButton = document.getElementById('create-button');
var joinButton = document.getElementById('join-button');
var randomButton = document.getElementById('random');

var createInput = document.getElementById('stream-name');
var nameInput = document.getElementById('player-name');
var joinInput = document.getElementById('room-key');

var alertElement = document.getElementById('alert');
var roomNumberElement = document.getElementById('room-number');
var helpElement = document.getElementById('helpElement');

var formElement = document.getElementById('start-form');

export default function Login() {
	return new Promise((res, rej) => {

		createButton.addEventListener('click', ev => {
			var playerName = nameInput.value;
			var streamName = createInput.value;

			if (!playerName) {
				alertElement.innerText = 'Please provide a player name!';
				return;
			}

			let request = new XMLHttpRequest();

            request.onload = e => {
            	if (request.status === 400) {
            		alertElement.innerText = request.responseText;
            	}
           		else {
	            	var response = JSON.parse(request.responseText);

					formElement.style.display = 'none';
					alertElement.style.display = 'none';
					roomNumberElement.innerText = 'ROOM ' + response.roomID;

	            	return res({ roomID: response.roomID, playerName: playerName });
            	}
            }
            request.open("POST", "/create", true);
            request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			request.send(`playerName=${playerName}&streamName=${streamName}`);
		});

		joinButton.addEventListener('click', ev => {
			let request = new XMLHttpRequest();

			var playerName = nameInput.value;
			var roomID = joinInput.value;

			if (!playerName) {
				alertElement.innerText = 'Please provide a player name!';
				return;
			}

            request.onload = e => {
            	if (request.status === 400) {
            		alertElement.innerText = request.responseText;
            	}
           		else {
	            	var response = JSON.parse(request.responseText);

					formElement.style.display = 'none';
					alertElement.style.display = 'none';
					roomNumberElement.innerText = 'ROOM ' + response.roomID;

	            	return res({ roomID: response.roomID, playerName: playerName });
            	}
            }
            request.open("POST", "/join", true);
            request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			request.send(`roomID=${roomID}`);
		});

		randomButton.addEventListener('click', ev => {
			let request = new XMLHttpRequest();

			var playerName = nameInput.value;

			if (!playerName) {
				alertElement.innerText = 'Please provide a player name!';
				return;
			}

            request.onload = e => {
            	if (request.status === 400) {
            		alertElement.innerText = request.responseText;
            	}
           		else {
	            	var response = JSON.parse(request.responseText);

					formElement.style.display = 'none';
					alertElement.style.display = 'none';
					roomNumberElement.innerText = 'ROOM ' + response.roomID;

	            	return res({ roomID: response.roomID, playerName: playerName });
            	}
            }
            request.open("GET", "/random", true);
			request.send();
		});
	})
}