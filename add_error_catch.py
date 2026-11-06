with open("script.js", "r", encoding="utf-8") as f:
    content = f.read()

marker = "window.addEventListener(\"error\""
if marker in content:
    print("Ja existe captura de erro, nada foi alterado.")
else:
    error_catch = '''window.addEventListener("error", (e) => {
  alert("ERRO JS: " + e.message + " (linha " + e.lineno + ")");
});

'''
    marker_point = "const audio = document.getElementById(\"audio\");"
    if marker_point not in content:
        print("ERRO: marcador nao encontrado.")
    else:
        content = content.replace(marker_point, error_catch + marker_point, 1)
        with open("script.js", "w", encoding="utf-8") as f:
            f.write(content)
        print("OK: captura de erro adicionada.")
