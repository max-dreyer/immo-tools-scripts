// ============================================
// ImmoTools — Global Utility Library
// utils.js v3.1.0
//
// Buttons: Klasse "button" + data-action="..."
// Funktioniert mit Button, Link Block, Div — egal welches Element.
//
// data-action Werte:
//   berechnen  — Berechnung auslösen
//   reset      — Alle Eingaben zurücksetzen
//   share      — Link mit Eingaben in Zwischenablage
//   pdf        — Ergebnis als PDF exportieren (+ data-filename optional)
//   copy       — Einzelwert kopieren (+ data-copy-target="ID")
// ============================================

const ImmoTools = {

    // ==========================================
    // KONFIGURATION
    // ==========================================
  
    globalFields: [
      'steuersatz',
      'afa',
      'eigenkapital',
      'zins',
      'tilgung'
    ],
  
  
    // ==========================================
    // TOOL-SCOPE
    // ==========================================
  
    getForm(toolName) {
      return document.querySelector(`form[data-tool="${toolName}"]`);
    },
  
    queryTool(toolName, className) {
      const form = this.getForm(toolName);
      if (!form) return null;
      return form.querySelector(`.${className}`);
    },
  
  
    // ==========================================
    // FORMATIERUNG
    // ==========================================
  
    formatCurrency(value) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency', currency: 'EUR',
        minimumFractionDigits: 2, maximumFractionDigits: 2
      }).format(value);
    },
  
    formatCurrencyShort(value) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency', currency: 'EUR',
        minimumFractionDigits: 0, maximumFractionDigits: 0
      }).format(value);
    },
  
    formatPercent(value, decimals = 2) {
      return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals
      }).format(value) + ' %';
    },
  
    formatNumber(value, decimals = 0) {
      return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals
      }).format(value);
    },
  
    formatFactor(value, decimals = 1) {
      return this.formatNumber(value, decimals) + 'x';
    },
  
    formatArea(value, decimals = 1) {
      return this.formatNumber(value, decimals) + ' m²';
    },
  
    formatDuration(months) {
      const years = Math.floor(months / 12);
      const rest = Math.round(months % 12);
      if (years === 0) return `${rest} Monat${rest !== 1 ? 'e' : ''}`;
      if (rest === 0) return `${years} Jahr${years !== 1 ? 'e' : ''}`;
      return `${years} Jahr${years !== 1 ? 'e' : ''}, ${rest} Monat${rest !== 1 ? 'e' : ''}`;
    },
  
  
    // ==========================================
    // INPUT-HANDLING
    // ==========================================
  
    getInputValue(id, fallback = 0) {
      const el = document.getElementById(id);
      if (!el) {
        console.warn(`ImmoTools: Element #${id} nicht gefunden`);
        return fallback;
      }
      const raw = el.value.trim();
      if (raw === '') return fallback;
      const normalized = raw.replace(/\./g, '').replace(',', '.');
      const val = parseFloat(normalized);
      return isNaN(val) ? fallback : val;
    },
  
    getSelectValue(id, fallback = '') {
      const el = document.getElementById(id);
      if (!el) return fallback;
      return el.value || fallback;
    },
  
    getToggleValue(id) {
      const el = document.getElementById(id);
      if (!el) return false;
      return el.checked;
    },
  
    setInputValue(id, value) {
      const el = document.getElementById(id);
      if (el) el.value = value;
    },
  
  
    // ==========================================
    // OUTPUT-HANDLING
    // ==========================================
  
    setOutput(id, value) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    },
  
    setOutputHTML(id, html) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    },
  
    show(toolName, className) {
      const el = this.queryTool(toolName, className);
      if (el) el.classList.remove('is-hidden');
    },
  
    hide(toolName, className) {
      const el = this.queryTool(toolName, className);
      if (el) el.classList.add('is-hidden');
    },
  
    toggle(toolName, className, visible) {
      if (visible) { this.show(toolName, className); }
      else { this.hide(toolName, className); }
    },
  
  
    // ==========================================
    // VALIDIERUNG
    // ==========================================
  
    validateInputs(fields) {
      const errors = [];
      fields.forEach(({ id, label, min, max, required }) => {
        const val = this.getInputValue(id, null);
        if ((required !== false) && (val === null || val === 0)) {
          errors.push(`Bitte ${label} eingeben.`);
          this.markInvalid(id);
        } else if (val !== null) {
          if (min !== undefined && val < min) {
            errors.push(`${label} muss mindestens ${this.formatNumber(min)} sein.`);
            this.markInvalid(id);
          } else if (max !== undefined && val > max) {
            errors.push(`${label} darf maximal ${this.formatNumber(max)} sein.`);
            this.markInvalid(id);
          } else {
            this.markValid(id);
          }
        }
      });
      return errors;
    },
  
    markInvalid(id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('is-invalid');
    },
  
    markValid(id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-invalid');
    },
  
    clearValidation(toolName) {
      const form = this.getForm(toolName);
      if (!form) return;
      form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    },
  
  
    // ==========================================
    // FEHLERMELDUNGEN
    // ==========================================
  
    showError(toolName, message) {
      const el = this.queryTool(toolName, 'error-message');
      if (el) {
        el.textContent = Array.isArray(message) ? message.join(' ') : message;
        el.classList.remove('is-hidden');
      }
    },
  
    hideError(toolName) {
      const el = this.queryTool(toolName, 'error-message');
      if (el) el.classList.add('is-hidden');
    },
  
  
    // ==========================================
    // AUTO-SAVE (localStorage)
    // ==========================================
  
    _saveInputs(toolName) {
      const form = this.getForm(toolName);
      if (!form) return;
  
      const toolData = {};
      const globalData = this._loadRaw('global') || {};
  
      form.querySelectorAll('input, select').forEach(el => {
        if (!el.id) return;
        const value = el.type === 'checkbox' ? el.checked : el.value;
        if (value === '' || value === false) return;
  
        const fieldName = el.id.replace(`${toolName}-input-`, '');
        if (this.globalFields.includes(fieldName)) {
          globalData[fieldName] = value;
        }
  
        toolData[el.id] = value;
      });
  
      this._saveRaw(`tool-${toolName}`, toolData);
      this._saveRaw('global', globalData);
    },
  
    _restoreInputs(toolName) {
      const form = this.getForm(toolName);
      if (!form) return;
  
      const toolData = this._loadRaw(`tool-${toolName}`) || {};
      const globalData = this._loadRaw('global') || {};
  
      form.querySelectorAll('input, select').forEach(el => {
        if (!el.id) return;
  
        if (toolData[el.id] !== undefined) {
          if (el.type === 'checkbox') el.checked = toolData[el.id];
          else el.value = toolData[el.id];
          return;
        }
  
        const fieldName = el.id.replace(`${toolName}-input-`, '');
        if (this.globalFields.includes(fieldName) && globalData[fieldName] !== undefined) {
          if (el.type === 'checkbox') el.checked = globalData[fieldName];
          else el.value = globalData[fieldName];
        }
      });
    },
  
    _enableAutoSave(toolName) {
      const form = this.getForm(toolName);
      if (!form) return;
  
      let saveTimeout;
      form.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => this._saveInputs(toolName), 500);
      });
  
      form.addEventListener('change', () => this._saveInputs(toolName));
    },
  
    _saveRaw(key, data) {
      try { localStorage.setItem(`immo-${key}`, JSON.stringify(data)); }
      catch (e) { console.warn('ImmoTools: localStorage nicht verfügbar'); }
    },
  
    _loadRaw(key) {
      try {
        const raw = localStorage.getItem(`immo-${key}`);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
  
    saveData(key, data) { this._saveRaw(key, data); },
    loadData(key, fallback = null) { return this._loadRaw(key) || fallback; },
    removeData(key) { try { localStorage.removeItem(`immo-${key}`); } catch (e) {} },
  
  
    // ==========================================
    // URL-SHARING
    // ==========================================
  
    generateShareURL(toolName) {
      const form = this.getForm(toolName);
      if (!form) return window.location.href;
  
      const params = new URLSearchParams();
  
      form.querySelectorAll('input, select').forEach(el => {
        if (!el.id) return;
        const value = el.type === 'checkbox' ? (el.checked ? '1' : '') : el.value;
        if (value === '') return;
  
        const paramName = el.id.replace(`${toolName}-input-`, '');
        params.set(paramName, value);
      });
  
      const baseURL = window.location.origin + window.location.pathname;
      return `${baseURL}?${params.toString()}`;
    },
  
    _restoreFromURL(toolName) {
      const params = new URLSearchParams(window.location.search);
      if (params.toString() === '') return false;
  
      const form = this.getForm(toolName);
      if (!form) return false;
  
      let restored = false;
  
      form.querySelectorAll('input, select').forEach(el => {
        if (!el.id) return;
        const paramName = el.id.replace(`${toolName}-input-`, '');
        const value = params.get(paramName);
  
        if (value !== null) {
          if (el.type === 'checkbox') el.checked = value === '1';
          else el.value = value;
          restored = true;
        }
      });
  
      return restored;
    },
  
    shareResults(toolName) {
      const url = this.generateShareURL(toolName);
  
      navigator.clipboard.writeText(url).then(() => {
        this._showToast('Link in Zwischenablage kopiert!');
      }).catch(() => {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        this._showToast('Link in Zwischenablage kopiert!');
      });
    },
  
  
    // ==========================================
    // COPY-TO-CLIPBOARD
    // ==========================================
  
    copyValue(id) {
      const el = document.getElementById(id);
      if (!el) return;
  
      const text = el.textContent.trim();
  
      navigator.clipboard.writeText(text).then(() => {
        this._showCopyFeedback(el);
      }).catch(() => {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        this._showCopyFeedback(el);
      });
    },
  
    _showCopyFeedback(el) {
      el.classList.add('is-copied');
      this._showToast('Kopiert!');
      setTimeout(() => el.classList.remove('is-copied'), 1500);
    },
  
  
    // ==========================================
    // TOAST
    // ==========================================
  
    _showToast(message, duration = 2000) {
      const existing = document.querySelector('.immo-toast');
      if (existing) existing.remove();
  
      const toast = document.createElement('div');
      toast.className = 'immo-toast';
      toast.textContent = message;
  
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1a1a1a',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '9999',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      });
  
      document.body.appendChild(toast);
      requestAnimationFrame(() => { toast.style.opacity = '1'; });
  
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },
  
  
    // ==========================================
    // PDF-EXPORT
    // ==========================================
  
    exportPDF(toolName, filename, options = {}) {
      const container = this.queryTool(toolName, 'container-ergebnis');
      if (!container) return;
  
      if (typeof html2pdf === 'undefined') {
        this._showToast('PDF-Export nicht verfügbar');
        return;
      }
  
      if (!filename) {
        filename = `ImmoTools-${toolName}-Ergebnis.pdf`;
      }
  
      const defaultOptions = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
  
      this._showToast('PDF wird erstellt...', 3000);
  
      html2pdf()
        .set({ ...defaultOptions, ...options })
        .from(container)
        .save()
        .then(() => this._showToast('PDF heruntergeladen!'));
    },
  
  
    // ==========================================
    // BUTTON-HANDLING (data-action System)
    // ==========================================
  
    _initButtons(toolName, berechnungsFn) {
      const form = this.getForm(toolName);
      if (!form) return;
  
      form.querySelectorAll('[data-action]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
  
          const action = el.getAttribute('data-action');
  
          switch (action) {
  
            case 'berechnen':
              this.clearValidation(toolName);
              this.hideError(toolName);
              this.hide(toolName, 'container-ergebnis');
              berechnungsFn();
              break;
  
            case 'reset':
              this.resetTool(toolName);
              break;
  
            case 'share':
              this.shareResults(toolName);
              break;
  
            case 'pdf':
              const filename = el.getAttribute('data-filename') || null;
              this.exportPDF(toolName, filename);
              break;
  
            case 'copy':
              const targetId = el.getAttribute('data-copy-target');
              if (targetId) this.copyValue(targetId);
              break;
  
            default:
              console.warn(`ImmoTools: Unbekannte Action "${action}"`);
          }
        });
      });
    },
  
  
    // ==========================================
    // TOOL-INITIALISIERUNG
    // ==========================================
  
    initTool(toolName, berechnungsFn) {
        const init = () => {
          const form = this.getForm(toolName);
          if (!form) {
            console.warn(`ImmoTools: Form [data-tool="${toolName}"] nicht gefunden`);
            return;
          }
    
          form.addEventListener('submit', (e) => e.preventDefault());
    
          const restoredFromURL = this._restoreFromURL(toolName);
    
          if (!restoredFromURL) {
            this._restoreInputs(toolName);
          }
    
          this._enableAutoSave(toolName);
          this._initButtons(toolName, berechnungsFn);
    
          form.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              this.clearValidation(toolName);
              this.hideError(toolName);
              this.hide(toolName, 'container-ergebnis');
              berechnungsFn();
            }
          });
    
          if (restoredFromURL) {
            berechnungsFn();
          }
        };
    
        // Fix: Falls Seite schon geladen ist, sofort starten
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', init);
        } else {
          init();
        }
      },
  
    resetTool(toolName) {
      const form = this.getForm(toolName);
      if (!form) return;
      form.querySelectorAll('input').forEach(input => {
        if (input.type === 'checkbox') input.checked = false;
        else input.value = '';
      });
      form.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
      });
      this.clearValidation(toolName);
      this.hideError(toolName);
      this.hide(toolName, 'container-ergebnis');
      this.removeData(`tool-${toolName}`);
    },
  
  
    // ==========================================
    // STAMMDATEN
    // ==========================================
  
    grunderwerbsteuer: {
      'baden-wuerttemberg': 5.0,
      'bayern': 3.5,
      'berlin': 6.0,
      'brandenburg': 6.5,
      'bremen': 5.0,
      'hamburg': 5.5,
      'hessen': 6.0,
      'mecklenburg-vorpommern': 6.0,
      'niedersachsen': 5.0,
      'nordrhein-westfalen': 6.5,
      'rheinland-pfalz': 5.0,
      'saarland': 6.5,
      'sachsen': 5.5,
      'sachsen-anhalt': 5.0,
      'schleswig-holstein': 6.5,
      'thueringen': 5.0
    },
  
    notarkostenProzent: 1.5,
    grundbuchProzent: 0.5,
    maklerProzentKauf: 3.57
  
  };
  