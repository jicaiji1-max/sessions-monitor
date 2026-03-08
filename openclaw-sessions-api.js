// 轻量级 sessions API 服务
// 读取 ~/.openclaw/agents/*/sessions/sessions.json 并提供 HTTP API
// 通用版本，支持任意 OpenClaw 用户

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 18790;
const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(require('os').homedir(), '.openclaw');
const WORKSPACE_DIR = path.join(OPENCLAW_DIR, 'workspace-programmer');

// 从配置文件自动提取 Agent 中文名字映射
function loadAgentCnNames() {
  const cnNames = {};
  
  try {
    // 从 SOUL.md 提取当前 agent 的中文名字
    const soulPath = path.join(WORKSPACE_DIR, 'SOUL.md');
    if (fs.existsSync(soulPath)) {
      const soulContent = fs.readFileSync(soulPath, 'utf8');
      // 提取标题中的中文名字（格式：# SOUL.md - 代码助手）
      const titleMatch = soulContent.match(/^#\s*SOUL\.md\s*-\s*(.+)$/m);
      if (titleMatch) {
        const cnName = titleMatch[1].trim();
        // 从 session 数据推断当前 agentId，或者使用默认映射
        cnNames['programmer'] = cnName;
      }
    }
    
    // 常用默认映射（可以被关闭）
    const defaultMappings = {
      'main': '主助手',
      'programmer': '代码助手',
      'product-manager': '产品助手',
      'project-manager': '项目经理'
    };
    
    // 合并默认映射（如果 SOUL.md 没有定义）
    Object.assign(cnNames, defaultMappings);
    
  } catch (e) {
    console.error('加载 agent 中文名字失败:', e.message);
  }
  
  return cnNames;
}

// 加载 agent 中文名字
const AGENT_CN_NAMES = loadAgentCnNames();

console.log(`📊 Sessions API`);
console.log(`📂 读取目录：${OPENCLAW_DIR}`);
console.log(`🌐 端口：${PORT}`);
console.log(`🔗 API: http://127.0.0.1:${PORT}/api/sessions`);
console.log(`📝 Agent 中文名字:`, AGENT_CN_NAMES);
console.log();

const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 只处理 GET 请求
  if (req.method !== 'GET') {
    res.writeHead(405);
    res.end('Method Not Allowed');
    return;
  }
  
  // 只处理 /api/sessions 路径
  if (req.url !== '/api/sessions') {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  
  try {
    const allSessions = [];
    const agentsData = {};
    const agentsDir = path.join(OPENCLAW_DIR, 'agents');
    const agentDirs = fs.readdirSync(agentsDir).filter(f => {
      try {
        return fs.statSync(path.join(agentsDir, f)).isDirectory();
      } catch {
        return false;
      }
    });
    
    for (const agentId of agentDirs) {
      agentsData[agentId] = true;
      try {
        const agentSessDir = path.join(agentsDir, agentId, 'sessions');
        const sFile = path.join(agentSessDir, 'sessions.json');
        if (!fs.existsSync(sFile)) continue;
        
        const data = JSON.parse(fs.readFileSync(sFile, 'utf8'));
        const sessions = Object.entries(data).map(([key, s]) => ({
          key,
          agentId: agentId,
          label: s.label || key,
          model: s.modelOverride || s.model || '-',
          totalTokens: s.totalTokens || 0,
          contextTokens: s.contextTokens || s.contextWindow || 1000000,
          contextWindow: s.contextWindow || s.contextTokens || 1000000,
          kind: s.kind || (key.includes('group') ? 'group' : 'direct'),
          updatedAt: s.updatedAt || 0,
          createdAt: s.createdAt || s.updatedAt || 0,
          aborted: s.abortedLastRun || false
        }));
        
        // 排除 :run: 子 session
        const filteredSessions = sessions.filter(s => !s.key.includes(':run:'));
        allSessions.push(...filteredSessions);
      } catch (e) {
        console.error(`Error reading sessions for agent ${agentId}:`, e.message);
      }
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      sessions: allSessions,
      agents: Object.keys(agentsData),
      agentCnNames: AGENT_CN_NAMES
    }));
    console.log(`✅ 返回 ${allSessions.length} 个 sessions`);
  } catch (e) {
    console.error('Error:', e.message);
    res.writeHead(500);
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ 服务已启动\n`);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 服务已停止');
  server.close();
  process.exit(0);
});
