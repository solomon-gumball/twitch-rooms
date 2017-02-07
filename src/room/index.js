const THREE = require('three');

export default function initialize(options, scene) {

	const geometry = new THREE.BoxGeometry( 200, 200, 200 );
	const material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
	const mesh = new THREE.Mesh( geometry, material );

	scene.add( mesh );

	const socket = io.connect(undefined, {
		query: `roomID=${options.roomID}&playerName=${options.playerName}`
	});

	const playersLocal = [];

	console.log(options)

	socket.on('initialize-player', (msg) => {

		/*
			Initialize player
		*/
		const { stream, player } = msg;
		const options = {
			width: 854,
			height: 480,
			channel: stream,
		};
		const videoPlayer = new Twitch.Player('twitch-container', options);
		videoPlayer.setVolume(0.5);

		playersLocal[player.ID] = player;

		/*
			Add player to scene
		*/

		socket.on('chat-entry', function(entry) {

		});

		socket.on('remove-player', function(message) {
			playersLocal[message.ID] = null;
		});

		/*
			Add socket listeners
		*/

		socket.on('update-frame', function(players){
			var i = players.length;

			while (i--) {
				var target = players[i];

				/*
					If self, do not update
				*/

				if (target.ID === player.ID) {
					continue;
				}

				/*
					If new entry, create player
				*/

				else if (!playersLocal[target.ID]) {
					// playersLocal[target.ID] = new Character(target);
				}

				/*
					Update character
				*/

				// playersLocal[target.ID].receive(players[i]);
			}
		});
	});
}
