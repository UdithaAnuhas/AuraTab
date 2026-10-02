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
      icon: '<svg viewBox="0 0 24 24" fill="url(#gemini-tool-grad)"><path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"/><defs><linearGradient id="gemini-tool-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#4E82EE"/><stop offset="0.5" stop-color="#9B72CB"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs></svg>'
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
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z"/></svg>'
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
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg>'
    },
    {
      id: 'poe',
      name: 'Poe',
      url: 'https://poe.com',
      color: '#8b5cf6',
      visible: true,
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.513V8.36c0-.888-.717-1.608-1.603-1.615h-.013c-.498-.009-1.194-.123-1.688-.619-.44-.439-.584-1.172-.622-1.783l-.001.003c-.002-.014-.002-.03-.003-.044l-.001-.03a1.616 1.616 0 0 0-1.607-1.45H5.54a1.59 1.59 0 0 0-.164.008l-.055.009c-.034.004-.068.008-.102.015l-.069.017c-.028.008-.056.013-.083.022-.024.007-.045.015-.07.024-.026.01-.053.018-.08.03-.021.008-.042.02-.063.029-.027.013-.054.024-.08.038l-.059.034c-.025.015-.052.03-.077.047a.967.967 0 0 0-.061.045c-.021.015-.044.03-.065.05a1.21 1.21 0 0 0-.099.09c-.006.005-.013.01-.018.016l-.014.016a1.59 1.59 0 0 0-.094.102c-.017.02-.03.042-.046.062-.016.021-.033.042-.047.063l-.045.074-.037.062-.036.076a.682.682 0 0 0-.058.143l-.027.075-.02.074a.773.773 0 0 0-.018.078c-.006.03-.009.058-.013.088-.003.022-.008.045-.01.069-.003.022-.003.045-.004.068l-.002-.002c-.036.61-.182 1.345-.62 1.784-.496.495-1.191.61-1.69.618h-.012c-.05 0-.1.003-.147.007a1.27 1.27 0 0 0-.072.012c-.029.004-.057.007-.084.012l-.082.02-.072.018c-.026.009-.052.019-.079.027-.024.009-.048.016-.07.026-.024.01-.048.022-.072.034a.767.767 0 0 0-.072.033l-.068.04-.068.041a1.228 1.228 0 0 0-.072.054c-.018.014-.037.026-.053.04a1.627 1.627 0 0 0-.226.227c-.015.016-.027.036-.041.053a1.398 1.398 0 0 0-.054.074c-.016.022-.028.045-.041.067L.19 7.6c-.012.023-.022.047-.033.07l-.034.073c-.01.024-.017.046-.026.07-.01.027-.02.053-.027.08-.007.023-.012.047-.018.071l-.02.082-.012.084c-.003.024-.009.048-.01.072-.007.052-.01.106-.01.16v4.152c0 .888.717 1.609 1.603 1.616h.01c.5.008 1.196.123 1.69.618.43.43.577 1.143.618 1.746v4.13c0 .524.66.754.986.346l2.333-2.92h11.22c.861 0 1.563-.675 1.611-1.524l.001.003c.037-.61.183-1.344.622-1.783.495-.496 1.19-.61 1.689-.619h.012c.044 0 .088-.003.132-.007l.022-.001A1.613 1.613 0 0 0 24 12.513zm-3.85 1.69c-.502.503-1.215.613-1.717.619H5.566c-.501-.006-1.215-.114-1.717-.618-.408-.409-.565-1.117-.618-1.744V8.415c.052-.627.209-1.337.618-1.745.503-.503 1.216-.613 1.717-.619h12.867c.502.006 1.216.115 1.718.619.409.41.564 1.117.618 1.744v4.041c-.052.63-.209 1.339-.618 1.749zM8.424 7.99c-.892 0-1.615.723-1.615 1.615v1.616a1.615 1.615 0 1 0 3.23 0V9.604c0-.892-.723-1.615-1.615-1.615Zm7.154 0c-.893 0-1.616.723-1.616 1.615v1.616a1.615 1.615 0 1 0 3.231 0V9.604c0-.892-.723-1.615-1.615-1.615z"/></svg>'
    },
    {
      id: 'huggingchat',
      name: 'HuggingChat',
      url: 'https://huggingface.co/chat',
      color: '#ff9d00',
      visible: true,
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.025 1.13c-5.77 0-10.449 4.647-10.449 10.378 0 1.112.178 2.181.503 3.185.064-.222.203-.444.416-.577a.96.96 0 0 1 .524-.15c.293 0 .584.124.84.284.278.173.48.408.71.694.226.282.458.611.684.951v-.014c.017-.324.106-.622.264-.874s.403-.487.762-.543c.3-.047.596.06.787.203s.31.313.4.467c.15.257.212.468.233.542.01.026.653 1.552 1.657 2.54.616.605 1.01 1.223 1.082 1.912.055.537-.096 1.059-.38 1.572.637.121 1.294.187 1.967.187.657 0 1.298-.063 1.921-.178-.287-.517-.44-1.041-.384-1.581.07-.69.465-1.307 1.081-1.913 1.004-.987 1.647-2.513 1.657-2.539.021-.074.083-.285.233-.542.09-.154.208-.323.4-.467a1.08 1.08 0 0 1 .787-.203c.359.056.604.29.762.543s.247.55.265.874v.015c.225-.34.457-.67.683-.952.23-.286.432-.52.71-.694.257-.16.547-.284.84-.285a.97.97 0 0 1 .524.151c.228.143.373.388.43.625l.006.04a10.3 10.3 0 0 0 .534-3.273c0-5.731-4.678-10.378-10.449-10.378M8.327 6.583a1.5 1.5 0 0 1 .713.174 1.487 1.487 0 0 1 .617 2.013c-.183.343-.762-.214-1.102-.094-.38.134-.532.914-.917.71a1.487 1.487 0 0 1 .69-2.803m7.486 0a1.487 1.487 0 0 1 .689 2.803c-.385.204-.536-.576-.916-.71-.34-.12-.92.437-1.103.094a1.487 1.487 0 0 1 .617-2.013 1.5 1.5 0 0 1 .713-.174m-10.68 1.55a.96.96 0 1 1 0 1.921.96.96 0 0 1 0-1.92m13.838 0a.96.96 0 1 1 0 1.92.96.96 0 0 1 0-1.92M8.489 11.458c.588.01 1.965 1.157 3.572 1.164 1.607-.007 2.984-1.155 3.572-1.164.196-.003.305.12.305.454 0 .886-.424 2.328-1.563 3.202-.22-.756-1.396-1.366-1.63-1.32q-.011.001-.02.006l-.044.026-.01.008-.03.024q-.018.017-.035.036l-.032.04a1 1 0 0 0-.058.09l-.014.025q-.049.088-.11.19a1 1 0 0 1-.083.116 1.2 1.2 0 0 1-.173.18q-.035.029-.075.058a1.3 1.3 0 0 1-.251-.243 1 1 0 0 1-.076-.107c-.124-.193-.177-.363-.337-.444-.034-.016-.104-.008-.2.022q-.094.03-.216.087-.06.028-.125.063l-.13.074q-.067.04-.136.086a3 3 0 0 0-.135.096 3 3 0 0 0-.26.219 2 2 0 0 0-.12.121 2 2 0 0 0-.106.128l-.002.002a2 2 0 0 0-.09.132l-.001.001a1.2 1.2 0 0 0-.105.212q-.013.036-.024.073c-1.139-.875-1.563-2.317-1.563-3.203 0-.334.109-.457.305-.454m.836 10.354c.824-1.19.766-2.082-.365-3.194-1.13-1.112-1.789-2.738-1.789-2.738s-.246-.945-.806-.858-.97 1.499.202 2.362c1.173.864-.233 1.45-.685.64-.45-.812-1.683-2.896-2.322-3.295s-1.089-.175-.938.647 2.822 2.813 2.562 3.244-1.176-.506-1.176-.506-2.866-2.567-3.49-1.898.473 1.23 2.037 2.16c1.564.932 1.686 1.178 1.464 1.53s-3.675-2.511-4-1.297c-.323 1.214 3.524 1.567 3.287 2.405-.238.839-2.71-1.587-3.216-.642-.506.946 3.49 2.056 3.522 2.064 1.29.33 4.568 1.028 5.713-.624m5.349 0c-.824-1.19-.766-2.082.365-3.194 1.13-1.112 1.789-2.738 1.789-2.738s.246-.945.806-.858.97 1.499-.202 2.362c-1.173.864.233 1.45.685.64.451-.812 1.683-2.896 2.322-3.295s1.089-.175.938.647-2.822 2.813-2.562 3.244 1.176-.506 1.176-.506 2.866-2.567 3.49-1.898-.473 1.23-2.037 2.16c-1.564.932-1.686 1.178-1.464 1.53s3.675-2.511 4-1.297c.323 1.214-3.524 1.567-3.287 2.405.238.839 2.71-1.587 3.216-.642.506.946-3.49 2.056-3.522 2.064-1.29.33-4.568 1.028-5.713-.624"/></svg>'
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
