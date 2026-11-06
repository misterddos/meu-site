(() => {
  const audio = document.getElementById("audio");
  const video = document.getElementById("video");
  if (!audio || !video) return;

  let context = null;
  let analyser = null;
  let frame = 0;
  let sources = new WeakMap();
  let data = null;
  let hue = 180;

  function setup(media) {
    try {
      if (!context) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return false;
        context = new AudioContextClass();
        analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.78;
        data = new Uint8Array(analyser.frequencyBinCount);
        analyser.connect(context.destination);
      }

      if (!sources.has(media)) {
        const source = context.createMediaElementSource(media);
        source.connect(analyser);
        sources.set(media, source);
      }
      return true;
    } catch (error) {
      console.warn("RGB neon: análise de áudio indisponível.", error);
      return false;
    }
  }

  function animate() {
    if (!analyser) return;

    analyser.getByteFrequencyData(data);

    let total = 0;
    for (let i = 0; i < data.length; i++) total += data[i];

    const average = total / data.length / 255;
    const bass = data.slice(0, 12).reduce((a, b) => a + b, 0) / (12 * 255);
    const power = Math.min(1, Math.max(.12, average * 2.2 + bass * .7));

    hue = (hue + 0.7 + bass * 2.5) % 360;

    document.body.style.setProperty("--rgb-hue", hue.toFixed(0));
    document.body.style.setProperty("--rgb-power", power.toFixed(2));

    frame = requestAnimationFrame(animate);
  }

  function start(media) {
    if (!setup(media)) return;

    if (context.state === "suspended") context.resume().catch(() => {});

    cancelAnimationFrame(frame);
    document.body.classList.add("rgb-neon-active");
    animate();
  }

  function stop() {
    const playing = !audio.paused && !audio.ended;

    if (!playing) {
      cancelAnimationFrame(frame);
      document.body.classList.remove("rgb-neon-active");
      document.body.style.setProperty("--rgb-power", "0");
    }
  }

  audio.addEventListener("play", () => start(audio));
  audio.addEventListener("pause", stop);
  audio.addEventListener("ended", stop);
  audio.addEventListener("error", stop);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
    } else {
      const playing = !audio.paused && !audio.ended ? audio : null;
      if (playing) start(playing);
    }
  });
})();
