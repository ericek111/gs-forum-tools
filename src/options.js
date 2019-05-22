function saveOptions() {
	var customapikey = document.getElementById('customapikey').value;
	chrome.storage.sync.set({ "customapikey": customapikey }, function() {
		document.getElementById('statusSaved').style.visibility = 'visible';
	});
}

function restoreOptions() {
	chrome.storage.sync.get(["customapikey"], function (data) {
		if (typeof data['customapikey'] != 'undefined') {
			document.getElementById('customapikey').value = data['customapikey'];
		}
	})
}

function initOptions(){
	restoreOptions();
	document.getElementById('save').addEventListener('click', saveOptions);
}

if (document.location.protocol != 'http:' && document.location.protocol != 'https:') {
	document.addEventListener('DOMContentLoaded', initOptions);
}
