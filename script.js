window.addEventListener("error", (e) => {
  alert("ERRO JS: " + e.message + " (linha " + e.lineno + ")");
});

const audio = document.getElementById("audio");
const video = document.getElementById("video");
const filesInput = document.getElementById("musicFiles");
const playlistElement = document.getElementById("playlist");
const trackName = document.getElementById("trackName");
const trackDetails = document.getElementById("trackDetails");
const playButton = document.getElementById("play");
const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const songCount = document.getElementById("songCount");
const mediaType = document.getElementById("mediaType");

let audioChain;
let videoChain;


let tracks = [];
let currentIndex = -1;
let toastTimer;

// ===== Equalizador paramétrico (5 bandas) + Limiter =====
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

function buildChain(mediaElement) {
  const source = audioCtx.createMediaElementSource(mediaElement);

  const band60 = audioCtx.createBiquadFilter();
  band60.type = "lowshelf";
  band60.frequency.value = 60;

  const band250 = audioCtx.createBiquadFilter();
  band250.type = "peaking";
  band250.frequency.value = 250;
  band250.Q.value = 1;

  const band1k = audioCtx.createBiquadFilter();
  band1k.type = "peaking";
  band1k.frequency.value = 1000;
  band1k.Q.value = 1;

  const band4k = audioCtx.createBiquadFilter();
  band4k.type = "peaking";
  band4k.frequency.value = 4000;
  band4k.Q.value = 1;

  const band12k = audioCtx.createBiquadFilter();
  band12k.type = "highshelf";
  band12k.frequency.value = 12000;

  const limiter = audioCtx.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.1;

  source.connect(band60);
  band60.connect(band250);
  band250.connect(band1k);
  band1k.connect(band4k);
  band4k.connect(band12k);
  band12k.connect(limiter);
  limiter.connect(audioCtx.destination);

  return { source, bands: [band60, band250, band1k, band4k, band12k], limiter };
}



document.getElementById("year").textContent = new Date().getFullYear();

audioChain = buildChain(audio);
videoChain = buildChain(video);

function resumeAudioCtx() {
  if (audioCtx.state === "suspended") audioCtx.resume();
}

const eqIds = ["eq60", "eq250", "eq1k", "eq4k", "eq12k"];
const eqSliders = eqIds.map(id => document.getElementById(id));
const eqEnabled = document.getElementById("eqEnabled");
const limiterSlider = document.getElementById("limiterThreshold");
const limiterValueLabel = document.getElementById("limiterValue");

function applyEqToChain(chain) {
  if (!chain) return;
  eqSliders.forEach((slider, i) => {
    const gain = eqEnabled.checked ? Number(slider.value) : 0;
    chain.bands[i].gain.value = gain;
  });
}

function applyLimiterToChain(chain) {
  if (!chain) return;
  chain.limiter.threshold.value = Number(limiterSlider.value);
}

function applyEqToAll() {
  applyEqToChain(audioChain);
  applyEqToChain(videoChain);
}

function applyLimiterToAll() {
  applyLimiterToChain(audioChain);
  applyLimiterToChain(videoChain);
}

eqSliders.forEach(slider => slider.addEventListener("input", applyEqToAll));
eqEnabled.addEventListener("change", applyEqToAll);
limiterSlider.addEventListener("input", () => {
  limiterValueLabel.textContent = limiterSlider.value + "dB";
  applyLimiterToAll();
});

document.addEventListener("click", resumeAudioCtx, { once: true });

applyEqToAll();
applyLimiterToAll();


function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function activeMedia() {
  return currentIndex >= 0 && tracks[currentIndex]?.kind === "video" ? video : audio;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function renderPlaylist() {
  playlistElement.innerHTML = "";
  songCount.textContent = `${tracks.length} arquivo${tracks.length === 1 ? "" : "s"}`;

  if (!tracks.length) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = "Sua lista aparecerá aqui.";
    playlistElement.appendChild(item);
    return;
  }

  tracks.forEach((track, index) => {
    const item = document.createElement("li");
    item.className = index === currentIndex ? "active" : "";

    const name = document.createElement("span");
    name.textContent = `${index + 1}. ${track.name}`;

    const marker = document.createElement("span");
    marker.textContent = index === currentIndex
      ? (activeMedia().paused ? "Selecionado" : "Tocando")
      : (track.kind === "video" ? "VÍDEO" : "ÁUDIO");

    item.append(name, marker);
    item.addEventListener("click", () => loadTrack(index, true));
    playlistElement.appendChild(item);
  });
}

function stopMedia() {
  audio.pause();
  video.pause();
}


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

function loadTrack(index, autoplay = false) {
  if (index < 0 || index >= tracks.length) return;

  stopMedia();
  currentIndex = index;

  const track = tracks[index];
  const isVideo = track.kind === "video";
  const media = isVideo ? video : audio;

  audio.removeAttribute("src");
  video.removeAttribute("src");
  audio.load();
  video.load();

  video.hidden = !isVideo;
  mediaType.textContent = isVideo ? "VIDEO MODE" : "AUDIO MODE";

  media.src = track.url;
  media.load();

  trackName.textContent = track.name;
  trackDetails.textContent = `${isVideo ? "Vídeo" : "Áudio"} • Arquivo ${index + 1} de ${tracks.length}`;
  progress.value = 0;
  currentTime.textContent = "0:00";
  duration.textContent = "0:00";
  playButton.textContent = "▶";

  renderPlaylist();
  updateVideoControlsVisibility();

  if (autoplay) {
    media.play().catch(() => showToast("Toque em reproduzir para iniciar o arquivo."));
  }
}

function detectKind(file) {
  const name = file.name.toLowerCase();
  const videoExtensions = /\.(mp4|m4v|webm|ogv|mov|mpeg|mpg|avi|mkv|3gp)$/i;

  if (file.type.startsWith("video/") || videoExtensions.test(name)) return "video";
  if (file.type.startsWith("audio/")) return "audio";

  if (/\.(mp3|m4a|m4b|aac|wav|wave|ogg|oga|opus|flac|aif|aiff|amr|3ga|caf|wma|mid|midi)$/i.test(name)) {
    return "audio";
  }

  return null;
}

filesInput.addEventListener("change", event => {
  const selected = Array.from(event.target.files || []);
  const valid = selected
    .map(file => ({ file, kind: detectKind(file) }))
    .filter(item => item.kind);

  if (!valid.length) {
    showToast("Nenhum formato de áudio ou vídeo reconhecido.");
    filesInput.value = "";
    return;
  }

  valid.forEach(({ file, kind }) => {
    tracks.push({
      name: file.name,
      kind,
      url: URL.createObjectURL(file)
    });
  });

  renderPlaylist();

  if (currentIndex === -1) loadTrack(0, true);

  showToast(`${valid.length} arquivo(s) adicionado(s).`);
  filesInput.value = "";
});

playButton.addEventListener("click", () => {
  if (!tracks.length) {
    showToast("Primeiro importe um arquivo do dispositivo.");
    return;
  }

  const media = activeMedia();

  if (media.paused) {
    media.play().catch(() => showToast("Não foi possível reproduzir este formato."));
  } else {
    media.pause();
  }
});

document.getElementById("previous").addEventListener("click", () => {
  if (tracks.length) loadTrack((currentIndex - 1 + tracks.length) % tracks.length, true);
});

document.getElementById("next").addEventListener("click", () => {
  if (tracks.length) loadTrack((currentIndex + 1) % tracks.length, true);
});

function updatePlayState() {
  const media = activeMedia();
  playButton.textContent = media.paused ? "▶" : "Ⅱ";
  renderPlaylist();
}

[audio, video].forEach(media => {
  media.addEventListener("play", updatePlayState);
  media.addEventListener("pause", updatePlayState);

  media.addEventListener("loadedmetadata", () => {
    if (media === activeMedia()) duration.textContent = formatTime(media.duration);
  });

  media.addEventListener("timeupdate", () => {
    if (media !== activeMedia()) return;
    currentTime.textContent = formatTime(media.currentTime);

    if (Number.isFinite(media.duration) && media.duration > 0) {
      progress.value = (media.currentTime / media.duration) * 100;
    }
  });

  media.addEventListener("ended", () => {
    if (media === activeMedia() && tracks.length) {
      loadTrack((currentIndex + 1) % tracks.length, true);
    }
  });

  media.addEventListener("error", () => {
    if (media === activeMedia() && media.currentSrc) {
      showToast("Formato ou codec não compatível com este navegador.");
    }
  });
});

progress.addEventListener("input", () => {
  const media = activeMedia();
  if (Number.isFinite(media.duration) && media.duration > 0) {
    media.currentTime = (Number(progress.value) / 100) * media.duration;
  }
});

document.getElementById("volume").addEventListener("input", event => {
  const value = Number(event.target.value);
  audio.volume = value;
  video.volume = value;
});

audio.volume = 0.8;
video.volume = 0.8;

window.addEventListener("beforeunload", () => {
  stopMedia();
  tracks.forEach(track => URL.revokeObjectURL(track.url));
});
