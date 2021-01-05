var gotvRecordsCache = [];
var hlstatsServersCache = [];
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action == 'Steam_API_Get') {
		fetch(`https://api.steampowered.com/ISteamUser/${request.verb}/v0002/?key=${request.apikey}&steamids=${request.batch.join(',')}`)
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					throw Error(`Code ${res.status}. ${res.statusText}`);
				}
			})
			.then(data => sendResponse(data))
			.catch(error => sendResponse(undefined, error));
	} else if(request.action == 'SBRequest') {
		fetch(request.sourcebans, {
			method: 'POST',
			cache: 'no-cache',
			mode: 'no-cors',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: request.data
		})
			.then(res => {
				if (res.ok) {
					return res.text();
				} else {
					throw Error(`${res.status}: ${res.statusText}`);
				}
			})
			.then(data => sendResponse(data))
			.catch(error => sendResponse(undefined, error));
	} else if (request.action == 'GetGOTVRecord') {
		const checkAndSendFeasible = (cacheRow, requestDate) => {
			var feasible = cacheRow.entries.filter(entry => entry.date < requestDate);
			if (feasible.length > 0) {
				sendResponse(feasible[feasible.length - 1]);
				return true;
			} else {
				sendResponse(null, "No feasible entries found!");
				return false;
			}
		};

		var requestDate = new Date(request.date);
		var cacheRowIdx = gotvRecordsCache.findIndex(el => el.gotvurl == request.gotvurl);

		var cacheRow = {
			gotvurl: request.gotvurl,
			cached: new Date(),
			entries: []
		};
		if (cacheRowIdx !== -1) {
			let oldRow = gotvRecordsCache[cacheRowIdx];
			if (new Date() - oldRow.cached < 2 * 60 * 1000) {
				return checkAndSendFeasible(oldRow, requestDate);
			}

			gotvRecordsCache[cacheRowIdx] = cacheRow;
		} else {
			gotvRecordsCache.push(cacheRow);
		}

		fetch(request.gotvurl, {
			mode: 'no-cors'
		})
			.then(res => {
				if (res.ok) {
					return res.text();
				} else {
					throw Error(`${res.status}: ${res.statusText}`);
				}
			})
			.then(data => {
				var ret = [];
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(data, "text/html");
				for (let gotvRow of xmlDoc.getElementById("dataTable").querySelector("tbody").querySelectorAll("tr")) {
					let demoLink = gotvRow.children[2].querySelector("a").href;
					if (cacheRow.entries.length > 0 && demoLink == cacheRow.entries[cacheRow.entries.length - 1].demo)
						break;

					let mapName = gotvRow.children[1].innerText;
					let dateStrArr = gotvRow.children[0].innerText.split(" ");
					let goodDateStr = dateStrArr[0].split(".").reverse().join('-') + 'T' + dateStrArr[1];

					cacheRow.entries.push({
						date: new Date(goodDateStr),
						map: mapName,
						demo: demoLink
					});
				}

				checkAndSendFeasible(cacheRow, requestDate);
			})
			.catch(error => sendResponse(undefined, error));
	} else if (request.action == 'GetServers') {
		var cacheRowIdx = hlstatsServersCache.findIndex(el => el.url == request.hlstats);
		var cacheRow = hlstatsServersCache[cacheRowIdx];

		if (cacheRow) {
			sendResponse(cacheRow.ret);
			return true;
		}

		fetch(request.hlstats, {
			mode: 'no-cors'
		})
			.then(res => {
				if (res.ok) {
					return res.text();
				} else {
					throw Error(`${res.status}: ${res.statusText}`);
				}
			})
			.then(data => {
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(data, "text/html");
				var ret = [];
				for (let serverRow of xmlDoc.querySelectorAll("tr.game-table-row")) {
					let name = serverRow.children[0].querySelector("b").innerText;
					let ip = serverRow.children[1].innerText.split(' ')[0];
					ret.push({
						ip: ip,
						name: name
					});
				}

				hlstatsServersCache.push({
					url: request.hlstats,
					ret: ret
				});

				return ret;
			})
			.then(data => sendResponse(data))
			.catch(error => sendResponse(undefined, error));
	}
	return true;
});

chrome.webRequest.onBeforeRequest.addListener(() => {
		return { cancel: true };
	}, {
		urls: [
			"*://banlist.gamesites.cz/csgo/*/themes/star/js/aos.js",
			"*://banlist.gamesites.cz/csgo/*/themes/star/css/aos.css",
			"*://banlist.gamesites.cz/csgo/*/themes/star/js/countTo.js"
		],
		types: ["script", "stylesheet"]
	}, ["blocking"]
);