with open("script.js", "r", encoding="utf-8") as f:
    content = f.read()

marker = "vidBack14"
if marker in content:
    print("Ja existe codigo dos controles extras, nada foi alterado.")
else:
    extra_js = '''
// ===== Controles extras de video =====
const videoExtraControls = document.getElementById("videoExtraControls");
const vidBack14 = document.getElementById("vidBack14");
const vidForward14 = document.getElementById("vidForward14");
const vidPip = document.getElementById("vidPip");
const vidFullscreen = document.getElementById("vidFullscreen");

function updateVideoControlsVisibility() {
  const isVideo = currentIndex >= 0 && tracks[currentIndex] && tracks[currentIndex].kind === "video";
  videoExtraControls.hidden = !isVideo;
}

vidBack14.addEventListener("click", () => {
  video.currentTime = Math.max(0, video.currentTime - 14);
});

vidForward14.addEventListener("click", () => {
  if (Number.isFinite(video.duration)) {
    video.currentTime = Math.min(video.duration, video.currentTime + 14);
  } else {
    video.currentTime += 14;
  }
});

vidPip.addEventListener("click", async () => {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      await video.requestPictureInPicture();
    } else {
      showToast("Picture-in-Picture nao suportado neste navegador.");
    }
  } catch (err) {
    showToast("Nao foi possivel ativar o PIP.");
  }
});

vidFullscreen.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await video.requestFullscreen();
    }
  } catch (err) {
    showToast("Nao foi possivel alternar tela cheia.");
  }
});
'''
    marker_point = "function loadTrack(index, autoplay = false) {"
    if marker_point not in content:
        print("ERRO: ponto de insercao nao encontrado.")
    else:
        content = content.replace(marker_point, extra_js + "\n" + marker_point, 1)

        old_render = "renderPlaylist();\n\n  if (autoplay) {"
        new_render = "renderPlaylist();\n  updateVideoControlsVisibility();\n\n  if (autoplay) {"
        if old_render in content:
            content = content.replace(old_render, new_render, 1)
        else:
            print("AVISO: nao achou ponto para chamar updateVideoControlsVisibility, adicione manualmente dentro de loadTrack.")

        with open("script.js", "w", encoding="utf-8") as f:
            f.write(content)
        print("OK: controles extras de video adicionados no script.js.")
