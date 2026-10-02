/**
 * Panels - Side Panels Orchestrator
 * Manages smooth slide-in and slide-out transitions for side panels (Settings, Bookmarks, Todo).
 */
'use strict';

const Panels = (() => {
  const CLOSE_DURATION_MS = 240;

  function isOpen(panel) {
    if (typeof panel === 'string') panel = document.getElementById(panel);
    if (!panel) return false;
    return panel.style.display !== 'none' && !panel.classList.contains('panel-closing');
  }

  function open(panel, onOpened) {
    if (typeof panel === 'string') panel = document.getElementById(panel);
    if (!panel) return;

    if (panel._closeCleanup) {
      panel._closeCleanup();
    }

    panel.classList.remove('panel-closing');
    panel.style.display = '';

    panel.dispatchEvent(new CustomEvent('panelopen', { detail: { panel } }));

    if (typeof onOpened === 'function') {
      onOpened(panel);
    }
  }

  function close(panel, onClosed) {
    if (typeof panel === 'string') panel = document.getElementById(panel);
    if (!panel || panel.style.display === 'none') {
      if (typeof onClosed === 'function') onClosed(panel);
      return;
    }

    // If already in the process of closing, attach callback to finish
    if (panel.classList.contains('panel-closing')) {
      if (typeof onClosed === 'function') {
        panel.addEventListener('animationend', () => onClosed(panel), { once: true });
      }
      return;
    }

    if (panel._closeCleanup) {
      panel._closeCleanup();
    }

    panel.classList.add('panel-closing');
    panel.dispatchEvent(new CustomEvent('panelclosing', { detail: { panel } }));

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      panel.removeEventListener('animationend', handleAnimationEnd);
      clearTimeout(fallbackTimer);
      panel._closeCleanup = null;
      panel.classList.remove('panel-closing');
      panel.style.display = 'none';
      panel.dispatchEvent(new CustomEvent('panelclosed', { detail: { panel } }));
      if (typeof onClosed === 'function') {
        onClosed(panel);
      }
    };

    const handleAnimationEnd = (e) => {
      if (e.target === panel) {
        finish();
      }
    };

    panel.addEventListener('animationend', handleAnimationEnd);
    const fallbackTimer = setTimeout(finish, CLOSE_DURATION_MS + 30);

    panel._closeCleanup = () => {
      finished = true;
      panel.removeEventListener('animationend', handleAnimationEnd);
      clearTimeout(fallbackTimer);
      panel._closeCleanup = null;
      panel.classList.remove('panel-closing');
    };
  }

  function closeAll(exceptPanel, onAllClosed) {
    if (typeof exceptPanel === 'string') exceptPanel = document.getElementById(exceptPanel);
    const panels = document.querySelectorAll('.side-panel, .settings-panel');
    let count = 0;
    panels.forEach(p => {
      if (p !== exceptPanel && isOpen(p)) {
        count++;
        close(p, () => {
          count--;
          if (count === 0 && typeof onAllClosed === 'function') {
            onAllClosed();
          }
        });
      }
    });
    if (count === 0 && typeof onAllClosed === 'function') {
      onAllClosed();
    }
  }

  function toggle(panel, onOpen, onClose) {
    if (typeof panel === 'string') panel = document.getElementById(panel);
    if (!panel) return;

    if (isOpen(panel)) {
      close(panel, onClose);
    } else {
      closeAll(panel);
      open(panel, onOpen);
    }
  }

  return {
    isOpen,
    open,
    close,
    closeAll,
    toggle,
  };
})();

// Navigation active indicator orchestrator
function setActiveNav(activeId = 'nav-home') {
  const targetId = activeId || 'nav-home';
  const navIds = ['nav-home', 'btn-bookmarks', 'btn-google-apps', 'btn-ai-tools'];
  navIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === targetId) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

// Also expose globally on window
if (typeof window !== 'undefined') {
  window.Panels = Panels;
  window.setActiveNav = setActiveNav;

  // When any panel closes, if no other panels or popovers are open, return active indicator to Home
  document.addEventListener('panelclosed', () => {
    const anyPanelOpen = Array.from(document.querySelectorAll('.side-panel, .settings-panel')).some(p => p.style.display !== 'none' && !p.classList.contains('panel-closing'));
    const anyPopoverOpen = Array.from(document.querySelectorAll('.popover')).some(p => p.style.display !== 'none');
    if (!anyPanelOpen && !anyPopoverOpen) {
      setActiveNav('nav-home');
    }
  });
}
