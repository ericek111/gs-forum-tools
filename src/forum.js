let getThisPage = () => {
	let res = {
		type: null,
		site: null,
		section: null,
		forums: []
	};

	if (document.body.classList.contains("section-viewtopic")) {
		res.type = "topic";
	} else if (document.body.classList.contains("section-viewforum")) {
		res.type = "forum";
	} else if (document.body.classList.contains("section-index")) {
		res.type = "index";
	}

	let forumPathObj = document.querySelectorAll('#page-header ul.navlinks > li.icon-home a');
	for (var i = forumPathObj.length - 1; i >= 0; i--) {
		let forumUrl = forumPathObj[i].href;
		let forumId = forumUrl.substring(forumUrl.lastIndexOf('f') + 1, forumUrl.length - '.html'.length);
		if (forumId.length > 0)
			res.forums.push(parseInt(forumId, 10));
	}

	if (res.forums.length > 0) {
		sites_config.sites.forEach((site, idx) => {
			if (site.forumSections.filter(fid => res.forums.includes(fid)).length === 0) {
				res.site = site;
			}
			site.sections.forEach((section, sectionidx) => {
				if (section.forumSections.filter(fid => res.forums.includes(fid)).length > 0) {
					res.site = site;
					res.section = section;
				}
			});
		});
	}

	return res;
}

let doContents = () => {
	var elements = document.body.querySelectorAll('#content div.post div.postbody div.content');
	for (var i = 0; i < elements.length; i++) {
		processSIDsInDocument(elements[i]);
	}
}

let doPage = () => {
	if (thisPage.type == "topic")
		doContents();
}

var thisPage = getThisPage();
doPage();
