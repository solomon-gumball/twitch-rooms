import OBJLoader from 'famous/webgl-geometries/OBJLoader';
import Geometry from 'famous/webgl-geometries/Geometry';
import Mesh from 'famous/webgl-renderables/Mesh';
import Material from 'famous/webgl-materials/Material';
import DOMElement from 'famous/dom-renderables/DOMElement';
import EventEmitter from './base/event-emitter';
import AssetLoader from './helpers/asset-loader';
import TextureRegistry from 'famous/webgl-materials/TextureRegistry';
import Color from 'famous/utilities/Color';
import Opacity from 'famous/components/Opacity';
import Position from 'famous/components/Position';

export class Character extends EventEmitter {
	constructor(node, options) {
		super();

		this.node = node;
		this.meshNode = node.addChild();
		this.ID = options.ID;
		this.position = options.position;
		this.rotation = options.rotation;

		/*
			Set mesh and OBJGeometry
		*/
		this.mesh = new Mesh(this.meshNode)

		Character.GEOMETRY = Character.GEOMETRY || getGeometries();

		this.mesh.setGeometry(Character.GEOMETRY);
		this.mesh.setBaseColor(new Color('pink'));

		/*
			Set size and position
		*/
		this.receive({
			position: options.position,
			rotation: options.rotation
		});

		/*
			Create character label
		*/

		this.labelNode = this.node.addChild()
			.setSizeMode(1, 1, 1)
			.setAlign(0.5, 0.0, 0.5)
			.setMountPoint(0.5, 0.5, 0.5)
			.setOrigin(0.5, 0.5, 0.5)
			.setAbsoluteSize(100, 20, 0)
			.setRotation(0, Math.PI, 0)
			.setPosition(0, 30, -30);

		this.element = new DOMElement(this.labelNode, { classes: ['character-label'] });
		this.element.setContent('redwoodfavorite');

		/*
			Create chat bubble
		*/

		this.chatBubbleNode = this.node.addChild()
			.setSizeMode(1, 1, 1)
			.setAlign(0.5, 0.0, 0.5)
			.setMountPoint(0.5, 0.5, 0.5)
			.setAbsoluteSize(120, 20, 0)
			.setOrigin(0.5, 0.5, 0.5)
			.setRotation(0, Math.PI, 0)

		this.bubbleEl = new DOMElement(this.chatBubbleNode, {
			classes: ['chat-bubble']
		});

		this.bubbleOpacity = new Opacity(this.chatBubbleNode);
		this.bubblePosition = new Position(this.chatBubbleNode);
		this.hideComment();
		this._hideTimeout;
	}

	receive(input) {
		this.state = input;

		this.node.setPosition(input.position[0], input.position[1], input.position[2]);
		this.node.setRotation(input.rotation[0], input.rotation[1], input.rotation[2]);
	}

	hideComment() {
		this.bubblePosition.set(0, 20, 0);
		this.chatBubbleNode.setAbsoluteSize(0, 0, 0);

		this._commentVisible = false;
	}

	showComment(comment) {
		this.chatBubbleNode.setAbsoluteSize(120, 20, 0)
		this.bubblePosition.set(0, 0, 0);
		this.bubblePosition.set(0, -20, 0, {
			duration: 700,
			curve: 'outQuart'
		});
		this.bubbleOpacity.set(0);
		this.bubbleOpacity.set(1, {
			duration: 700,
			curve: 'outQuart'
		});

		this._commentVisible = true;

		this.bubbleEl
			.setContent(comment.content)

			console.log(this._hideTimeout)
		clearTimeout(this._hideTimeout);
		this._hideTimeout = setTimeout(() => this.hideComment(), 5000)
	}
}

function getGeometries() {
	var geometries = OBJLoader.formatText(
		AssetLoader.get('obj/character2.obj'),
		{
			normalize: true,
			computeNormals: true
		}
	);

	return new Geometry({
		buffers: [
	        { name: 'a_pos', data: geometries[0].vertices, size: 3 },
	        { name: 'a_normals', data: geometries[0].normals, size: 3 },
	        { name: 'indices', data: geometries[0].indices, size: 1 }
		]
	});
}
	
Character.MATERIAL = Material.normal(
	[],
	{
		texture: TextureRegistry.register(
			'guy-texture',
			'images/guy.png',
			{
				// wrapS: 'REPEAT',
				// wrapT: 'REPEAT'
			}
		)
	}
);
Character.GEOMETRY = null;