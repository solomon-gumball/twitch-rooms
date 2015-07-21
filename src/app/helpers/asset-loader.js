var AssetLoader = {
	_storage: {},

	get: (key) => AssetLoader._storage[key],

	load: ({ fromURL }) => {
		let promises = [];

		if (Array.isArray(fromURL)) {
			for (var i = 0; i < fromURL.length; i++) {
				promises.push(AssetLoader._fromURL(fromURL[i]));
			}
		}

		return new Promise((res, rej) => {
			Promise.all(promises).then((assets) => {
				assets.forEach((asset, i) => AssetLoader._storage[fromURL[i]] = asset)
				res(assets);
			});
		});
	},

	_fromURL: (url) => {
		return new Promise((res, rej) => {
            let request = new XMLHttpRequest();
            request.onload = () => res(request.responseText);
            request.open("get", url, true);
            request.send();
		});
	}
}

export default AssetLoader;