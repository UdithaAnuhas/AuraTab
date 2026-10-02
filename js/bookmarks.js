/**
 * Bookmarks module
 * Browse, search, and manage chrome.bookmarks in a searchable side panel
 * Features:
 * - Clean bookmark and folder rows (clutter-free, no hover icons)
 * - Custom glassmorphic context menu matching site theme and accent color:
 *   Add new bookmark, Open, Open in new window, Open in Incognito, Edit, Copy link address, Delete, and Open bookmark manager
 * - Add new bookmark button (+) in the panel header matching the site vibe and style
 * - Full bookmark & folder editing matching the browser's default Edit section:
 *   Name, URL, live Folder tree picker, and New folder / Delete folder buttons
 * - Syncs name, url, additions, AND folder moves directly with the browser (chrome.bookmarks)
 * - Real-time two-way synchronization with browser bookmarks
 * - Undo support for accidental removals
 */
'use strict';

const Bookmarks = (() => {
  let currentFolderId = '0';
  let breadcrumb = []; // [{id, title}]
  let activeContextNode = null;
  let activeContextIsFolder = false;
  let activeContextRow = null;
  let isLocalAction = false;

  let editingNode = null;
  let editingIsFolder = false;
  let isAddingNew = false;
  let selectedFolderId = '1';

  let draggedNode = null;
  let draggedIsFolder = false;
  let draggedRowEl = null;

  let showBookmarkIcons = true;

  async function init() {
    try {
      if (typeof Storage !== 'undefined' && Storage.getSync) {
        const stored = await Storage.getSync(['showBookmarkIcons']);
        if (stored && typeof stored.showBookmarkIcons === 'boolean') {
          showBookmarkIcons = stored.showBookmarkIcons;
        }
      }
    } catch (_) {}

    _setupListeners();
    _setupContextMenu();
    _setupEditModal();
    _setupSyncListeners();
  }

  function _setupListeners() {
    const btn = document.getElementById('btn-bookmarks');
    const panel = document.getElementById('bookmarks-panel');
    const searchInput = document.getElementById('bookmark-search');
    const bookmarkList = document.getElementById('bookmark-list');
    const addBtn = document.getElementById('btn-add-bookmark');

    if (btn && panel) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        _hideContextMenu();
        _hideAddMenu();
        _closeAllPopovers();
        if (typeof Panels !== 'undefined') {
          Panels.toggle(panel, () => {
            if (typeof window.setActiveNav === 'function') window.setActiveNav('btn-bookmarks');
            _loadRoot();
            if (searchInput) searchInput.focus();
          }, () => {
            if (typeof window.setActiveNav === 'function') window.setActiveNav('nav-home');
            _hideContextMenu();
            _hideAddMenu();
          });
        } else {
          const isOpen = panel.style.display !== 'none';
          document.querySelectorAll('.side-panel, .settings-panel').forEach(p => p.style.display = 'none');
          if (!isOpen) {
            panel.style.display = '';
            if (typeof window.setActiveNav === 'function') window.setActiveNav('btn-bookmarks');
            _loadRoot();
            if (searchInput) searchInput.focus();
          } else {
            if (typeof window.setActiveNav === 'function') window.setActiveNav('nav-home');
          }
        }
      });

      const closeBtn = panel.querySelector('[data-close]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          _hideContextMenu();
          _hideAddMenu();
          if (typeof window.setActiveNav === 'function') window.setActiveNav('nav-home');
          if (typeof Panels !== 'undefined') {
            Panels.close(panel);
          } else {
            panel.style.display = 'none';
          }
        });
      }

      panel.addEventListener('panelclosing', () => {
        _hideContextMenu();
        _hideAddMenu();
      });

      // Right click on panel empty area opens context menu with Add bookmark
      panel.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.bookmark-row') || e.target.closest('.modal') || e.target.closest('input')) return;
        e.preventDefault();
        _showContextMenu(e.clientX, e.clientY, null, false, null);
      });
    }

    // Add button in panel header (toggles menu asking Bookmark or Folder)
    const addMenu = document.getElementById('bookmark-add-menu');
    const addItemBm = document.getElementById('btn-add-item-bookmark');
    const addItemFolder = document.getElementById('btn-add-item-folder');

    const _hideAddMenu = () => {
      if (addMenu) addMenu.style.display = 'none';
    };

    if (addBtn && addMenu) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        _hideContextMenu();
        const isOpen = addMenu.style.display !== 'none';
        addMenu.style.display = isOpen ? 'none' : 'flex';
      });

      if (addItemBm) {
        addItemBm.addEventListener('click', (e) => {
          e.stopPropagation();
          _hideAddMenu();
          _openAddBookmarkModal(false);
        });
      }

      if (addItemFolder) {
        addItemFolder.addEventListener('click', (e) => {
          e.stopPropagation();
          _hideAddMenu();
          _openAddBookmarkModal(true);
        });
      }
    }

    // Search
    if (searchInput) {
      let searchTimer;
      searchInput.addEventListener('input', () => {
        _hideContextMenu();
        _hideAddMenu();
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          const query = searchInput.value.trim();
          if (query.length >= 2) {
            _search(query);
          } else {
            _renderFolder(currentFolderId);
          }
        }, 220);
      });
    }

    // Close context menu & add menu on list scroll and handle empty list drag
    if (bookmarkList) {
      bookmarkList.addEventListener('scroll', () => {
        _hideContextMenu();
        _hideAddMenu();
      }, { passive: true });

      bookmarkList.addEventListener('dragover', (e) => {
        if (!draggedNode) return;
        if (e.target === bookmarkList) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      });

      bookmarkList.addEventListener('drop', (e) => {
        if (!draggedNode) return;
        if (e.target === bookmarkList) {
          e.preventDefault();
          isLocalAction = true;
          chrome.bookmarks.getChildren(currentFolderId, (children) => {
            isLocalAction = false;
            if (!children || !children.length) return;
            const lastChild = children[children.length - 1];
            _reorderNode(draggedNode, lastChild, true);
          });
        }
      });
    }

    // Close context menu & add menu on click outside or Escape
    document.addEventListener('pointerdown', (e) => {
      const menu = document.getElementById('bookmark-context-menu');
      if (menu && menu.style.display !== 'none' && !menu.contains(e.target)) {
        _hideContextMenu();
      }
      if (addMenu && addMenu.style.display !== 'none' && !addMenu.contains(e.target) && !addBtn.contains(e.target)) {
        _hideAddMenu();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        _hideContextMenu();
        _hideAddMenu();
      }
    });
  }

  function _setupContextMenu() {
    const menu = document.getElementById('bookmark-context-menu');
    if (!menu) return;

    menu.addEventListener('contextmenu', (e) => e.preventDefault());
    menu.addEventListener('click', (e) => e.stopPropagation());
    menu.addEventListener('pointerdown', (e) => e.stopPropagation());

    const addCtxBtn = document.getElementById('bkm-ctx-add');
    const addFolderCtxBtn = document.getElementById('bkm-ctx-add-folder');
    const openBtn = document.getElementById('bkm-ctx-open');
    const newWinBtn = document.getElementById('bkm-ctx-new-window');
    const incognitoBtn = document.getElementById('bkm-ctx-incognito');
    const editBtn = document.getElementById('bkm-ctx-edit');
    const copyBtn = document.getElementById('bkm-ctx-copy');
    const deleteBtn = document.getElementById('bkm-ctx-delete');
    const managerBtn = document.getElementById('bkm-ctx-manager');

    if (addCtxBtn) {
      addCtxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        _openAddBookmarkModal(false);
        _hideContextMenu();
      });
    }

    if (addFolderCtxBtn) {
      addFolderCtxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        _openAddBookmarkModal(true);
        _hideContextMenu();
      });
    }

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeContextNode) return;
        if (activeContextIsFolder) {
          _navigateToFolder(activeContextNode.id);
        } else if (activeContextNode.url) {
          if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: activeContextNode.url });
          } else {
            window.open(activeContextNode.url, '_blank');
          }
        }
        _hideContextMenu();
      });
    }

    if (newWinBtn) {
      newWinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeContextNode || !activeContextNode.url) return;
        if (typeof chrome !== 'undefined' && chrome.windows && chrome.windows.create) {
          chrome.windows.create({ url: activeContextNode.url });
        } else {
          window.open(activeContextNode.url, '_blank', 'popup=no');
        }
        _hideContextMenu();
      });
    }

    if (incognitoBtn) {
      incognitoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeContextNode || !activeContextNode.url) return;
        if (typeof chrome !== 'undefined' && chrome.windows && chrome.windows.create) {
          chrome.windows.create({ url: activeContextNode.url, incognito: true }, () => {
            if (chrome.runtime.lastError) {
              if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('Incognito mode unavailable: Allow in Incognito in extension settings.');
              }
            }
          });
        } else {
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast('Incognito mode is not supported in this browser');
          }
        }
        _hideContextMenu();
      });
    }

    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeContextNode) return;
        _openEditModal(activeContextNode, activeContextIsFolder);
        _hideContextMenu();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeContextNode || !activeContextNode.url) return;
        _copyToClipboard(activeContextNode.url);
        _hideContextMenu();
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeContextNode) return;
        _deleteNode(activeContextNode, activeContextIsFolder, activeContextRow);
      });
    }

    if (managerBtn) {
      managerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = activeContextNode ? activeContextNode.id : null;
        _openBrowserBookmarkManager(targetId);
        _hideContextMenu();
      });
    }
  }

  function _openBrowserBookmarkManager(targetId) {
    const url = targetId ? `chrome://bookmarks/?id=${targetId}` : 'chrome://bookmarks/';
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url }, () => {
        if (chrome.runtime.lastError) {
          window.open(url, '_blank');
        }
      });
    } else {
      window.open(url, '_blank');
    }
  }

  function _setupEditModal() {
    const modal = document.getElementById('bookmark-edit-modal');
    if (!modal) return;

    const form = document.getElementById('bookmark-edit-form');
    const titleInput = document.getElementById('bookmark-edit-title-input');
    const urlInput = document.getElementById('bookmark-edit-url-input');
    const cancelBtn = document.getElementById('bookmark-edit-cancel-btn');
    const saveBtn = document.getElementById('bookmark-edit-save-btn');
    const closeBtn = modal.querySelector('[data-close]');
    const openMgrBtn = document.getElementById('bookmark-edit-open-manager-btn');
    const newFolderBtn = document.getElementById('bookmark-edit-new-folder-btn');
    const deleteFolderBtn = document.getElementById('bookmark-edit-delete-folder-btn');

    const closeModal = (e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      modal.style.display = 'none';
      editingNode = null;
      editingIsFolder = false;
      isAddingNew = false;
      const panel = document.getElementById('bookmarks-panel');
      if (panel) {
        if (typeof Panels !== 'undefined') Panels.open(panel);
        else panel.style.display = '';
      }
    };

    if (cancelBtn) cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal(e);
    });
    if (closeBtn) closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal(e);
    });

    if (openMgrBtn) {
      openMgrBtn.addEventListener('click', () => {
        const targetId = editingNode ? editingNode.id : null;
        closeModal();
        _openBrowserBookmarkManager(targetId);
      });
    }

    if (newFolderBtn) {
      newFolderBtn.addEventListener('click', () => {
        const folderName = window.prompt('New folder name:');
        if (folderName && folderName.trim()) {
          const parent = selectedFolderId || (editingNode ? editingNode.parentId : '1') || '1';
          chrome.bookmarks.create({ parentId: parent, title: folderName.trim() }, (newFolder) => {
            if (chrome.runtime.lastError) {
              if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('Could not create folder: ' + chrome.runtime.lastError.message);
              }
              return;
            }
            if (typeof App !== 'undefined' && App.showToast) {
              App.showToast(`Folder "${newFolder.title}" created`);
            }
            selectedFolderId = newFolder.id;
            _renderFolderTree(selectedFolderId);
            _updateDeleteFolderBtnState();
          });
        }
      });
    }

    if (deleteFolderBtn) {
      deleteFolderBtn.addEventListener('click', () => {
        if (editingIsFolder && editingNode) {
          _confirmAndDeleteFolder(editingNode, () => closeModal());
          return;
        }

        if (selectedFolderId) {
          chrome.bookmarks.get(selectedFolderId, (results) => {
            if (results && results.length) {
              _confirmAndDeleteFolder(results[0], () => {
                _updateDeleteFolderBtnState();
              });
            }
          });
        }
      });
    }

    modal.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target === modal) closeModal(e);
    });

    const submitEdit = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const newTitle = titleInput ? titleInput.value.trim() : '';
      if (!newTitle) {
        if (titleInput) titleInput.focus();
        return;
      }

      // Adding new bookmark or folder
      if (isAddingNew) {
        const targetParent = selectedFolderId || (currentFolderId !== '0' ? currentFolderId : '1') || '1';

        if (editingIsFolder) {
          // Creating folder
          if (typeof chrome !== 'undefined' && chrome.bookmarks) {
            chrome.bookmarks.create({ parentId: targetParent, title: newTitle }, (newFolder) => {
              if (chrome.runtime.lastError) {
                if (typeof App !== 'undefined' && App.showToast) {
                  App.showToast('Failed to create folder: ' + chrome.runtime.lastError.message);
                }
                return;
              }
              closeModal();
              if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('Folder created');
              }
              _refreshList();
            });
          } else {
            closeModal();
          }
          return;
        }

        // Creating bookmark
        let newUrl = urlInput ? urlInput.value.trim() : '';
        if (!newUrl) {
          if (urlInput) urlInput.focus();
          return;
        }
        if (!/^https?:\/\//i.test(newUrl) && !/^(chrome|edge|brave|file):\/\//i.test(newUrl)) {
          newUrl = 'https://' + newUrl;
        }
        if (typeof chrome !== 'undefined' && chrome.bookmarks) {
          chrome.bookmarks.create({ parentId: targetParent, title: newTitle, url: newUrl }, (newBm) => {
            if (chrome.runtime.lastError) {
              if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('Failed to add bookmark: ' + chrome.runtime.lastError.message);
              }
              return;
            }
            closeModal();
            if (typeof App !== 'undefined' && App.showToast) {
              App.showToast('Bookmark added');
            }
            _refreshList();
          });
        } else {
          closeModal();
        }
        return;
      }

      // Updating existing bookmark / folder
      if (!editingNode || !editingNode.id) {
        closeModal();
        return;
      }

      const updateData = { title: newTitle };

      if (!editingIsFolder) {
        let newUrl = urlInput ? urlInput.value.trim() : '';
        if (!newUrl) {
          if (urlInput) urlInput.focus();
          return;
        }
        if (!/^https?:\/\//i.test(newUrl) && !/^(chrome|edge|brave|file):\/\//i.test(newUrl)) {
          newUrl = 'https://' + newUrl;
        }
        updateData.url = newUrl;
      }

      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.update(editingNode.id, updateData, (updated) => {
          if (chrome.runtime.lastError) {
            if (typeof App !== 'undefined' && App.showToast) {
              App.showToast('Failed to update: ' + chrome.runtime.lastError.message);
            }
            return;
          }

          // If folder changed, move bookmark to the selected folder
          const shouldMove = selectedFolderId && editingNode.parentId && (selectedFolderId !== editingNode.parentId);

          if (shouldMove) {
            chrome.bookmarks.move(editingNode.id, { parentId: selectedFolderId }, () => {
              closeModal();
              if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(editingIsFolder ? 'Folder updated' : 'Bookmark updated and moved');
              }
              _refreshList();
            });
          } else {
            closeModal();
            if (typeof App !== 'undefined' && App.showToast) {
              App.showToast(editingIsFolder ? 'Folder renamed' : 'Bookmark updated');
            }
            _refreshList();
          }
        });
      } else {
        closeModal();
      }
    };

    if (saveBtn) saveBtn.addEventListener('click', submitEdit);
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitEdit();
    });
  }

  function _openAddBookmarkModal(isFolder = false) {
    editingNode = null;
    editingIsFolder = isFolder;
    isAddingNew = true;
    selectedFolderId = (currentFolderId && currentFolderId !== '0') ? currentFolderId : '1';

    const modal = document.getElementById('bookmark-edit-modal');
    if (!modal) return;

    const modalTitle = document.getElementById('bookmark-edit-modal-title');
    const titleLabel = document.querySelector('label[for="bookmark-edit-title-input"]');
    const titleInput = document.getElementById('bookmark-edit-title-input');
    const urlGroup = document.getElementById('bookmark-edit-url-group');
    const urlInput = document.getElementById('bookmark-edit-url-input');
    const folderSection = document.getElementById('bookmark-folder-tree-section');
    const saveBtn = document.getElementById('bookmark-edit-save-btn');

    if (modalTitle) {
      modalTitle.textContent = isFolder ? 'Add folder' : 'Add bookmark';
    }

    if (titleLabel) {
      titleLabel.textContent = isFolder ? 'Folder name' : 'Name';
    }

    if (titleInput) {
      titleInput.placeholder = isFolder ? 'Folder name' : 'Name';
      titleInput.value = '';
    }

    if (urlGroup) {
      urlGroup.style.display = isFolder ? 'none' : 'flex';
    }
    if (urlInput) {
      urlInput.required = !isFolder;
      urlInput.value = '';
    }

    if (folderSection) {
      folderSection.style.display = 'flex';
      _renderFolderTree(selectedFolderId);
    }

    if (saveBtn) {
      saveBtn.textContent = isFolder ? 'Create' : 'Save';
    }

    _updateDeleteFolderBtnState();

    modal.style.display = 'flex';
    setTimeout(() => {
      if (titleInput) {
        titleInput.focus();
      }
    }, 50);
  }

  function _openEditModal(node, isFolder) {
    editingNode = node;
    editingIsFolder = isFolder;
    isAddingNew = false;
    selectedFolderId = node.parentId || currentFolderId || '1';

    const modal = document.getElementById('bookmark-edit-modal');
    if (!modal) return;

    const modalTitle = document.getElementById('bookmark-edit-modal-title');
    const titleLabel = document.querySelector('label[for="bookmark-edit-title-input"]');
    const titleInput = document.getElementById('bookmark-edit-title-input');
    const urlGroup = document.getElementById('bookmark-edit-url-group');
    const urlInput = document.getElementById('bookmark-edit-url-input');
    const folderSection = document.getElementById('bookmark-folder-tree-section');
    const saveBtn = document.getElementById('bookmark-edit-save-btn');

    if (modalTitle) {
      modalTitle.textContent = isFolder ? 'Rename folder' : 'Edit bookmark';
    }

    if (titleLabel) {
      titleLabel.textContent = isFolder ? 'Folder name' : 'Name';
    }

    if (saveBtn) {
      saveBtn.textContent = 'Save';
    }

    if (titleInput) {
      titleInput.value = node.title || '';
    }

    if (urlGroup && urlInput) {
      if (isFolder) {
        urlGroup.style.display = 'none';
        urlInput.required = false;
        urlInput.value = '';
      } else {
        urlGroup.style.display = 'flex';
        urlInput.required = true;
        urlInput.value = node.url || '';
      }
    }

    if (folderSection) {
      if (isFolder) {
        folderSection.style.display = 'none';
      } else {
        folderSection.style.display = 'flex';
        _renderFolderTree(selectedFolderId);
      }
    }

    _updateDeleteFolderBtnState();

    modal.style.display = 'flex';
    setTimeout(() => {
      if (titleInput) {
        titleInput.focus();
        titleInput.select();
      }
    }, 50);
  }

  function _updateDeleteFolderBtnState() {
    const deleteFolderBtn = document.getElementById('bookmark-edit-delete-folder-btn');
    if (!deleteFolderBtn) return;

    if (isAddingNew) {
      deleteFolderBtn.style.display = 'none';
      return;
    }

    if (editingIsFolder && editingNode) {
      const isRoot = editingNode.parentId === '0' || editingNode.id === '0' || editingNode.id === '1' || editingNode.id === '2';
      deleteFolderBtn.style.display = isRoot ? 'none' : 'inline-flex';
      deleteFolderBtn.textContent = 'Delete folder';
      return;
    }

    // Check if selected folder in tree is custom/deletable
    const isCustom = selectedFolderId !== '0' && selectedFolderId !== '1' && selectedFolderId !== '2' && selectedFolderId !== '3';
    deleteFolderBtn.style.display = isCustom ? 'inline-flex' : 'none';
    deleteFolderBtn.textContent = 'Delete folder';
  }

  function _confirmAndDeleteFolder(folderNode, onDeleted) {
    if (!folderNode || !folderNode.id) return;
    const panel = document.getElementById('bookmarks-panel');
    if (panel) panel.style.display = '';

    const isRoot = folderNode.parentId === '0' || folderNode.id === '0' || folderNode.id === '1' || folderNode.id === '2';
    if (isRoot) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('System root folders cannot be removed');
      }
      return;
    }

    const confirmMsg = `Remove folder "${folderNode.title || 'Untitled'}" and all bookmarks inside?`;
    if (!window.confirm(confirmMsg)) return;

    isLocalAction = true;
    chrome.bookmarks.removeTree(folderNode.id, () => {
      setTimeout(() => { isLocalAction = false; }, 350);
      if (chrome.runtime.lastError) {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Failed to remove folder: ' + chrome.runtime.lastError.message);
        }
        return;
      }

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`Folder "${folderNode.title || 'Untitled'}" removed`);
      }

      // If deleted folder was selected, reset to parent or root bookmarks bar
      if (selectedFolderId === folderNode.id) {
        selectedFolderId = folderNode.parentId || '1';
      }

      _renderFolderTree(selectedFolderId);
      _updateDeleteFolderBtnState();
      _refreshList();

      if (typeof onDeleted === 'function') onDeleted();
    });
  }

  function _renderFolderTree(activeFolderId) {
    const treeContainer = document.getElementById('bookmark-folder-tree');
    if (!treeContainer) return;
    treeContainer.innerHTML = '<div style="padding:12px;color:var(--text-tertiary);font-size:var(--fs-xs);">Loading folders...</div>';

    if (typeof chrome === 'undefined' || !chrome.bookmarks) {
      treeContainer.innerHTML = '';
      return;
    }

    chrome.bookmarks.getTree((tree) => {
      if (chrome.runtime.lastError || !tree || !tree.length) {
        treeContainer.innerHTML = '<div style="padding:12px;color:var(--text-tertiary);font-size:var(--fs-xs);">Could not load folders</div>';
        return;
      }

      treeContainer.innerHTML = '';
      const rootNode = tree[0];

      const renderNode = (folderNode, depth) => {
        if (folderNode.id === '0') {
          (folderNode.children || []).forEach(child => {
            if (!child.url) renderNode(child, 0);
          });
          return;
        }

        const isDeletable = folderNode.parentId !== '0' && folderNode.id !== '0' && folderNode.id !== '1' && folderNode.id !== '2' && folderNode.id !== '3';

        const item = document.createElement('div');
        item.className = 'folder-tree-item';
        item.dataset.folderId = folderNode.id;
        item.style.paddingLeft = `${depth * 16 + 8}px`;

        if (folderNode.id === selectedFolderId) {
          item.classList.add('selected');
        }

        const content = document.createElement('div');
        content.className = 'folder-tree-content';
        content.innerHTML = `
          <span class="folder-tree-icon">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </span>
          <span class="folder-tree-title">${_escapeHtml(folderNode.title || 'Untitled')}</span>
        `;
        item.appendChild(content);

        // Delete button directly on custom folder rows in tree
        if (isDeletable) {
          const treeDelBtn = document.createElement('button');
          treeDelBtn.type = 'button';
          treeDelBtn.className = 'folder-tree-delete-btn';
          treeDelBtn.setAttribute('aria-label', `Delete folder ${folderNode.title || 'Untitled'}`);
          treeDelBtn.setAttribute('title', `Delete folder ${folderNode.title || 'Untitled'}`);
          treeDelBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          `;
          treeDelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            _confirmAndDeleteFolder(folderNode);
          });
          item.appendChild(treeDelBtn);
        }

        item.addEventListener('click', () => {
          treeContainer.querySelectorAll('.folder-tree-item').forEach(el => el.classList.remove('selected'));
          item.classList.add('selected');
          selectedFolderId = folderNode.id;
          _updateDeleteFolderBtnState();
        });

        treeContainer.appendChild(item);

        (folderNode.children || []).forEach(child => {
          if (!child.url) {
            renderNode(child, depth + 1);
          }
        });
      };

      renderNode(rootNode, 0);
    });
  }

  function _setupSyncListeners() {
    if (typeof chrome === 'undefined' || !chrome.bookmarks) return;

    const onBookmarksChanged = () => {
      if (isLocalAction) return;
      const panel = document.getElementById('bookmarks-panel');
      if (panel && panel.style.display !== 'none') {
        _refreshList();
      }
    };

    try {
      if (chrome.bookmarks.onRemoved) chrome.bookmarks.onRemoved.addListener(onBookmarksChanged);
      if (chrome.bookmarks.onCreated) chrome.bookmarks.onCreated.addListener(onBookmarksChanged);
      if (chrome.bookmarks.onChanged) chrome.bookmarks.onChanged.addListener(onBookmarksChanged);
      if (chrome.bookmarks.onMoved) chrome.bookmarks.onMoved.addListener(onBookmarksChanged);
    } catch (err) {
      console.warn('Bookmarks live sync error:', err);
    }
  }

  function _refreshList() {
    const searchInput = document.getElementById('bookmark-search');
    const query = searchInput ? searchInput.value.trim() : '';
    if (query.length >= 2) {
      _search(query);
    } else {
      _renderFolder(currentFolderId);
    }
  }

  function _loadRoot() {
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      chrome.bookmarks.get('1', (results) => {
        if (!chrome.runtime.lastError && results && results.length) {
          _navigateToFolder('1');
        } else {
          _navigateToFolder('0');
        }
      });
    } else {
      _navigateToFolder('0');
    }
  }

  function _renderFolder(folderId) {
    if (typeof chrome === 'undefined' || !chrome.bookmarks) {
      _showNoBookmarks();
      return;
    }

    chrome.bookmarks.getChildren(folderId, (children) => {
      if (chrome.runtime.lastError || !children) {
        _showNoBookmarks();
        return;
      }

      const list = document.getElementById('bookmark-list');
      if (!list) return;
      list.innerHTML = '';

      // Folders always come first at the top, followed by bookmark links
      const folders = children.filter(node => !node.url);
      const links = children.filter(node => !!node.url);
      const sortedChildren = [...folders, ...links];

      sortedChildren.forEach(node => {
        const isFolder = !node.url;
        const row = _createBookmarkRow(node, isFolder);
        list.appendChild(row);
      });

      if (children.length === 0) {
        _showNoBookmarks();
      }
    });
  }

  function _clearRowDropIndicators(row) {
    if (row) row.classList.remove('drop-target-above', 'drop-target-below', 'drop-target-inside');
  }

  function _cleanupDropIndicators() {
    document.querySelectorAll('.bookmark-row').forEach(r => {
      r.classList.remove('drop-target-above', 'drop-target-below', 'drop-target-inside', 'is-dragging');
    });
  }

  function _moveNodeToFolder(dragged, targetFolder) {
    if (typeof chrome === 'undefined' || !chrome.bookmarks) return;
    if (dragged.id === targetFolder.id) return;
    if (draggedIsFolder && (targetFolder.parentId === dragged.id || targetFolder.id === dragged.id)) return;

    isLocalAction = true;
    chrome.bookmarks.move(dragged.id, { parentId: targetFolder.id }, () => {
      isLocalAction = false;
      if (chrome.runtime.lastError) {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Could not move: ' + chrome.runtime.lastError.message);
        }
        return;
      }
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`Moved to ${targetFolder.title || 'folder'}`);
      }
      _refreshList();
    });
  }

  function _reorderNode(dragged, target, isBelow) {
    if (typeof chrome === 'undefined' || !chrome.bookmarks) return;
    if (dragged.id === target.id) return;

    isLocalAction = true;
    chrome.bookmarks.getChildren(currentFolderId, (children) => {
      if (chrome.runtime.lastError || !children) {
        isLocalAction = false;
        return;
      }

      const currentDragged = children.find(c => c.id === dragged.id);
      const currentTarget = children.find(c => c.id === target.id);

      if (!currentDragged || !currentTarget) {
        isLocalAction = false;
        return;
      }

      const oldIndex = currentDragged.index;
      let targetIndex = currentTarget.index;

      if (targetIndex < oldIndex) {
        targetIndex = isBelow ? targetIndex + 1 : targetIndex;
      } else if (targetIndex > oldIndex) {
        targetIndex = isBelow ? targetIndex : targetIndex - 1;
      }

      if (targetIndex === oldIndex) {
        isLocalAction = false;
        return;
      }

      chrome.bookmarks.move(dragged.id, { parentId: currentFolderId, index: targetIndex }, () => {
        isLocalAction = false;
        if (chrome.runtime.lastError) {
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast('Could not reorder: ' + chrome.runtime.lastError.message);
          }
          return;
        }
        _refreshList();
      });
    });
  }

  function _createBookmarkRow(node, isFolder) {
    const row = document.createElement('li');
    row.className = 'bookmark-row';
    row.dataset.id = node.id;

    const searchInput = document.getElementById('bookmark-search');
    const isSearching = searchInput && searchInput.value.trim().length >= 2;

    // Enable drag and drop reordering when browsing folders (not during search)
    if (!isSearching) {
      row.draggable = true;

      row.addEventListener('dragstart', (e) => {
        draggedNode = node;
        draggedIsFolder = isFolder;
        draggedRowEl = row;

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', node.id);

        setTimeout(() => {
          row.classList.add('is-dragging');
        }, 0);
      });

      row.addEventListener('dragend', () => {
        row.classList.remove('is-dragging');
        _cleanupDropIndicators();
        draggedNode = null;
        draggedIsFolder = false;
        draggedRowEl = null;
      });

      row.addEventListener('dragover', (e) => {
        if (!draggedNode || draggedNode.id === node.id) return;
        e.preventDefault();
        e.stopPropagation();

        const rect = row.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const height = rect.height;

        _clearRowDropIndicators(row);

        // If target is a folder and not dropping inside itself, middle 50% drops into folder
        if (isFolder && draggedNode.id !== node.id && offsetY > height * 0.25 && offsetY < height * 0.75) {
          row.classList.add('drop-target-inside');
          e.dataTransfer.dropEffect = 'move';
          return;
        }

        // Reordering indicator: top half -> above, bottom half -> below
        if (offsetY < height * 0.5) {
          row.classList.add('drop-target-above');
        } else {
          row.classList.add('drop-target-below');
        }
        e.dataTransfer.dropEffect = 'move';
      });

      row.addEventListener('dragleave', (e) => {
        if (!row.contains(e.relatedTarget)) {
          _clearRowDropIndicators(row);
        }
      });

      row.addEventListener('drop', (e) => {
        if (!draggedNode || draggedNode.id === node.id) return;
        e.preventDefault();
        e.stopPropagation();

        const isInside = row.classList.contains('drop-target-inside');
        const isBelow = row.classList.contains('drop-target-below');
        _cleanupDropIndicators();

        if (isInside && isFolder) {
          _moveNodeToFolder(draggedNode, node);
        } else {
          _reorderNode(draggedNode, node, isBelow);
        }
      });
    }

    if (isFolder) {
      // Folder Item
      const item = document.createElement('div');
      item.className = 'bookmark-item bookmark-folder';
      item.setAttribute('role', 'treeitem');
      item.setAttribute('tabindex', '0');
      item.setAttribute('draggable', 'false');

      const folderIcon = document.createElement('span');
      folderIcon.className = 'bookmark-item-icon';
      folderIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>';

      const folderTitle = document.createElement('span');
      folderTitle.className = 'bookmark-item-title';
      folderTitle.textContent = node.title || 'Untitled';

      item.appendChild(folderIcon);
      item.appendChild(folderTitle);

      item.addEventListener('click', () => {
        _hideContextMenu();
        _navigateToFolder(node.id);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
      row.appendChild(item);
    } else {
      // Bookmark Link
      const a = document.createElement('a');
      a.className = 'bookmark-item bookmark-link';
      const safeUrl = (node.url && !/^javascript:/i.test(node.url.trim())) ? node.url : '#';
      a.href = safeUrl;
      a.setAttribute('role', 'treeitem');
      a.setAttribute('draggable', 'false');
      a.title = `${node.title || ''}\n${node.url || ''}`;

      const iconSpan = document.createElement('span');
      iconSpan.className = 'bookmark-item-icon';

      const fallbackSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

      if (showBookmarkIcons) {
        const primaryFavicon = _getFaviconUrl(node.url);
        const googleFavicon = _getGoogleFaviconUrl(node.url);

        if (primaryFavicon) {
          const img = document.createElement('img');
          img.className = 'bookmark-favicon';
          img.alt = '';
          img.width = 16;
          img.height = 16;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.src = primaryFavicon;

          let triedGoogle = false;
          img.onerror = () => {
            if (!triedGoogle && googleFavicon && img.src !== googleFavicon) {
              triedGoogle = true;
              img.src = googleFavicon;
            } else {
              img.onerror = null;
              iconSpan.innerHTML = fallbackSvg;
            }
          };

          iconSpan.appendChild(img);
        } else {
          iconSpan.innerHTML = fallbackSvg;
        }
      } else {
        iconSpan.innerHTML = fallbackSvg;
      }

      const titleSpan = document.createElement('span');
      titleSpan.className = 'bookmark-item-title';
      titleSpan.textContent = node.title || node.url || 'Untitled';

      a.appendChild(iconSpan);
      a.appendChild(titleSpan);
      row.appendChild(a);
    }

    // Right-click: trigger custom theme-matched context menu
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      _showContextMenu(e.clientX, e.clientY, node, isFolder, row);
    });

    return row;
  }

  function _deleteNode(node, isFolder, rowEl) {
    _hideContextMenu();
    const panel = document.getElementById('bookmarks-panel');
    if (panel) panel.style.display = '';
    if (!node || !node.id) return;

    if (isFolder) {
      _confirmAndDeleteFolder(node, () => {
        if (rowEl) rowEl.remove();
        _checkEmptyList();
      });
      return;
    }

    // Single bookmark link
    if (rowEl) {
      rowEl.classList.add('bookmark-row-removing');
    }

    // Save info for Undo restoration
    const restoreData = {
      parentId: node.parentId || currentFolderId || '1',
      title: node.title || '',
      url: node.url
    };
    if (typeof node.index === 'number') {
      restoreData.index = node.index;
    }

    isLocalAction = true;
    chrome.bookmarks.remove(node.id, () => {
      setTimeout(() => { isLocalAction = false; }, 350);
      if (chrome.runtime.lastError) {
        if (rowEl) rowEl.classList.remove('bookmark-row-removing');
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Failed to remove bookmark: ' + chrome.runtime.lastError.message);
        }
        return;
      }

      if (rowEl) rowEl.remove();
      _checkEmptyList();

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Bookmark removed', 5000, 'Undo', () => {
          chrome.bookmarks.create(restoreData, () => {
            if (chrome.runtime.lastError) {
              App.showToast('Could not restore bookmark');
              return;
            }
            App.showToast('Bookmark restored');
            _refreshList();
          });
        });
      }
    });
  }

  function _showContextMenu(clientX, clientY, node, isFolder, rowEl) {
    activeContextNode = node;
    activeContextIsFolder = isFolder;
    activeContextRow = rowEl;

    const menu = document.getElementById('bookmark-context-menu');
    if (!menu) return;

    const addBtn = document.getElementById('bkm-ctx-add');
    const addFolderBtn = document.getElementById('bkm-ctx-add-folder');
    const div0 = document.getElementById('bkm-ctx-div-0');
    const openBtn = document.getElementById('bkm-ctx-open');
    const openLabel = document.getElementById('bkm-ctx-open-label');
    const newWinBtn = document.getElementById('bkm-ctx-new-window');
    const incognitoBtn = document.getElementById('bkm-ctx-incognito');
    const div1 = document.getElementById('bkm-ctx-div-1');
    const editBtn = document.getElementById('bkm-ctx-edit');
    const editLabel = document.getElementById('bkm-ctx-edit-label');
    const copyBtn = document.getElementById('bkm-ctx-copy');
    const div2 = document.getElementById('bkm-ctx-div-2');
    const deleteBtn = document.getElementById('bkm-ctx-delete');
    const deleteLabel = document.getElementById('bkm-ctx-delete-label');
    const div3 = document.getElementById('bkm-ctx-div-3');
    const managerBtn = document.getElementById('bkm-ctx-manager');

    // If right clicked on empty area of bookmarks panel
    if (!node) {
      if (addBtn) addBtn.style.display = 'flex';
      if (addFolderBtn) addFolderBtn.style.display = 'flex';
      if (div0) div0.style.display = '';
      if (openBtn) openBtn.style.display = 'none';
      if (newWinBtn) newWinBtn.style.display = 'none';
      if (incognitoBtn) incognitoBtn.style.display = 'none';
      if (div1) div1.style.display = 'none';
      if (editBtn) editBtn.style.display = 'none';
      if (copyBtn) copyBtn.style.display = 'none';
      if (div2) div2.style.display = 'none';
      if (deleteBtn) deleteBtn.style.display = 'none';
      if (div3) div3.style.display = '';
      if (managerBtn) managerBtn.style.display = 'flex';
    } else {
      if (addBtn) addBtn.style.display = 'flex';
      if (addFolderBtn) addFolderBtn.style.display = 'flex';
      if (div0) div0.style.display = '';

      const isRoot = isFolder && (node.parentId === '0' || node.id === '0' || node.id === '1' || node.id === '2');

      if (isFolder) {
        if (openBtn) openBtn.style.display = 'flex';
        if (openLabel) openLabel.textContent = 'Open folder';
        if (newWinBtn) newWinBtn.style.display = 'none';
        if (incognitoBtn) incognitoBtn.style.display = 'none';
        if (copyBtn) copyBtn.style.display = 'none';

        if (isRoot) {
          if (div1) div1.style.display = 'none';
          if (editBtn) editBtn.style.display = 'none';
          if (div2) div2.style.display = 'none';
          if (deleteBtn) deleteBtn.style.display = 'none';
        } else {
          if (div1) div1.style.display = '';
          if (editBtn) {
            editBtn.style.display = 'flex';
            if (editLabel) editLabel.textContent = 'Rename folder...';
          }
          if (div2) div2.style.display = '';
          if (deleteBtn) {
            deleteBtn.style.display = 'flex';
            if (deleteLabel) deleteLabel.textContent = 'Delete folder';
          }
        }
      } else {
        if (openBtn) openBtn.style.display = 'flex';
        if (openLabel) openLabel.textContent = 'Open in new tab';
        if (newWinBtn) newWinBtn.style.display = 'flex';
        if (incognitoBtn) incognitoBtn.style.display = 'flex';
        if (div1) div1.style.display = '';
        if (editBtn) {
          editBtn.style.display = 'flex';
          if (editLabel) editLabel.textContent = 'Edit...';
        }
        if (copyBtn) copyBtn.style.display = 'flex';
        if (div2) div2.style.display = '';
        if (deleteBtn) {
          deleteBtn.style.display = 'flex';
          if (deleteLabel) deleteLabel.textContent = 'Delete bookmark';
        }
      }

      if (div3) div3.style.display = '';
      if (managerBtn) managerBtn.style.display = 'flex';
    }

    menu.style.display = 'flex';
    menu.style.visibility = 'hidden';

    const menuWidth = menu.offsetWidth || 205;
    const menuHeight = menu.offsetHeight || 260;

    let x = clientX;
    let y = clientY;

    if (x + menuWidth > window.innerWidth - 8) {
      x = window.innerWidth - menuWidth - 8;
    }
    if (y + menuHeight > window.innerHeight - 8) {
      y = window.innerHeight - menuHeight - 8;
    }

    menu.style.left = `${Math.max(8, x)}px`;
    menu.style.top = `${Math.max(8, y)}px`;
    menu.style.visibility = 'visible';
  }

  function _hideContextMenu() {
    const menu = document.getElementById('bookmark-context-menu');
    if (menu) {
      menu.style.display = 'none';
    }
    activeContextNode = null;
    activeContextIsFolder = false;
    activeContextRow = null;
  }

  function _copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Link copied to clipboard');
        }
      }).catch(() => _fallbackCopy(text));
    } else {
      _fallbackCopy(text);
    }
  }

  function _fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Link copied to clipboard');
      }
    } catch {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Could not copy link');
      }
    }
    ta.remove();
  }

  function _checkEmptyList() {
    const list = document.getElementById('bookmark-list');
    if (list && list.querySelectorAll('.bookmark-row').length === 0) {
      _showNoBookmarks();
    }
  }

  function _navigateToFolder(folderId, explicitBreadcrumb) {
    _hideContextMenu();
    const searchInput = document.getElementById('bookmark-search');
    if (searchInput) searchInput.value = '';

    if (explicitBreadcrumb && explicitBreadcrumb.length) {
      currentFolderId = folderId;
      breadcrumb = explicitBreadcrumb;
      _renderBreadcrumb();
      _renderFolder(folderId);
      return;
    }

    const rootTitle = (typeof I18n !== 'undefined' && I18n.t) ? I18n.t('bookmarks', 'Bookmarks') : 'Bookmarks';

    if (!folderId || folderId === '0') {
      currentFolderId = '0';
      breadcrumb = [{ id: '0', title: rootTitle }];
      _renderBreadcrumb();
      _renderFolder('0');
      return;
    }

    _buildBreadcrumbPath(folderId, (path) => {
      currentFolderId = folderId;
      breadcrumb = path;
      _renderBreadcrumb();
      _renderFolder(folderId);
    });
  }

  function _buildBreadcrumbPath(folderId, callback) {
    const rootTitle = (typeof I18n !== 'undefined' && I18n.t) ? I18n.t('bookmarks', 'Bookmarks') : 'Bookmarks';
    if (typeof chrome === 'undefined' || !chrome.bookmarks) {
      callback([{ id: '0', title: rootTitle }]);
      return;
    }

    const path = [];

    function step(id) {
      if (!id || id === '0') {
        path.unshift({ id: '0', title: rootTitle });
        callback(path);
        return;
      }
      chrome.bookmarks.get(id, (results) => {
        if (chrome.runtime.lastError || !results || !results.length) {
          path.unshift({ id: '0', title: rootTitle });
          callback(path);
          return;
        }
        const node = results[0];
        let title = node.title;
        if (!title) {
          if (node.id === '1') title = 'Bookmarks bar';
          else if (node.id === '2') title = 'Other bookmarks';
          else if (node.id === '3') title = 'Mobile bookmarks';
          else title = 'Folder';
        }
        path.unshift({ id: node.id, title });
        if (node.parentId && node.parentId !== '0') {
          step(node.parentId);
        } else {
          path.unshift({ id: '0', title: rootTitle });
          callback(path);
        }
      });
    }

    step(folderId);
  }

  function _renderBreadcrumb() {
    const bc = document.getElementById('bookmark-breadcrumb');
    if (!bc) return;
    bc.innerHTML = '';

    breadcrumb.forEach((item, i) => {
      const isLast = (i === breadcrumb.length - 1);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'breadcrumb-item' + (isLast ? ' is-current' : '');
      btn.textContent = item.title;
      btn.dataset.id = item.id;

      if (!isLast) {
        btn.title = `Go to ${item.title}`;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          _navigateToFolder(item.id, breadcrumb.slice(0, i + 1));
        });
      } else {
        btn.title = item.title;
      }

      bc.appendChild(btn);

      if (i < breadcrumb.length - 1) {
        const sep = document.createElement('span');
        sep.className = 'breadcrumb-sep';
        sep.textContent = '›';
        bc.appendChild(sep);
      }
    });
  }

  function _search(query) {
    if (typeof chrome === 'undefined' || !chrome.bookmarks) return;

    chrome.bookmarks.search(query, (results) => {
      if (chrome.runtime.lastError) return;

      const list = document.getElementById('bookmark-list');
      if (!list) return;
      list.innerHTML = '';

      const matched = (results || []).slice(0, 50);
      const folders = matched.filter(node => !node.url);
      const links = matched.filter(node => !!node.url);
      const sortedMatched = [...folders, ...links];

      sortedMatched.forEach(node => {
        const isFolder = !node.url;
        const row = _createBookmarkRow(node, isFolder);
        list.appendChild(row);
      });

      if (!results || results.length === 0) {
        _showNoBookmarks();
      }
    });
  }

  function _showNoBookmarks() {
    const list = document.getElementById('bookmark-list');
    if (!list) return;
    const msg = (typeof I18n !== 'undefined' && I18n.t) ? I18n.t('noBookmarks', 'No bookmarks found') : 'No bookmarks found';
    list.innerHTML = `<li class="bookmark-empty-state">${msg}</li>`;
  }

  function _getFaviconUrl(pageUrl) {
    if (!pageUrl || typeof pageUrl !== 'string') return '';
    if (pageUrl.startsWith('javascript:') || pageUrl.startsWith('data:')) return '';

    // Chrome MV3 native _favicon API: provides browser-cached favicons for bookmarks
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        const u = new URL(chrome.runtime.getURL('/_favicon/'));
        u.searchParams.set('pageUrl', pageUrl);
        u.searchParams.set('size', '32');
        return u.toString();
      }
    } catch (_) {}

    return _getGoogleFaviconUrl(pageUrl);
  }

  function _getGoogleFaviconUrl(pageUrl) {
    if (!pageUrl || typeof pageUrl !== 'string') return '';
    try {
      const parsed = new URL(pageUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=32`;
      }
    } catch (_) {}
    return '';
  }

  function _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function getShowIcons() {
    return showBookmarkIcons;
  }

  function setShowIcons(val) {
    showBookmarkIcons = !!val;
    const panel = document.getElementById('bookmarks-panel');
    if (panel && panel.style.display !== 'none') {
      const searchInput = document.getElementById('bookmark-search');
      const query = searchInput ? searchInput.value.trim() : '';
      if (query.length >= 2) {
        _search(query);
      } else {
        _renderFolder(currentFolderId);
      }
    }
  }

  return { init, getShowIcons, setShowIcons };
})();
