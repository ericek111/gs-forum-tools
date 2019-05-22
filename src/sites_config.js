const SB_TEAM = 1;
const SB_CHAT = 2;
const SB_CHAT_AND_TEAM = 3;
const SB_VOICE = 1;
const SB_CHAT_AND_VOICE = 3;
const SB_GAME = -1;

const sites_config = {
	sites: [
		{
			game: "CS:GO",
			serverListPage: "https://www.gamesites.cz/servery/cs-go/",
			forumPage: "https://www.gamesites.cz/forum/counter-strike-global-offensive-f49.html",
			forumSections: [49, 873],
			sections: [
				{
					name: "JailBreak",
					sourcebans: "https://www.gamesites.cz/serversoubory/ostatni/csgoblnew2/",
					hlstats: "http://hlstats.fakaheda.eu/hlxce_186497/hlstats.php",
					forumSections: [ 954, 1014 ],
					banIcons: new Map([
						[SB_TEAM, "icons/sourcebans_team.png"],
						[SB_CHAT, "icons/sourcebans_chat.png"],
						[SB_CHAT_AND_TEAM, "icons/sourcebans_chat.png"]
					]),
					banOrder: [
						{ reason: "FreeKill / PP", time: 240, type: SB_TEAM },
						{ reason: "Neschopnost CT / PP", time: 1440, type: SB_TEAM },
						{ reason: "Úmyslné kažení hry / PP", time: 1440, type: SB_TEAM },
						{ reason: "Nadržování / PP", time: 1440, type: SB_TEAM },
						{ reason: "MultiFreeKill / PP", time: 2880, type: SB_TEAM },
						{ reason: "Nadávky velké / PP", time: 720, type: SB_CHAT },
						{ reason: "Nadávky neúnosné / PP", time: 2880, type: SB_CHAT },
						{ reason: "BunnyHop / PP", time: 10080, type: SB_GAME },
						{ reason: "MultiHack / PP", time: 0, type: SB_GAME }
					]
				},
				{
					name: "ALL",
					sourcebans: "https://www.gamesites.cz/serversoubory/ostatni/csgoblnew1/",
					hlstats: "http://hlstats.fakaheda.eu/hlxce_187068/hlstats.php",
					forumSections: [ 976, 992 ]
				},
				{
					name: "TTT",
					sourcebans: "https://sourcebans.fakaheda.eu/sbans_249095/",
					hlstats: "http://hlstats.fakaheda.eu/hlxce_205007/hlstats.php",
					forumSections: [ 1105 ]
				}
			]
		}
	]
};
