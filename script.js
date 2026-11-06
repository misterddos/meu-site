const audio = document.getElementById("audio");
const filesInput = document.getElementById("musicFiles");
const playlistElement = document.getElementById("playlist");
const trackName = document.getElementById("trackName");
const trackDetails = document.getElementById("trackDetails");
const playButton = document.getElementById("play");
const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const songCount = document.getElementById("songCount");

let tracks = [];
let currentIndex = -1;
let toastTimer;

document.getElementById("year").textContent = new Date().getFullYear();

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function renderPlaylist() {
  playlistElement.innerHTML = "";
  songCount.textContent = `${tracks.length} música${tracks.length === 1 ? "" : "s"}`;

  if (!tracks.length) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = "Sua lista de músicas aparecerá aqui.";
    playlistElement.appendChild(item);
    return;
  }

  tracks.forEach((track, index) => {
    const item = document.createElement("li");
    item.className = index === currentIndex ? "active" : "";
    const name = document.createElement("span");
    name.textContent = `${index + 1}. ${track.name}`;
    const marker = document.createElement("span");
    marker.textContent = index === currentIndex && !audio.paused ? "Tocando" : "▶";
    item.append(name, marker);
    item.addEventListener("click", () => loadTrack(index, true));
    playlistElement.appendChild(item);
  });
}

function loadTrack(index, autoplay = false) {
  if (index < 0 || index >= tracks.length) return;
  currentIndex = index;
  audio.src = tracks[index].url;
  trackName.textContent = tracks[index].name;
  trackDetails.textContent = `Faixa ${index + 1} de ${tracks.length}`;
  progress.value = 0;
  currentTime.textContent = "0:00";
  duration.textContent = "0:00";
  renderPlaylist();

  if (autoplay) {
    audio.play().catch(() => showToast("Toque em reproduzir para iniciar o áudio."));
  }
}

filesInput.addEventListener("change", event => {
  const selected = Array.from(event.target.files || []);
  const valid = selected.filter(file =>
    file.type.startsWith("audio/") ||
    /\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|webm|mp4)$/i.test(file.name)
  );

  if (!valid.length) {
    showToast("Selecione arquivos de áudio compatíveis.");
    return;
  }

  valid.forEach(file => {
    tracks.push({ name: file.name, url: URL.createObjectURL(file) });
  });

  renderPlaylist();
  if (currentIndex === -1) loadTrack(0, true);
  showToast(`${valid.length} arquivo(s) adicionado(s) à playlist.`);
  filesInput.value = "";
});

playButton.addEventListener("click", () => {
  if (!tracks.length) {
    showToast("Primeiro selecione músicas do seu dispositivo.");
    return;
  }
  if (audio.paused) {
    audio.play().catch(() => showToast("Não foi possível iniciar essa faixa."));
  } else {
    audio.pause();
  }
});

document.getElementById("previous").addEventListener("click", () => {
  if (tracks.length) loadTrack((currentIndex - 1 + tracks.length) % tracks.length, true);
});

document.getElementById("next").addEventListener("click", () => {
  if (tracks.length) loadTrack((currentIndex + 1) % tracks.length, true);
});

audio.addEventListener("play", () => {
  playButton.textContent = "Ⅱ";
  renderPlaylist();
});
audio.addEventListener("pause", () => {
  playButton.textContent = "▶";
  renderPlaylist();
});
audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});
audio.addEventListener("timeupdate", () => {
  currentTime.textContent = formatTime(audio.currentTime);
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  }
});
audio.addEventListener("ended", () => {
  if (tracks.length) loadTrack((currentIndex + 1) % tracks.length, true);
});
audio.addEventListener("error", () => {
  if (audio.src) showToast("O navegador não conseguiu reproduzir esse arquivo.");
});

progress.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  }
});

document.getElementById("volume").addEventListener("input", event => {
  audio.volume = Number(event.target.value);
});
audio.volume = 0.8;

window.addEventListener("beforeunload", () => {
  tracks.forEach(track => URL.revokeObjectURL(track.url));
});
