/**
 * Extensions for Markdown Viewer
 *
 * Contains: Cloud Save, Shared Doc Loading, Auto-Share UI,
 *           Vietnamese i18n, and clipboard utilities.
 * All code here was extracted from script.js uncommitted changes.
 */

(function () {
  'use strict';

  // ──────────────────────────────────────────────
  // 1. Clipboard fallback utility
  // ──────────────────────────────────────────────
  function fallbackCopy(text, btnEl) {
    try {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      if (btnEl) {
        btnEl.innerHTML = '<i class="bi bi-check-lg"></i>';
        setTimeout(function () {
          btnEl.innerHTML = '<i class="bi bi-clipboard"></i>';
        }, 2000);
      }
    } catch (e) {
      console.warn('Clipboard fallback failed:', e);
    }
  }

  // ──────────────────────────────────────────────
  // 2. Cloud save state tracking
  // ──────────────────────────────────────────────
  var _firestoreSaveInProgress = false;

  // ──────────────────────────────────────────────
  // 3. Shared document loading (?sharedoc=XXX)
  // ──────────────────────────────────────────────
  function doLoadSharedDoc(docId, loader, isEditMode) {
    loader(docId)
      .then(function (data) {
        if (!data || !data.content) {
          console.error('Shared document is empty or not found.');
          return;
        }
        var docTitle = data.title || 'Shared Document';
        if (window.__scriptAPI && window.__scriptAPI.newTab) {
          window.__scriptAPI.newTab(docId, data.content, docTitle);
        }
        // Set id on the active tab so subsequent saves update this doc
        if (window.__tabs && window.__activeTabId) {
          var activeT = window.__tabs.find(function(t) { return t.id === window.__activeTabId; });
          if (activeT) activeT.id = docId;
        }
        var canEdit = isEditMode || data.isPublicWrite === true;
        var viewMode = canEdit ? 'split' : 'preview';
        if (window.__scriptAPI && window.__scriptAPI.setViewMode) {
          window.__scriptAPI.setViewMode(viewMode);
        }
        if (window.history && window.history.replaceState) {
          var cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      })
      .catch(function (err) {
        alert('Bạn không có quyền xem tài liệu này');
        if (window.isUserLoggedIn()) {
          var listFn = window.getFirebaseDocList();
          if (listFn) {
            listFn().then(function(docs) {
              if (docs && docs.length > 0) {
                var recent = docs[0];
                if (window.__scriptAPI && window.__scriptAPI.newTab) {
                  window.__scriptAPI.newTab(recent.id, recent.content, recent.title);
                }
              }
            }).catch(function(e) {
              console.error('Failed to load recent document:', e);
            });
          }
        } else {
          if (window.__scriptAPI && window.__scriptAPI.newTab) {
            window.__scriptAPI.newTab(null, '# Chào mừng đến Markdown\n\nStart typing your markdown here...', 'Chào mừng');
          }
        }
        var cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        console.error('Failed to load shared document:', err);
      });
  }

  // ──────────────────────────────────────────────
  // 4. i18n additions (autoShare keys, Vietnamese)
  // ──────────────────────────────────────────────
  function patchI18n() {
    if (!window.__I18N_DICTS) return;

    var dicts = window.__I18N_DICTS;

    // Add autoShare key to existing languages
    dicts.en.autoShare = 'Auto Share';
    dicts.zh.autoShare = '\u81ea\u52a8\u5206\u4eab';
    dicts.ja.autoShare = '\u81ea\u52d5\u5171\u6709';
    dicts.ko.autoShare = '\uc790\ub3d9 \uacf5\uc720';
    dicts.pt.autoShare = 'Compartilhamento Autom\u00e1tico';

    // Add Vietnamese dictionary
    dicts.vi = {
      title: 'Tr\u00ecnh xem Markdown',
      syncOff: 'T\u1eaft \u0111\u1ed3ng b\u1ed9',
      syncOn: 'B\u1eadt \u0111\u1ed3ng b\u1ed9',
      import: 'Nh\u1eadp',
      importFile: 'T\u1eeb t\u1ec7p tin',
      importGithub: 'T\u1eeb GitHub',
      export: 'Xu\u1ea5t',
      exportMd: 'Markdown (.md)',
      exportHtml: 'HTML',
      exportPdf: 'PDF',
      copy: 'Sao ch\u00e9p',
      copied: '\u0110\u00e3 sao ch\u00e9p!',
      share: 'Chia s\u1ebb',
      reset: '\u0110\u1eb7t l\u1ea1i',
      editor: 'So\u1ea1n th\u1ea3o',
      split: 'Chia \u0111\u00f4i',
      preview: 'Xem tr\u01b0\u1edbc',
      minRead: 'Ph\u00fat \u0111\u1ecdc',
      words: 'T\u1eeb',
      chars: 'K\u00fd t\u1ef1',
      switchRtl: 'Chuy\u1ec3n sang RTL',
      switchLtr: 'Chuy\u1ec3n sang LTR',
      darkMode: 'Ch\u1ebf \u0111\u1ed9 t\u1ed1i',
      lightMode: 'Ch\u1ebf \u0111\u1ed9 s\u00e1ng',
      helpTitle: 'Tr\u1ee3 gi\u00fap Tr\u00ecnh xem Markdown',
      aboutTitle: 'Gi\u1edbi thi\u1ec7u v\u1ec1 Markdown',
      shareTitle: 'Chia s\u1ebb t\u00e0i li\u1ec7u',
      renameTitle: '\u0110\u1ed5i t\u00ean t\u1ec7p',
      insertLink: 'Ch\u00e8n li\u00ean k\u1ebft',
      insertRef: 'Ch\u00e8n tham chi\u1ebfu',
      insertImg: 'Ch\u00e8n h\u00ecnh \u1ea3nh',
      insertTable: 'Ch\u00e8n b\u1ea3ng',
      findReplace: 'T\u00ecm ki\u1ebfm & Thay th\u1ebf',
      placeholder: 'Nh\u1eadp n\u1ed9i dung Markdown t\u1ea1i \u0111\u00e2y...',
      loadingEmojis: '\u0110ang t\u1ea3i bi\u1ec3u t\u01b0\u1ee3ng c\u1ea3m x\u00fac...',
      autoShare: 'T\u1ef1 \u0111\u1ed9ng chia s\u1ebb',
      loadingFiles: '\u0110ang t\u1ea3i c\u00e2y th\u01b0 m\u1ee5c...'
    };
  }

  // ──────────────────────────────────────────────
  // 5. Wrap applyTranslations to support Vietnamese
  // ──────────────────────────────────────────────
  function wrapApplyTranslations() {
    if (!window.__applyTranslations) return;

    var origApply = window.__applyTranslations;
    window.__applyTranslations = function (lang) {
      origApply(lang);

      // Update language label flag for Vietnamese
      if (lang === 'vi') {
        var labelEl = document.getElementById('current-lang-label');
        if (labelEl) {
          labelEl.textContent = '\ud83c\uddfb\ud83c\uddf3 Ti\u1ebfng Vi\u1ec7t';
        }
        var mobileLabelEl = document.getElementById('mobile-current-lang-label');
        if (mobileLabelEl) {
          mobileLabelEl.textContent = 'VN Ti\u1ebfng Vi\u1ec7t';
        }
      }

      // Update mobile auto-share button text
      var mAutoShareBtn = document.getElementById('mobile-auto-share-btn');
      if (mAutoShareBtn && window.__I18N_DICTS && window.__I18N_DICTS[lang]) {
        mAutoShareBtn.innerHTML =
          '<i class="bi bi-cloud-arrow-up me-2"></i>' +
          (window.__I18N_DICTS[lang].autoShare || 'Auto Share');
      }
    };
  }

  async function initCloudSave() {
    var shareModal = document.getElementById('share-modal');
    if (!shareModal) return;

    // Wait for Firebase Auth to be fully initialized
    await window.__FIREBASE_AUTH_READY__;

    function updateCloudSaveUI() {
      var isLoggedIn =
        typeof window.isUserLoggedIn === 'function'
          ? window.isUserLoggedIn()
          : false;

      var guestSection = document.getElementById('share-guest-section');
      var permissionSection = document.getElementById('share-public-permission-section');
      if (guestSection) {
        if (isLoggedIn) {
          guestSection.classList.add('d-none');
        } else {
          guestSection.classList.remove('d-none');
        }
      }

      // Guest Sign-in Button in Share Modal
      var guestSigninBtn = document.getElementById('share-guest-signin-btn');
      if (guestSigninBtn && !guestSigninBtn.dataset.bound) {
        guestSigninBtn.dataset.bound = 'true';
        guestSigninBtn.addEventListener('click', function () {
          var shareModal = document.getElementById('share-modal');
          if (shareModal && typeof window.closeShareModal === 'function') {
            window.closeShareModal();
          }
          var btnLogin = document.getElementById('btn-login');
          if (btnLogin) btnLogin.click();
        });
      }
    }

    // Auth is ready, run with correct state
    updateCloudSaveUI();

    // Re-run on subsequent auth changes (login/logout)
    window.addEventListener('firebase-auth-changed', updateCloudSaveUI);
  }

  // ──────────────────────────────────────────────
  // 7. Auto-share toggle button handlers
  // ──────────────────────────────────────────────
  function initAutoShareButtons() {
    var autoShareBtn = document.getElementById('auto-share-btn');
    var mobileAutoShareBtn = document.getElementById('mobile-auto-share-btn');

    if (autoShareBtn) {
      autoShareBtn.addEventListener('click', function () {
        if (typeof window.toggleAutoShare === 'function') {
          window.toggleAutoShare();
        }
      });
    }
    if (mobileAutoShareBtn) {
      mobileAutoShareBtn.addEventListener('click', function () {
        if (typeof window.toggleAutoShare === 'function') {
          window.toggleAutoShare();
        }
      });
    }
  }

  // ──────────────────────────────────────────────
  // 8. Schedule auto-save on editor input
  // ──────────────────────────────────────────────
  function initAutoSaveOnInput() {
    var editor = document.getElementById('markdown-editor');
    if (editor) {
      editor.addEventListener('input', function () {
        if (typeof window.scheduleAutoShareSave === 'function') {
          window.scheduleAutoShareSave();
        }
      });
    }
  }

  // ──────────────────────────────────────────────
  // 9. Shared doc loading from URL
  // ──────────────────────────────────────────────
  function initSharedDocLoading() {
    var params = new URLSearchParams(window.location.search);
    var sharedDocId = params.get('sharedoc');
    if (!sharedDocId) return;

    var isEditMode = params.get('edit') === '1';

    var loader =
      typeof window.getFirebaseDocLoader === 'function'
        ? window.getFirebaseDocLoader()
        : null;
    if (!loader) {
      console.warn(
        'Firebase not ready yet, retrying shared doc load in 2s...'
      );
      setTimeout(function retry() {
        var retryLoader =
          typeof window.getFirebaseDocLoader === 'function'
            ? window.getFirebaseDocLoader()
            : null;
        if (retryLoader) {
          doLoadSharedDoc(sharedDocId, retryLoader, isEditMode);
        } else {
          console.error(
            'Failed to load shared document: Firebase not available'
          );
        }
      }, 2000);
      return;
    }
    doLoadSharedDoc(sharedDocId, loader, isEditMode);
  }

  // ──────────────────────────────────────────────
  // 10. Vietnamese language detection
  // ──────────────────────────────────────────────
  function detectVietnamese() {
    var savedLang = localStorage.getItem('app-lang');
    if (savedLang) return false; // User has a saved preference

    // Check if browser is Vietnamese
    var navLang = (
      navigator.language || navigator.userLanguage || ''
    ).toLowerCase();
    if (navLang.startsWith('vi')) {
      localStorage.setItem('app-lang', 'vi');
      return true;
    }
    return false;
  }

  // ──────────────────────────────────────────────
  // Main initialization (runs after script.js's DOMContentLoaded handler)
  // ──────────────────────────────────────────────
  function init() {
    // Apply i18n patches before language detection runs
    patchI18n();

    // Wrap applyTranslations to support Vietnamese
    wrapApplyTranslations();

    // Detect Vietnamese browser and apply language
    if (detectVietnamese()) {
      if (typeof window.__applyTranslations === 'function') {
        window.__applyTranslations('vi');
      }
    }

    // Init shared doc loading
    initSharedDocLoading();

    // Init cloud save modal observer and buttons
    initCloudSave();

    // Init auto-share toggle buttons
    initAutoShareButtons();

    // Init auto-save on editor input
    initAutoSaveOnInput();
  }

  // Wait for script.js's DOMContentLoaded handler to complete before running
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
