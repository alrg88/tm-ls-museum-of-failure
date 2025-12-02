# Create Desktop Shortcut for Fantasy Football Stats

## Quick Start Option 1: Using the BAT file

The easiest way to start your Fantasy Football Stats dashboard:

1. **Open File Explorer** in Windows
2. **Navigate to** the project folder (it's accessible via WSL)
3. **Find** the file: `start-fantasy-stats.bat`
4. **Right-click** on `start-fantasy-stats.bat`
5. **Select** "Send to" → "Desktop (create shortcut)"
6. **Rename** the shortcut on your desktop to "Fantasy Football Stats"

Done! Double-click the shortcut to launch the app.

---

## Option 2: Create a Custom Shortcut (Recommended)

This creates a nicer shortcut with a custom icon:

### Step 1: Create the Shortcut

1. **Right-click** on your Desktop
2. Select **"New"** → **"Shortcut"**
3. In the location field, paste this:
   ```
   C:\Windows\System32\wsl.exe -d Ubuntu bash -c "cd /home/adam/Projects/ffootball && ./start-fantasy-stats.sh"
   ```
4. Click **"Next"**
5. Name it: **"Fantasy Football Stats"**
6. Click **"Finish"**

### Step 2: Customize the Shortcut (Optional)

1. **Right-click** the new shortcut
2. Select **"Properties"**
3. Click **"Change Icon..."**
4. Choose a football or sports icon (or browse for a custom .ico file)
5. Click **"OK"** twice

### Step 3: Test It

Double-click the shortcut! It should:
- Start the server
- Open your browser to http://localhost:3000
- Show your Fantasy Football Stats dashboard

---

## Option 3: Using VBS Script (Silent Launch)

If you prefer a cleaner launch without seeing terminal windows:

### Access the VBS file from Windows:

1. Open **File Explorer**
2. In the address bar, type: `\\wsl$\Ubuntu\home\adam\Projects\ffootball`
3. Press **Enter**
4. You'll see the file: **`Fantasy-Football-Stats.vbs`**
5. **Right-click** on it
6. Select **"Send to"** → **"Desktop (create shortcut)"**
7. Rename the shortcut to "Fantasy Football Stats"

Done! This version launches quietly in the background.

---

## Accessing Your Project Folder from Windows

Your WSL project is accessible from Windows at:
```
\\wsl$\Ubuntu\home\adam\Projects\ffootball
```

You can:
- Create shortcuts from here
- Edit files with Windows editors
- Copy files to/from Windows

---

## Troubleshooting

### "wsl.exe not found"
- Make sure WSL2 is installed and working
- Try opening a command prompt and typing: `wsl --version`

### "Ubuntu not found"
- Your WSL distribution might have a different name
- Open PowerShell and run: `wsl -l -v` to see your distributions
- Replace "Ubuntu" in the commands with your distribution name

### Server won't start
- Check if port 3000 is already in use
- The script will try to kill any existing process on port 3000
- Check for error messages in the console

### Browser doesn't open automatically
- Manually open: http://localhost:3000
- Make sure your default browser is set in Windows

### Icon doesn't look good
- You can download a football icon (.ico file)
- Save it to your project folder
- Change the shortcut icon to use that file

---

## Manual Start (Alternative)

If you prefer to start manually:

1. Open **Windows Terminal** or **PowerShell**
2. Run:
   ```
   wsl
   cd /home/adam/Projects/ffootball
   ./start-fantasy-stats.sh
   ```

---

## Stopping the Server

- Click on the terminal window
- Press **Ctrl+C**
- The server will shut down gracefully
