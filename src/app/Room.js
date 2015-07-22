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

		this.lightNode = node.addChild()
			.setOrigin(0.5, 0.5, 0.5)
			.setAlign(0.5, 0.5, 0.5)
			.setProportionalSize(0.1, 0.1, 0.1)

		this.light = new PointLight(this.lightNode)
			.setColor(new Color('white'))
			
		this.screen = new Screen(this.screenNode);

		// this.floorNode = this.node.addChild()
		// 	.setMountPoint(0.5, 0.5, 0.5)
		// 	.setAlign(0.5, 1.0, 0.5)
		// 	.setOrigin(0.5, 0.5, 0.5)
		// 	.setRotation(Math.PI / 2, 0, 0);

		// this.screenNode = this.node.addChild()
		// 	.setAlign(0.5, 0.75, 0)
		// 	.setMountPoint(0.5, 0.5, 0.5)
		// 	.setProportionalSize(1, 0.5, 0)

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
	// this.element = new DOMElement(node, {
	// 	tagName: 'iframe',
	// 	attributes: {
	// 		frameborder: 0,
	// 		scrolling: 'no',
	// 		// height: 378,
	// 		// width: 620,
	// 		height: 600,
	// 		width: 1100,
	// 		src: "http://www.twitch.tv/pokernighttv/embed"
	// 	},
	// 	properties: {
	// 		pointerEvents: 'none'
	// 	}
	// });

	// node.el = new DOMElement(node)
	// 	.setProperty('background-color', 'blue');
}

Room.TEXTURES = {
	FLOOR: 'images/tile2.jpg'
}