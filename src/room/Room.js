import DynamicGeometry from 'famous/webgl-geometries/DynamicGeometry';
import DOMElement from 'famous/dom-renderables/DOMElement';
import Material from 'famous/webgl-materials/Material';
import Mesh from 'famous/webgl-renderables/Mesh';
import TextureRegistry from 'famous/webgl-materials/TextureRegistry';
import EventEmitter from './base/event-emitter';
import OBJLoader from 'famous/webgl-geometries/OBJLoader';
import AssetLoader from './helpers/asset-loader';
import Geometry from 'famous/webgl-geometries/Geometry';
import Color from 'famous/utilities/Color';
import PointLight from 'famous/webgl-renderables/lights/PointLight';
import AmbientLight from 'famous/webgl-renderables/lights/AmbientLight';
import GeometryHelper from 'famous/webgl-geometries/GeometryHelper';
import PlaneGeometry from 'famous/webgl-geometries/primitives/Plane';
import CubeGeometry from 'famous/webgl-geometries/primitives/Box';

export class Room extends EventEmitter{
	constructor(node, options) {
		super();

		this.buildGeometries(node);

		this.screenNode = node.addChild()
			.setAlign(0.5, 0.643, 0.06)
			.setMountPoint(0.5, 1.0, 0.5)
			.setProportionalSize(0.6, 0.28, 0.0);

		this.screen = new Screen(this.screenNode);

		this.lightNode = node.addChild()
			.setOrigin(0.5, 0.5, 0.5)
			.setAlign(0.5, 0.5, 0.2)
			.setProportionalSize(0.1, 0.1, 0.1)

		this.backlightNode = node.addChild()
			.setAlign(0.5, 0.8, 0.9);

		this.light = new PointLight(this.lightNode)
			.setColor(new Color([100, 100, 100]));

		this.ambientLight = new AmbientLight(node.addChild())
			.setColor(new Color([175, 175, 175]))
	}

	buildGeometries(node) {
		var models = {
			screen: {
				URL: 'obj/room-screen-model.json',
				material: {
					color: [30, 30, 30]
				},
				align: [0, -0.03, 0.02]
			},
			walls: {
				URL: 'obj/room-walls-model.json',
				material: {
					texture: 'images/curtain.png'
				},
				align: [0, 0.1, 0.0]
			},
			floor: {
				URL: 'obj/room-floor-model.json',
				material: {
					texture: 'images/carpet.png'
				},
				align: [0, 0.25, 0.5]
			}
		};

		var out = {};


		var modelURL, geometry, meshNode, mesh, model, material;
		for (var modelName in models) {
			model = models[modelName];
			modelURL = model.URL;
			geometry = AssetLoader.get(modelURL);
			geometry = JSON.parse(geometry);
			geometry.normals = GeometryHelper.computeNormals(geometry.vertices, geometry.indices);

			if (modelName === 'walls') {
				geometry = new CubeGeometry();
				// geometry.spec.bufferValues[1] = geometry.spec.bufferValues[1].map(function(val, i) {
				// 	return i % 2 ? val * 0.1 : val;
				// 	return val;
				// })
			}

			else {
				geometry = new Geometry({
					buffers: [
					    { name: 'a_texCoord', data: geometry.uvs, size: 2 },
				        { name: 'a_pos', data: geometry.vertices, size: 3 },
				        { name: 'a_normals', data: geometry.normals, size: 3 },
				        { name: 'indices', data: geometry.indices, size: 1 }
					]
				});
			}

			material = model.material.color ? new Color(model.material.color) : new Material.image(
				[],
				{
					texture: TextureRegistry.register(
						null,
						model.material.texture,
					{
						flipYWebgl: true,
						wrapS: 'REPEAT',
						wrapT: 'REPEAT',
						mipmap: true
					})
				}
			);

			meshNode = node.addChild()
				.setAlign(model.align[0], model.align[1], model.align[2])

			mesh = new Mesh(meshNode)
				.setGeometry(geometry)
				.setBaseColor(material);

			if (modelName === 'walls') {
				mesh.setDrawOptions({
					side: 'back'
				});

				meshNode
					.setProportionalSize(0.8, 0.6, 1)
					.setAlign(0.1, 0.2, 0.5)
			}
		}

		return out;
	}
}


function Screen (node) {
	var fidelity = 0.1;

	this.screenNode = node.addChild()
		.setAlign(0, -0.1, 0)
		.setProportionalSize(fidelity, fidelity, 0)
		.setScale(1 / fidelity, 1 / fidelity, 1);

	this.headerNode = node.addChild()
		.setProportionalSize(1, 0.15, 0)
		.setAlign(0, .98, 0)

	this.headerEl = new DOMElement(this.headerNode, {
		classes: ['stream-header'],
		content: 'twitch.tv/...'
	});

	this.screenEl = new DOMElement(this.screenNode, {
		tagName: 'iframe',
		attributes: {
			frameborder: 0,
			scrolling: 'no',
			type: 'text/html',
			height: 378,
			width: 620
		},
		properties: {
			pointerEvents: 'none'
		}
	});
}

Screen.prototype.setTwitchStream = function setTwitchStream(streamName) {
	this.screenEl
		// .setAttribute('src', `https://www.youtube.com/embed/5AUdYd1scrM?autoplay=1`)
		.setAttribute('src', `http://player.twitch.tv/?channel=${streamName}`)
		.setAttribute('muted');

	this.headerEl
		.setContent(`twitch.tv/${streamName}`)

	// hack to make sure attribute loads without context resize

	this.screenNode
		.setSizeMode(1, 1, 1)
		.setSizeMode(0, 0, 0)
} 

Room.TEXTURES = {
	FLOOR: 'images/tile2.jpg'
}