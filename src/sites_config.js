const SB_CHAT = 2;
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
					forumSections: [
						{ fid: 954, shortname: "PP" },
						{ fid: 1014, shortname: "AA" }
					],
					banIcons: new Map([
						[SB_VOICE, "icons/sourcebans_team.png"],
						[SB_CHAT, "icons/sourcebans_chat.png"],
						[SB_CHAT_AND_VOICE, "icons/sourcebans_chat.png"]
					]),
					banOrder: [
						{ reason: "FreeKill", time: 240, type: SB_VOICE },
						{ reason: "Neschopnost CT", time: 1440, type: SB_VOICE },
						{ reason: "Úmyslné kažení hry", time: 1440, type: SB_VOICE },
						{ reason: "Nadržování", time: 1440, type: SB_VOICE },
						{ reason: "MultiFreeKill", time: 2880, type: SB_VOICE },
						{ reason: "Nadávky velké", time: 720, type: SB_CHAT },
						{ reason: "Nadávky neúnosné", time: 2880, type: SB_CHAT },
						{ reason: "BunnyHop", time: 10080, type: SB_GAME },
						{ reason: "MultiHack", time: 0, type: SB_GAME }
					]
				},
				{
					name: "ALL",
					sourcebans: "https://www.gamesites.cz/serversoubory/ostatni/csgoblnew1/",
					hlstats: "http://hlstats.fakaheda.eu/hlxce_187068/hlstats.php",
					forumSections: [
						{ fid: 976, shortname: "PP" },
						{ fid: 992, shortname: "PP" }
					],
					banOrder: [
						{ reason: "Nadávky velké", time: 720, type: SB_CHAT_AND_VOICE },
						{ reason: "Nadávky neúnosné", time: 2880, type: SB_CHAT_AND_VOICE },
						{ reason: "BunnyHop", time: 10080, type: SB_GAME },
						{ reason: "WallHack", time: 0, type: SB_GAME },
						{ reason: "AimBot", time: 0, type: SB_GAME },
						{ reason: "MultiHack", time: 0, type: SB_GAME }
					]
				},
				{
					name: "TTT",
					sourcebans: "http://sourcebans.fakaheda.eu/sbans_249095/",
					hlstats: "http://hlstats.fakaheda.eu/hlxce_205007/hlstats.php",
					forumSections: [
						{ fid: 1105, shortname: "PP" }
					],
					banOrder: [
						{ reason: "Nadávky velké", time: 720, type: SB_CHAT_AND_VOICE },
						{ reason: "Nadávky neúnosné", time: 2880, type: SB_CHAT_AND_VOICE },
						{ reason: "Zneužívání bloků", time: 60, type: SB_GAME },
						{ reason: "Bugování pod mapu", time: 240, type: SB_GAME },
						{ reason: "Úmyslné kažení hry", time: 720, type: SB_GAME },
						{ reason: "Ghosting", time: 1440, type: SB_GAME },
						{ reason: "BunnyHop", time: 10080, type: SB_GAME },
						{ reason: "MultiHack", time: 0, type: SB_GAME }
					]
				}
			]
		}
	]
};
