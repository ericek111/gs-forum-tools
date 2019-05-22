makeHLstatsLink = (base, sid) => {
	return base + "?mode=search&st=uniqueid&q=" + sid + "#autoredirect";
}
makeSourceBansLink = (base, sid, commslist) => {
	return base + "?p=" + (commslist ? "commslist" : "banlist") + "&searchText=" + sid;
}

banPlayer = (sourcebans, nick, sid, time, type, reason) => {
	var data = "xajax=" + (type == SB_GAME ? "AddBan" : "AddBlock");
	data += "&xajaxr=" + (new Date().getTime());
	data += "&xajaxargs[]=" + encodeURIComponent(nick);
	data += "&xajaxargs[]=" + (type == SB_GAME ? 0 : type);
	data += "&xajaxargs[]=" + encodeURIComponent(sid);
	if (type == SB_GAME) {
		data += "&xajaxargs[]="; // ip
	}
	data += "&xajaxargs[]=" + time;
	if (type == SB_GAME) {
		data += "&xajaxargs[]="; // demo file
		data += "&xajaxargs[]="; // demo file name
	}
	data += "&xajaxargs[]=" + encodeURIComponent(reason);

	return fetch(sourcebans, {
		method: 'POST',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: data
	});
}

renderSIDclickable = (sid) => {
	sid = sid.replace("STEAM_0", "STEAM_1");
	// ID64 = 76561197960265728 + (B * 2) + A
    // ID3 = (B * 2) + A
    // ID32 = STEAM_0:A:B
	var sidp = sid.match(/STEAM_1:([01]):(\d+)/);
	var sid3 = parseInt(sidp[2], 10) * 2 + parseInt(sidp[1]);

	var ret = `
		<div class="FTsteamIDcont" data-sid="${sid}" data-sid3="${sid3}">
			<div>
				<span class="sid">${sid}</span>
				<a onclick="navigator.clipboard.writeText('${sid}')"><img class="utilityicon" src="${chrome.runtime.getURL("icons/clipboard.png")}" /></a>
				<a href="https://steamcommunity.com/profiles/[U:1:${sid3}]" target="_blank">
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
		ret += `<div style="position:absolute">
					<ul class="banmenu" style="display: none">
						<input type="text" placeholder="Player's nickname" name="playername" />`;
		thisPage.section.banOrder.forEach((banEntry) => {
			ret += `<li data-time='${banEntry.time}' data-type='${banEntry.type}' data-reason='${banEntry.reason}'>`;
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
			ret += `${banEntry.reason.replace(/\s\/\sPP$/, '')}</li>\n`;
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

handleSIDTextNode = (textNode) => {
	let origText = textNode.textContent;
	let newHtml = origText.replace(/STEAM_[0-5]:[01]:\d+/g, (a) => renderSIDclickable(a));

	if(newHtml !== origText) {
		let newSpan = document.createElement('div');
		newSpan.innerHTML = newHtml;
		newSpan.style.display = "inline-block";

		var fttool = newSpan.querySelector("div.FTsteamIDcont");
		var { sid, sid3 } = fttool.dataset;

		var banplayerbutton = newSpan.querySelector("a.utility.banplayer");
		var menu = newSpan.querySelector("ul.banmenu");
		if (banplayerbutton && menu) {
			var nickobj = menu.querySelector("input[name=playername]");
			banplayerbutton.addEventListener("click", function(e) {
				if (menu.style.display == "block")
					menu.style.display = "none";
				else 
					menu.style.display = "block";
				if (nickobj.value.length < 1) {
					var sid64 = 76561197960265728n + BigInt(sid3);
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
					var { time, reason, type } = e.target.dataset;

					banPlayer(thisPage.section.sourcebans, nickobj.value, sid, time, type, reason)
						.then(function (response) {
							if (!response.ok) {
								ShowBox("Request failed", response.statusText, "red");
								return;
							}
							
							response.text().then(function(resp) {
								var parser = new DOMParser();
								var xmlDoc = parser.parseFromString(resp, "text/xml");
								for (let el of xmlDoc.getElementsByTagName("xjx")[0].getElementsByTagName("cmd")) {

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
							})

						});/*.catch(function(error) {
							ShowBox("Network failure", error.message, "red");
							return;
						});*/
				});
			});
		}
		textNode.parentNode.replaceChild(newSpan, textNode);
	}
}

//Testing: Walk the DOM of the <body> handling all non-empty text nodes
function processSIDsInDocument(topEl) {
	//Create the TreeWalker
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

