const makeHLstatsLink = (base, sid) => {
	return base + "?mode=search&st=uniqueid&q=" + sid + "#autoredirect";
}
const makeSourceBansLink = (base, sid, commslist) => {
	return base + "?p=" + (commslist ? "commslist" : "banlist") + "&searchText=" + sid;
}
const serializeSBRequest = (verb, args) => {
	var data = `xajax=${verb}&xajaxr=${new Date().getTime()}`;
	for (let arg of args) {
		data += "&xajaxargs[]=" + encodeURIComponent(arg);
	}
	return data;
}
const banLengthToString = (m) => {
	if (m == 0)
		return '\u221e'; // infinity symbol
	var days = Math.floor(m / (60*24));
	m -= days * 60 * 24;
	var hours = Math.floor(m / 60);
	m -= hours * 60;
	res = "";
	var comp = [];
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
	var sidp = sid.match(/STEAM_1:([01]):(\d+)/);
	var sid3 = parseInt(sidp[2], 10) * 2 + parseInt(sidp[1]);
	var sid64 = 76561197960265728n + BigInt(sid3);

	var ret = `
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
				<a class="utility sourcebans" href="${makeSourceBansLink(thisPage.section.sourcebans, sid)}" target="_blank">
					<img class="utilityicon" src="${chrome.runtime.getURL("icons/sourcebans_ban.png")}" />
				</a>
				<a class="utility sourcebans" href="${makeSourceBansLink(thisPage.section.sourcebans, sid, true)}" target="_blank">
					<img class="utilityicon" src="${chrome.runtime.getURL("icons/sourcebans_chat.png")}" />
				</a>`;
	if (thisPage.section && thisPage.section.banOrder) {
		ret += `<div class="banmenucont">
					<ul class="banmenu" style="display: none">
						<input type="text" placeholder="Player's nickname" name="playername" />`;
		thisPage.section.banOrder.forEach((banEntry) => {
			let reason = banEntry.reason;
			if (thisPage.forumSection && thisPage.forumSection.shortname) {
				reason += " / " + thisPage.forumSection.shortname;
			}

			ret += `<li data-time='${banEntry.time}' data-type='${banEntry.type}' data-reason='${reason}'>`;

			var iconuri = null;
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
	let newHtml = origText.replace(/STEAM_[0-5]:[01]:\d+/g, (a) => renderSIDclickable(a));

	if(newHtml !== origText) {
		let newSpan = document.createElement('div');
		newSpan.innerHTML = newHtml;
		newSpan.style.display = "inline-block";

		newSpan.querySelectorAll("div.FTsteamIDcont").forEach((fttool) => {
			var { sid, sid64 } = fttool.dataset;

			var banplayerbutton = fttool.querySelector("a.utility.banplayer");
			var menu = fttool.querySelector("ul.banmenu");
			if (banplayerbutton && menu) {
				var nickobj = menu.querySelector("input[name=playername]");
				banplayerbutton.addEventListener("click", function(e) {
					if (menu.style.display == "block")
						menu.style.display = "none";
					else 
						menu.style.display = "block";
					if (nickobj.value.length < 1) {
						chrome.runtime.sendMessage(chrome.runtime.id, {
							action: 'Steam_API_Get',
							verb: 'GetPlayerSummaries',
							apikey: apikey,
							batch: [sid64.toString()]
						}, function(data, error) {
							if (!error && data) {
								nickobj.value = data.response.players[0].personaname;
							}
						});
					}
				}, false);
				const ShowBox = function(title, msg, color, redir, noclose, append) { // ShowBox
					if(color == "red")
						color = "error";
					else if(color == "blue")
						color = "info";
					else if(color == "green")
						color = "ok";
					else
						color = "default";
					menu.innerHTML = `
						<div class="boxmsg ${color}">
							<div class="title">${title}</div>
							<div class="msg">${msg}</div>
							${append || ""}
						</div>
					`;
				};
				menu.querySelectorAll("li").forEach((el) => {
					el.addEventListener("click", function(e) {
						var dataTarget = e.target;
						while (dataTarget && dataTarget.nodeName != "LI") {
							dataTarget = dataTarget.parentNode;
						}

						var { time, reason, type } = dataTarget.dataset;
						if (!(time && reason && type)) {
							alert("Chyba! Kontaktujte vývojára.");
							throw Error("Invalid ban entry!");
						}

						var tosend;
						if (type == SB_GAME) {
							tosend = serializeSBRequest("AddBan", [
								nickobj.value,
								0,	// type - Steam ID ban
								sid,
								"", // ip
								time,
								0, // demo file
								"", // demo file name
								reason,
								"" // fromsub
							]);
						} else {
							tosend = serializeSBRequest("AddBlock", [
								nickobj.value,
								type,
								sid,
								time,
								reason
							]);
						}

						chrome.runtime.sendMessage(chrome.runtime.id, {
							action: 'SBRequest',
							sourcebans: thisPage.section.sourcebans,
							data: tosend
						}, function(data, error) {
							if (error || !data) {
								ShowBox("Request failed", error ? error : "Unknown error. (timed out?)", "red");
								return;
							}

							var parser = new DOMParser();
							var xmlDoc = parser.parseFromString(data, "text/xml");
							var xmlRoot = xmlDoc.getElementsByTagName("xjx");
							if (xmlRoot.length < 1) {
								alert("Chyba! Jsi přihlášen?");
								return;
							}
							for (let el of xmlRoot[0].getElementsByTagName("cmd")) {
								if (el.attributes.n.value != "js")
									continue;
								if (['ShowBox', 'ShowKickBox', 'ShowBlockBox'].filter((x) => el.innerHTML.startsWith(x)).length < 1)
									continue;
								var sb_f = new Function('ShowBox', 'ShowKickBox', 'ShowBlockBox', el.innerHTML);
								const ShowKickBox = function(check, type) {
									ShowBox('Ban Added',
											'The ban has been successfully added<br>',
											'green',
											'index.php?p=admin&c=bans',
											true,
											`<iframe src="${thisPage.section.sourcebans}/pages/admin.kickit.php?check=${check}&type=${type}"></iframe>`);

								};
								const ShowBlockBox = function(check, type, length) {
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
				});
			}
		});


		textNode.parentNode.replaceChild(newSpan, textNode);
	}
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
	nodeList.forEach(function(el){
		handleSIDTextNode(el);
	});
}

