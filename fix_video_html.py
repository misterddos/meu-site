with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

marker = "video-extra-controls"
if marker in content:
    print("Ja existe video-extra-controls, nada foi alterado.")
else:
    old = '<video id="video" class="local-video" preload="metadata" controls playsinline hidden></video>'
    new = old + '''
        <div class="video-extra-controls" id="videoExtraControls" hidden>
          <button id="vidBack14" type="button">&#8630; 14s</button>
          <button id="vidPip" type="button">PIP</button>
          <button id="vidFullscreen" type="button">TELA CHEIA</button>
          <button id="vidForward14" type="button">14s &#8631;</button>
        </div>'''
    if old not in content:
        print("ERRO: marcador do video nao encontrado.")
    else:
        content = content.replace(old, new, 1)
        with open("index.html", "w", encoding="utf-8") as f:
            f.write(content)
        print("OK: controles extras do video adicionados no HTML.")
