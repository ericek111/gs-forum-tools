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

const highlightTopicTitles = () => {
	// Thanks, Amby!

	const replMap = [
		{ orig: ['V', 'Vyřešeno', 'Vyriešené', 'Vyr'], with: 'Vyřešeno', background: '#09b509' },
		{ orig: ['N', 'Nedostatečné', 'Ned',], with: 'Nedostatečné', background: '#ef3d3d' },
		{ orig: ['Čeká se'], with: 'Čeká se', background: '#5a9afb' },
		{ orig: ['Mimo vzor'], with: 'Mimo vzor', background: '#ef3d3d' },
		{ orig: ['Duplicita', 'Dup'], with: 'Duplicita', background: '#5f5f5f' },
		{ orig: ['Neřešitelné', 'Neriešiteľné'], with: 'Neřešitelné', background: '#5f5f5f' },
		{ orig: ['Čekání na CHH', 'Čeká se na CHH', 'CHH'], with: 'Čekání na CHH', background: '#5a9afb' },
		{ orig: ['BPR'], with: 'POSRAL TO!', background: '#24ff70', className: 'posralto' },
	];

	const titles = document.querySelectorAll('.topiclist .row .topictitle');
	for (const titleEl of titles) {
		const oldTitle = titleEl.innerText;

		// Extract prefix tags without brackets containing unicode letters and basic punctuation
		const newTitle = oldTitle.replace(/^[\[\(]\s*([\p{L}\.,\s]+)\s*[\]\)]\s*(.+)$/ui, (match, p1, p2) => {
			// strip punctuation and symbols
			const replKey = p1.replace(/[\p{P}\p{S}]/gu, '');
			const replEntry = replMap.find(entry => entry.orig.includes(replKey));
			if (!replEntry) {
				// Unknown tag, leave it as it is.
				return match;
			}

			let tag = `<span style="background-color: ${replEntry.background}" class="ft-highlight ${replEntry.className || ''}">${replEntry.with}</span> ${p2}`;
			return tag;
		});

		if (newTitle !== oldTitle) {
			titleEl.innerHTML = newTitle;
		}
	}
}

const thisPage = getThisPage();
if (thisPage.type == "topic") {
	doTopic();
} else if (thisPage.type == "forum") {
	highlightTopicTitles();
}
