const getThisPage = () => {
	const res = {
		type: null,
		playerId: null,
		site: null,
		section: null
	};

	const params = new URLSearchParams(location.search);
	res.type = params.get("mode") || "index";
	res.playerId = params.get("player");

	// We can use some cool new javascript trickery, but meh
	// res.site = sites_config.sites.filter(site => site.sections.filter(section => section.hlstats == thisBase));
	const thisBase = document.location.href.split('?')[0];
	for (let site of sites_config.sites) {
		for (let section of site.sections) {
			if (section.hlstats === thisBase) {
				res.site = site;
				res.section = section;
				break;
			}
		}
	}

	return res;
}

const doHistoryRow = (tr) => {
	if (!tr)
		return;

	const rowDate = new Date(tr.children[0].innerText);
	const rowServer = tr.children[3].innerText;
	const rowMap = tr.children[4].innerText;

	const rowServerEntry = thisPage.section.servers.find(el => el.name === rowServer);
	if (!rowServerEntry)
		doHistoryRow(tr.nextElementSibling);

	chrome.runtime.sendMessage(chrome.runtime.id, {
		action: 'GetGOTVRecord',
		gotvurl: rowServerEntry.demos,
		date: rowDate
	}, function(data, error) {
		let link = rowServerEntry.demos;
		let img = chrome.runtime.getURL("icons/clock.svg");

		// For cases where the map name is left empty in HLstats, try to match using date and server name only.
		// A difference of more than 3 hours is unlikely (and there'd be something wrong with it).
		if (!error && data && (data.map == rowMap || rowMap.length === 0) && Math.abs(rowDate - new Date(data.date)) < 180 * 60 * 1000) {
			link = data.demo;
			img = chrome.runtime.getURL("icons/download.png");
		}

		const td = document.createElement('td');
		const linkEl = document.createElement('a');
		linkEl.href = link;
		const imgEl = document.createElement('img');
		imgEl.src = img;
		imgEl.style.height = "1em";
		linkEl.insertBefore(imgEl, null);
		td.insertBefore(linkEl, null);
		td.style.textAlign = "center";
		tr.insertBefore(td, null);

		doHistoryRow(tr.nextElementSibling);
	});
}

const doPlayerHistory = () => {
	const table = document.querySelector("table.data-table");
	for (const tr of table.querySelectorAll("tr")) {
		if (tr.className === "data-table-head") {
			const td = document.createElement('td');
			td.className = "fSmall";
			td.innerHTML = "GOTV";
			tr.insertBefore(td, null);
		} else {
			doHistoryRow(tr);
			break;
		}
	}
}

const doPlayerInfo = (tries) => {
	const sidfield = document.querySelector("table.data-table > tbody > tr:nth-child(4) > td");
	// player info is loaded and inserted by AJAX and we cannot hook Tabs.updateTab from our extension
	if (!sidfield && (!tries || tries < 10)) {
		setTimeout(doPlayerInfo.bind(null, (tries + 1) || 0), 200);
		return;
	}
	
	const sidlink = sidfield.querySelector("a");
	const wrapper = document.createElement('span');
	sidlink.before(wrapper);
	wrapper.appendChild(sidlink);

	processSIDsInDocument(sidfield);
}

const getTimeFromSessionRow = (el, month) => {
	if (month !== undefined) {
		const elMonth = parseInt(el.children[0].innerText.trim().substring(5, 7), 10);
		if (elMonth !== month)
			return -1;
	}
	
	let time = 0;
	const matches = el.children[3].innerText.trim().match(/^(\d+)d\s(\d{2}):(\d{2}):(\d{2})h$/).splice(1, 4).map(str => parseInt(str, 10));
	time += matches[0] * 24 * 60 * 60; // days
	time += matches[1] * 60 * 60; // hours
	time += matches[2] * 60; // minutes
	time += matches[3]; // seconds
	return time;
}

const doPlayerSessions = () => {
	let activity = 0;
	const thisMonth = new Date().getMonth() + 1;
	const rows = document.querySelectorAll("table.data-table tr:not(.data-table-head)");
	for (const row of rows) {
		const seconds = getTimeFromSessionRow(row, thisMonth);
		console.log(row, seconds);
		if (seconds === -1) // we've reached the first record of some previous month
			break;

		activity += seconds;
	}
	
	const contEl = document.createElement('P');
	contEl.style.marginBottom = '-1em';
	contEl.innerHTML = `<b>Celková aktivita za tento měsíc:</b> ${formatSecondsToHours(activity)}`;
	const heading = document.querySelector('.content .block .fHeading');
	heading.insertAdjacentElement('afterend', contEl);
}

const formatSecondsToHours = e => {
	const h = Math.floor(e / 3600).toString().padStart(2,'0'),
		  m = Math.floor(e % 3600 / 60).toString().padStart(2,'0'),
		  s = Math.floor(e % 60).toString().padStart(2,'0');
	
	return h + ':' + m + ':' + s;
}

// Precache server names, so we can match IPs for GOTV with names from HLstats
const loadServerNames = (cb, section) => {
	section = section || thisPage.section;
	chrome.runtime.sendMessage(chrome.runtime.id, {
		action: 'GetServers',
		hlstats: section.hlstats,
		ips: section.servers.map(el => el.ip)
	}, function(data, error) {
		if (error || !data)
			return;

		for (const server of section.servers) {
			if (server.name)
				continue;

			const entry = data.find(el => el.ip === server.ip);
			if (entry)
				server.name = entry.name;
		}
		cb();
	});
}

const thisPage = getThisPage();
if (thisPage.type === "playerhistory") {
	loadServerNames(doPlayerHistory);
} else if (thisPage.type === "playerinfo") {
	doPlayerInfo();
} else if (thisPage.type === "playersessions") {
	doPlayerSessions();
}