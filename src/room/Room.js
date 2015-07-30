import DynamicGeometry from 'famous/webgl-geometries/DynamicGeometry';
import DOMElement from 'famous/dom-renderables/DOMElement';
import Material from 'famous/webgl-materials/Material';
import Mesh from 'famous/webgl-renderables/Mesh';
import TextureRegistry from 'famous/webgl-materials/TextureRegistry';
import ChatWindow from './chat/ChatWindow';
import EventEmitter from './base/event-emitter';
import OBJLoader from 'famous/webgl-geometries/OBJLoader';
import AssetLoader from './helpers/asset-loader';
import Geometry from 'famous/webgl-geometries/Geometry';
import Color from 'famous/utilities/Color';
import PointLight from 'famous/webgl-renderables/lights/PointLight';
import AmbientLight from 'famous/webgl-renderables/lights/AmbientLight';

export class Room extends EventEmitter{
	constructor(node, options) {
		super();

		var material = new Material.image(
			[],
			{
				texture: TextureRegistry.register(
					'wall-texture',
					'images/planks-minecraft.png',
				{
					wrapS: 'REPEAT',
					wrapT: 'REPEAT'
				})
			}
		);

		this.meshNode = node.addChild();
		this.mesh = new Mesh(this.meshNode)
			.setGeometry(getGeometry())
			.setBaseColor(material);

		this.screenNode = node.addChild()
			.setAlign(0.5, 0.6, 0.14)
			.setMountPoint(0.5, 1.0, 0.5)
			.setProportionalSize(0.4, 0.2, 0);

		this.screen = new Screen(this.screenNode);

		this.lightNode = node.addChild()
			.setOrigin(0.5, 0.5, 0.5)
			.setAlign(0.5, 0.5, 0.15)
			.setProportionalSize(0.1, 0.1, 0.1)

		this.backlightNode = node.addChild()
			.setAlign(0.5, 0.8, 0.9);

		this.light = new PointLight(this.lightNode)
			.setColor(new Color([100, 100, 100]));

		this.ambientLight = new AmbientLight(node.addChild())
			.setColor(new Color([175, 175, 175]))
			
		this.chatWindowNode = node.addChild()
			.setAlign(0.86, 0.5, 0.1)
			.setMountPoint(0.5, 0.5, 0.5)
			.setProportionalSize(0.22, 0.27, 0)
			.setRotation(0, 0, 0);

		this.chatWindow = new ChatWindow(this.chatWindowNode);
	}
}

function getGeometry() {
	var geometries = OBJLoader.formatText(
		AssetLoader.get('obj/room2.obj'),
		{
			normalize: true
		}
	);

	return new Geometry({
		buffers: [
		    { name: 'a_texCoord', data: geometries[0].textureCoords, size: 2 },
	        { name: 'a_pos', data: geometries[0].vertices, size: 3 },
	        { name: 'a_normals', data: geometries[0].normals, size: 3 },
	        { name: 'indices', data: geometries[0].indices, size: 1 }
		]
	});
}

function Screen (node) {
	this.node = node;

	this.element = new DOMElement(node, {
		tagName: 'iframe',
		attributes: {
			frameborder: 0,
			scrolling: 'no',
			height: 378,
			width: 620
		},
		properties: {
			pointerEvents: 'none'
		}
	});
}

Screen.prototype.setTwitchStream = function setTwitchStream(streamName) {
	this.element
		.setAttribute('src', `http://www.twitch.tv/${streamName}/embed`);

	// hack to make sure attribute loads without context resize
	
	this.node
		.setSizeMode(1, 1, 1)
		.setSizeMode(0, 0, 0)
} 

Room.TEXTURES = {
	FLOOR: 'images/tile2.jpg'
}