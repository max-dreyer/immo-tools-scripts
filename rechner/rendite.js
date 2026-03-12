// ============================================
// rendite.js — Mietrendite-Rechner (v2)
// Benötigt: utils.js (global eingebunden)
//
// Webflow-Struktur:
// <form data-tool="rendite">
//   Inputs mit IDs: rendite-input-*
//   Outputs mit IDs: rendite-output-*
//   Button mit Klasse: .btn-berechnen
//   Ergebnis-Div mit Klasse: .container-ergebnis
//   Fehler-Div mit Klasse: .error-message
// </form>
// ============================================

(function () {
    const T = 'rendite';
  
    function berechnen() {
  
      // ── 1. EINGABEN ──
  
      const kaufpreis          = ImmoTools.getInputValue(`${T}-input-kaufpreis`);
      const kaufnebenkosten    = ImmoTools.getInputValue(`${T}-input-kaufnebenkosten`);
      const kaltmiete          = ImmoTools.getInputValue(`${T}-input-kaltmiete`);
  
      const verwaltungMonat    = ImmoTools.getInputValue(`${T}-input-verwaltung`);
      const instandhaltungJahr = ImmoTools.getInputValue(`${T}-input-instandhaltung`);
      const leerstandProzent   = ImmoTools.getInputValue(`${T}-input-leerstand`);
  
      const eigenkapital       = ImmoTools.getInputValue(`${T}-input-eigenkapital`);
      const darlehenszins      = ImmoTools.getInputValue(`${T}-input-zins`);
      const tilgungssatz       = ImmoTools.getInputValue(`${T}-input-tilgung`);
  
      const steuersatz         = ImmoTools.getInputValue(`${T}-input-steuersatz`);
      const afaProzent         = ImmoTools.getInputValue(`${T}-input-afa`);
  
      // ── 2. VALIDIERUNG ──
  
      const errors = ImmoTools.validateInputs([
        { id: `${T}-input-kaufpreis`, label: 'Kaufpreis', min: 1 },
        { id: `${T}-input-kaltmiete`, label: 'Monatliche Kaltmiete', min: 1 },
        { id: `${T}-input-kaufnebenkosten`, label: 'Kaufnebenkosten', min: 0, required: false },
        { id: `${T}-input-leerstand`, label: 'Leerstandsquote', min: 0, max: 100, required: false },
        { id: `${T}-input-zins`, label: 'Sollzins', min: 0, max: 15, required: false },
        { id: `${T}-input-tilgung`, label: 'Tilgung', min: 0, max: 20, required: false },
        { id: `${T}-input-steuersatz`, label: 'Steuersatz', min: 0, max: 50, required: false },
        { id: `${T}-input-afa`, label: 'AfA-Satz', min: 0, max: 10, required: false }
      ]);
  
      if (errors.length > 0) {
        ImmoTools.showError(T, errors);
        return;
      }
  
      // ── 3. BERECHNUNGEN ──
  
      const nebenkostenBetrag   = kaufpreis * (kaufnebenkosten / 100);
      const gesamtkosten        = kaufpreis + nebenkostenBetrag;
  
      const jahresBruttoMiete   = kaltmiete * 12;
      const leerstandAbzug      = jahresBruttoMiete * (leerstandProzent / 100);
      const jahresEffektivMiete = jahresBruttoMiete - leerstandAbzug;
  
      const verwaltungJahr      = verwaltungMonat * 12;
      const kostenGesamt        = verwaltungJahr + instandhaltungJahr;
      const jahresNettoMiete    = jahresEffektivMiete - kostenGesamt;
  
      const bruttoRendite       = (jahresBruttoMiete / gesamtkosten) * 100;
      const nettoRendite        = (jahresNettoMiete / gesamtkosten) * 100;
      const kaufpreisfaktor     = gesamtkosten / jahresBruttoMiete;
  
      const darlehenssumme  = gesamtkosten - eigenkapital;
      const jahresZins      = darlehenssumme * (darlehenszins / 100);
      const jahresTilgung   = darlehenssumme * (tilgungssatz / 100);
      const jahresAnnuitaet = jahresZins + jahresTilgung;
      const monatsrate      = jahresAnnuitaet / 12;
  
      const cashflowVorSteuerJahr  = jahresNettoMiete - jahresAnnuitaet;
      const cashflowVorSteuerMonat = cashflowVorSteuerJahr / 12;
  
      const afaBetrag       = kaufpreis * (afaProzent / 100);
      const zuVersteuern    = jahresNettoMiete - jahresZins - afaBetrag;
      const steuerLast      = zuVersteuern > 0 ? zuVersteuern * (steuersatz / 100) : 0;
      const steuerErsparnis = zuVersteuern < 0 ? Math.abs(zuVersteuern) * (steuersatz / 100) : 0;
  
      const cashflowNachSteuerJahr  = cashflowVorSteuerJahr - steuerLast + steuerErsparnis;
      const cashflowNachSteuerMonat = cashflowNachSteuerJahr / 12;
  
      const ekEinsatz = eigenkapital > 0 ? eigenkapital : gesamtkosten;
      const eigenkapitalRendite = (cashflowNachSteuerJahr / ekEinsatz) * 100;
  
      // ── 4. AUSGABEN ──
  
      ImmoTools.setOutput(`${T}-output-brutto`, ImmoTools.formatPercent(bruttoRendite));
      ImmoTools.setOutput(`${T}-output-netto`, ImmoTools.formatPercent(nettoRendite));
      ImmoTools.setOutput(`${T}-output-faktor`, ImmoTools.formatNumber(kaufpreisfaktor, 1) + 'x');
      ImmoTools.setOutput(`${T}-output-gesamtkosten`, ImmoTools.formatCurrencyShort(gesamtkosten));
  
      ImmoTools.setOutput(`${T}-output-darlehenssumme`, ImmoTools.formatCurrencyShort(darlehenssumme));
      ImmoTools.setOutput(`${T}-output-monatsrate`, ImmoTools.formatCurrency(monatsrate));
      ImmoTools.setOutput(`${T}-output-jahresannuitaet`, ImmoTools.formatCurrencyShort(jahresAnnuitaet));
  
      ImmoTools.setOutput(`${T}-output-cashflow-vor-steuer`, ImmoTools.formatCurrency(cashflowVorSteuerMonat));
      ImmoTools.setOutput(`${T}-output-cashflow-nach-steuer`, ImmoTools.formatCurrency(cashflowNachSteuerMonat));
      ImmoTools.setOutput(`${T}-output-cashflow-jahr`, ImmoTools.formatCurrencyShort(cashflowNachSteuerJahr));
  
      ImmoTools.setOutput(`${T}-output-afa-betrag`, ImmoTools.formatCurrencyShort(afaBetrag));
      ImmoTools.setOutput(`${T}-output-steuer`, ImmoTools.formatCurrencyShort(steuerLast));
      ImmoTools.setOutput(`${T}-output-steuerersparnis`, ImmoTools.formatCurrencyShort(steuerErsparnis));
  
      ImmoTools.setOutput(`${T}-output-ek-rendite`, ImmoTools.formatPercent(eigenkapitalRendite));
  
      // ── 5. BEWERTUNGEN ──
  
      setBewertung(`${T}-bewertung-brutto`, bruttoRendite, [
        { min: 6, label: 'Sehr gut', cls: 'is-sehr-gut' },
        { min: 4, label: 'Gut', cls: 'is-gut' },
        { min: 3, label: 'Akzeptabel', cls: 'is-akzeptabel' },
        { min: 0, label: 'Schwach', cls: 'is-schwach' }
      ]);
  
      setBewertung(`${T}-bewertung-netto`, nettoRendite, [
        { min: 5, label: 'Sehr gut', cls: 'is-sehr-gut' },
        { min: 3.5, label: 'Gut', cls: 'is-gut' },
        { min: 2, label: 'Akzeptabel', cls: 'is-akzeptabel' },
        { min: 0, label: 'Schwach', cls: 'is-schwach' }
      ]);
  
      setBewertung(`${T}-bewertung-faktor`, kaufpreisfaktor, [
        { max: 20, label: 'Sehr gut', cls: 'is-sehr-gut' },
        { max: 25, label: 'Gut', cls: 'is-gut' },
        { max: 30, label: 'Akzeptabel', cls: 'is-akzeptabel' },
        { max: Infinity, label: 'Teuer', cls: 'is-schwach' }
      ]);
  
      setBewertung(`${T}-bewertung-cashflow`, cashflowNachSteuerMonat, [
        { min: 100, label: 'Positiv', cls: 'is-sehr-gut' },
        { min: 0, label: 'Neutral', cls: 'is-gut' },
        { min: -100, label: 'Leicht negativ', cls: 'is-akzeptabel' },
        { min: -Infinity, label: 'Negativ', cls: 'is-schwach' }
      ]);
  
      setBewertung(`${T}-bewertung-ek-rendite`, eigenkapitalRendite, [
        { min: 10, label: 'Sehr gut', cls: 'is-sehr-gut' },
        { min: 6, label: 'Gut', cls: 'is-gut' },
        { min: 3, label: 'Akzeptabel', cls: 'is-akzeptabel' },
        { min: 0, label: 'Schwach', cls: 'is-schwach' }
      ]);
  
      // ── 6. JAHRESÜBERSICHT ──
  
      erstelleJahresTabelle({
        darlehenssumme,
        darlehenszins,
        tilgungssatz,
        jahresNettoMiete,
        steuersatz,
        afaBetrag
      });
  
      // ── Ergebnis einblenden ──
      ImmoTools.show(T, 'container-ergebnis');
  
      const container = ImmoTools.queryTool(T, 'container-ergebnis');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  
  
    function setBewertung(id, value, stufen) {
      const el = document.getElementById(id);
      if (!el) return;
  
      el.classList.remove('is-sehr-gut', 'is-gut', 'is-akzeptabel', 'is-schwach');
  
      let ergebnis = stufen[stufen.length - 1];
      for (const stufe of stufen) {
        if (stufe.min !== undefined && value >= stufe.min) { ergebnis = stufe; break; }
        if (stufe.max !== undefined && value <= stufe.max) { ergebnis = stufe; break; }
      }
  
      el.textContent = ergebnis.label;
      el.classList.add(ergebnis.cls);
    }
  
  
    function erstelleJahresTabelle(params) {
      const tableBody = document.getElementById(`${T}-tabelle-body`);
      if (!tableBody) return;
  
      tableBody.innerHTML = '';
  
      const jahre = 10;
      let restschuld = params.darlehenssumme;
      let gesamtZins = 0;
      let gesamtTilgung = 0;
  
      for (let jahr = 1; jahr <= jahre; jahr++) {
        const zinsJahr    = restschuld * (params.darlehenszins / 100);
        const tilgungJahr = restschuld * (params.tilgungssatz / 100);
        const annuitaet   = zinsJahr + tilgungJahr;
  
        const zuVersteuern = params.jahresNettoMiete - zinsJahr - params.afaBetrag;
        const steuer    = zuVersteuern > 0 ? zuVersteuern * (params.steuersatz / 100) : 0;
        const ersparnis = zuVersteuern < 0 ? Math.abs(zuVersteuern) * (params.steuersatz / 100) : 0;
  
        const cashflow = params.jahresNettoMiete - annuitaet - steuer + ersparnis;
  
        restschuld = Math.max(0, restschuld - tilgungJahr);
        gesamtZins += zinsJahr;
        gesamtTilgung += tilgungJahr;
  
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${jahr}</td>
          <td>${ImmoTools.formatCurrencyShort(params.jahresNettoMiete)}</td>
          <td>${ImmoTools.formatCurrencyShort(zinsJahr)}</td>
          <td>${ImmoTools.formatCurrencyShort(tilgungJahr)}</td>
          <td>${ImmoTools.formatCurrencyShort(steuer > 0 ? -steuer : ersparnis)}</td>
          <td class="${cashflow >= 0 ? 'is-positiv' : 'is-negativ'}">${ImmoTools.formatCurrencyShort(cashflow)}</td>
          <td>${ImmoTools.formatCurrencyShort(restschuld)}</td>
        `;
        tableBody.appendChild(row);
      }
  
      ImmoTools.setOutput(`${T}-output-gesamt-zins`, ImmoTools.formatCurrencyShort(gesamtZins));
      ImmoTools.setOutput(`${T}-output-gesamt-tilgung`, ImmoTools.formatCurrencyShort(gesamtTilgung));
      ImmoTools.setOutput(`${T}-output-restschuld-10`, ImmoTools.formatCurrencyShort(restschuld));
    }
  
  
    ImmoTools.initTool(T, berechnen);
  
  })();