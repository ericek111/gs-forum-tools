let getThisPage = () => {
	let res = {
		type: null,
		site: null,
		section: null
	};

	var params = new URLSearchParams(location.search);
	res.type = params.get("p") || "index";

	let thisRaw = window.location.host + window.location.pathname.replace('index.php', '');
	for (let site of sites_config.sites) {
		for (let section of site.sections) {
			let blUrl = new URL(section.sourcebans);
			let sectionRaw = blUrl.host + blUrl.pathname.replace('index.php', '');

			if (sectionRaw === thisRaw) {
				res.site = site;
				res.section = section;
			}
		}
	}

	return res;
};
let doPlayerInfo = (tries) => {
	let fields = document.querySelectorAll('#banlist > table > tbody > tr > td > .collapse > table > tbody > tr:nth-child(3) > td:nth-child(2)');
	for (let field of fields) {
		processSIDsInDocument(field);
	}
}
let doPage = () => {
	if (thisPage.type == "banlist" || thisPage.type == "commslist") {
		doPlayerInfo();
	}

	let counts = document.querySelectorAll('.count-number');
	for (let c of counts) {
		c.textContent = c.dataset.to;
	}
}

var thisPage = getThisPage();
doPage();

