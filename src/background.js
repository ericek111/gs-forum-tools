chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action == 'Steam_API_Get') {
		fetch(`https://api.steampowered.com/ISteamUser/${request.verb}/v0002/?key=${request.apikey}&steamids=${request.batch.join(',')}`)
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					throw Error(`Code ${res.status}. ${res.statusText}`);
				}
			})
			.then(data => sendResponse(data))
			.catch(error => sendResponse(undefined, error));
	}
	return true;
});
