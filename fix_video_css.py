with open("style.css", "r", encoding="utf-8") as f:
    content = f.read()

marker = ".local-video"
if marker in content:
    print("Já existe regra .local-video, pulando CSS (edite manualmente se precisar).")
else:
    video_css = '''

/* ===== Vídeo proporcional ===== */
.local-video {
  width: 100%;
  max-height: 60vh;
  display: block;
  object-fit: contain;
  background: #000;
  border-radius: 10px;
  margin: 12px 0;
}

.video-extra-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 10px 0 4px;
}

.video-extra-controls button {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 0.78rem;
  cursor: pointer;
}

.video-extra-controls button:active {
  background: rgba(255, 255, 255, 0.18);
}
'''
    content += video_css
    with open("style.css", "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: CSS do vídeo adicionado.")
