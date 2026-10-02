/**
 * AI Tools module
 * Glass popover with configurable AI tool links matching site vibe and accent color
 */
'use strict';

const AITools = (() => {
  const DEFAULT_TOOLS = [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      url: 'https://chatgpt.com',
      color: '#10a37f',
      visible: true,
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.28 9.37a5.98 5.98 0 0 0-.52-4.95 6.07 6.07 0 0 0-6.52-2.87 6.05 6.05 0 0 0-4.66-2.12c-3.07 0-5.63 2.3-5.96 5.33a6.05 6.05 0 0 0-3.9 2.83 6.06 6.06 0 0 0 .73 7.1 6.02 6.02 0 0 0 .52 4.95 6.07 6.07 0 0 0 6.52 2.87 6.03 6.03 0 0 0 4.66 2.12c3.07 0 5.63-2.3 5.96-5.33a6.05 6.05 0 0 0 3.9-2.83 6.06 6.06 0 0 0-.73-7.1zm-8.87 11.83a4.57 4.57 0 0 1-2.91-1.04l.15-.08 4.84-2.79a.77.77 0 0 0 .39-.67v-6.84l2.06 1.19c.03.02.04.05.04.08v5.57a4.58 4.58 0 0 1-4.57 4.58zm-7.66-3.83a4.55 4.55 0 0 1-.58-3.04l.15.09 4.84 2.8a.77.77 0 0 0 .78 0l5.92-3.42v2.38c0 .03-.02.06-.05.08l-4.82 2.78a4.58 4.58 0 0 1-6.24-1.67zm-1.84-8.8a4.55 4.55 0 0 1 2.33-2.03v5.75c0 .28.15.54.39.67l5.92 3.42-2.06 1.19a.08.08 0 0 1-.08 0l-4.83-2.79a4.58 4.58 0 0 1-1.67-6.21zm14.18 2.45l-5.92-3.42 2.06-1.19a.08.08 0 0 1 .08 0l4.83 2.79a4.58 4.58 0 0 1 .59 8.24v-5.75a.77.77 0 0 0-.39-.67h-.01zm2.34-3.84a4.55 4.55 0 0 1 .58 3.04l-.15-.09-4.84-2.8a.77.77 0 0 0-.78 0l-5.92 3.42V7.15c0-.03.02-.06.05-.08l4.82-2.78a4.58 4.58 0 0 1 6.24 1.67zM8.03 13.06l2.4-1.39 2.4 1.39v2.77l-2.4 1.39-2.4-1.39v-2.77z"/></svg>'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      url: 'https://gemini.google.com',
      color: '#4285f4',
      visible: true,
      icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C12 7.52 7.52 12 2 12c5.48 0 10 4.48 10 10 0-5.52 4.48-10 10-10-5.52 0-10-4.48-10-10z" fill="url(#gemini-tool-grad)"/><defs><linearGradient id="gemini-tool-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#4E82EE"/><stop offset="0.5" stop-color="#9B72CB"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs></svg>'
    },
    {
      id: 'claude',
      name: 'Claude',
      url: 'https://claude.ai',
      color: '#d97757',
      visible: true,
      icon: '<svg viewBox="0 0 24 24" fill="#D97757"><path d="M13.53 2.18a1.2 1.2 0 0 0-1.7-.24 1.2 1.2 0 0 0-.24 1.69l1.8 2.4-3.1 1.38a1.2 1.2 0 1 0 .98 2.2l3.1-1.38 1.2 3.16a1.2 1.2 0 1 0 2.25-.86l-1.2-3.15 3.15-1.2a1.2 1.2 0 0 0-.85-2.25l-3.15 1.2-1.8-2.4a1.2 1.2 0 0 0-.44-.55zM4.73 12.56a1.2 1.2 0 0 0-.86 2.25l3.16 1.2-1.2 3.16a1.2 1.2 0 1 0 2.24.86l1.2-3.16 3.1 1.38a1.2 1.2 0 0 0 .98-2.2l-3.1-1.38 1.8-2.4a1.2 1.2 0 0 0-1.94-1.45l-1.8 2.4-3.16-1.2a1.2 1.2 0 0 0-.42-.06z"/></svg>'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      url: 'https://perplexity.ai',
      color: '#20b8cd',
      visible: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#20B8CD" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5v19M4 7.5l16 9M4 16.5l16-9M5.5 12h13"/></svg>'
    },
    {
      id: 'copilot',
      name: 'Copilot',
      url: 'https://copilot.microsoft.com',
      color: '#0078d4',
      visible: true,
      icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M15 3.5a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V7.5a4 4 0 0 1 4-4h4z" fill="url(#copilot-tool-g1)"/><path d="M9 20.5a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H9z" fill="url(#copilot-tool-g2)" opacity="0.85"/><defs><linearGradient id="copilot-tool-g1" x1="7" y1="3" x2="19" y2="16" gradientUnits="userSpaceOnUse"><stop stop-color="#0078D4"/><stop offset="1" stop-color="#22B8CD"/></linearGradient><linearGradient id="copilot-tool-g2" x1="5" y1="8" x2="17" y2="21" gradientUnits="userSpaceOnUse"><stop stop-color="#E05B20"/><stop offset="1" stop-color="#F25022"/></linearGradient></defs></svg>'
    },
    {
      id: 'grok',
      name: 'Grok',
      url: 'https://grok.x.ai',
      color: '#ffffff',
      visible: true,
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2.5h2.9l-6.4 7.3 7.5 9.7h-5.9l-4.6-6-5.3 6H3.5l6.9-7.8L3.2 2.5h6l4.2 5.5 4.8-5.5zm-1 15.3h1.6L8.8 4.1H7.1l10.1 13.7z"/></svg>'
    },
    {
      id: 'poe',
      name: 'Poe',
      url: 'https://poe.com',
      color: '#8b5cf6',
      visible: true,
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.8 1.15 5.33 3 7.15V22l3.2-1.6c1.18.39 2.45.6 3.8.6 5.52 0 10-4.48 10-10S17.52 2 12 2zm-1 13H8.5V9H11c1.38 0 2.5 1.12 2.5 2.5S12.38 15 11 15zm0-2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H10v1h1z"/></svg>'
    },
    {
      id: 'huggingchat',
      name: 'HuggingChat',
      url: 'https://huggingface.co/chat',
      color: '#ff9d00',
      visible: true,
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.524 4.477 10 10 10s10-4.476 10-10c0-5.523-4.477-10-10-10zm-3.5 6a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zm7 0a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zm-3.5 9.5c-2.6 0-4.75-1.63-5.5-4h11c-.75 2.37-2.9 4-5.5 4z"/></svg>'
    }
  ];

  let tools = [];

  async function init() {
    const data = await Storage.getSync(['aiTools']);
    if (data.aiTools && Array.isArray(data.aiTools)) {
      // Merge with DEFAULT_TOOLS to update icons/colors and preserve user visibility/order
      tools = DEFAULT_TOOLS.map(def => {
        const existing = data.aiTools.find(t => t.id === def.id);
        if (existing) {
          return {
            ...def,
            visible: existing.visible !== undefined ? existing.visible : def.visible,
            url: existing.url || def.url,
            name: existing.name || def.name
          };
        }
        return def;
      });
      // Also preserve any custom tools the user might have added
      const customTools = data.aiTools.filter(t => !DEFAULT_TOOLS.some(def => def.id === t.id));
      tools.push(...customTools);
    } else {
      tools = [...DEFAULT_TOOLS];
    }
    render();
    _setupListeners();
  }

  function render() {
    const list = document.getElementById('ai-tools-list');
    if (!list) return;
    list.innerHTML = '';

    tools.filter(t => t.visible).forEach(tool => {
      const a = document.createElement('a');
      a.className = 'ai-tool-item';
      a.href = tool.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      const icon = document.createElement('span');
      icon.className = 'ai-tool-icon';
      if (tool.id === 'grok') {
        icon.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        icon.style.borderColor = 'rgba(var(--accent-rgb, 99, 102, 241), 0.25)';
        icon.style.color = 'var(--text-primary)';
      } else if (tool.color && tool.color.startsWith('#')) {
        icon.style.backgroundColor = tool.color + '1a';
        icon.style.borderColor = tool.color + '38';
        icon.style.color = tool.color;
      } else {
        icon.style.backgroundColor = 'rgba(var(--accent-rgb, 99, 102, 241), 0.12)';
        icon.style.borderColor = 'rgba(var(--accent-rgb, 99, 102, 241), 0.25)';
        icon.style.color = tool.color || 'var(--accent)';
      }
      icon.innerHTML = tool.icon;

      const name = document.createElement('span');
      name.className = 'ai-tool-name';
      name.textContent = tool.name;

      a.appendChild(icon);
      a.appendChild(name);
      list.appendChild(a);
    });
  }

  function _setupListeners() {
    const btn = document.getElementById('btn-ai-tools');
    const popover = document.getElementById('ai-tools-popover');
    if (!btn || !popover) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = popover.style.display !== 'none';
      _closeAllPopovers();
      if (!isOpen) {
        popover.style.display = '';
        if (typeof window.setActiveNav === 'function') {
          window.setActiveNav('btn-ai-tools');
        } else {
          btn.classList.add('active');
        }
        _positionPopover(popover, btn);
      } else {
        if (typeof window.setActiveNav === 'function') {
          window.setActiveNav('nav-home');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    const closeBtn = popover.querySelector('[data-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        popover.style.display = 'none';
        if (typeof window.setActiveNav === 'function') {
          window.setActiveNav('nav-home');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (popover.style.display !== 'none' && !popover.contains(e.target) && !btn.contains(e.target)) {
        popover.style.display = 'none';
        if (typeof window.setActiveNav === 'function') {
          window.setActiveNav('nav-home');
        } else {
          btn.classList.remove('active');
        }
      }
    });
  }

  function _positionPopover(popover, anchor) {
    const rect = anchor.getBoundingClientRect();
    const popoverWidth = 340;
    let left = rect.left + (rect.width / 2) - (popoverWidth / 2);
    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }
    popover.style.left = `${left}px`;
    popover.style.top = `${rect.bottom + 8}px`;
    popover.style.right = 'auto';
    popover.style.bottom = 'auto';
    popover.style.transform = 'none';
  }

  function setToolVisibility(id, visible) {
    const tool = tools.find(t => t.id === id);
    if (tool) {
      tool.visible = visible;
      render();
      _save();
    }
  }

  async function _save() {
    await Storage.setSync({ aiTools: tools });
  }

  return {
    init, render, setToolVisibility,
    get tools() { return tools; },
  };
})();

/** Close all popovers helper */
function _closeAllPopovers() {
  document.querySelectorAll('.popover').forEach(p => {
    p.style.display = 'none';
  });
  document.querySelectorAll('.side-panel').forEach(p => {
    p.style.display = 'none';
  });
  if (typeof window.setActiveNav === 'function') {
    window.setActiveNav('nav-home');
  } else {
    document.getElementById('btn-ai-tools')?.classList.remove('active');
    document.getElementById('btn-google-apps')?.classList.remove('active');
  }
}
