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

const doTopicHighlighting = () => {
	if(!thisPage.forumSection)
		return;
		
	if(thisPage.forumSection.fid == 954) {
		topics = document.querySelectorAll(".topiclist.topics")[1].children;
		for(var i = 0; i < topics.length; i++) {
			highlightTopic(topics[i]);
		}

	} else if(thisPage.forumSection.shortname = "PP") {
		topics = document.querySelectorAll(".topiclist.topics")[1].children;
		for(var i = 0; i < topics.length; i++) {
			highlightTopic(topics[i]);
		}
	}
}

const highlightTopic = (topic) => {
	let title = topic.querySelector(".topictitle");
	let status = 0;
	if(title.innerHTML.includes("[Vyřešeno]")) status = 1;
	else if(title.innerHTML.includes("[V]")) status = 1;
	else if(title.innerHTML.includes("[Nedostatečné]")) status = 2;
	else if(title.innerHTML.includes("[N]")) status = 2;
	else if(title.innerHTML.includes("[Čeká se]")) status = 3;
	else if(title.innerHTML.includes("[Mimo vzor]")) status = 4;
	else if(title.innerHTML.includes("[Duplicita]")) status = 5;
	else if(title.innerHTML.includes("[Neřešitelné]")) status = 6;
	else if(title.innerHTML.includes("[Čekání na CHH]")) status = 7;
	else if(title.innerHTML.includes("[CHH]")) status = 7;
	else if(title.innerHTML.includes("[BPR]")) status = 8;
	title.innerHTML = title.innerHTML.replace(/\[[a-zA-ZáčďéíňóřšťůúýžÁČĎÉÍŇÓŘŠŤŮÚÝŽ\s]*\]\s?/i, "");

	var el = document.createElement("span");

	if(status == 1) {
		el.innerHTML = `<span style="background-color: #3dca3d;border-radius: 3px;padding: 2px 5px 2px 5px;color: white;">Vyřešeno</span>&nbsp;`;
	} else if(status == 2) {
		el.innerHTML = `<span style="background-color: #ef3d3d;border-radius: 3px;padding: 2px 5px 2px 5px;color: white;">Nedostatečné</span>&nbsp;`;
	} else if(status == 3) {
		el.innerHTML = `<span style="background-color: #5a9afb;border-radius: 3px;padding: 2px 5px 2px 5px;color: white;">Čeká se</span>&nbsp;`;
	} else if(status == 4) {
		el.innerHTML = `<span style="background-color: #ef3d3d;border-radius: 3px;padding: 2px 5px 2px 5px;color: white;">Mimo vzor</span>&nbsp;`;
	} else if(status == 5) {
		el.innerHTML = `<span style="background-color: #5f5f5f;border-radius: 3px;padding: 2px 5px 2px 5px;color: white;">Duplicita</span>&nbsp;`;
	} else if(status == 6) {
		el.innerHTML = `<span style="background-color: #5f5f5f;border-radius: 3px;padding: 2px 5px 2px 5px;color: white;">Neřešitelné</span>&nbsp;`;
	} else if(status == 7) {
		el.innerHTML = `<span style="background-color: #5a9afb;border-radius: 3px;padding: 2px 5px 2px 5px;color: white;">Čekání na CHH</span>&nbsp;`;
	} else if(status == 8) {
		el.innerHTML = `<span style="padding: 2px 5px 2px 5px;color: #24ff70;transform: skewY(-11deg);display: inline-block;font-weight: bold;text-decoration: underline;background-image: linear-gradient(to right, #ff6ff4 , #ff0023);margin-top: 12px;margin-bottom: 10px;">POSRAL TO!</span>&nbsp;`;
 	}

	title.before(el);
}

const thisPage = getThisPage();
if (thisPage.type == "topic") {
	doTopic();
} else if (thisPage.type == "forum") {
	doTopicHighlighting();
}