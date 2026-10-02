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
      icon: '<img src="icons/chatgpt.png" alt="ChatGPT">'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      url: 'https://gemini.google.com',
      color: '#4285f4',
      visible: true,
      icon: '<img src="icons/gemini.png" alt="Gemini">'
    },
    {
      id: 'claude',
      name: 'Claude',
      url: 'https://claude.ai',
      color: '#d97757',
      visible: true,
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg>'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      url: 'https://perplexity.ai',
      color: '#20b8cd',
      visible: true,
      icon: '<img src="icons/perplexity.png" alt="Perplexity">'
    },
    {
      id: 'copilot',
      name: 'Copilot',
      url: 'https://copilot.microsoft.com',
      color: '#0078d4',
      visible: true,
      icon: '<img src="icons/copilot.png" alt="Copilot">'
    },
    {
      id: 'grok',
      name: 'Grok',
      url: 'https://grok.x.ai',
      color: '#ffffff',
      visible: true,
      icon: '<img src="icons/grok.png" alt="Grok">'
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
