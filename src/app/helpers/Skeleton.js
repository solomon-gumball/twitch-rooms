import { mat4, mat3 } from 'gl-matrix';

export default class Skeleton {
	constructor(options) {
		this._bindTransforms = [];
		this._localBindTransforms = [];
		this._localTransforms = [];
		this._worldTransforms = [];

		this._inverseTransforms = [];
		this._boneFinalTransforms = [];
		this._rotationTransform = [];

		this._bones;
		this._dependencies = mat4.create;

		if (options.bones) this.setBones(options.bones);
	}

	setBones(bones) {
		var bone;

		this._bones = bones;

		for (var i = 0; i < bones.length; i++) {
			bone = bones[i];

			this._localTransforms[i] = mat4.create();
			this.updateBone(i, bone.rotq, bone.pos);
			this._worldTransforms[i] = mat4.create();
			this._inverseTransforms[i] = mat4.create();
			this._boneFinalTransforms[i] = mat4.create();
			this._bindTransforms[i] = mat4.create();
			this._localBindTransforms[i] = mat4.create();
			this._localBindTransforms[i] = mat4.copy(
				this._localBindTransforms[i],
				this._localTransforms[i]
			);

			if (bone.parent === -1) {
				this._rootBone = i;
			} else {
				if (this._dependencies[bone.parent]) {
					this._dependencies[bone.parent].push(i);
				} else {
					this._dependencies[bone.parent] = [i];
				}
			}
		}

		this.calculateWorldTransforms();

		for (var i = 0; i < this._worldTransforms.length; i++) {
			mat4.copy(
				this._bindTransforms[i],
				this._worldTransforms[i]
			);
		}
	}

	transformBone(boneIndex, isRoot) {
		var childIndex;
		var childLocalTransform;
		var childWorldTransform;
		var parentWorldTransform = this._worldTransforms[boneIndex];

		if (isRoot) {
			mat4.copy(this._worldTransforms[boneIndex], this._localTransforms[boneIndex]);
		}

		if (!this._dependencies[boneIndex]) return;

		for (var i = 0; i < this._dependencies[boneIndex].length; i++) {
			childIndex = this._dependencies[boneIndex][i];
			childLocalTransform = this._localTransforms[childIndex];
			childWorldTransform = this._worldTransforms[childIndex];

			mat4.multiply(
				childWorldTransform,
				parentWorldTransform,
				childLocalTransform
			);

			this.transformBone(this._dependencies[boneIndex][i]);
		}
	}

	calculateWorldTransforms() {
		this.transformBone(this._rootBone, true);
	}

	calculateRelativeMatrices() {
		for (var i = 0; i < this._worldTransforms.length; i++) {
			mat4.invert(
				this._inverseTransforms[i],
				this._worldTransforms[i]
			);

			mat4.multiply(
				this._boneFinalTransforms[i],
				this._bindTransforms[i],
				this._inverseTransforms[i]
			);
		}
	}

	updateBone(boneId, quaternion, position) {
		this._localTransforms[boneId] = mat4.fromRotationTranslation(
			this._localTransforms[boneId],
			quaternion,
			position
		);
	}

	calculateBoneTransforms() {
		this.calculateWorldTransforms();
		this.calculateRelativeMatrices();

		return this._boneFinalTransforms;
	}
}