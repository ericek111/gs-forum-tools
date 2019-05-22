const defaultkeys = ['5DA40A4A4699DEE30C1C9A7BCE84C914',
					 '5970533AA2A0651E9105E706D0F8EDDC',
					 '2B3382EBA9E8C1B58054BD5C5EE1C36A'];

chrome.storage.sync.get(['customapikey', 'greentext'], function(data) {
	if (typeof data['greentext'] == 'undefined'){
		chrome.storage.sync.set({
			'greentext': true
		});
	} else {
		greentext = data['greentext'];
	}
	if (typeof data['customapikey'] == 'undefined'){
		apikey = defaultkeys[Math.floor(Math.random() * 3)];
	} else {
		apikey = data['customapikey'];
	}
});
