// ========================================
// Auto-Share & Cloud Store Management
// ========================================

window.__autoShareEnabled = false;
window.__autoShareTimeout = null;
window.__autoShareLastDocId = null;
const AUTO_SHARE_DEBOUNCE_MS = 3000;
const GLOBAL_STATE_KEY = 'markdownViewerGlobalState';

// Helper to read auto-share preference directly from localStorage
// (not dependent on script.js DOMContentLoaded timing)
function loadAutoSharePreference() {
  try {
    const state = JSON.parse(localStorage.getItem(GLOBAL_STATE_KEY)) || {};
    window.__autoShareEnabled = !!state.autoShareEnabled;
  } catch {
    window.__autoShareEnabled = false;
  }
}

// Initialize auto-share preference immediately (before any auth events)
loadAutoSharePreference();

// Listen for auth state changes from auth.js
window.addEventListener('firebase-auth-changed', function(e) {
  const user = e.detail.user;
  // Update account button appearance based on auth state
  updateAccountButton();
  // Update share button appearance based on auth state
  updateShareButtonAuthState();
  // (Re-)load auto-share preference in case it was updated by another tab
  loadAutoSharePreference();
  updateAutoShareUI();
});

// Also reload preference when page gains focus (e.g., user returns from settings)
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    loadAutoSharePreference();
  }
});

function showAuthRequiredModal() {
  var modal = document.getElementById('auth-required-modal');
  if (!modal) return;
  if (typeof window.__scriptAPI !== 'undefined' && window.__scriptAPI.openAppModal) {
    window.__scriptAPI.openAppModal(modal, {
      onClose: function() {
        closeAuthRequiredModal();
      }
    });
  } else {
    // Fallback: directly open modal
    modal.style.display = 'flex';
    requestAnimationFrame(function() {
      modal.classList.add('is-visible');
    });
    modal.setAttribute('aria-hidden', 'false');
  }

  // Wire up sign-in button (idempotent — only binds once)
  var signInBtn = document.getElementById('auth-required-modal-signin');
  if (signInBtn && !signInBtn.dataset.bound) {
    signInBtn.dataset.bound = 'true';
    signInBtn.addEventListener('click', function() {
      closeAuthRequiredModal();
      var btnLogin = document.getElementById('btn-login');
      if (btnLogin) {
        btnLogin.click();
      }
    });
  }

  // Wire up cancel button
  var cancelBtn = document.getElementById('auth-required-modal-cancel');
  if (cancelBtn && !cancelBtn.dataset.bound) {
    cancelBtn.dataset.bound = 'true';
    cancelBtn.addEventListener('click', function() {
      closeAuthRequiredModal();
    });
  }

  // Wire up close icon
  var closeIcon = document.getElementById('auth-required-modal-close-icon');
  if (closeIcon && !closeIcon.dataset.bound) {
    closeIcon.dataset.bound = 'true';
    closeIcon.addEventListener('click', function() {
      closeAuthRequiredModal();
    });
  }
}

function updateAccountButton() {
  var btn = document.getElementById('btn-account');
  if (!btn) return;
  if (window.isUserLoggedIn()) {
    var user = window.__FIREBASE__.currentUser;
    btn.innerHTML = user.photoURL
      ? '<img class="btn-account-avatar" src="' + user.photoURL + '" alt="">'
      : '<i class="bi bi-person"></i>';
    if (user.displayName) {
      btn.title = user.displayName;
    }
  } else {
    btn.innerHTML = '<i class="bi bi-person"></i>';
    btn.title = 'Đăng nhập với Google';
  }
}

function closeAccountDropdown() {
  var dd = document.getElementById('account-dropdown');
  if (!dd) return;
  dd.classList.remove('open');
}

function openAccountDropdown() {
  var dd = document.getElementById('account-dropdown');
  if (!dd) return;
  var btn = document.getElementById('btn-account');
  if (!btn) return;

  var rect = btn.getBoundingClientRect();
  dd.style.top = (rect.bottom + 4) + 'px';
  dd.style.right = (window.innerWidth - rect.right) + 'px';
  dd.classList.add('open');
  loadUserDocs();
}

var _accountDocsCache = {};

function loadUserDocs() {
  var container = document.getElementById('account-dropdown-docs');
  if (!container) return;
  container.innerHTML = '<div class="account-dropdown-docs-loading"><i class="bi bi-arrow-repeat"></i> Loading...</div>';

  var listFn = window.getFirebaseDocList();
  if (!listFn) {
    container.innerHTML = '<div class="account-dropdown-docs-empty"><i class="bi bi-exclamation-circle"></i> Service not ready</div>';
    return;
  }

  listFn().then(function(docs) {
    if (!docs || docs.length === 0) {
      container.innerHTML = '<div class="account-dropdown-docs-empty"><i class="bi bi-file-text"></i> No saved documents yet</div>';
      return;
    }
    _accountDocsCache = {};
    var html = '';
    docs.forEach(function(doc) {
      _accountDocsCache[doc.id] = doc;
      var updatedStr = '';
      if (doc.updatedAt) {
         var d = doc.updatedAt.toDate();
        updatedStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      html +=
        '<button type="button" class="account-dropdown-doc-item" data-doc-id="' + escAttr(doc.id) + '">' +
          '<span class="account-dropdown-doc-title">' + escHtml(doc.title) + '</span>' +
          '<span class="account-dropdown-doc-date">' + updatedStr + '</span>' +
        '</button>';
    });
    container.innerHTML = html;

    container.querySelectorAll('.account-dropdown-doc-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var docId = item.getAttribute('data-doc-id');
        var doc = _accountDocsCache[docId];
        if (!doc) return;
        closeAccountDropdown();
        if (window.__scriptAPI && window.__scriptAPI.newTab) {
          window.__scriptAPI.newTab(doc.content, doc.title);
        }
      });
    });
  }).catch(function(err) {
    console.error('Failed to list user docs:', err);
    container.innerHTML = '<div class="account-dropdown-docs-empty"><i class="bi bi-exclamation-circle"></i> Error loading documents</div>';
  });
}

function escAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toggleAccountDropdown() {
  var dd = document.getElementById('account-dropdown');
  if (!dd) return;
  if (dd.classList.contains('open')) {
    closeAccountDropdown();
  } else {
    if (!window.isUserLoggedIn()) {
      showAuthRequiredModal();
      return;
    }
    // Fill user info
    var user = window.__FIREBASE__.currentUser;
    var avatarEl = document.getElementById('account-dropdown-avatar');
    var nameEl = document.getElementById('account-dropdown-name');
    var emailEl = document.getElementById('account-dropdown-email');
    if (avatarEl) {
      avatarEl.src = user.photoURL || '';
      avatarEl.style.display = user.photoURL ? '' : 'none';
    }
    if (nameEl) nameEl.textContent = user.displayName || 'User';
    if (emailEl) emailEl.textContent = user.email || '';
    openAccountDropdown();
  }
}

var btnAccount = document.getElementById('btn-account');
if (btnAccount && !btnAccount.dataset.bound) {
  btnAccount.dataset.bound = 'true';
  btnAccount.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleAccountDropdown();
  });
}

// Close dropdown on outside click
document.addEventListener('click', function(e) {
  var dd = document.getElementById('account-dropdown');
  if (!dd) return;
  if (dd.classList.contains('open')) {
    var btn = document.getElementById('btn-account');
    if (btn && btn.contains(e.target)) return;
    if (dd.contains(e.target)) return;
    closeAccountDropdown();
  }
});

// Close dropdown on escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeAccountDropdown();
  }
});

// Handle logout
document.addEventListener('click', function(e) {
  var logoutBtn = document.getElementById('account-dropdown-logout');
  if (!logoutBtn) return;
  if (e.target.closest && e.target.closest('#account-dropdown-logout')) {
    e.preventDefault();
    closeAccountDropdown();
    if (typeof window.__FIREBASE_LOGOUT__ === 'function') {
      window.__FIREBASE_LOGOUT__().catch(function(err) {
        console.error("Logout error:", err);
      });
    }
  }
});

function closeAuthRequiredModal() {
  var modal = document.getElementById('auth-required-modal');
  if (!modal) return;
  if (typeof window.__scriptAPI !== 'undefined' && window.__scriptAPI.closeAppModal) {
    window.__scriptAPI.closeAppModal(modal);
  } else {
    // Fallback
    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(function() {
      if (!modal.classList.contains('is-visible')) {
        modal.style.display = 'none';
      }
    }, 200);
  }
}

function updateAutoShareUI() {
  const autoBtn = document.getElementById('auto-share-btn');
  const mobileAutoBtn = document.getElementById('mobile-auto-share-btn');
  const activeClass = 'auto-share-on';
  const inactiveClass = 'auto-share-off';

  if (autoBtn) {
    if (window.__autoShareEnabled) {
      autoBtn.classList.remove(inactiveClass);
      autoBtn.classList.add(activeClass);
      autoBtn.title = 'Auto-share: On — Saving changes to cloud automatically';
    } else {
      autoBtn.classList.remove(activeClass);
      autoBtn.classList.add(inactiveClass);
      autoBtn.title = 'Auto-share: Off — Save changes to cloud automatically';
    }
  }
  if (mobileAutoBtn) {
    if (window.__autoShareEnabled) {
      mobileAutoBtn.classList.remove(inactiveClass);
      mobileAutoBtn.classList.add(activeClass);
      mobileAutoBtn.title = 'Auto-share: On';
    } else {
      mobileAutoBtn.classList.remove(activeClass);
      mobileAutoBtn.classList.add(inactiveClass);
      mobileAutoBtn.title = 'Auto-share: Off';
    }
  }
}

function toggleAutoShare() {
  if (!window.isUserLoggedIn()) {
    // Guest user: show modal requiring Google sign-in
    showAuthRequiredModal();
    return;
  }

  window.__autoShareEnabled = !window.__autoShareEnabled;
  if (window.__saveGlobalState) {
    window.__saveGlobalState({ autoShareEnabled: window.__autoShareEnabled });
  }
  updateAutoShareUI();

  if (window.__autoShareEnabled) {
    // Trigger an immediate save when turning on
    triggerAutoShareSave();
  }
}

async function triggerAutoShareSave() {
  if (!window.__autoShareEnabled) return;

  // SỬA TẠI ĐÂY: Lấy auth chuẩn từ cấu hình hệ thống của bạn
  const firebaseCtx = window.__FIREBASE__;
  const currentUser = firebaseCtx ? firebaseCtx.currentUser : null;

  if (!currentUser) {
    console.warn('Auto-share aborted: Firebase auth not fully initialized or user logged out.');
    return; 
  }

  const saver = window.getFirebaseDocSaver();
  if (!saver) return;

  try {
    const tabs = window.__tabs || [];
    const activeTabId = window.__activeTabId;
    const markdownEditor = document.getElementById('markdown-editor');
    const activeTab = tabs.find(function(t) { return t.id === activeTabId; });
    const docTitle = activeTab ? activeTab.title : 'Untitled';
    
    const cloudDocId = activeTab ? activeTab.cloudDocId : null;
    const docId = await saver(markdownEditor.value, docTitle, cloudDocId);
    if (activeTab) activeTab.cloudDocId = docId;

    // ... (Giữ nguyên đoạn code đổi UI nút bấm sang "Saved" thành công của bạn) ...
    const autoBtn = document.getElementById('auto-share-btn');
    const mobileAutoBtn = document.getElementById('mobile-auto-share-btn');
    if (autoBtn && window.__autoShareEnabled) {
      autoBtn.innerHTML = '<i class="bi bi-cloud-check"></i> <span class="btn-text">Saved</span>';
    }
    if (mobileAutoBtn && window.__autoShareEnabled) {
      mobileAutoBtn.innerHTML = '<i class="bi bi-cloud-check me-2"></i> Saved';
    }
    if ((autoBtn || mobileAutoBtn) && window.__autoShareEnabled) {
      setTimeout(function() {
        if (autoBtn && window.__autoShareEnabled) {
          autoBtn.innerHTML = '<i class="bi bi-cloud-arrow-up"></i> <span class="btn-text">Auto Share</span>';
        }
        if (mobileAutoBtn && window.__autoShareEnabled) {
          mobileAutoBtn.innerHTML = '<i class="bi bi-cloud-arrow-up me-2"></i> Auto Share';
        }
      }, 2000);
    }
  } catch (err) {
    console.error('Auto-share save failed:', err);
  }
}


function scheduleAutoShareSave() {
  if (!window.__autoShareEnabled) return;
  clearTimeout(window.__autoShareTimeout);
  window.__autoShareTimeout = setTimeout(triggerAutoShareSave, AUTO_SHARE_DEBOUNCE_MS);
}

function updateShareButtonAuthState() {
  const shareButton = window.__shareButton;
  if (!shareButton) return;
  if (window.isUserLoggedIn()) {
    shareButton.setAttribute('data-auth', 'logged-in');
  } else {
    shareButton.removeAttribute('data-auth');
  }
}

// Expose functions globally for script.js to call
window.updateAutoShareUI = updateAutoShareUI;
window.toggleAutoShare = toggleAutoShare;
window.triggerAutoShareSave = triggerAutoShareSave;
window.scheduleAutoShareSave = scheduleAutoShareSave;
window.updateShareButtonAuthState = updateShareButtonAuthState;
window.showAuthRequiredModal = showAuthRequiredModal;

document.addEventListener("DOMContentLoaded", () => {
    updateAccountButton();
});
