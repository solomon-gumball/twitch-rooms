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
import AnimatedSkeleton from './helpers/AnimatedSkeleton';
import GeometryHelper from 'famous/webgl-geometries/GeometryHelper';

export class Character extends EventEmitter {
	constructor(node, options) {
		super();

		this.node = node;
		this.color = options.color;
		this.meshNode = node.addChild();
		this.ID = options.ID;
		this.name = options.name;
		this.position = options.position;
		this.rotation = options.rotation;

		/*
			Set size and position
		*/
		this.receive({
			position: options.position,
			rotation: options.rotation
		});

		if (!options.isPlayer) renderSelf.call(this, options);
	}

	receive(input) {
		this.state = input;

		this.node.setPosition(input.position[0], input.position[1], input.position[2]);
		this.node.setRotation(input.rotation[0], input.rotation[1], input.rotation[2]);
	}

	hideComment() {
		this.bubblePosition.set(0, -200, 0);

		this.frontBubbleNode.setSizeMode(0, 0, 0);
		this.backBubbleNode.setSizeMode(0, 0, 0);

		this.frontBubbleNode.setOpacity(0);
		this.backBubbleNode.setOpacity(0);

		this._commentVisible = false;
	}

	showComment(comment) {
		
		this.hideComment();

		this.frontBubbleNode.setSizeMode(2, 2, 2);
		this.backBubbleNode.setSizeMode(2, 2, 2);

		this._commentVisible = true;

		this.frontBubbleEl
			.setContent(comment.content);

		this.backBubbleEl
			.setContent(comment.content);

		clearTimeout(this._hideTimeout);
		clearTimeout(this._renderTimeout);

		this._renderTimeout = setTimeout(() => this.handleTextRender(), 1000)
		this._hideTimeout = setTimeout(() => this.hideComment(), 6000)
	}

	handleTextRender() {
		var sizeFront = this.frontBubbleEl.getRenderSize();
		var sizeBack = this.backBubbleEl.getRenderSize();

		sizeFront[0] += 30;
		sizeFront[1] += 30;
		sizeBack[0] += 30;
		sizeBack[1] += 30;

		this.frontBubbleEl.setCutoutState({ size: sizeFront })
		this.backBubbleEl.setCutoutState({ size: sizeBack })

		this.bubblePosition.set(0, -300, 0, {
			duration: 300,
			curve: 'outQuart'
		});

		this.frontBubbleNode.setOpacity(0);
		this.backBubbleNode.setOpacity(0);
		this.backBubbleNode.setOpacity(1, {
			duration: 700,
			curve: 'outQuart'
		});
		this.frontBubbleNode.setOpacity(1, {
			duration: 700,
			curve: 'outQuart'
		});
	}
}

function renderSelf(options) {
		this._lastMovement = 10;

		var endTime = 3.35;
		var lastTime;
		var boneTransforms = [];
		var animate = this.meshNode.addComponent({
			onUpdate: function onUpdate(time) {
				this.meshNode.requestUpdateOnNextTick(animate);

				this._lastMovement++;
				if (this._lastMovement < 5) {
					lastTime = time;
					this.mesh.setUniform(
						'u_boneMatrices[5]',
						Character.SKELETON.update(
							boneTransforms,
							time
						)
					);
				}

			}.bind(this),

			onTransformChange: function onTransformChange() {
				this._lastMovement = 0;
			}.bind(this)
		});

		this.meshNode.requestUpdate(animate);

		/*
			Set mesh and OBJGeometry
		*/

		this.mesh = new Mesh(this.meshNode)

		Character.GEOMETRY = Character.GEOMETRY || getGeometries();
		Character.SKELETON = Character.SKELETON || getSkeleton();

		this.mesh
			.setGeometry(Character.GEOMETRY)
			.setBaseColor(new Color(this.color))
			.setPositionOffset(Character.MATERIALS.SKELETON)

		/*
			Create character label
		*/

		this.labelNodeBack = this.node.addChild()
			.setSizeMode(1, 1, 1)
			.setAlign(0.5, -2.7, 0.5)
			.setMountPoint(0.5, 0.5, 0.5)
			.setOrigin(0.5, 0.5, 0.5)
			.setAbsoluteSize(100, 20, 0)

		this.labelNodeFront = this.node.addChild()
			.setSizeMode(1, 1, 1)
			.setAlign(0.5, -2.7, 0.5)
			.setMountPoint(0.5, 0.5, 0.5)
			.setOrigin(0.5, 0.5, 0.5)
			.setAbsoluteSize(100, 20, 0)
			.setRotation(0, Math.PI, 0)

		this.labelFrontEl = new DOMElement(this.labelNodeFront, { classes: ['character-label'] });
		this.labelFrontEl.setContent(options.name);

		this.labelBackEl = new DOMElement(this.labelNodeBack, { classes: ['character-label'] });
		this.labelBackEl.setContent(options.name);

		/*
			Create chat bubble
		*/

		this.chatBubbleNode = this.node.addChild()
			.setAlign(0.5, 0.0, 0.5)
			.setProportionalSize(0, 0, 0)
			.setMountPoint(0.5, 1, 0.5)

		this.frontBubbleNode = this.chatBubbleNode.addChild()
			.setSizeMode(2, 2, 2)
			.setMountPoint(0.5, 1, 0)
			.setAbsoluteSize(0, 0, 0)
			.setOrigin(0.5, 0.5, 0.5)
			.setRotation(0, Math.PI, 0)
			.setProportionalSize(0, 0, 0)

		this.backBubbleNode = this.chatBubbleNode.addChild()
			.setSizeMode(2, 2, 2)
			.setAbsoluteSize(0, 0, 0)
			.setMountPoint(0.5, 1, 0)
			.setOrigin(0.5, 0.5, 0.5)
			.setPosition(0, 0, 0)
			.setRotation(0, 0, 0)
			.setProportionalSize(0, 0, 0);

		this.backBubbleEl = new DOMElement(this.backBubbleNode, {
			tagName: 'span',
			classes: ['chat-bubble']
		});

		this.frontBubbleEl = new DOMElement(this.frontBubbleNode, {
			tagName: 'span',
			classes: ['chat-bubble']
		});

		this.bubbleOpacity = new Opacity(this.chatBubbleNode)
		this.bubblePosition = new Position(this.chatBubbleNode);
		this.hideComment();
		this._hideTimeout;
}

function getSkeleton () {
	return new AnimatedSkeleton(
		JSON.parse(AssetLoader.get('obj/character-new.json'))
	);
}

function getGeometries() {
	var json = JSON.parse(AssetLoader.get('obj/character-new.json'))

	// for some reason maya normals are all fucked up...

	// var normals = GeometryHelper.computeNormals(json.vertices, json.indices);

	// ...

	json.skinWeights = json.skinWeights.filter((val, i) => (i + 1) % 5);


	return new Geometry({
		buffers: [
	        { name: 'a_pos', data: json.vertices, size: 3 },
	        { name: 'a_normals', data: [], size: 3 },
	        { name: 'indices', data: json.indices, size: 1 },
	        { name: 'a_weight', data: json.skinWeights, size: 4 }
		]
	});
}

Material.registerExpression('skeleton', {
	glsl: 'addBoneOffset(a_pos);',
	output: 3,
	defines: `vec3 addBoneOffset(in vec3 pos) {
		vec3 bonedPos = vec3(0.0);
		vec4 pos4 = vec4(pos, 1.0);

		float weightSum = 0.0;
		for (int i = 0; i < 4; i++) {
			weightSum += a_weight[i];
			bonedPos += (u_boneMatrices[i] * pos4 * a_weight[i]).xyz;
		}

		float finalWeight = 1.0 - weightSum;
		bonedPos += (u_boneMatrices[4] * pos4 * finalWeight).xyz;

		return bonedPos;
	}`
});

Character.MATERIALS = {
	SKELETON: Material.skeleton([], {
		uniforms: {
			'u_boneMatrices[5]': [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
		},
		attributes: {
			'a_weight': [0, 0, 0, 0]
		}
	})
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