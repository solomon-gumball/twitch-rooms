'use strict';

import KeyHandler from './room/inputs/KeyHandler';
import startApp from './room/index';
import handleLogin from './login/main';
import testBrowserCompatability from './browserCompatability';
const THREE = require('three');

const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );

camera.position.z = 1000;

testBrowserCompatability();

/*
	Famo.us boilerplate
*/

KeyHandler.init();

onUpdate();

function onUpdate () {

	// Update systems
	renderer.render(scene, camera);
	KeyHandler.update();

	requestAnimationFrame(onUpdate);
}

handleLogin()
	.then(options => startApp(
		options,
		scene
	));
