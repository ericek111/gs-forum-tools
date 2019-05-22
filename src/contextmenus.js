let context_api, tabs_api;
if (chrome) {
	context_api = chrome.contextMenus;
	tabs_api = chrome.tabs;
} else if (browser) {
	context_api = browser.menus;
	tabs_api = browser.tabs;
} else {
	throw new Error('Could not find browser extension sdk');
}

const context_listener = (info, tab) => {
	var word = info.menuItemId.match(/^(.*?)[\-\d]+/)[1];
	var reg = /\-(\d+)/g;
	var ids = [];
	var match;
	while ((match = reg.exec(info.menuItemId)) != null) {
		ids.push(parseInt(match[1]));
	}

	var url = "";
	if (word == "servers") {
		url = sites_config.sites[ids[0]].serverListPage;
	} else if (word == "forum") {
		url = sites_config.sites[ids[0]].forumPage;
	} else if (word == "hlstats") {
		url = sites_config.sites[ids[0]].sections[ids[1]].hlstats;
	} else if (word == "banlist") {
		url = sites_config.sites[ids[0]].sections[ids[1]].sourcebans;
	}

	if (url != "") {
		tabs_api.create({
			url: url
		});
	}
};

sites_config.sites.forEach((site, idx) => {
	if (site.serverListPage) {
		context_api.create({
			id: 'servers-' + idx,
			type: 'normal',
			title: site.game + ' servery',
			contexts: ['browser_action', 'page_action']
		});
	}

	if (site.forumPage) {
		context_api.create({
			id: 'forum-' + idx,
			type: 'normal',
			title: site.game + ' fórum',
			contexts: ['browser_action', 'page_action']
		});
	}
	context_api.create({
		id: '_parent_hlstats-' + idx,
		type: 'normal',
		title: site.game + ' HLstatsX',
		contexts: ['browser_action', 'page_action']
	});

	context_api.create({
		id: '_parent_banlist-' + idx,
		type: 'normal',
		title: site.game + ' banlist',
		contexts: ['browser_action', 'page_action']
	});

	site.sections.forEach((section, sectionidx) => {
		if (section.hlstats)
			context_api.create({
				id: 'hlstats-' + idx + '-' + sectionidx,
				parentId: '_parent_hlstats-' + idx,
				type: 'normal',
				title: section.name,
				contexts: ['browser_action', 'page_action']
			});
		if (section.sourcebans)
			context_api.create({
				id: 'banlist-' + idx + '-' + sectionidx,
				parentId: '_parent_banlist-' + idx,
				type: 'normal',
				title: section.name,
				contexts: ['browser_action', 'page_action']
			});
	});
})

context_api.onClicked.addListener(context_listener);
