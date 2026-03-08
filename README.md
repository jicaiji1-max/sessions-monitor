# Sessions Monitor - OpenClaw 会话监控面板

> **一句话介绍**: 这是一个 Chrome 浏览器扩展，安装后会在你的 OpenClaw 页面右上角显示一个监控面板，实时展示所有 AI 助手（Agent）的工作状态、使用的模型、Tokens 消耗等信息。

![Version](https://img.shields.io/badge/version-1.0.4-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 💡 为什么要做这个工具？

**真实故事**：有一天，我发现我的 AI 助手们出现了各种奇怪的问题：

### 问题 1：Context 爆炸 💥

> "我的助手怎么突然变傻了？回答的问题前言不搭后语..."

**排查发现**：
- 某个助手的 Context 使用率已经达到 98%
- 但它还在继续接收新任务，没有触发 compaction
- 导致回答质量严重下降，甚至开始胡言乱语

**如果有监控面板**：
- 一眼就能看到 Context 进度条变红（>80%）
- 可以及时手动清理或重启助手
- 避免回答质量下降

---

### 问题 2：助手在不在运行？🤔

> "我早上提交的任务，晚上回来还在跑吗？还是早就挂了？"

**尴尬情况**：
- 不知道助手是在认真工作，还是早就出错了
- 打开 OpenClaw 页面，看到一堆会话，但不知道哪些是活的
- 想找个正在运行的助手问点事，但不知道哪个在用

**如果有监控面板**：
- 🟢 绿色 = 正在运行（5 分钟内有活动）
- 🟡 黄色 = 空闲中
- 🔴 红色 = 出错了（aborted）
- 一眼就知道该找哪个助手

---

### 问题 3：Token 消耗太快 💰

> "这个月 API 账单怎么这么贵？谁在用这么多 Token？"

**痛点**：
- 不知道哪个助手最费 Token
- 不知道某个任务消耗了多少上下文
- 想优化成本，但找不到数据

**如果有监控面板**：
- 实时显示每个助手的 Token 消耗
- 显示 Context Window 使用率
- 发现异常消耗，及时干预

---

### 问题 4：会话太多找不到 📋

> "我昨天那个任务在哪个会话里来着？"

**混乱场景**：
- 一个助手开了 20+ 个会话
- 想找某个特定任务的对话记录
- 不知道哪些会话还在用，哪些可以清理

**如果有监控面板**：
- 点击会话数量，展开所有会话列表
- 显示每个会话的最后更新时间
- 显示会话的任务描述（群聊/私聊/定时任务）
- 快速定位目标会话

---

## 🎯 这个扩展能帮你做什么？

基于上面的痛点，这个扩展可以帮你：

1. **预防 Context 爆炸** - 进度条变黄（>50%）就开始注意，变红（>80%）就处理
2. **实时状态监控** - 一眼看出哪个助手在忙、哪个空闲、哪个出错了
3. **成本透明** - 每个助手的 Token 消耗清清楚楚
4. **会话管理** - 快速找到目标会话，清理废弃会话
5. **无需刷新** - 数据每 10 秒自动更新，不干扰正常工作

**适合谁用**:
- ✅ 同时运行多个 AI 助手的 OpenClaw 用户
- ✅ 遇到过 Context 爆炸、助手变傻的用户
- ✅ 想监控助手状态和 Token 消耗的用户
- ✅ 需要知道哪个助手在忙、哪个空闲的用户
- ✅ 想优化 API 成本的用户

**不适合谁**:
- ❌ 只用一个助手、不关心状态的用户
- ❌ 不想安装 Chrome 扩展的用户
- ❌ 助手数量 < 2 且从未遇到问题的用户

---

## 📸 效果预览

安装后，你的 OpenClaw 页面右上角会显示这样一个监控面板：

```
┌─────────────────────────────────────────┐
│ 🤖 Sessions Monitor              [−]    │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ main (主助手)               qwen... │ │
│ │                           🟢 运行中 │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ programmer (代码助手)       qwen... │ │
│ │                           🟡 空闲   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [刷新（10 秒自动刷新）]                  │
└─────────────────────────────────────────┘
```

**面板功能**:
- 📊 显示所有 AI 助手的实时状态
- 🔄 每 10 秒自动刷新数据
- 🎨 可以拖拽移动位置、调整大小
- 🔍 点击卡片可以展开查看详情（Tokens 使用、会话列表等）

---

## 🎯 这个扩展能帮你做什么？

如果你使用 OpenClaw 管理多个 AI 助手，这个扩展可以帮你：

1. **一眼看到所有助手在干什么** - 哪个在运行、哪个在空闲
2. **监控资源使用** - 每个助手用了多少 Tokens，Context 还剩多少
3. **快速定位问题** - 如果有助手出错（aborted），红色标记立刻能看到
4. **无需刷新页面** - 数据自动更新，不干扰你正常工作

**适合谁用**:
- ✅ 同时运行多个 AI 助手的 OpenClaw 用户
- ✅ 想监控助手状态和 Token 消耗的用户
- ✅ 需要知道哪个助手在忙、哪个空闲的用户

**不适合谁**:
- ❌ 只用一个助手、不关心状态的用户
- ❌ 不想安装 Chrome 扩展的用户

---

## 📦 安装教程（小白友好）

### 第一步：准备文件

**方法 A：如果你会用 Git（推荐）**

打开终端（Mac 用户按 `Cmd+Space` 搜索 "终端"），输入以下命令：

```bash
# 1. 进入 OpenClaw 的 skills 目录
cd ~/.openclaw/skills

# 2. 下载这个扩展
git clone https://github.com/jicaiji1-max/openclaw-monitor-extension.git

# 3. 确认下载成功
ls sessions-monitor/openclaw-monitor-extension
```

如果看到 `manifest.json`、`content.js` 等文件，说明下载成功。

**方法 B：如果你不会用 Git**

1. 打开浏览器，访问：https://github.com/jicaiji1-max/openclaw-monitor-extension
2. 点击绿色的 **Code** 按钮
3. 选择 **Download ZIP**
4. 下载完成后解压
5. 把解压后的 `openclaw-monitor-extension` 文件夹移动到 `~/.openclaw/skills/` 目录下

---

### 第二步：启动后台服务

这个扩展需要一个后台服务来读取数据。

**Mac 用户**:

1. 打开终端（按 `Cmd+Space` 搜索 "终端"）
2. 输入以下命令：

```bash
cd ~/.openclaw/skills/sessions-monitor/openclaw-monitor-extension
node openclaw-sessions-api.js
```

3. 如果看到类似下面的输出，说明启动成功：
```
📊 Sessions API
📂 读取目录：/Users/你的用户名/.openclaw
🌐 端口：18790
🔗 API: http://127.0.0.1:18790/api/sessions

✅ 服务已启动
```

**重要**: 这个服务需要一直运行，不要关闭终端窗口。如果想后台运行，按 `Ctrl+C` 停止后，用下面命令重新启动：

```bash
node openclaw-sessions-api.js &
```

（末尾的 `&` 符号表示后台运行）

**Windows 用户**:

1. 按 `Win+R`，输入 `cmd`，回车
2. 输入以下命令：

```cmd
cd %USERPROFILE%\.openclaw\skills\sessions-monitor\openclaw-monitor-extension
node openclaw-sessions-api.js
```

---

### 第三步：加载 Chrome 扩展（重要！）

这个扩展是 Chrome 浏览器扩展，需要手动加载到 Chrome 中。

**详细步骤**：

1. **打开 Chrome 浏览器**
   - 注意：必须是 Google Chrome，不能用 Edge、Safari 等其他浏览器

2. **进入扩展管理页面**
   - 方法 A：在地址栏输入 `chrome://extensions/` 回车
   - 方法 B：点击右上角三个点 → 扩展程序 → 管理扩展程序

3. **开启开发者模式** ⚠️
   - 在页面**右上角**，找到 **开发者模式** 开关
   - 把它打开（开关变蓝色）
   - **注意**：不开启开发者模式无法加载自定义扩展

4. **加载扩展**
   - 点击左上角的 **加载已解压的扩展程序** 按钮
   - 在弹出的窗口中，选择你刚才下载的文件夹：
     - **Mac**: `/Users/你的用户名/.openclaw/skills/sessions-monitor/openclaw-monitor-extension`
     - **Windows**: `C:\Users\你的用户名\.openclaw\skills\sessions-monitor\openclaw-monitor-extension`
   - 点击 **选择文件夹** 按钮

5. **确认加载成功** ✅
   - 扩展列表中应该出现 "Sessions Monitor"
   - 状态显示为 **"已启用"**（绿色开关）
   - 如果显示"错误"，查看下面的常见问题

**常见问题**：

❌ **显示"错误"或红色提示**
- 原因：manifest.json 配置有问题
- 解决：检查 manifest.json 格式，重新加载扩展

❌ **找不到"加载已解压的扩展程序"按钮**
- 原因：没开开发者模式
- 解决：先开启右上角的开发者模式开关

❌ **加载后扩展列表没有出现**
- 原因：文件夹选择错误
- 解决：确保选择的是 `openclaw-monitor-extension` 文件夹（里面要有 manifest.json）

---

### 第四步：验证安装

1. **打开你的 OpenClaw 页面**
   - 在浏览器地址栏输入：`http://127.0.0.1:18789`
   - 或者你平时访问 OpenClaw 的地址

2. **查看右上角**
   - 应该能看到一个深色背景的监控面板
   - 标题是 "🤖 Sessions Monitor"

3. **如果看不到面板**
   - 检查后台服务是否在运行（第二步的终端窗口）
   - 刷新浏览器页面（按 `F5` 或 `Cmd+R`）
   - 查看浏览器控制台有没有报错（按 `F12` → Console）

---

## 🎮 如何使用

### 基本操作

| 你想做什么 | 操作方法 |
|-----------|---------|
| 移动面板位置 | 鼠标点住面板顶部（标题栏），拖拽到任意位置 |
| 调整面板大小 | 鼠标点住面板右下角，拖拽调整 |
| 查看助手详情 | 点击任意助手卡片，展开详细信息 |
| 收起详情 | 再次点击卡片头部，收起详情 |
| 查看会话列表 | 点击 "会话数量" 那一行，展开当前助手的所有会话 |
| 手动刷新数据 | 点击底部的绿色 "刷新" 按钮 |
| 隐藏/显示面板 | 点击右上角的 `−` 按钮 |

### 读懂面板信息

每个助手卡片显示：

```
┌─────────────────────────────────────┐
│ main (主助手)              [▼]      │  ← 助手名字
│                          🟢 运行中   │  ← 状态
│                                     │
│ [展开后显示]                        │
│ 累计 Tokens / Context Window:       │
│   198.9K / 1.0M                    │  ← Token 使用情况
│ Context 使用率：19.9% [====    ]    │  ← Context 占用进度条
│ 会话数量：17 (aborted: 0) ▶         │  ← 当前会话数
└─────────────────────────────────────┘
```

**状态说明**:
- 🟢 **运行中** - 助手正在处理任务（5 分钟内有活动）
- 🟡 **空闲** - 助手暂时没事做
- 🔴 **aborted** - 助手出错或任务被中断

**进度条颜色**:
- 🟢 绿色 - Context 使用率 < 50%（健康）
- 🟡 黄色 - Context 使用率 50-80%（注意）
- 🔴 红色 - Context 使用率 > 80%（可能需要清理）

---

## ⚙️ 自定义配置

### 修改中文名字

如果面板上显示的中文名字不是你想要的，可以自己改。

1. 找到这个文件：
   ```
   ~/.openclaw/skills/sessions-monitor/openclaw-monitor-extension/openclaw-sessions-api.js
   ```

2. 用文本编辑器打开（Mac 用 TextEdit，Windows 用记事本）

3. 找到这一行：
   ```javascript
   const AGENT_CN_NAMES = {
     'main': '主助手',
     'programmer': '代码助手',
     'product-manager': '产品助手',
     'project-manager': '项目经理'
   };
   ```

4. 修改成你想要的名字，比如：
   ```javascript
   const AGENT_CN_NAMES = {
     'main': '大助手',
     'programmer': '写代码的',
     'my-custom-agent': '我的自定义助手'
   };
   ```

5. 保存文件

6. 重启后台服务（先按 `Ctrl+C` 停止，再运行 `node openclaw-sessions-api.js`）

7. 刷新浏览器页面

### 修改刷新频率

默认每 10 秒刷新一次，如果想改快或改慢：

1. 打开文件：
   ```
   ~/.openclaw/skills/sessions-monitor/openclaw-monitor-extension/content.js
   ```

2. 找到这一行：
   ```javascript
   const REFRESH_INTERVAL = 10000; // 10 秒
   ```

3. 修改数字（单位是毫秒）：
   - `5000` = 5 秒（更快）
   - `30000` = 30 秒（更慢）

4. 保存文件，刷新浏览器页面

---

## ❓ 常见问题

### Q1: 面板完全不显示

**可能原因**:
1. 后台服务没运行
2. Chrome 扩展没加载成功
3. 浏览器地址不对

**解决方法**:
```bash
# 1. 检查后台服务
curl http://127.0.0.1:18790/api/sessions
# 如果返回 JSON 数据，说明服务正常
# 如果报错，重新启动服务：
cd ~/.openclaw/skills/sessions-monitor/openclaw-monitor-extension
node openclaw-sessions-api.js

# 2. 检查扩展
# 访问 chrome://extensions/ 确认 "Sessions Monitor" 在列表中

# 3. 确认访问地址
# 必须是 http://127.0.0.1:18789 或 http://localhost:18789
```

### Q2: 显示"加载失败"

**原因**: 后台服务没响应

**解决方法**:
1. 检查终端窗口，服务是否还在运行
2. 如果服务挂了，重新启动：
   ```bash
   node openclaw-sessions-api.js &
   ```
3. 刷新浏览器页面

### Q3: 中文名字不显示

**原因**: 配置没生效

**解决方法**:
1. 检查 `openclaw-sessions-api.js` 中的 `AGENT_CN_NAMES` 是否正确
2. 重启后台服务
3. 刷新浏览器页面

### Q4: 面板位置跑偏了

**原因**: 浏览器窗口大小变化

**解决方法**:
- 直接拖拽面板头部，移到你想要的位置
- 刷新页面会恢复默认位置（右上角）

### Q5: 怎么关闭这个扩展？

**方法 A**: 暂时禁用
1. 访问 `chrome://extensions/`
2. 找到 "Sessions Monitor"
3. 关闭开关（不用删除）

**方法 B**: 完全卸载
1. 访问 `chrome://extensions/`
2. 找到 "Sessions Monitor"
3. 点击 **移除**
4. 删除文件：
   ```bash
   rm -rf ~/.openclaw/skills/sessions-monitor
   ```

**停止后台服务**:
```bash
# 找到进程
ps aux | grep openclaw-sessions-api

# 杀掉进程（替换 <PID> 为实际数字）
kill <PID>
```

---

## 🔒 安全说明

这个扩展很安全，你可以放心使用：

- ✅ **只在本地运行** - 所有数据都在你的电脑上，不会发送到任何服务器
- ✅ **不需要联网** - 安装后可以断网使用
- ✅ **开源代码** - 所有代码在 GitHub 上公开，可以审查
- ✅ **无外部依赖** - 不下载任何额外的包或插件
- ✅ **通过安全审计** - 无 XSS 漏洞、无内存泄漏

**隐私说明**:
- 这个扩展只读取你本地 OpenClaw 的 sessions 数据
- 不会访问你的浏览器历史记录
- 不会访问你的其他网站
- 不会收集任何个人信息

---

## 🛠️ 技术信息（给开发者看）

### 项目结构

```
openclaw-monitor-extension/
├── manifest.json              # Chrome 扩展配置
├── content.js                 # 注入脚本（1,054 行）
├── openclaw-sessions-api.js   # 后台 API 服务（~120 行）
└── README.md                  # 本文档
```

### 技术栈

- **前端**: 原生 JavaScript (ES5)，无框架
- **后端**: Node.js HTTP 服务
- **样式**: 内嵌 CSS

### 性能

| 指标 | 数值 |
|------|------|
| 代码行数 | 1,174 行 |
| 内存占用 | ~5MB |
| CPU 占用 | <1% |
| 刷新间隔 | 10 秒 |

---

## 📞 遇到问题怎么办？

如果上面的常见问题没解决你的问题：

1. **查看 GitHub Issues**
   - 访问：https://github.com/jicaiji1-max/openclaw-monitor-extension/issues
   - 搜索有没有人遇到类似问题

2. **提交新 Issue**
   - 描述你的问题
   - 附上截图和错误信息
   - 说明你的操作系统和 OpenClaw 版本

3. **联系维护者**
   - GitHub: @jicaiji1-max

---

## 📄 许可证

MIT License - 你可以自由使用、修改、分发

---

**最后更新**: 2026-03-08  
**版本**: 1.0.4  
**维护者**: 菜🐒 @jicaiji1-max

---

## 🎉 快速开始检查清单

安装完成后，对照这个清单检查：

- [ ] 后台服务已启动（终端看到 "✅ 服务已启动"）
- [ ] Chrome 扩展已加载（chrome://extensions/ 能看到）
- [ ] OpenClaw 页面右上角有监控面板
- [ ] 面板显示至少一个助手卡片
- [ ] 数据每 10 秒自动刷新

全部打勾？恭喜，安装成功！🎊
