const makeHLstatsLink = (base, sid) => {
	let url = new URL(base);
	url.searchParams.set('mode', 'search');
	url.searchParams.set('st', 'uniqueid');
	url.searchParams.set('q', sid);
	url.hash = 'autoredirect';
	return url.toString();
}

const makeSourceBansLink = (base, action, search) => {
	let url = new URL(base);
	url.searchParams.set('p', action || 'home');
	search && url.searchParams.set('searchText', search);
	return url.toString();
}

const serializeSBRequest = (verb, args) => {
	let data = `xajax=${verb}&xajaxr=${new Date().getTime()}`;
	for (let arg of args) {
		data += "&xajaxargs[]=" + encodeURIComponent(arg);
	}
	return data;
}

const banLengthToString = (m) => {
	if (m == 0)
		return '\u221e'; // infinity symbol
	let days = Math.floor(m / (60*24));
	m -= days * 60 * 24;
	let hours = Math.floor(m / 60);
	m -= hours * 60;
	res = "";
	let comp = [];
	if (days > 0)
		comp.push(days + " d");
	if (hours > 0)
		comp.push(hours + " h");
	if (m > 0)
		comp.push(m + " m");
	return comp.join(' ');
}

const renderSIDclickable = (sid) => {
	sid = sid.replace("STEAM_0", "STEAM_1");
	// ID64 = 76561197960265728 + (B * 2) + A
    // ID3 = (B * 2) + A
    // ID32 = STEAM_0:A:B
	let sidp = sid.match(/STEAM_1:([01]):(\d+)/);
	let sid3 = parseInt(sidp[2], 10) * 2 + parseInt(sidp[1]);
	let sid64 = 76561197960265728n + BigInt(sid3);

	let ret = `
		<div class="FTsteamIDcont" data-sid="${sid}" data-sid3="${sid3}" data-sid64="${sid64}">
			<div>
				<span class="sid">${sid}</span>
				<a class="utility clipboard" onclick="navigator.clipboard.writeText('${sid}')">
					<img class="utilityicon" src="${chrome.runtime.getURL("icons/clipboard.png")}" />
				</a>
				<a class="utility steamlink" href="https://steamcommunity.com/profiles/${sid64}" target="_blank">
					<img class="utilityicon" src="${chrome.runtime.getURL("icons/steam.png")}" />
				</a>
			</div>`;

	if (thisPage.section && thisPage.section.hlstats)
		ret += `
			<div class="hlstats_cont">
				<a class="utility hlstats" href="${makeHLstatsLink(thisPage.section.hlstats, sid)}" target="_blank">
					<img class="utilityicon" src="${chrome.runtime.getURL("icons/hlstats.png")}" />
				</a>
			</div>`;

	if (thisPage.section && thisPage.section.sourcebans)
		ret += `
			<div class="sourcebans_cont">
				<a class="utility sourcebans" href="${makeSourceBansLink(thisPage.section.sourcebans, 'banlist', sid)}" target="_blank">
					<img class="utilityicon" src="${chrome.runtime.getURL("icons/sourcebans_ban.png")}" />
				</a>
				<a class="utility sourcebans" href="${makeSourceBansLink(thisPage.section.sourcebans, 'commslist', sid)}" target="_blank">
					<img class="utilityicon" src="${chrome.runtime.getURL("icons/sourcebans_chat.png")}" />
				</a>`;

	if (thisPage.section && thisPage.section.banOrder) {
		ret += `<div class="banmenucont">
					<ul class="banmenu">
						<input type="text" placeholder="Player's nickname" name="playername" />`;

		thisPage.section.banOrder.forEach(banEntry => {
			let reason = banEntry.reason;
			if (thisPage.forumSection && thisPage.forumSection.shortname) {
				reason += " / " + thisPage.forumSection.shortname;
			}

			ret += `<li data-time='${banEntry.time}' data-type='${banEntry.type}' data-reason='${reason}'>`;

			let iconuri = null;
			if (banEntry.icon) {
				iconuri = banEntry.icon;
			}
			if (thisPage.section.banIcons && thisPage.section.banIcons.has(banEntry.type)) {
				iconuri = thisPage.section.banIcons.get(banEntry.type);
			}
			if (!iconuri) {
				if (banEntry.type == SB_VOICE) {
					iconuri = "icons/sourcebans_voice.png";
				} else if (banEntry.type == SB_CHAT || banEntry.type == SB_CHAT_AND_VOICE) {
					iconuri = "icons/sourcebans_chat.png";
				} else if (banEntry.type == SB_GAME) {
					iconuri = "icons/sourcebans_bans.png";
				}
			}
			if (iconuri) {
				ret += `<img src="${chrome.runtime.getURL(iconuri)}" />`
			}
			ret += `<span class="reason">${banEntry.reason.replace(/\s\/\sPP$/, '')}</span> <span class="time">(${banLengthToString(banEntry.time)})</span></li>\n`;
		});

		ret += `</ul></div>`;
		ret += `
				<a class="utility banplayer">
					<img class="utilityicon" src="${chrome.runtime.getURL("icons/ban_hammer.png")}" />
				</a>
		`;
	}
	ret += `
			</div>
		</div>
	`;

	return ret;
}

const handleSIDTextNode = (textNode) => {
	let origText = textNode.textContent;
	let newHtml = origText.replace(/STEAM_[0-5]:[01]:\d+/g, a => renderSIDclickable(a));
	if (newHtml === origText)
		return;

	let parentAnchor = textNode.parentNode.closest('a');
	if (parentAnchor) {
		parentAnchor.removeAttribute('href');

	}

	let newSpan = document.createElement('span');
	newSpan.innerHTML = newHtml;
	newSpan.style.display = 'inline';

	textNode.replaceWith(newSpan);

	for (let fttool of newSpan.querySelectorAll('div.FTsteamIDcont')) {
		addListenersToWidget(fttool);
	}
}

// TODO: Open the "Sign in through Steam" directly for banlists that implement it.
const openBanlistLoginPage = (index) => {
	window.open(makeSourceBansLink(index, 'login'), '_blank');
}

const addListenersToWidget = fttool => {
	const { sid, sid64 } = fttool.dataset;

	let banPlayerButton = fttool.querySelector('a.utility.banplayer');
	let menu = fttool.querySelector('ul.banmenu');
	if (!banPlayerButton || !menu)
		return;

	let nickInput = menu.querySelector('input[name=playername]');
	banPlayerButton.addEventListener('click', event => {
		fttool.classList.toggle('banmenu-open');

		if (nickInput.value.length < 1) {
			nickInput.value = '   ';
			chrome.runtime.sendMessage(chrome.runtime.id, {
				action: 'Steam_API_Get',
				verb: 'GetPlayerSummaries',
				apikey: apikey,
				batch: [sid64.toString()]
			}, (data, error) => {
				if (!error && data) {
					nickInput.value = data.response.players[0].personaname;
				}
			});
		}
	}, false);

	const ShowBox = (title, msg, color, redir, noclose, append) => {
		if (color === 'red')
			color = 'error';
		else if (color === 'blue')
			color = 'info';
		else if (color === 'green')
			color = 'ok';
		else
			color = 'default';

		menu.innerHTML = `
			<div class="boxmsg ${color}">
				<div class="title">${title}</div>
				<div class="msg">${msg}</div>
				${append || ""}
			</div>
		`;
	};

	menu.addEventListener('click', event => {
		const li = event.target.closest('li');
		if (!li)
			return;

		let { time, reason, type } = li.dataset;
		if (!(time && reason && type)) {
			alert("Chyba! Kontaktujte vývojára.");
			throw Error("Invalid ban entry!");
		}
		type = parseInt(type);

		// only allow public posts to be attached as PP URLs
		const ppUrl = (!thisPage.isAdminSection && fttool.closest('.post .postbody')?.querySelector(':scope > .author > a:first-child')?.href) || '';
		
		let tosend;
		if (type === SB_GAME) {
			tosend = serializeSBRequest("AddBan", [
				nickInput.value,
				0,	// type - Steam ID ban
				sid,
				"", // ip
				time,
				0, // demo file
				"", // demo file name
				reason,
				"", // fromsub
				ppUrl,
			]);
		} else {
			tosend = serializeSBRequest("AddBlock", [
				nickInput.value,
				type,
				sid,
				time,
				reason,
				ppUrl
			]);
		}

		chrome.runtime.sendMessage(chrome.runtime.id, {
			action: 'SBRequest',
			sourcebans: thisPage.section.sourcebans,
			data: tosend
		}, (data, error) => {
			if (error || !data) {
				ShowBox("Request failed", error ? error : "Unknown error. (timed out?)", 'red');
				return;
			}

			let parser = new DOMParser();
			let xmlDoc = parser.parseFromString(data, 'text/xml');
			let xmlRoot = xmlDoc.getElementsByTagName("xjx");
			if (xmlRoot.length < 1) {
				alert("Chyba! Jsi přihlášen?");
				return;
			}

			for (let el of xmlRoot[0].getElementsByTagName("cmd")) {
				if (el.attributes.n.value === "al") { // alert
					if (['Unknown Function AddBlock.', 'Unknown Function AddBan.'].includes(el.innerHTML)) { // known messages for anonymous users
						openBanlistLoginPage(thisPage.section.sourcebans);
						continue;
					}
				} else if (el.attributes.n.value !== "js") { // not a JS code to eval
					continue;
				}

				if (['ShowBox', 'ShowKickBox', 'ShowBlockBox'].filter((x) => el.innerHTML.startsWith(x)).length < 1)
					continue;

				let sb_f = new Function('ShowBox', 'ShowKickBox', 'ShowBlockBox', el.innerHTML);

				const ShowKickBox = (check, type)  =>{
					ShowBox('Ban Added',
							'The ban has been successfully added<br>',
							'green',
							'index.php?p=admin&c=bans',
							true,
							`<iframe src="${thisPage.section.sourcebans}/pages/admin.kickit.php?check=${check}&type=${type}"></iframe>`);

				};

				const ShowBlockBox = (check, type, length) => {
					ShowBox('Block Added',
							'The block has been successfully added<br>',
							'green',
							'index.php?p=admin&c=comms',
							true,
							`<iframe src="${thisPage.section.sourcebans}/pages/admin.blockit.php?check=${check}&type=${type}&length=${length}"></iframe>`);
				};

				sb_f(ShowBox, ShowKickBox, ShowBlockBox);
			}
		});

	});

}

function processSIDsInDocument(topEl) {
	let treeWalker = document.createTreeWalker(topEl, NodeFilter.SHOW_TEXT, {
		acceptNode: function(node) { 
			if (node.textContent.length === 0
				|| node.nodeName !== '#text'
				|| node.parentNode.nodeName === 'SCRIPT' 
				|| node.parentNode.nodeName === 'STYLE'
			) {
				return NodeFilter.FILTER_SKIP;
			}
			return NodeFilter.FILTER_ACCEPT;
		}
	}, false);

	let nodeList = [];
	while (treeWalker.nextNode()) {
		nodeList.push(treeWalker.currentNode);
	}
	for (let node of nodeList) {
		handleSIDTextNode(node);
	}
}

