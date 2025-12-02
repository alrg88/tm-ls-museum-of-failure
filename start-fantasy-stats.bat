@echo off
REM Fantasy Football Stats - Windows Launcher
REM Double-click this file to start the Fantasy Football Stats Dashboard

title Fantasy Football Stats

wsl.exe -d Ubuntu bash -c "cd /home/adam/Projects/ffootball && ./start-fantasy-stats.sh"
