with open("style.css", "r", encoding="utf-8") as f:
    content = f.read()

if "eq-panel" in content:
    print("Já existe CSS do eq-panel, nada foi alterado.")
else:
    eq_css = '''

/* ===== Equalizador paramétrico ===== */
.eq-panel {
  margin: 18px 0;
  padding: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.eq-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.85);
}

.eq-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.6);
}

.eq-toggle input {
  accent-color: #4ade80;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.eq-bands {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
  height: 130px;
  padding: 0 6px;
}

.eq-band {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  flex: 1;
}

.eq-band input[type="range"] {
  writing-mode: vertical-lr;
  direction: rtl;
  width: 6px;
  height: 100px;
  appearance: slider-vertical;
  -webkit-appearance: slider-vertical;
  background: transparent;
  accent-color: #22d3ee;
  cursor: pointer;
}

.eq-band span {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.04em;
}

.eq-limiter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.04em;
}

.eq-limiter-row input[type="range"] {
  flex: 1;
  accent-color: #f472b6;
  cursor: pointer;
}

.eq-limiter-row #limiterValue {
  min-width: 44px;
  text-align: right;
  color: rgba(255, 255, 255, 0.85);
}
'''
    content += eq_css
    with open("style.css", "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: CSS do equalizador adicionado.")
