// ============================================
// ImmoTools — Global Utility Library
// utils.js v1.0.0
// ============================================

const ImmoTools = {
    // FORMATIERUNG
  
    // Zahl → "250.000,00 €"
    formatCurrency(value) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },
  
    // Zahl → "250.000 €" (ohne Cent)
    formatCurrencyShort(value) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    },
  
    // Zahl → "4,52 %"
    formatPercent(value, decimals = 2) {
      return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value) + ' %';
    },
  
    // Zahl → "1.250" oder "1.250,50"
    formatNumber(value, decimals = 0) {
      return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
    },
  
    // Zahl → "12,5x"
    formatFactor(value, decimals = 1) {
      return this.formatNumber(value, decimals) + 'x';
    },
  
    // Quadratmeter → "85,5 m²"
    formatArea(value, decimals = 1) {
      return this.formatNumber(value, decimals) + ' m²';
    },
  
    // Monate → "10 Jahre, 3 Monate"
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
  
    // Input-Wert als Zahl holen
    // Unterstützt deutsche Formate: "250.000,50" → 250000.5
    getInputValue(id, fallback = 0) {
      const el = document.getElementById(id);
      if (!el) {
        console.warn(`ImmoTools: Element #${id} nicht gefunden`);
        return fallback;
      }
      const raw = el.value.trim();
      if (raw === '') return fallback;
      // Deutsche Formatierung normalisieren
      const normalized = raw.replace(/\./g, '').replace(',', '.');
      const val = parseFloat(normalized);
      return isNaN(val) ? fallback : val;
    },
  
    // Select-Wert holen
    getSelectValue(id, fallback = '') {
      const el = document.getElementById(id);
      if (!el) {
        console.warn(`ImmoTools: Element #${id} nicht gefunden`);
        return fallback;
      }
      return el.value || fallback;
    },
  
    // Checkbox/Toggle-Status holen
    getToggleValue(id) {
      const el = document.getElementById(id);
      if (!el) return false;
      return el.checked;
    },
  
    // Input-Wert setzen
    setInputValue(id, value) {
      const el = document.getElementById(id);
      if (el) el.value = value;
    },
  
  
    // ==========================================
    // OUTPUT-HANDLING
    // ==========================================
  
    // Text in Element schreiben
    setOutput(id, value) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    },
  
    // HTML in Element schreiben (für formatierte Ausgaben)
    setOutputHTML(id, html) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    },
  
    // Element einblenden
    show(id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-hidden');
    },
  
    // Element ausblenden
    hide(id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('is-hidden');
    },
  
    // Element ein-/ausschalten
    toggle(id, visible) {
      if (visible) {
        this.show(id);
      } else {
        this.hide(id);
      }
    },
  
  
    // ==========================================
    // VALIDIERUNG
    // ==========================================
  
    // Mehrere Inputs auf einmal validieren
    // Gibt Array mit Fehlermeldungen zurück (leer = alles ok)
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
  
    // Input visuell als fehlerhaft markieren
    markInvalid(id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('is-invalid');
    },
  
    // Input visuell als ok markieren
    markValid(id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-invalid');
    },
  
    // Alle Inputs eines Tools zurücksetzen
    clearValidation(toolPrefix) {
      const wrapper = document.getElementById(`${toolPrefix}-wrapper`);
      if (!wrapper) return;
      wrapper.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
      });
    },
  
  
    // ==========================================
    // FEHLERMELDUNGEN
    // ==========================================
  
    showError(toolPrefix, message) {
      const el = document.getElementById(`${toolPrefix}-error-message`);
      if (el) {
        if (Array.isArray(message)) {
          el.textContent = message.join(' ');
        } else {
          el.textContent = message;
        }
        el.classList.remove('is-hidden');
      }
    },
  
    hideError(toolPrefix) {
      const el = document.getElementById(`${toolPrefix}-error-message`);
      if (el) el.classList.add('is-hidden');
    },
  
  
    // ==========================================
    // TOOL-INITIALISIERUNG (Boilerplate-Reduktion)
    // ==========================================
  
    // Standardmäßiges Setup für ein Tool
    // Bindet Button-Click und Enter-Taste
    initTool(toolPrefix, berechnungsFn) {
      document.addEventListener('DOMContentLoaded', () => {
        // Berechnen-Button
        const btn = document.getElementById(`${toolPrefix}-btn-berechnen`);
        if (btn) {
          btn.addEventListener('click', () => {
            this.clearValidation(toolPrefix);
            this.hideError(toolPrefix);
            this.hide(`${toolPrefix}-container-ergebnis`);
            berechnungsFn();
          });
        }
  
        // Enter-Taste im Tool-Bereich
        const wrapper = document.getElementById(`${toolPrefix}-wrapper`);
        if (wrapper) {
          wrapper.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              this.clearValidation(toolPrefix);
              this.hideError(toolPrefix);
              this.hide(`${toolPrefix}-container-ergebnis`);
              berechnungsFn();
            }
          });
        }
  
        // Zurücksetzen-Button (optional)
        const resetBtn = document.getElementById(`${toolPrefix}-btn-reset`);
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.resetTool(toolPrefix);
          });
        }
      });
    },
  
    // Alle Inputs zurücksetzen
    resetTool(toolPrefix) {
      const wrapper = document.getElementById(`${toolPrefix}-wrapper`);
      if (!wrapper) return;
      wrapper.querySelectorAll('input').forEach(input => {
        input.value = '';
      });
      wrapper.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
      });
      this.clearValidation(toolPrefix);
      this.hideError(toolPrefix);
      this.hide(`${toolPrefix}-container-ergebnis`);
    },
  
  
    // ==========================================
    // ERGEBNIS ANZEIGEN (Shortcut)
    // ==========================================
  
    // Prüft Validierung und zeigt entweder Fehler oder Ergebnis
    showResults(toolPrefix, fields, berechnungsFn) {
      this.clearValidation(toolPrefix);
      this.hideError(toolPrefix);
      this.hide(`${toolPrefix}-container-ergebnis`);
  
      const errors = this.validateInputs(fields);
      if (errors.length > 0) {
        this.showError(toolPrefix, errors);
        return false;
      }
  
      berechnungsFn();
      this.show(`${toolPrefix}-container-ergebnis`);
      // Sanft zum Ergebnis scrollen
      const container = document.getElementById(`${toolPrefix}-container-ergebnis`);
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return true;
    },
  
  
    // ==========================================
    // DATEN FÜR RECHNER
    // ==========================================
  
    // Grunderwerbsteuer nach Bundesland (Stand 2025)
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
  
    // Notar- und Grundbuchkosten (Richtwerte)
    notarkostenProzent: 1.5,   // ca. 1,5% vom Kaufpreis
    grundbuchProzent: 0.5,     // ca. 0,5% vom Kaufpreis
    maklerProzentKauf: 3.57,   // 3,57% inkl. MwSt (Käuferanteil)
  
  
    // ==========================================
    // PDF-EXPORT
    // ==========================================
  
    // Element als PDF herunterladen
    // Benötigt html2pdf.js (extern einbinden)
    exportPDF(elementId, filename = 'Dokument.pdf', options = {}) {
      if (typeof html2pdf === 'undefined') {
        console.error('ImmoTools: html2pdf.js ist nicht geladen.');
        alert('PDF-Export ist nicht verfügbar. Bitte Seite neu laden.');
        return;
      }
  
      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`ImmoTools: Element #${elementId} nicht gefunden`);
        return;
      }
  
      const defaultOptions = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
  
      const mergedOptions = { ...defaultOptions, ...options };
      html2pdf().set(mergedOptions).from(element).save();
    },
  
  
    // ==========================================
    // LOCALSTORAGE HELPERS
    // ==========================================
  
    // Daten speichern (JSON)
    saveData(key, data) {
      try {
        localStorage.setItem(`immo-${key}`, JSON.stringify(data));
        return true;
      } catch (e) {
        console.warn('ImmoTools: localStorage nicht verfügbar', e);
        return false;
      }
    },
  
    // Daten laden (JSON)
    loadData(key, fallback = null) {
      try {
        const raw = localStorage.getItem(`immo-${key}`);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        console.warn('ImmoTools: Fehler beim Laden', e);
        return fallback;
      }
    },
  
    // Daten löschen
    removeData(key) {
      try {
        localStorage.removeItem(`immo-${key}`);
      } catch (e) {
        console.warn('ImmoTools: Fehler beim Löschen', e);
      }
    }
  
  };