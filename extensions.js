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
  function doLoadSharedDoc(docId, loader) {
    loader(docId)
      .then(function (data) {
        if (!data || !data.content) {
          console.error('Shared document is empty or not found.');
          return;
        }
        var docTitle = data.title || 'Shared Document';
        if (window.__scriptAPI && window.__scriptAPI.newTab) {
          window.__scriptAPI.newTab(data.content, docTitle);
        }
        if (data.mode === 'view' || !data.mode) {
          if (window.__scriptAPI && window.__scriptAPI.setViewMode) {
            window.__scriptAPI.setViewMode('preview');
          }
        }
        if (window.history && window.history.replaceState) {
          var cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      })
      .catch(function (err) {
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

  // ──────────────────────────────────────────────
  // 6. Cloud save modal observer + button handlers
  // ──────────────────────────────────────────────
  function initCloudSave() {
    var shareModal = document.getElementById('share-modal');

    // Observe share modal visibility changes
    if (shareModal) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'class'
          ) {
            if (shareModal.classList.contains('is-visible')) {
              // --- Modal opened: prepare cloud save UI ---
              var cloudSection = document.getElementById('share-cloud-section');
              var cloudUrlInput = document.getElementById(
                'share-cloud-url-input'
              );
              var cloudUrlRow = document.getElementById('share-cloud-url-row');
              var cloudStatus = document.getElementById(
                'share-cloud-status-text'
              );
              if (cloudUrlInput) cloudUrlInput.value = '';
              if (cloudUrlRow) cloudUrlRow.style.display = 'none';
              var guestSection = document.getElementById('share-guest-section');
              if (guestSection) {
                var isLoggedIn =
                  typeof window.isUserLoggedIn === 'function'
                    ? window.isUserLoggedIn()
                    : false;
                if (isLoggedIn) {
                  guestSection.classList.add('d-none');
                } else {
                  guestSection.classList.remove('d-none');
                }
              }
            } else {
              // --- Modal closed: reset cloud save state ---
              _firestoreSaveInProgress = false;
              var cloudStatus2 = document.getElementById(
                'share-cloud-status-text'
              );
              if (cloudStatus2) {
                cloudStatus2.textContent = 'Save to cloud';
                cloudStatus2.className = 'share-cloud-status';
              }
              var cloudUrlRow2 = document.getElementById(
                'share-cloud-url-row'
              );
              if (cloudUrlRow2) cloudUrlRow2.style.display = 'none';
            }
          }
        });
      });
      observer.observe(shareModal, { attributes: true });
    }

    // Cloud Save Button
    var shareCloudBtn = document.getElementById('share-cloud-btn');
    var shareCloudCopyBtn = document.getElementById('share-cloud-copy-btn');

    if (shareCloudBtn) {
      shareCloudBtn.addEventListener('click', async function () {
        if (_firestoreSaveInProgress) return;
        _firestoreSaveInProgress = true;

        var shareCloudUrlInput = document.getElementById(
          'share-cloud-url-input'
        );
        var shareCloudUrlRow = document.getElementById('share-cloud-url-row');
        var shareCloudStatus = document.getElementById(
          'share-cloud-status-text'
        );
        var cloudBtnIcon = shareCloudBtn.querySelector('i.bi');
        var cloudBtnText = shareCloudBtn.querySelector('.share-cloud-btn-text');

        try {
          if (cloudBtnIcon) cloudBtnIcon.className = 'bi bi-cloud-upload';
          if (cloudBtnText) cloudBtnText.textContent = 'Saving...';
          if (shareCloudStatus) {
            shareCloudStatus.textContent = 'Saving...';
            shareCloudStatus.className = 'share-cloud-status text-muted';
          }
          shareCloudBtn.disabled = true;

          var saver =
            typeof window.getFirebaseDocSaver === 'function'
              ? window.getFirebaseDocSaver()
              : null;
          if (!saver)
            throw new Error('Cloud save is not available. Please sign in.');

          var markdownEditor = document.getElementById('markdown-editor');
          var activeTab = null;
          if (window.__tabs && window.__activeTabId) {
            var tabs = window.__tabs;
            var activeTabId = window.__activeTabId;
            if (tabs && activeTabId) {
              for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].id === activeTabId) {
                  activeTab = tabs[i];
                  break;
                }
              }
            }
          }
          var docTitle = activeTab ? activeTab.title : 'Untitled';

          var existingDocId = activeTab ? activeTab.cloudDocId : null;
          var docId = await saver(
            markdownEditor ? markdownEditor.value : '',
            docTitle,
            existingDocId
          );
          
          if (activeTab) activeTab.cloudDocId = docId;

          var shareUrl =
            window.location.origin +
            window.location.pathname +
            '?sharedoc=' +
            encodeURIComponent(docId);

          if (shareCloudUrlInput) shareCloudUrlInput.value = shareUrl;
          if (shareCloudUrlRow) shareCloudUrlRow.style.display = 'flex';
          if (shareCloudStatus) {
            shareCloudStatus.textContent = 'Saved! View-only link ready.';
            shareCloudStatus.className = 'share-cloud-status text-success';
          }
          if (cloudBtnIcon) cloudBtnIcon.className = 'bi bi-check-circle';
          if (cloudBtnText) cloudBtnText.textContent = 'Saved';
        } catch (err) {
          console.error('Cloud save failed:', err);
          if (shareCloudStatus) {
            shareCloudStatus.textContent = 'Save failed: ' + err.message;
            shareCloudStatus.className = 'share-cloud-status text-danger';
          }
          if (cloudBtnIcon)
            cloudBtnIcon.className = 'bi bi-cloud-exclamation';
          if (cloudBtnText) cloudBtnText.textContent = 'Try Again';
        } finally {
          _firestoreSaveInProgress = false;
          shareCloudBtn.disabled = false;
        }
      });
    }

    // Cloud Save Copy Button
    if (shareCloudCopyBtn) {
      shareCloudCopyBtn.addEventListener('click', function () {
        var shareCloudUrlInput = document.getElementById(
          'share-cloud-url-input'
        );
        if (!shareCloudUrlInput || !shareCloudUrlInput.value) return;
        var url = shareCloudUrlInput.value;
        if (navigator.clipboard && window.isSecureContext !== false) {
          navigator.clipboard
            .writeText(url)
            .then(function () {
              shareCloudCopyBtn.innerHTML =
                '<i class="bi bi-check-lg"></i>';
              setTimeout(function () {
                shareCloudCopyBtn.innerHTML =
                  '<i class="bi bi-clipboard"></i>';
              }, 2000);
            })
            .catch(function () {
              fallbackCopy(url, shareCloudCopyBtn);
            });
        } else {
          fallbackCopy(url, shareCloudCopyBtn);
        }
      });
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
          doLoadSharedDoc(sharedDocId, retryLoader);
        } else {
          console.error(
            'Failed to load shared document: Firebase not available'
          );
        }
      }, 2000);
      return;
    }
    doLoadSharedDoc(sharedDocId, loader);
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
