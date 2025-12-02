Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "wsl.exe -d Ubuntu bash -c ""cd /home/adam/Projects/ffootball && ./start-fantasy-stats.sh""", 1, False
