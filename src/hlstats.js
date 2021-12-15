let getThisPage = () => {
	let res = {
		type: null,
		playerId: null,
		site: null,
		section: null
	};

	var params = new URLSearchParams(location.search);
	res.type = params.get("mode") || "index";
	res.playerId = params.get("player");

	// We can use some cool new javascript trickery, but meh
	// res.site = sites_config.sites.filter(site => site.sections.filter(section => section.hlstats == thisBase));
	var thisBase = document.location.href.split('?')[0];
	for (let site of sites_config.sites) {
		for (let section of site.sections) {
			if (section.hlstats === thisBase) {
				res.site = site;
				res.section = section;
			}
		}
	}

	return res;
};
const doRow = (tr) => {
	if (!tr)
		return;

	let rowDate = new Date(tr.children[0].innerText);
	let rowServer = tr.children[3].innerText;
	let rowMap = tr.children[4].innerText;

	let rowServerEntry = thisPage.section.servers.find(el => el.name === rowServer);

	if (!rowServerEntry)
		doRow(tr.nextElementSibling);

	chrome.runtime.sendMessage(chrome.runtime.id, {
		action: 'GetGOTVRecord',
		gotvurl: rowServerEntry.demos,
		date: rowDate
	}, function(data, error) {
		var link = rowServerEntry.demos;
		var img = chrome.runtime.getURL("icons/clock.svg");

		if (!error && data && data.map == rowMap && Math.abs(rowDate - new Date(data.date)) < 180 * 60 * 1000) {
			link = data.demo;
			img = chrome.runtime.getURL("icons/download.png");
		}

		let td = document.createElement('td');
		let linkEl = document.createElement('a');
		linkEl.href = link;
		let imgEl = document.createElement('img');
		imgEl.src = img;
		imgEl.style.height = "1em";
		linkEl.insertBefore(imgEl, null);
		td.insertBefore(linkEl, null);
		td.style.textAlign = "center";
		tr.insertBefore(td, null);

		doRow(tr.nextElementSibling);
	});
}
let doPlayerHistory = () => {
	let table = document.querySelector("table.data-table");
	for (let tr of table.querySelectorAll("tr")) {
		if (tr.className == "data-table-head") {
			let td = document.createElement('td');
			td.className = "fSmall";
			td.innerHTML = "GOTV";
			tr.insertBefore(td, null);
		} else {
			doRow(tr);
			break;
		}
	}
};
let doPlayerInfo = (tries) => {
	let sidfield = document.querySelector("table.data-table > tbody > tr:nth-child(4) > td");
	// player info is loaded and inserted by AJAX and we cannot hook Tabs.updateTab from our extension
	if (!sidfield && (!tries || tries < 10)) {
		setTimeout(doPlayerInfo.bind(null, (tries + 1) || 0), 200);
		return;
	}
	var sidlink = sidfield.querySelector("a");
	sidlink.outerHTML = `<span>${sidlink.innerText}</span>`;
	processSIDsInDocument(sidfield);
}
let loadServerNames = (cb, section) => {
	section = section || thisPage.section;
	chrome.runtime.sendMessage(chrome.runtime.id, {
		action: 'GetServers',
		hlstats: section.hlstats,
		ips: section.servers.map(el => el.ip)
	}, function(data, error) {
		if (error || !data)
			return;
		for (let server of section.servers) {
			if (server.name)
				continue;
			var entry = data.find(el => el.ip === server.ip);
			if (entry)
				server.name = entry.name;
		}
		cb();

	});
}
let doPage = () => {
	if (thisPage.type == "playerhistory")
		loadServerNames(doPlayerHistory);
	else if (thisPage.type == "playerinfo") {
		doPlayerInfo();
	}
}

var thisPage = getThisPage();
doPage();
