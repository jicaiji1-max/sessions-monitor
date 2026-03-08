// Agents Monitor - OpenClaw Agent 状态监控面板
// 支持任意 OpenClaw 实例，从 API 动态获取配置

(function() {
  'use strict';
  
  // ==================== 常量定义 ====================
  const API_URL = 'http://127.0.0.1:18790/api/sessions';
  const REFRESH_INTERVAL = 10000; // 10 秒
  const PANEL_ID = 'agents-monitor-panel';
  const PANEL_DEFAULT_WIDTH = 480;
  const PANEL_DEFAULT_HEIGHT = 450;
  const PANEL_MIN_WIDTH = 400;
  const PANEL_MIN_HEIGHT = 250;
  const PANEL_MAX_HEIGHT = 600;
  
  // ==================== 状态管理 ====================
  var state = {
    expandedStates: {}, // 保存每个 agent 的展开状态
    refreshTimer: null,
    isPanelVisible: true,
    eventListeners: [] // 跟踪事件监听器，用于清理
  };
  
  // ==================== 工具函数 ====================
  
  // 格式化 token 数量
  function formatTokens(tokens) {
    if (!tokens && tokens !== 0) return '-';
    if (tokens >= 1000000) return (tokens / 1000000).toFixed(1) + 'M';
    if (tokens >= 1000) return (tokens / 1000).toFixed(1) + 'K';
    return String(tokens);
  }
  
  // 计算 context 占比
  function getContextPercent(used, total) {
    if (!total || total <= 0) return 0;
    return Math.min(100, (used / total) * 100);
  }
  
  // 判断 context 等级
  function getContextLevel(percent) {
    if (percent < 50) return 'low';
    if (percent < 80) return 'medium';
    return 'high';
  }
  
  // 判断 session 状态
  function getSessionStatus(session) {
    if (!session) return 'idle';
    if (session.aborted) return 'aborted';
    var fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (session.updatedAt && session.updatedAt > fiveMinutesAgo) return 'running';
    return 'idle';
  }
  
  // 获取会话任务描述
  function getSessionTask(session) {
    if (!session) return '💭 对话会话';
    const label = session.label || session.key || '';
    const key = session.key || '';
    
    if (label.includes('Cron') || key.includes('cron')) {
      return '🕐 定时任务：' + label.replace('Cron: ', '');
    }
    if (label.includes('feishu') || key.includes('feishu')) {
      if (key.includes('group')) return '💬 飞书群聊';
      return '💬 飞书私聊';
    }
    if (key.includes('run:')) return '⚡ 任务执行';
    if (label.includes('topic') || key.includes('topic')) return '📝 话题讨论';
    if (key.includes('group')) return '💬 群聊会话';
    if (key.includes('direct') || key.includes('user:')) return '💬 私聊会话';
    return '💭 对话会话';
  }
  
  // 安全地添加事件监听器（用于后续清理）
  function addEventListener(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    state.eventListeners.push({ target: target, event: event, handler: handler });
  }
  
  // 清理所有事件监听器
  function cleanupEventListeners() {
    state.eventListeners.forEach(function(item) {
      try {
        item.target.removeEventListener(item.event, item.handler);
      } catch (e) {
        // 忽略清理错误
      }
    });
    state.eventListeners = [];
  }
  
  // ==================== DOM 创建工具 ====================
  
  // 创建带类名的元素
  function createElement(tag, className) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }
  
  // 创建文本节点
  function createText(text) {
    return document.createTextNode(String(text));
  }
  
  // ==================== 数据获取与处理 ====================
  
  // 获取并处理 sessions 数据
  function fetchSessionsData() {
    return fetch(API_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
    .then(function(res) {
      if (!res.ok) {
        throw new Error('HTTP ' + res.status + ': ' + res.statusText);
      }
      return res.json();
    })
    .then(function(response) {
      // 支持新旧两种响应格式
      var sessions = response.sessions || response;
      var apiAgentCnNames = response.agentCnNames || {};
      
      if (!Array.isArray(sessions)) {
        throw new Error('Invalid response format: sessions is not an array');
      }
      
      // 合并中文名字映射
      var agentCnNames = Object.assign({}, state.agentCnNames || {}, apiAgentCnNames);
      state.agentCnNames = agentCnNames;
      
      // 聚合数据 by agentId
      var agentsData = {};
      sessions.forEach(function(s) {
        if (!s || !s.agentId) return; // 跳过无效数据
        
        var agentId = s.agentId;
        if (!agentsData[agentId]) {
          agentsData[agentId] = {
            id: agentId,
            model: s.model || '-',
            sessions: [],
            totalTokens: 0,
            contextWindow: 1000000,
            active: false,
            abortedCount: 0,
            status: 'idle',
            lastUpdate: 0,
            cnName: agentCnNames[agentId] || ''
          };
        }
        
        agentsData[agentId].sessions.push(s);
        agentsData[agentId].totalTokens = Math.max(
          agentsData[agentId].totalTokens, 
          s.totalTokens || 0
        );
        
        // 使用最大的 contextWindow（避免 compaction 导致的跳变）
        var currentContextWindow = s.contextWindow || s.contextTokens || 1000000;
        agentsData[agentId].contextWindow = Math.max(
          agentsData[agentId].contextWindow,
          currentContextWindow
        );
        
        // 排除 subagent 的 aborted（只统计主 session 的 aborted）
        if (s.aborted && !s.key.includes(':subagent:') && !s.key.includes(':run:')) {
          agentsData[agentId].abortedCount++;
          agentsData[agentId].status = 'aborted';
        }
        
        // 优先使用有有效 model 值的 session（避免 model 为 '-' 的情况）
        if (s.updatedAt > agentsData[agentId].lastUpdate) {
          agentsData[agentId].lastUpdate = s.updatedAt;
          if (s.model && s.model !== '-') {
            agentsData[agentId].model = s.model;
          }
        }
        // 如果当前 session 有有效 model，也更新（兜底）
        if (s.model && s.model !== '-' && agentsData[agentId].model === '-') {
          agentsData[agentId].model = s.model;
        }
        
        var fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        if (s.updatedAt > fiveMinutesAgo && !s.aborted) {
          agentsData[agentId].active = true;
          if (agentsData[agentId].status !== 'aborted') {
            agentsData[agentId].status = 'running';
          }
        }
      });
      
      return agentsData;
    });
  }
  
  // ==================== 卡片渲染（重构：合并重复逻辑） ====================
  
  // 渲染卡片头部
  function renderCardHeader(agent, isExpanded) {
    var cardHeader = createElement('div', 'agent-card-header');
    
    var agentInfo = createElement('div', 'agent-info');
    var nameContainer = createElement('div');
    
    var nameEl = createElement('span', 'agent-name');
    nameEl.textContent = agent.id;
    nameContainer.appendChild(nameEl);
    
    if (agent.cnName) {
      var cnNameEl = createElement('span', 'agent-cn-name');
      cnNameEl.textContent = '（' + agent.cnName + '）';
      nameContainer.appendChild(cnNameEl);
    }
    
    var expandIcon = createElement('span', 'expand-icon');
    expandIcon.textContent = isExpanded ? '▼' : '▶';
    
    agentInfo.appendChild(nameContainer);
    agentInfo.appendChild(expandIcon);
    
    var status = createElement('div', 'agent-status');
    
    var badge = createElement('span', 'model-badge');
    badge.textContent = agent.model || '-';
    
    var statusBadge = createElement('span', 'status-badge ' + agent.status);
    statusBadge.textContent = getStatusText(agent.status);
    
    status.appendChild(badge);
    status.appendChild(statusBadge);
    
    cardHeader.appendChild(agentInfo);
    cardHeader.appendChild(status);
    
    return cardHeader;
  }
  
  // 获取状态文本
  function getStatusText(status) {
    var statusMap = {
      'no-sessions': '无会话',
      'aborted': 'aborted',
      'running': '运行中',
      'idle': '空闲'
    };
    return statusMap[status] || status;
  }
  
  // 渲染卡片详情（公共逻辑）
  function renderCardDetails(agent, sessionsExpanded, onToggleSessions) {
    var details = createElement('div', 'agent-details');
    
    var contextPercent = getContextPercent(agent.totalTokens, agent.contextWindow);
    var contextLevel = getContextLevel(contextPercent);
    
    // Tokens 行
    var row1 = createDetailRow(
      '累计 Tokens / Context Window:',
      agent.sessions.length === 0 ? '- / -' : formatTokens(agent.totalTokens) + ' / ' + formatTokens(agent.contextWindow)
    );
    row1.classList.add('row-tokens');
    details.appendChild(row1);
    
    // Context 使用率行
    var row2 = createElement('div', 'detail-row row-context');
    row2.style.display = 'flex';
    row2.style.alignItems = 'center';
    row2.style.gap = '8px';
    
    var label2 = createElement('span', 'detail-label');
    label2.textContent = 'Context 使用率:';
    
    var value2 = createElement('span', 'detail-value');
    value2.textContent = agent.sessions.length === 0 ? '-' : contextPercent.toFixed(1) + '%';
    
    var bar = createElement('div', 'context-bar');
    var fill = createElement('div', 'context-fill ' + contextLevel);
    fill.style.width = (agent.sessions.length > 0 ? contextPercent : 0) + '%';
    bar.appendChild(fill);
    
    row2.appendChild(label2);
    row2.appendChild(value2);
    row2.appendChild(bar);
    details.appendChild(row2);
    
    // 会话数量行
    var row3 = createSessionCountRow(agent, sessionsExpanded, onToggleSessions);
    details.appendChild(row3);
    
    // 会话列表
    if (sessionsExpanded && agent.sessions.length > 0) {
      var sessionList = renderSessionList(agent.sessions);
      details.appendChild(sessionList);
    }
    
    return details;
  }
  
  // 创建详情行
  function createDetailRow(labelText, valueText) {
    var row = createElement('div', 'detail-row');
    var label = createElement('span', 'detail-label');
    label.textContent = labelText;
    var value = createElement('span', 'detail-value');
    value.textContent = valueText;
    row.appendChild(label);
    row.appendChild(value);
    return row;
  }
  
  // 创建会话数量行
  function createSessionCountRow(agent, sessionsExpanded, onToggle) {
    var row3 = createElement('div', 'detail-row row-sessions');
    
    if (agent.sessions.length === 0) {
      row3.style.cursor = 'default';
      row3.style.opacity = '0.5';
    } else {
      row3.classList.add('clickable');
      row3.title = sessionsExpanded ? '收起会话列表' : '展开会话列表';
    }
    
    var label3 = createElement('span', 'detail-label');
    label3.textContent = '会话数量:';
    
    var valueContainer = createElement('div');
    valueContainer.style.display = 'flex';
    valueContainer.style.alignItems = 'center';
    valueContainer.style.gap = '6px';
    
    var value3 = createElement('span', 'detail-value');
    value3.textContent = agent.sessions.length;
    
    var expandIcon = createElement('span', 'detail-value');
    expandIcon.textContent = sessionsExpanded ? '▼' : '▶';
    
    var abortedLabel = createElement('span', 'detail-label');
    if (agent.abortedCount > 0) {
      abortedLabel.textContent = '(aborted: ' + agent.abortedCount + ')';
    }
    
    valueContainer.appendChild(value3);
    valueContainer.appendChild(expandIcon);
    valueContainer.appendChild(abortedLabel);
    row3.appendChild(label3);
    row3.appendChild(valueContainer);
    
    // 绑定点击事件
    if (agent.sessions.length > 0 && onToggle) {
      row3.addEventListener('click', function(e) {
        e.stopPropagation();
        onToggle();
      });
    }
    
    return row3;
  }
  
  // 渲染会话列表
  function renderSessionList(sessions) {
    var sessionList = createElement('div', 'session-list');
    
    // 按更新时间排序
    var sortedSessions = sessions.slice().sort(function(a, b) {
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
    
    sortedSessions.forEach(function(s) {
      var item = createElement('div', 'session-item');
      
      var main = createElement('div', 'session-main');
      var label = createElement('div', 'session-label');
      label.textContent = (s.label || s.key || '未知会话').slice(0, 50);
      var task = createElement('div', 'session-task');
      task.textContent = getSessionTask(s);
      main.appendChild(label);
      main.appendChild(task);
      
      var meta = createElement('div', 'session-meta');
      var model = createElement('span', 'session-model');
      model.textContent = s.model || '-';
      var tokens = createElement('span', 'session-tokens');
      tokens.textContent = formatTokens(s.totalTokens || 0);
      var statusContainer = createElement('div', 'session-status');
      var dot = createElement('span', 'status-dot small ' + getSessionStatus(s));
      var statusText = createElement('span');
      statusText.textContent = getSessionStatus(s);
      statusContainer.appendChild(dot);
      statusContainer.appendChild(statusText);
      meta.appendChild(model);
      meta.appendChild(tokens);
      meta.appendChild(statusContainer);
      
      item.appendChild(main);
      item.appendChild(meta);
      sessionList.appendChild(item);
    });
    
    return sessionList;
  }
  
  // 创建或更新 Agent 卡片（统一函数，消除重复）
  function renderAgentCard(agentId, agent, savedState) {
    var detailsExpanded = savedState ? savedState.details : false;
    var sessionsExpanded = savedState ? savedState.sessions : false;
    
    // 检查是否已存在
    var existingCard = document.querySelector('.agent-card[data-agent-id="' + agentId + '"]');
    
    if (existingCard) {
      // 更新现有卡片
      updateExistingCard(existingCard, agent, detailsExpanded, sessionsExpanded);
      return existingCard;
    } else {
      // 创建新卡片
      return createNewCard(agent, detailsExpanded, sessionsExpanded);
    }
  }
  
  // 创建新卡片
  function createNewCard(agent, detailsExpanded, sessionsExpanded) {
    var card = createElement('div', 'agent-card');
    card.dataset.agentId = agent.id;
    
    var cardHeader = renderCardHeader(agent, detailsExpanded);
    card.appendChild(cardHeader);
    
    // 创建切换会话列表的回调函数
    var onToggleSessions = function() {
      sessionsExpanded = !sessionsExpanded;
      state.expandedStates[agent.id] = { 
        details: detailsExpanded, 
        sessions: sessionsExpanded 
      };
      updateExistingCard(card, agent, detailsExpanded, sessionsExpanded);
    };
    
    if (detailsExpanded) {
      var details = renderCardDetails(agent, sessionsExpanded, onToggleSessions);
      card.appendChild(details);
    }
    
    // 绑定卡片头部点击事件（展开/收起详情）
    addEventListener(cardHeader, 'click', function() {
      detailsExpanded = !detailsExpanded;
      state.expandedStates[agent.id] = { 
        details: detailsExpanded, 
        sessions: sessionsExpanded 
      };
      updateExistingCard(card, agent, detailsExpanded, sessionsExpanded);
    });
    
    return card;
  }
  
  // 更新现有卡片
  function updateExistingCard(card, agent, detailsExpanded, sessionsExpanded) {
    var cardHeader = card.querySelector('.agent-card-header');
    if (!cardHeader) return;
    
    // 更新头部
    var agentInfo = cardHeader.querySelector('.agent-info');
    var nameContainer = agentInfo.querySelector('div:first-child');
    nameContainer.querySelector('.agent-name').textContent = agent.id;
    
    // 更新或创建中文名字
    var cnNameEl = nameContainer.querySelector('.agent-cn-name');
    if (agent.cnName) {
      if (!cnNameEl) {
        cnNameEl = createElement('span', 'agent-cn-name');
        nameContainer.appendChild(cnNameEl);
      }
      cnNameEl.textContent = '（' + agent.cnName + '）';
    } else if (cnNameEl) {
      cnNameEl.remove();
    }
    
    // 更新展开图标
    agentInfo.querySelector('.expand-icon').textContent = detailsExpanded ? '▼' : '▶';
    
    // 更新状态
    var status = cardHeader.querySelector('.agent-status');
    status.querySelector('.model-badge').textContent = agent.model || '-';
    var statusBadge = status.querySelector('.status-badge');
    statusBadge.className = 'status-badge ' + agent.status;
    statusBadge.textContent = getStatusText(agent.status);
    
    // 更新或创建详情区域
    var existingDetails = card.querySelector('.agent-details');
    if (detailsExpanded) {
      // 创建切换会话列表的回调函数
      var onToggleSessions = function() {
        sessionsExpanded = !sessionsExpanded;
        state.expandedStates[agent.id] = { 
          details: detailsExpanded, 
          sessions: sessionsExpanded 
        };
        updateExistingCard(card, agent, detailsExpanded, sessionsExpanded);
      };
      
      if (!existingDetails) {
        existingDetails = renderCardDetails(agent, sessionsExpanded, onToggleSessions);
        card.appendChild(existingDetails);
      } else {
        updateCardDetails(existingDetails, agent, sessionsExpanded, onToggleSessions);
      }
      existingDetails.style.display = 'block';
    } else if (existingDetails) {
      existingDetails.style.display = 'none';
    }
  }
  
  // 更新卡片详情
  function updateCardDetails(details, agent, sessionsExpanded, onToggleSessions) {
    var contextPercent = getContextPercent(agent.totalTokens, agent.contextWindow);
    var contextLevel = getContextLevel(contextPercent);
    
    // 更新 Tokens 行
    var row1 = details.querySelector('.row-tokens .detail-value');
    if (row1) {
      row1.textContent = agent.sessions.length === 0 ? '- / -' : formatTokens(agent.totalTokens) + ' / ' + formatTokens(agent.contextWindow);
    }
    
    // 更新 Context 行
    var row2Value = details.querySelector('.row-context .detail-value');
    var fill = details.querySelector('.context-fill');
    if (row2Value && fill) {
      row2Value.textContent = agent.sessions.length === 0 ? '-' : contextPercent.toFixed(1) + '%';
      fill.className = 'context-fill ' + contextLevel;
      fill.style.width = (agent.sessions.length > 0 ? contextPercent : 0) + '%';
    }
    
    // 更新会话数量行
    var row3 = details.querySelector('.row-sessions');
    if (row3) {
      var valueContainer = row3.querySelectorAll('.detail-value');
      if (valueContainer.length >= 2) {
        valueContainer[0].textContent = agent.sessions.length;
        valueContainer[1].textContent = sessionsExpanded ? '▼' : '▶';
      }
      var abortedLabel = row3.querySelectorAll('.detail-label')[1];
      if (abortedLabel) {
        abortedLabel.textContent = agent.abortedCount > 0 ? '(aborted: ' + agent.abortedCount + ')' : '';
      }
      
      // 重新绑定点击事件（移除旧的监听器）
      if (agent.sessions.length > 0 && onToggleSessions) {
        // 克隆节点来移除旧的事件监听器
        var newRow3 = row3.cloneNode(true);
        row3.parentNode.replaceChild(newRow3, row3);
        // 添加新的事件监听器
        newRow3.addEventListener('click', function(e) {
          e.stopPropagation();
          onToggleSessions();
        });
      }
    }
    
    // 更新或创建会话列表
    var existingList = details.querySelector('.session-list');
    if (sessionsExpanded && agent.sessions.length > 0) {
      if (!existingList) {
        existingList = renderSessionList(agent.sessions);
        details.appendChild(existingList);
      } else {
        existingList.innerHTML = '';
        var newList = renderSessionList(agent.sessions);
        while (newList.firstChild) {
          existingList.appendChild(newList.firstChild);
        }
      }
    } else if (existingList) {
      existingList.remove();
    }
  }
  
  // ==================== 面板渲染 ====================
  
  // 渲染主面板
  function renderPanel(agentsData) {
    var body = document.querySelector('#' + PANEL_ID + ' .monitor-body');
    if (!body) return;
    
    var section = body.querySelector('.section');
    if (!section) {
      section = createElement('div', 'section');
      body.innerHTML = '';
      body.appendChild(section);
      
      // 提示文字
      var hint = createElement('div', 'hint');
      hint.innerHTML = '🟢运行中 🟡空闲 🔴aborted<br>点击卡片展开详情 | 点击会话数量展开会话列表';
      section.appendChild(hint);
    }
    
    // 更新或创建 agent 卡片
    var agentIds = Object.keys(agentsData);
    agentIds.forEach(function(agentId) {
      var agent = agentsData[agentId];
      var savedState = state.expandedStates[agentId] || { details: false, sessions: false };
      var card = renderAgentCard(agentId, agent, savedState);
      // 如果卡片是新创建的，添加到 section
      if (card && !card.parentNode) {
        section.appendChild(card);
      }
    });
    
    // 移除不存在的卡片
    var existingCards = section.querySelectorAll('.agent-card');
    existingCards.forEach(function(card) {
      var agentId = card.dataset.agentId;
      if (!agentsData[agentId]) {
        card.remove();
      }
    });
    
    // 添加刷新按钮
    if (!body.querySelector('.refresh-btn')) {
      var refreshBtn = createElement('button', 'refresh-btn');
      refreshBtn.textContent = '刷新（10 秒自动刷新）';
      addEventListener(refreshBtn, 'click', loadData);
      section.appendChild(refreshBtn);
    }
  }
  
  // HTML 转义函数（防止 XSS）
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // 显示错误信息
  function showError(message) {
    var body = document.querySelector('#' + PANEL_ID + ' .monitor-body');
    if (!body) return;
    
    var existingCards = body.querySelectorAll('.agent-card');
    if (existingCards.length === 0) {
      // 使用 createElement 避免 XSS
      body.innerHTML = '';
      var errorDiv = createElement('div', 'error');
      errorDiv.textContent = '加载失败：' + message;
      var hint = createElement('small');
      hint.textContent = '请确保 sessions API 服务正在运行';
      errorDiv.appendChild(document.createElement('br'));
      errorDiv.appendChild(hint);
      body.appendChild(errorDiv);
    }
    console.error('[Agents Monitor] 加载失败:', message);
  }
  
  // 加载数据
  function loadData() {
    console.log('[Agents Monitor] 开始加载数据...');
    fetchSessionsData()
      .then(function(agentsData) {
        console.log('[Agents Monitor] 数据加载成功，agents:', Object.keys(agentsData));
        renderPanel(agentsData);
      })
      .catch(function(e) {
        console.error('[Agents Monitor] 加载失败:', e.message);
        showError(e.message);
      });
  }
  
  // ==================== 面板初始化 ====================
  
  // 创建面板
  function initPanel() {
    // 检查是否已存在
    if (document.getElementById(PANEL_ID)) {
      console.log('[Agents Monitor] 面板已存在，跳过初始化');
      return;
    }
    
    // 创建样式
    var style = createElement('style');
    style.textContent = getStyles();
    document.head.appendChild(style);
    
    // 创建面板容器
    var panel = createElement('div', '');
    panel.id = PANEL_ID;
    panel.style.width = PANEL_DEFAULT_WIDTH + 'px';
    panel.style.height = PANEL_DEFAULT_HEIGHT + 'px';
    
    // 创建头部
    var header = createElement('div', 'monitor-header');
    var title = createElement('span', 'monitor-title');
    title.textContent = '🤖 Agents Monitor';
    var toggleBtn = createElement('button', 'monitor-toggle');
    toggleBtn.textContent = '−';
    header.appendChild(title);
    header.appendChild(toggleBtn);
    panel.appendChild(header);
    
    // 创建内容区
    var content = createElement('div', 'monitor-content');
    var body = createElement('div', 'monitor-body');
    body.innerHTML = '<div class="loading">加载中...</div>';
    content.appendChild(body);
    panel.appendChild(content);
    
    // 添加拖拽手柄（右下角和左下角）
    var resizeHandleBR = createElement('div', 'resize-handle-br');
    resizeHandleBR.title = '拖拽调整大小';
    panel.appendChild(resizeHandleBR);
    
    var resizeHandleBL = createElement('div', 'resize-handle-bl');
    resizeHandleBL.title = '拖拽调整大小';
    panel.appendChild(resizeHandleBL);
    
    // 添加到页面
    document.body.appendChild(panel);
    
    // 初始化拖拽和调整大小
    initDragAndResize(panel, header, resizeHandleBR, resizeHandleBL, toggleBtn, content);
    
    // 初始加载
    loadData();
    
    // 启动自动刷新
    state.refreshTimer = setInterval(loadData, REFRESH_INTERVAL);
    
    // 页面隐藏时暂停刷新（节省资源，Manifest V3 不允许 unload 事件）
    addEventListener(document, 'visibilitychange', function() {
      if (document.hidden) {
        // 页面隐藏，暂停刷新
        if (state.refreshTimer) {
          clearInterval(state.refreshTimer);
          state.refreshTimer = null;
        }
      } else {
        // 页面显示，恢复刷新
        if (!state.refreshTimer) {
          state.refreshTimer = setInterval(loadData, REFRESH_INTERVAL);
        }
      }
    });
    
    console.log('[Agents Monitor] 面板已初始化');
  }
  
  // 初始化拖拽和调整大小
  function initDragAndResize(panel, header, resizeHandleBR, resizeHandleBL, toggleBtn, content) {
    var dragState = { isDragging: false, hasDragged: false, lastX: 0, lastY: 0 };
    var resizeStateBR = { isResizing: false, lastX: 0, lastY: 0 };
    var resizeStateBL = { isResizing: false, lastX: 0, lastY: 0 };
    var isExpanded = true;
    
    // 面板拖拽
    addEventListener(header, 'mousedown', function(e) {
      dragState.isDragging = true;
      dragState.hasDragged = false;
      dragState.lastX = e.clientX;
      dragState.lastY = e.clientY;
      header.style.cursor = 'grabbing';
      e.preventDefault();
    }, { passive: false });
    
    addEventListener(document, 'mousemove', function(e) {
      if (!dragState.isDragging) return;
      
      var deltaX = e.clientX - dragState.lastX;
      var deltaY = e.clientY - dragState.lastY;
      
      // 5px 阈值区分点击和拖拽
      if (!dragState.hasDragged && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
        dragState.hasDragged = true;
      }
      
      if (!dragState.hasDragged) return;
      
      dragState.lastX = e.clientX;
      dragState.lastY = e.clientY;
      
      var rect = panel.getBoundingClientRect();
      var newLeft = (parseFloat(panel.style.left) || rect.left) + deltaX;
      var newTop = (parseFloat(panel.style.top) || rect.top) + deltaY;
      
      // 边界限制
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - rect.width));
      newTop = Math.max(10, Math.min(newTop, window.innerHeight - rect.height - 10));
      
      panel.style.left = newLeft + 'px';
      panel.style.top = newTop + 'px';
      panel.style.right = 'auto';
    }, { passive: true });
    
    addEventListener(document, 'mouseup', function() {
      dragState.isDragging = false;
      header.style.cursor = 'default';
      resizeStateBR.isResizing = false;
      resizeStateBL.isResizing = false;
    });
    
    // 右下角调整大小
    addEventListener(resizeHandleBR, 'mousedown', function(e) {
      resizeStateBR.isResizing = true;
      resizeStateBR.lastX = e.clientX;
      resizeStateBR.lastY = e.clientY;
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
    
    addEventListener(document, 'mousemove', function(e) {
      if (!resizeStateBR.isResizing) return;
      
      var deltaX = e.clientX - resizeStateBR.lastX;
      var deltaY = e.clientY - resizeStateBR.lastY;
      resizeStateBR.lastX = e.clientX;
      resizeStateBR.lastY = e.clientY;
      
      var newWidth = (parseFloat(panel.style.width) || PANEL_DEFAULT_WIDTH) + deltaX;
      var newHeight = (parseFloat(panel.style.height) || PANEL_DEFAULT_HEIGHT) + deltaY;
      
      newWidth = Math.max(PANEL_MIN_WIDTH, newWidth);
      newHeight = Math.max(PANEL_MIN_HEIGHT, Math.min(newHeight, PANEL_MAX_HEIGHT));
      
      panel.style.width = newWidth + 'px';
      panel.style.height = newHeight + 'px';
    }, { passive: true });
    
    // 左下角调整大小
    addEventListener(resizeHandleBL, 'mousedown', function(e) {
      resizeStateBL.isResizing = true;
      resizeStateBL.lastX = e.clientX;
      resizeStateBL.lastY = e.clientY;
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
    
    addEventListener(document, 'mousemove', function(e) {
      if (!resizeStateBL.isResizing) return;
      
      var deltaX = e.clientX - resizeStateBL.lastX;
      var deltaY = e.clientY - resizeStateBL.lastY;
      resizeStateBL.lastX = e.clientX;
      resizeStateBL.lastY = e.clientY;
      
      var rect = panel.getBoundingClientRect();
      var currentWidth = parseFloat(panel.style.width) || rect.width;
      var currentHeight = parseFloat(panel.style.height) || rect.height;
      var currentLeft = parseFloat(panel.style.left) || rect.left;
      
      var newWidth = currentWidth - deltaX;
      var newHeight = currentHeight + deltaY;
      var newLeft = currentLeft + deltaX;
      
      // 最小尺寸限制
      if (newWidth < PANEL_MIN_WIDTH) newWidth = PANEL_MIN_WIDTH;
      if (newHeight < PANEL_MIN_HEIGHT) newHeight = PANEL_MIN_HEIGHT;
      // 左边界限制
      if (newLeft < 0) {
        newWidth += newLeft;
        newLeft = 0;
      }
      
      panel.style.width = newWidth + 'px';
      panel.style.height = newHeight + 'px';
      panel.style.left = newLeft + 'px';
      panel.style.right = 'auto';
    }, { passive: true });
    
    addEventListener(document, 'mouseup', function() {
      resizeState.isResizing = false;
    });
    
    // 切换展开/收起
    addEventListener(toggleBtn, 'click', function() {
      isExpanded = !isExpanded;
      if (isExpanded) {
        // 展开：显示整个面板
        panel.style.display = 'block';
        toggleBtn.textContent = '−';
      } else {
        // 收起：隐藏整个面板
        panel.style.display = 'none';
        toggleBtn.textContent = '+';
      }
    });
  }
  
  // 获取样式
  function getStyles() {
    return `
      #${PANEL_ID} {
        position: fixed;
        top: 80px;
        right: 20px;
        background: #1a1a24;
        border: 1px solid #2a2a3a;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        overflow: hidden;
      }
      .monitor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #13131a;
        border-bottom: 1px solid #2a2a3a;
      }
      .monitor-title {
        font-size: 14px;
        font-weight: 600;
        color: #e4e4e7;
      }
      .monitor-toggle {
        width: 24px;
        height: 24px;
        border: none;
        background: #2a2a3a;
        color: #a1a1aa;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
      }
      .monitor-toggle:hover {
        background: #3a3a4a;
        color: #fff;
      }
      .monitor-content {
        height: calc(100% - 50px);
        overflow-y: auto;
      }
      .monitor-body {
        padding: 16px;
        background: #0a0a0f;
        color: #e4e4e7;
        font-size: 13px;
        min-height: 100%;
      }
      .section { margin-bottom: 16px; }
      .hint {
        font-size: 10px;
        color: #6b7280;
        margin-bottom: 12px;
        padding: 8px;
        background: #13131a;
        border-radius: 6px;
        font-style: italic;
        border-left: 3px solid #6366f1;
      }
      .agent-card {
        background: #13131a;
        border: 1px solid #2a2a3a;
        border-radius: 8px;
        margin-bottom: 8px;
        overflow: hidden;
        transition: all 0.2s;
      }
      .agent-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #1a1a24;
        cursor: pointer;
        transition: background 0.2s;
      }
      .agent-card-header:hover {
        background: #222230;
      }
      .agent-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .agent-name {
        font-weight: 600;
        font-size: 14px;
      }
      .agent-cn-name {
        font-size: 12px;
        color: #71717a;
        font-weight: normal;
      }
      .agent-status {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
      .status-dot.running { background: #10b981; box-shadow: 0 0 8px #10b981; }
      .status-dot.idle { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
      .status-dot.aborted { background: #ef4444; box-shadow: 0 0 8px #ef4444; animation: none; }
      .status-dot.no-sessions { background: #6b7280; box-shadow: none; animation: none; }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .model-badge {
        background: #6366f1;
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
      }
      .status-badge {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
      }
      .status-badge.running { background: #10b981; color: #fff; }
      .status-badge.idle { background: #f59e0b; color: #fff; }
      .status-badge.aborted { background: #ef4444; color: #fff; }
      .status-badge.no-sessions { background: #6b7280; color: #fff; }
      .expand-icon {
        color: #71717a;
        font-size: 12px;
        margin-left: 8px;
      }
      .agent-details {
        padding: 12px 16px;
        font-size: 11px;
        color: #a1a1aa;
        background: #0f0f16;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        transition: background 0.2s;
      }
      .detail-row.clickable {
        cursor: pointer;
      }
      .detail-row.clickable:hover {
        background: #1a1a24;
      }
      .detail-row:last-child {
        margin-bottom: 0;
      }
      .detail-label { color: #71717a; }
      .detail-value { color: #e4e4e7; font-weight: 500; }
      .context-bar {
        height: 4px;
        background: #2a2a3a;
        border-radius: 2px;
        margin-top: 0;
        overflow: hidden;
        width: 80px;
        flex-shrink: 0;
      }
      .context-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s;
      }
      .context-fill.low { background: #10b981; }
      .context-fill.medium { background: #f59e0b; }
      .context-fill.high { background: #ef4444; }
      .loading { color: #71717a; text-align: center; padding: 20px; }
      .error { color: #ef4444; text-align: center; padding: 20px; font-size: 11px; }
      .refresh-btn {
        display: block;
        width: 100%;
        padding: 8px;
        margin-top: 8px;
        background: #10b981;
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
      }
      .refresh-btn:hover { background: #059669; }
      .session-list {
        margin-top: 8px;
        padding: 8px;
        background: #13131a;
        border-radius: 6px;
        border: 1px solid #2a2a3a;
        max-height: 200px;
        overflow-y: auto;
      }
      .session-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 8px;
        margin-bottom: 4px;
        font-size: 10px;
        border-radius: 4px;
        background: #1a1a24;
      }
      .session-item:hover { background: #222230; }
      .session-main {
        flex: 1;
        min-width: 0;
      }
      .session-label { 
        color: #a1a1aa; 
        font-weight: 500;
        margin-bottom: 4px;
        word-break: break-word;
      }
      .session-task {
        color: #6b7280;
        font-size: 9px;
        margin-top: 2px;
        font-style: italic;
      }
      .session-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        margin-left: 8px;
      }
      .session-model {
        color: #6366f1;
        font-size: 9px;
        background: #13131a;
        padding: 2px 4px;
        border-radius: 3px;
      }
      .session-tokens {
        color: #71717a;
        font-size: 9px;
      }
      .session-status {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 9px;
      }
      .status-dot.small {
        width: 6px;
        height: 6px;
      }
      .resize-handle-br {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        cursor: nwse-resize;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 1000;
      }
      .resize-handle-br:hover {
        opacity: 1;
        background: linear-gradient(135deg, transparent 50%, #6366f1 50%);
        border-radius: 0 0 12px 0;
        box-shadow: -2px -2px 8px rgba(0, 0, 0, 0.3);
      }
      .resize-handle-bl {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 20px;
        height: 20px;
        cursor: nesw-resize;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 1000;
      }
      .resize-handle-bl:hover {
        opacity: 1;
        background: linear-gradient(45deg, transparent 50%, #6366f1 50%);
        border-radius: 0 0 0 12px;
        box-shadow: 2px -2px 8px rgba(0, 0, 0, 0.3);
      }
    `;
  }
  
  // ==================== 启动 ====================
  initPanel();
})();
