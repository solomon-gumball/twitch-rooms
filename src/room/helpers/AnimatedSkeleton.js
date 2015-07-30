import Skeleton from './Skeleton';
import Timeline from './Timeline';

// This is hightly hardcoded because i give up

export default class AnimatedSkeleton extends Skeleton {
	constructor(json) {
		super({});

		this._boneMatrices = [];
		this._initial;

		if (json) this.fromJSON(json);
	}

	fromJSON(json) {

		if (json.bones) this.setBones(json.bones);

		var animation = json.animations[0];

		this.timeline = new Timeline({
			keyFrames: animation.hierarchy[1].keyFrames
		});
		this.timeline2 = new Timeline({
			keyFrames: animation.hierarchy[3].keyFrames
		});
	}

	update(out, time) {
		if (!this._initial) {
			this._initial = time;
		}

		var progressTime = (time - this._initial) * 0.006 % 3.35;

		var bone1 = this.timeline.update(progressTime);
		var bone2 = this.timeline2.update(progressTime);

		this.updateBone(3, bone2.rot, bone2.pos);
		this.updateBone(1, bone1.rot, bone1.pos);

		return mergeArrays(out, this.calculateBoneTransforms());
	}
}

function mergeArrays(out, arraysArray) {
	out.length = 0;

	for (var i = 0; i < arraysArray.length; i++) {
		out.push.apply(out, arraysArray[i]);
	}

	return out;
}