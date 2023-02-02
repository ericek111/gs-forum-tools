(() => {
	const ipRows = document.querySelectorAll('article.content-server > div.server > .ip');
	if (ipRows.length === 0) {
		return;
	}

	const serverListStyle = document.createElement('STYLE');
	serverListStyle.innerText = `
		article div.server {
			display: flex;
		}
		.ft-join-server-button a {
			color: #238ad4;
			font-weight: bold;
			padding: 0.75em 1em;
		}
		article div.server div.ip {
			min-width: 135px;
			width: auto;
		}
		article div.server div.players {
			text-align: center;
		}
	`;
	document.head.appendChild(serverListStyle);

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
