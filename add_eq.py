with open("script.js", "r", encoding="utf-8") as f:
    content = f.read()

if "AudioContext" in content:
    print("Já existe código de AudioContext no arquivo, nada foi alterado.")
else:
    audio_graph = '''
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

'''

    marker1 = "let toastTimer;"
    if marker1 not in content:
        print("ERRO: marcador 1 nao encontrado.")
    else:
        content = content.replace(marker1, marker1 + "\n" + audio_graph, 1)

    marker2 = 'const mediaType = document.getElementById("mediaType");'
    chains_decl = marker2 + "\n\nlet audioChain;\nlet videoChain;\n"
    content = content.replace(marker2, chains_decl, 1)

    build_call = '''
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
'''

    marker3 = 'document.getElementById("year").textContent = new Date().getFullYear();'
    if marker3 not in content:
        print("ERRO: marcador 3 nao encontrado.")
    else:
        content = content.replace(marker3, marker3 + "\n" + build_call, 1)

    with open("script.js", "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: equalizador e limiter integrados ao script.js.")
