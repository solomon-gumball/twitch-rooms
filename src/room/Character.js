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
		this.meshNode = node.addChild();
		this.ID = options.ID;
		this.name = options.name;
		this.position = options.position;
		this.rotation = options.rotation;

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
					this.mesh.setUniform('u_boneMatrices[5]', Character.SKELETON.update(boneTransforms, time));
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
			.setBaseColor(new Color('pink'))
			.setPositionOffset(Character.MATERIALS.SKELETON)
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
			.setPosition(0, -400, 0);

		this.element = new DOMElement(this.labelNode, { classes: ['character-label'] });
		this.element.setContent(options.name);

		/*
			Create chat bubble
		*/

		this.chatBubbleNode = this.node.addChild()
			.setSizeMode(2, 2, 2)
			.setAlign(0.5, 0.0, 0.5)
			.setMountPoint(0.5, 0.5, 0.5)
			.setAbsoluteSize(0, 0, 0)
			.setOrigin(0.5, 0.5, 0.5)
			.setRotation(0, Math.PI, 0)
			.setProportionalSize(0, 0, 0);


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
		this.bubblePosition.set(0, 0, 0);
		this.chatBubbleNode.setSizeMode(0, 0, 0);

		this._commentVisible = false;
	}

	showComment(comment) {
		this.chatBubbleNode.setSizeMode(2, 2, 2);

		setTimeout(() => {
			this.chatBubbleNode.setSizeMode(1, 1, 1);
			var size = this.bubbleEl.getRenderSize();
			this.chatBubbleNode.setAbsoluteSize(
				size[0],
				size[1],
				size[2]
			);
		}, 20)

		this.bubblePosition.set(0, -300, 0);
		this.bubblePosition.set(0, -450, 0, {
			duration: 300,
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

		clearTimeout(this._hideTimeout);
		this._hideTimeout = setTimeout(() => this.hideComment(), 5000)
	}
}

function getSkeleton () {
	return new AnimatedSkeleton(
		JSON.parse(AssetLoader.get('obj/character.json'))
	);
}

function getGeometries() {
	var json = JSON.parse(AssetLoader.get('obj/character.json'))

	// for some reason maya normals are all fucked up...

	var normals = GeometryHelper.computeNormals(json.vertices, json.indices);

	// ...

	json.skinWeights = json.skinWeights.filter((val, i) => (i + 1) % 5);


	return new Geometry({
		buffers: [
	        { name: 'a_pos', data: json.vertices, size: 3 },
	        { name: 'a_normals', data: normals, size: 3 },
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

		// lol

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