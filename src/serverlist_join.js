(() => {
	// Thanks, eNcoo!

	const ipRows = document.querySelectorAll('article.content-server > div.server > .ip');
	if (ipRows.length === 0) {
		return;
	}

	const joinButtonTempl = document.createElement('DIV');
	joinButtonTempl.classList.add('ft-join-server-button');
	const joinLinkTempl = document.createElement('A');
	joinLinkTempl.innerText = 'Connect';
	joinButtonTempl.appendChild(joinLinkTempl);

	for (const ipRow of ipRows) {
		joinLinkTempl.href = 'steam://connect/' + ipRow.innerText.trim();
		
		const joinServerDiv = joinButtonTempl.cloneNode(true);
		ipRow.insertAdjacentElement('afterend', joinServerDiv);
	}
})();
