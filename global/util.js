// ============================================
// ImmoTools — Global Utility Library
// utils.js v2.0.0
//
// Architektur: Jedes Tool lebt in einem <form data-tool="toolname">
// Inputs/Outputs werden per ID angesteuert.
// Alles andere (Buttons, Container) per Klasse innerhalb des Forms.
// ============================================

const ImmoTools = {

    // ==========================================
    // TOOL-SCOPE
    // ==========================================
  
    // Form-Element eines Tools holen
    getForm(toolName) {
      return document.querySelector(`form[data-tool="${toolName}"]`);
    },
  
    // Element innerhalb eines Tools per Klasse finden
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
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },
  
    formatCurrencyShort(value) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    },
  
    formatPercent(value, decimals = 2) {
      return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value) + ' %';
    },
  
    formatNumber(value, decimals = 0) {
      return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
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
  
    // Container per Klasse innerhalb des Tool-Forms ein-/ausblenden
    show(toolName, className) {
      const el = this.queryTool(toolName, className);
      if (el) el.classList.remove('is-hidden');
    },
  
    hide(toolName, className) {
      const el = this.queryTool(toolName, className);
      if (el) el.classList.add('is-hidden');
    },
  
    toggle(toolName, className, visible) {
      if (visible) {
        this.show(toolName, className);
      } else {
        this.hide(toolName, className);
      }
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
      form.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
      });
    },
  
  
    // ==========================================
    // FEHLERMELDUNGEN (per Klasse im Form)
    // ==========================================
  
    showError(toolName, message) {
      const el = this.queryTool(toolName, 'error-message');
      if (el) {
        if (Array.isArray(message)) {
          el.textContent = message.join(' ');
        } else {
          el.textContent = message;
        }
        el.classList.remove('is-hidden');
      }
    },
  
    hideError(toolName) {
      const el = this.queryTool(toolName, 'error-message');
      if (el) el.classList.add('is-hidden');
    },
  
  
    // ==========================================
    // TOOL-INITIALISIERUNG
    // ==========================================
  
    initTool(toolName, berechnungsFn) {
      document.addEventListener('DOMContentLoaded', () => {
        const form = this.getForm(toolName);
        if (!form) {
          console.warn(`ImmoTools: Form [data-tool="${toolName}"] nicht gefunden`);
          return;
        }
  
        // Form-Submit verhindern (kein Reload)
        form.addEventListener('submit', (e) => {
          e.preventDefault();
        });
  
        // Berechnen-Button (Klasse .btn-berechnen innerhalb des Forms)
        const btn = form.querySelector('.btn-berechnen');
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.clearValidation(toolName);
            this.hideError(toolName);
            this.hide(toolName, 'container-ergebnis');
            berechnungsFn();
          });
        }
  
        // Enter-Taste
        form.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.clearValidation(toolName);
            this.hideError(toolName);
            this.hide(toolName, 'container-ergebnis');
            berechnungsFn();
          }
        });
  
        // Zurücksetzen-Button (optional, Klasse .btn-reset)
        const resetBtn = form.querySelector('.btn-reset');
        if (resetBtn) {
          resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.resetTool(toolName);
          });
        }
      });
    },
  
    resetTool(toolName) {
      const form = this.getForm(toolName);
      if (!form) return;
      form.querySelectorAll('input').forEach(input => {
        input.value = '';
      });
      form.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
      });
      this.clearValidation(toolName);
      this.hideError(toolName);
      this.hide(toolName, 'container-ergebnis');
    },
  
  
    // ==========================================
    // ERGEBNIS ANZEIGEN (Shortcut)
    // ==========================================
  
    showResults(toolName, fields, berechnungsFn) {
      this.clearValidation(toolName);
      this.hideError(toolName);
      this.hide(toolName, 'container-ergebnis');
  
      const errors = this.validateInputs(fields);
      if (errors.length > 0) {
        this.showError(toolName, errors);
        return false;
      }
  
      berechnungsFn();
      this.show(toolName, 'container-ergebnis');
  
      const container = this.queryTool(toolName, 'container-ergebnis');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return true;
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
    maklerProzentKauf: 3.57,
  
  
    // ==========================================
    // PDF-EXPORT
    // ==========================================
  
    exportPDF(elementId, filename = 'Dokument.pdf', options = {}) {
      if (typeof html2pdf === 'undefined') {
        console.error('ImmoTools: html2pdf.js ist nicht geladen.');
        alert('PDF-Export ist nicht verfügbar. Bitte Seite neu laden.');
        return;
      }
  
      const element = document.getElementById(elementId);
      if (!element) return;
  
      const defaultOptions = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
  
      html2pdf().set({ ...defaultOptions, ...options }).from(element).save();
    },
  
  
    // ==========================================
    // LOCALSTORAGE
    // ==========================================
  
    saveData(key, data) {
      try {
        localStorage.setItem(`immo-${key}`, JSON.stringify(data));
        return true;
      } catch (e) {
        console.warn('ImmoTools: localStorage nicht verfügbar', e);
        return false;
      }
    },
  
    loadData(key, fallback = null) {
      try {
        const raw = localStorage.getItem(`immo-${key}`);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
  
    removeData(key) {
      try {
        localStorage.removeItem(`immo-${key}`);
      } catch (e) {}
    }
  
  };
  