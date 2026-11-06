with open("style.css", "r", encoding="utf-8") as f:
    content = f.read()

marker = "user-select: none"
if marker in content:
    print("Ja existe protecao no CSS, nada foi alterado.")
else:
    protection_css = '''

/* ===== Protecao basica contra copia casual ===== */
body {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

input, textarea {
  -webkit-user-select: text;
  -moz-user-select: text;
  user-select: text;
}

img, video {
  -webkit-user-drag: none;
  user-drag: none;
  pointer-events: auto;
}
'''
    content += protection_css
    with open("style.css", "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: protecao CSS adicionada.")
