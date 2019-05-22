if (window.location.hash == "#autoredirect") {
	var linkobj = document.querySelectorAll('table.data-table > tbody > tr:nth-child(2) > td:nth-child(2) > a');
	if (linkobj.length > 0) {
		window.location.href = linkobj[0].href;
	}
}
