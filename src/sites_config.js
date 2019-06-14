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
					servers: [
						{ ip: "217.11.249.84:27361", demos: "https://psopf.cz/dema/index.php?server=JailBreak1" },
						{ ip: "217.11.249.84:27583", demos: "https://psopf.cz/dema/index.php?server=JailBreak2" },
						{ ip: "217.11.249.79:27422", demos: "https://psopf.cz/dema/index.php?server=JailBreak3" },
						{ ip: "81.0.217.175:27988", demos: "https://psopf.cz/dema/index.php?server=JailBreak4" },
						{ ip: "217.11.249.78:27883", demos: "https://psopf.cz/dema/index.php?server=JailBreak5" },
						{ ip: "217.11.249.79:27817", demos: "https://psopf.cz/dema/index.php?server=JailBreak6" },
						{ ip: "82.208.17.105:27466", demos: "https://psopf.cz/dema/index.php?server=JailBreak7" },
						{ ip: "82.208.17.102:27299", demos: "https://psopf.cz/dema/index.php?server=JailBreak8" },
						{ ip: "217.11.249.93:27896", demos: "https://psopf.cz/dema/index.php?server=JailBreak9" }
					],
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
						{ fid: 976, shortname: "PP" }
					],
					servers: [
						{ ip: "82.208.17.50:27933", demos: "https://psopf.cz/dema/index.php?server=1v1Arena" },
						{ ip: "82.208.17.101:27575", demos: "https://psopf.cz/dema/index.php?server=1v1Arena2" },
						{ ip: "81.0.217.178:27080", demos: "https://psopf.cz/dema/index.php?server=Public" },
						{ ip: "82.208.17.50:27378", demos: "https://psopf.cz/dema/index.php?server=Retakes" },
						{ ip: "217.11.249.79:27793", demos: "https://psopf.cz/dema/index.php?server=SniperWar" },
						{ ip: "82.208.17.109:27273", demos: "https://psopf.cz/dema/index.php?server=SniperWar2" }
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
					name: "Jump",
					sourcebans: "https://www.gamesites.cz/serversoubory/ostatni/csgoblnew1/",
					hlstats: "http://hlstats.fakaheda.eu/hlxce_189275/hlstats.php",
					forumSections: [
						{ fid: 992, shortname: "PP" }
					],
					servers: [
						{ ip: "82.208.17.102:27112", demos: "https://psopf.cz/dema/index.php?server=Surf" },
						{ ip: "82.208.17.105:27597", demos: "https://psopf.cz/dema/index.php?server=SurfCombat" }
					],
					banOrder: [
						{ reason: "Nadávky velké", time: 720, type: SB_CHAT_AND_VOICE },
						{ reason: "Nadávky neúnosné", time: 2880, type: SB_CHAT_AND_VOICE },
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
					servers: [
						{ ip: "217.11.249.84:27482", demos: "https://psopf.cz/dema/index.php?server=TTT1" },
						{ ip: "81.0.217.179:27976", demos: "https://psopf.cz/dema/index.php?server=TTT2" }
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
