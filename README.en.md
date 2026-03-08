# Agents Monitor for OpenClaw

> **One-liner**: A Chrome extension that displays a real-time monitoring panel in the top-right corner of your OpenClaw page, showing the status, models, and token usage of all AI agents.

![Version](https://img.shields.io/badge/version-1.0.7-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 💡 Why Build This Tool?

**True story**: One day, I noticed my AI agents were behaving strangely:

### Problem 1: Context Explosion 💥

> "Why is my agent suddenly so dumb? Its answers make no sense..."

**What I found**:
- One agent's context usage was at 98%
- It kept accepting new tasks without triggering compaction
- Answer quality dropped severely, even started talking nonsense

**With a monitoring panel**:
- You'd see the context progress bar turn red (>80%)
- You could manually clean or restart the agent in time
- Avoid quality degradation

---

### Problem 2: Is the Agent Running? 🤔

> "I submitted a task this morning. Is it still running tonight, or did it crash hours ago?"

**Awkward situations**:
- No idea if the agent is working hard or crashed long ago
- Open the OpenClaw page, see tons of sessions, but don't know which are alive
- Want to ask a running agent something, but don't know which one to use

**With a monitoring panel**:
- 🟢 Green = Running (activity within 5 minutes)
- 🟡 Yellow = Idle
- 🔴 Red = Error (aborted)
- Know which agent to use at a glance

---

### Problem 3: Token Usage Too High 💰

> "Why is this month's API bill so expensive? Who's using so many tokens?"

**Pain points**:
- Don't know which agent consumes the most tokens
- Don't know how much context a task used
- Want to optimize costs, but can't find the data

**With a monitoring panel**:
- Real-time token usage for each agent
- Context window usage percentage
- Detect abnormal usage and intervene early

---

### Problem 4: Too Many Sessions to Find 📋

> "Which session was that task from yesterday in?"

**Chaotic scenarios**:
- One agent has 20+ sessions
- Want to find a specific task's conversation record
- Don't know which sessions are still in use, which can be cleaned

**With a monitoring panel**:
- Click session count to expand all sessions
- See last update time for each session
- See session task description (group chat/direct message/scheduled task)
- Quickly locate target sessions

---

## 🎯 What This Extension Does for You

Based on the pain points above, this extension helps you:

1. **Prevent Context Explosion** - Pay attention when progress bar turns yellow (>50%), act when red (>80%)
2. **Real-time Status Monitoring** - See which agent is busy, idle, or errored at a glance
3. **Cost Transparency** - Clear token usage for each agent
4. **Session Management** - Quickly find target sessions, clean abandoned ones
5. **No Refresh Needed** - Data auto-updates every 10 seconds, doesn't interfere with work

**Who Should Use This**:
- ✅ OpenClaw users running multiple AI agents
- ✅ Users who've experienced context explosion or agent going dumb
- ✅ Users who want to monitor agent status and token usage
- ✅ Users who need to know which agent is busy or idle
- ✅ Users who want to optimize API costs

**Who Should NOT Use This**:
- ❌ Users with only one agent who don't care about status
- ❌ Users who don't want to install Chrome extensions
- ❌ Users with <2 agents who've never had problems

---

## 📸 Preview

After installation, a monitoring panel like this will appear in the top-right corner of your OpenClaw page:

```
┌─────────────────────────────────────────┐
│ 🤖 Agents Monitor                [−]    │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ main (主助手)               qwen... │ │
│ │                           🟢 Running│ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ programmer (代码助手)       qwen... │ │
│ │                           🟡 Idle   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Refresh (Auto-refresh every 10s)]      │
└─────────────────────────────────────────┘
```

**Panel Features**:
- 📊 Real-time status of all AI agents
- 🔄 Auto-refresh every 10 seconds
- 🎨 Draggable and resizable
- 🔍 Click cards to expand details (token usage, session lists, etc.)

---

## 📦 Installation Guide (Beginner-Friendly)

### Step 1: Get the Files

**Method A: Using Git (Recommended)**

Open Terminal (Mac users press `Cmd+Space` and search "Terminal"), then run:

```bash
# 1. Navigate to OpenClaw skills directory
cd ~/.openclaw/skills

# 2. Clone this repository
git clone https://github.com/jicaiji1-max/sessions-monitor.git

# 3. Verify download success
ls sessions-monitor/openclaw-monitor-extension
```

If you see files like `manifest.json`, `content.js`, the download succeeded.

**Method B: Manual Download (No Git)**

1. Open browser and visit: https://github.com/jicaiji1-max/sessions-monitor
2. Click the green **Code** button
3. Select **Download ZIP**
4. Extract the downloaded ZIP file
5. Move the `openclaw-monitor-extension` folder to `~/.openclaw/skills/`

---

### Step 2: Start the Background Service

This extension requires a background service to read data.

**Mac Users**:

1. Open Terminal (press `Cmd+Space` and search "Terminal")
2. Run:

```bash
cd ~/.openclaw/skills/sessions-monitor/openclaw-monitor-extension
node openclaw-sessions-api.js
```

3. If you see output like this, the service started successfully:
```
📊 Sessions API
📂 Reading directory: /Users/your-username/.openclaw
🌐 Port: 18790
🔗 API: http://127.0.0.1:18790/api/sessions

✅ Service started
```

**Important**: This service must keep running. Don't close the terminal window. To run in background, press `Ctrl+C` to stop, then restart with:

```bash
node openclaw-sessions-api.js &
```

(The `&` at the end means run in background)

**Windows Users**:

1. Press `Win+R`, type `cmd`, press Enter
2. Run:

```cmd
cd %USERPROFILE%\.openclaw\skills\sessions-monitor\openclaw-monitor-extension
node openclaw-sessions-api.js
```

---

### Step 3: Load Chrome Extension (Required!)

This extension is a Chrome browser extension that must be manually loaded.

**Detailed Steps**:

1. **Open Chrome Browser**
   - Note: Must be Google Chrome, not Edge, Safari, or other browsers

2. **Go to Extensions Page**
   - Method A: Type `chrome://extensions/` in address bar and press Enter
   - Method B: Click three dots (top-right) → Extensions → Manage Extensions

3. **Enable Developer Mode** ⚠️
   - Find the **Developer mode** toggle in the **top-right corner**
   - Turn it on (toggle turns blue)
   - **Note**: Cannot load custom extensions without enabling Developer mode

4. **Load Extension**
   - Click the **Load unpacked** button (top-left)
   - In the file picker, select the folder you downloaded:
     - **Mac**: `/Users/your-username/.openclaw/skills/sessions-monitor/openclaw-monitor-extension`
     - **Windows**: `C:\Users\your-username\.openclaw\skills\sessions-monitor\openclaw-monitor-extension`
   - Click **Select Folder**

5. **Verify Load Success** ✅
   - "Agents Monitor" should appear in the extensions list
   - Status should show **"Enabled"** (green toggle)
   - If you see "Error", see Common Issues below

**Common Issues**:

❌ **Shows "Error" or red warning**
- Cause: manifest.json configuration issue
- Fix: Check manifest.json format, reload extension

❌ **Can't find "Load unpacked" button**
- Cause: Developer mode not enabled
- Fix: Enable Developer mode toggle first

❌ **Extension doesn't appear after loading**
- Cause: Wrong folder selected
- Fix: Ensure you selected the `openclaw-monitor-extension` folder (must contain manifest.json)

---

### Step 4: Verify Installation

1. **Open Your OpenClaw Page**
   - Type in address bar: `http://127.0.0.1:18789`
   - Or your usual OpenClaw URL

2. **Check Top-Right Corner**
   - You should see a dark-themed monitoring panel
   - Title: "🤖 Agents Monitor"

3. **If Panel Not Visible**
   - Check if background service is running (Step 2 terminal window)
   - Refresh browser page (press `F5` or `Cmd+R`)
   - Check browser console for errors (press `F12` → Console)

---

## 🎮 How to Use

### Basic Operations

| What You Want to Do | How to Do It |
|---------------------|--------------|
| Move panel position | Click and drag panel header (title bar) to any position |
| Resize panel | Click and drag panel's bottom-right corner |
| View agent details | Click any agent card to expand details |
| Collapse details | Click card header again to collapse |
| View session list | Click the "Sessions" row to expand all sessions for that agent |
| Manual refresh | Click the green "Refresh" button at bottom |
| Hide/Show panel | Click the `−` button in top-right corner |

### Understanding Panel Information

Each agent card displays:

```
┌─────────────────────────────────────┐
│ main (主助手)              [▼]      │  ← Agent name
│                          🟢 Running │  ← Status
│                                     │
│ [After expanding]                   │
│ Total Tokens / Context Window:      │
│   198.9K / 1.0M                    │  ← Token usage
│ Context Usage: 19.9% [====    ]    │  ← Context usage progress bar
│ Sessions: 17 (aborted: 0) ▶         │  ← Current session count
└─────────────────────────────────────┘
```

**Status Meanings**:
- 🟢 **Running** - Agent is processing tasks (activity within 5 minutes)
- 🟡 **Idle** - Agent has nothing to do currently
- 🔴 **aborted** - Agent errored or task was interrupted

**Progress Bar Colors**:
- 🟢 Green - Context usage < 50% (healthy)
- 🟡 Yellow - Context usage 50-80% (caution)
- 🔴 Red - Context usage > 80% (may need cleanup)

---

## ⚙️ Configuration

### Customize Agent Chinese Names

If the Chinese names displayed on the panel aren't what you want, you can modify them.

1. Find this file:
   ```
   ~/.openclaw/skills/sessions-monitor/openclaw-monitor-extension/openclaw-sessions-api.js
   ```

2. Open with text editor (Mac: TextEdit, Windows: Notepad)

3. Find this line:
   ```javascript
   const AGENT_CN_NAMES = {
     'main': '主助手',
     'programmer': '代码助手',
     'product-manager': '产品助手',
     'project-manager': '项目经理'
   };
   ```

4. Modify to your preferred names, e.g.:
   ```javascript
   const AGENT_CN_NAMES = {
     'main': 'Main Assistant',
     'programmer': 'Code Helper',
     'my-custom-agent': 'My Custom Agent'
   };
   ```

5. Save file

6. Restart background service (press `Ctrl+C` to stop, then run `node openclaw-sessions-api.js`)

7. Refresh browser page

### Modify Refresh Frequency

Default refresh is every 10 seconds. To make it faster or slower:

1. Open file:
   ```
   ~/.openclaw/skills/sessions-monitor/openclaw-monitor-extension/content.js
   ```

2. Find this line:
   ```javascript
   const REFRESH_INTERVAL = 10000; // 10 seconds
   ```

3. Modify the number (in milliseconds):
   - `5000` = 5 seconds (faster)
   - `30000` = 30 seconds (slower)

4. Save file, refresh browser page

---

## ❓ Common Issues

### Q1: Panel doesn't show at all

**Possible causes**:
1. Background service not running
2. Chrome extension not loaded successfully
3. Wrong browser URL

**Solutions**:
```bash
# 1. Check background service
curl http://127.0.0.1:18790/api/sessions
# If returns JSON data, service is running
# If errors, restart service:
cd ~/.openclaw/skills/sessions-monitor/openclaw-monitor-extension
node openclaw-sessions-api.js

# 2. Check extension
# Visit chrome://extensions/ to confirm "Agents Monitor" is in list

# 3. Confirm access URL
# Must be http://127.0.0.1:18789 or http://localhost:18789
```

### Q2: Shows "Load Failed"

**Cause**: Background service not responding

**Solution**:
1. Check terminal window, verify service is still running
2. If service crashed, restart:
   ```bash
   node openclaw-sessions-api.js &
   ```
3. Refresh browser page

### Q3: Chinese names not showing

**Cause**: Configuration not applied

**Solution**:
1. Check if `AGENT_CN_NAMES` in `openclaw-sessions-api.js` is correct
2. Restart background service
3. Refresh browser page

### Q4: Panel position shifted

**Cause**: Browser window size changed

**Solution**:
- Drag panel header to your preferred position
- Refresh page to restore default position (top-right corner)

### Q5: How to disable this extension?

**Method A: Temporarily disable**
1. Visit `chrome://extensions/`
2. Find "Agents Monitor"
3. Toggle off switch (no need to delete)

**Method B: Completely uninstall**
1. Visit `chrome://extensions/`
2. Find "Agents Monitor"
3. Click **Remove**
4. Delete files:
   ```bash
   rm -rf ~/.openclaw/skills/sessions-monitor
   ```

**Stop background service**:
```bash
# Find process
ps aux | grep openclaw-sessions-api

# Kill process (replace <PID> with actual number)
kill <PID>
```

---

## 🔒 Security Notes

This extension is safe, you can use it with confidence:

- ✅ **Runs locally only** - All data stays on your computer, not sent to any server
- ✅ **No internet required** - Can work offline after installation
- ✅ **Open source code** - All code public on GitHub, can be audited
- ✅ **No external dependencies** - Doesn't download any additional packages or plugins
- ✅ **Security audited** - No XSS vulnerabilities, no memory leaks

**Privacy Notes**:
- This extension only reads your local OpenClaw sessions data
- Doesn't access your browser history
- Doesn't access your other websites
- Doesn't collect any personal information

---

## 🛠️ Technical Info (For Developers)

### Project Structure

```
openclaw-monitor-extension/
├── manifest.json              # Chrome extension configuration
├── content.js                 # Core injection script (1,054 lines)
├── openclaw-sessions-api.js   # Background API service (~120 lines)
└── README.md                  # This documentation
```

### Tech Stack

- **Frontend**: Vanilla JavaScript (ES5), no frameworks
- **Backend**: Node.js HTTP service
- **Styles**: Embedded CSS

### Performance

| Metric | Value |
|--------|-------|
| Lines of Code | 1,174 |
| Memory Usage | ~5MB |
| CPU Usage | <1% |
| Refresh Interval | 10 seconds |

---

## 📞 Need Help?

If Common Issues above didn't solve your problem:

1. **Check GitHub Issues**
   - Visit: https://github.com/jicaiji1-max/sessions-monitor/issues
   - Search for similar issues

2. **Submit New Issue**
   - Describe your problem
   - Attach screenshots and error messages
   - Mention your OS and OpenClaw version

3. **Contact Maintainer**
   - GitHub: @jicaiji1-max

---

## 📄 License

MIT License - Feel free to use, modify, and distribute

---

**Last Updated**: 2026-03-08  
**Version**: 1.0.7  
**Maintainer**: 菜🐒 @jicaiji1-max

---

## 🎉 Quick Start Checklist

After installation, check against this list:

- [ ] Background service started (terminal shows "✅ Service started")
- [ ] Chrome extension loaded (visible at chrome://extensions/)
- [ ] Monitoring panel appears in OpenClaw page top-right corner
- [ ] Panel shows at least one agent card
- [ ] Data auto-refreshes every 10 seconds

All checked? Congratulations, installation successful! 🎊
