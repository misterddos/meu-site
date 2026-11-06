(() => {
  const audio = document.getElementById("audio");
  if (!audio) return;

  let context = null;
  let analyser = null;
  let source = null;
  let data = null;
  let frame = 0;
  let hue = 180;
  let bassEnvelope = 0;
  let previousBass = 0;

  const clamp = (v, min = 0, max = 1) =>
    Math.max(min, Math.min(max, v));

  function setup() {
    try {
      if (!context) {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return false;

        context = new AudioContextClass();
        analyser = context.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.28;

        data = new Uint8Array(analyser.frequencyBinCount);

        source = context.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(context.destination);
      }

      return true;
    } catch (error) {
      console.warn("Lippy RGB:", error);
      return false;
    }
  }

  function animate() {
    if (!analyser || audio.paused || audio.ended) return;

    analyser.getByteFrequencyData(data);

    let bass = 0;
    let mids = 0;
    let highs = 0;

    for (let i = 2; i <= 8; i++) bass += data[i];
    for (let i = 9; i <= 45; i++) mids += data[i];
    for (let i = 46; i <= 150; i++) highs += data[i];

    bass = bass / (7 * 255);
    mids = mids / (37 * 255);
    highs = highs / (105 * 255);

    // Detecta variações nos graves
    const beat = Math.max(0, bass - previousBass);
    previousBass = bass;

    bassEnvelope = Math.max(
      bass * 1.15,
      bassEnvelope * 0.72
    );

    const flash = clamp(
      bassEnvelope * 1.5 + beat * 7.0
    );

    const power = clamp(
      0.12 + bass * 0.65 + mids * 0.55 + highs * 0.25,
      0.12,
      1
    );

    // Cores variam com a energia dos agudos
    hue = (hue + 1.8 + highs * 12) % 360;

    document.body.style.setProperty("--rgb-hue", hue.toFixed(0));
    document.body.style.setProperty("--rgb-power", power.toFixed(2));
    document.body.style.setProperty("--rgb-flash", flash.toFixed(2));
    document.body.style.setProperty("--rgb-bass", bass.toFixed(2));
    document.body.style.setProperty("--rgb-mids", mids.toFixed(2));
    document.body.style.setProperty("--rgb-highs", highs.toFixed(2));

    frame = requestAnimationFrame(animate);
  }

  function start() {
    if (!setup()) return;

    if (context.state === "suspended") {
      context.resume().catch(error =>
        console.warn("AudioContext:", error)
      );
    }

    cancelAnimationFrame(frame);
    document.body.classList.add("rgb-neon-active");
    animate();
  }

  function stop() {
    if (!audio.paused && !audio.ended) return;

    cancelAnimationFrame(frame);

    document.body.classList.remove("rgb-neon-active");

    ["--rgb-power", "--rgb-flash", "--rgb-bass",
     "--rgb-mids", "--rgb-highs"].forEach(property => {
      document.body.style.setProperty(property, "0");
    });

    bassEnvelope = 0;
    previousBass = 0;
  }

  audio.addEventListener("play", start);
  audio.addEventListener("pause", stop);
  audio.addEventListener("ended", stop);
  audio.addEventListener("error", stop);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
    } else if (!audio.paused && !audio.ended) {
      start();
    }
  });
})();
