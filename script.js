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

let tracks = [];
let currentIndex = -1;
let toastTimer;

document.getElementById("year").textContent = new Date().getFullYear();

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
