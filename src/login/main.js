var createButton = document.getElementById('create-button');
var joinButton = document.getElementById('join-button');

var createInput = document.getElementById('stream-name');
var nameInput = document.getElementById('player-name');
var joinInput = document.getElementById('room-key');

var formElement = document.getElementById('start-form');

export default function Login() {
	return new Promise((res, rej) => {

		createButton.addEventListener('click', ev => {
			let request = new XMLHttpRequest();

			var playerName = nameInput.value;
			var streamName = createInput.value;

            request.onload = () => {
            	var response = JSON.parse(request.responseText);

				formElement.style.display = 'none';

            	res({ roomID: response.roomID, playerName: playerName });
            }
            request.open("POST", "/create", true);
            request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			request.send(`playerName=${playerName}&streamName=${streamName}`);
		});

		joinButton.addEventListener('click', ev => {
			var playerName = nameInput.value;
			var roomID = joinInput.value;

			formElement.style.display = 'none';
			res({ roomID: roomID, playerName: playerName });
		});
	})
}