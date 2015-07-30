export default class Timeline {
	constructor(options) {
		this.keyFrames = options.keyFrames.sort((a, b) => {
			return a < b ? a : b;
		});

		this.value = {};

		var value;
		for (var key in this.keyFrames[0]) {
			value = this.keyFrames[0][key];
			if (Array.isArray(value)) {
				this.value[key] = value.slice();
			}
		}
	}

	update(time) {
		var startFrame, endFrame;
		var progress;

		for (var i = 0; i < this.keyFrames.length; i++) {
			if (this.keyFrames[i].time > time) {
				startFrame = this.keyFrames[i - 1];
				endFrame = this.keyFrames[i];
				progress = (time - startFrame.time) / (endFrame.time - startFrame.time);
				break;
			}
		}

		for (var key in this.value) {

			// Hack for now

			if (key === "time") continue;

			if (Array.isArray(this.value[key])) {
				for (var i = 0; i < this.value[key].length; i++) {
					this.value[key][i] = endFrame[key][i] * progress + startFrame[key][i] * (1 - progress);
				}
			}

			else {
				this.value[key] = endFrame[key][i] * progress + startFrame[key][i] * (1 - progress);
			}
		}

		return this.value;
	}
}