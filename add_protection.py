with open("script.js", "r", encoding="utf-8") as f:
    content = f.read()

marker = "contextmenu"
if marker in content:
    print("Ja existe protecao, nada foi alterado.")
else:
    protection = '''
// ===== Protecao basica contra copia casual =====
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  showToast("Acao desabilitada neste site.");
});

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  const blockedCombo =
    (e.ctrlKey && (key === "s" || key === "u" || key === "p")) ||
    (e.ctrlKey && e.shiftKey && (key === "i" || key === "j" || key === "c")) ||
    key === "f12";

  if (blockedCombo) {
    e.preventDefault();
    showToast("Acao desabilitada neste site.");
  }
});

document.addEventListener("dragstart", (e) => e.preventDefault());

'''
    marker_point = "document.getElementById(\"year\").textContent = new Date().getFullYear();"
    if marker_point not in content:
        print("ERRO: marcador nao encontrado.")
    else:
        content = content.replace(marker_point, protection + marker_point, 1)
        with open("script.js", "w", encoding="utf-8") as f:
            f.write(content)
        print("OK: protecao adicionada ao script.js.")
