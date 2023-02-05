const getThisPage = () => {
	const res = {
		type: null,
		site: null,
		section: null,
		forumSection: null,
		forums: [],
		isAdminSection: false,
	};

	if (document.body.classList.contains("section-viewtopic")) {
		res.type = "topic";
	} else if (document.body.classList.contains("section-viewforum")) {
		res.type = "forum";
	} else if (document.body.classList.contains("section-index")) {
		res.type = "index";
	}

	const navLinks = document.querySelectorAll('#page-header ul.navlinks > li.icon-home a');
	for (const navLink of navLinks) {
		const forumUrl = navLink.href;
		let forumId = forumUrl.substring(forumUrl.lastIndexOf('f') + 1, forumUrl.length - '.html'.length);
		if (!forumId)
			continue;

		forumId = parseInt(forumId, 10);
		res.forums.push(forumId);
	}

	// no forums in the navlinks
	if (res.forums.length === 0) {
		return res;
	}

	for (const site of sites_config.sites) {
		if (site.forumSections.filter(fid => res.forums.includes(fid)).length === 0) {
			res.site = site;
		}

		for (const section of site.sections) {
			const matchingForumSection = section.forumSections.find(sobj => res.forums.includes(sobj.fid));
			if (matchingForumSection === undefined)
				continue;

			res.site = site;
			res.section = section;
			res.forumSection = matchingForumSection;
			res.isAdminSection = site.adminSections?.some(fid => res.forums.includes(fid)) || false;
			break;
		}
	}

	return res;
}

const doTopic = () => {
	const postContents = document.body.querySelectorAll('#content div.post div.postbody div.content');
	for (const postContent of postContents) {
		processSIDsInDocument(postContent);
	}
}

const thisPage = getThisPage();
if (thisPage.type == "topic") {
	doTopic();
}
