/**
 * Multi-Modal Check-In Engine
 * Ported from Daily/app.js CheckInEngine to React-compatible module.
 *
 * Provides real:
 *   - MediaPipe FaceLandmarker → 7 emotion scores + arousal/valence
 *   - Web Audio AnalyserNode → jitter, shimmer, mean F0, energy
 *   - Oculomotor tracking → blink rate, gaze avoidance %
 *   - SpeechRecognition → live transcript
 */

// ─── Types ──────────────────────────────────────────────────────

export interface EmotionData {
  happy: number; sad: number; angry: number;
  fearful: number; disgusted: number; surprised: number; neutral: number;
  arousal: number; valence: number;
}

export interface VocalData {
  jitter: number; shimmer: number; meanF0: number; energy: number;
}

export interface OculomotorData {
  blinkRate: number; gazeAvoidancePct: number;
}

// ─── The Engine (singleton) ─────────────────────────────────────

class CheckInEngineClass {
  // Media
  mediaStream: MediaStream | null = null;
  audioContext: AudioContext | null = null;
  analyserNode: AnalyserNode | null = null;
  audioSource: MediaStreamAudioSourceNode | null = null;
  faceLandmarker: any = null;
  isMediaPipeReady = false;
  detectionRafId: number | null = null;
  audioRafId: number | null = null;
  bioUpdateInterval: ReturnType<typeof setInterval> | null = null;
  sampleInterval: ReturnType<typeof setInterval> | null = null;
  cameraReady = false;

  // Current live data
  emotions: EmotionData = { happy:0, sad:0, angry:0, fearful:0, disgusted:0, surprised:0, neutral:1, arousal:0, valence:0 };
  vocalData: VocalData = { jitter:0, shimmer:0, meanF0:0, energy:0 };
  oculomotorData: OculomotorData = { blinkRate:0, gazeAvoidancePct:0 };

  // Accumulation for averages
  emotionSamples: EmotionData[] = [];
  vocalSamples: VocalData[] = [];

  // Blink detection
  blinkTimestamps: number[] = [];
  wasBlinking = false;
  gazeFrameCount = 0;
  gazeAvertFrameCount = 0;

  // Vocal analysis history
  prevPitches: number[] = [];
  prevAmplitudes: number[] = [];

  // Speech
  recognition: any = null;
  isListening = false;
  transcript = '';

  // Callbacks for UI updates
  onEmotionUpdate?: (e: EmotionData) => void;
  onVocalUpdate?: (v: VocalData) => void;
  onOculomotorUpdate?: (o: OculomotorData) => void;
  onTranscriptUpdate?: (t: string) => void;

  // ─── Camera & Mic Init ───
  async initCamera(videoElement?: HTMLVideoElement | null): Promise<boolean> {
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: true,
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoElement) {
        videoElement.srcObject = this.mediaStream;
        videoElement.play().catch(() => {});
      }

      // Audio analysis setup
      this.audioContext = new AudioContext();
      this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.audioSource.connect(this.analyserNode);

      this.cameraReady = true;

      // Init MediaPipe
      this.initMediaPipe();

      return true;
    } catch (err) {
      console.warn('Media access denied:', err);
      return false;
    }
  }

  // ─── Audio-only Init (no camera) ───
  async initAudioOnly(): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.audioSource.connect(this.analyserNode);
      this.cameraReady = true;
      return true;
    } catch (err) {
      console.warn('Mic access denied:', err);
      return false;
    }
  }

  // ─── MediaPipe FaceLandmarker Init ───
  async initMediaPipe() {
    try {
      const vision = await import(
        /* @vite-ignore */
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs'
      );
      const { FaceLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      });

      this.isMediaPipeReady = true;
      console.log('✅ MediaPipe FaceLandmarker ready');
    } catch (err) {
      console.warn('MediaPipe init failed (non-critical):', err);
    }
  }

  // ─── Face Detection Loop ───
  startDetection(videoElement: HTMLVideoElement) {
    if (!this.faceLandmarker || !videoElement) return;

    let lastTimestamp = -1;

    const detect = () => {
      if (!this.faceLandmarker || !videoElement) return;

      if (videoElement.readyState >= 2 && videoElement.currentTime !== lastTimestamp) {
        lastTimestamp = videoElement.currentTime;
        try {
          const results = this.faceLandmarker.detectForVideo(videoElement, performance.now());
          if (results?.faceBlendshapes?.length > 0) {
            const bs = results.faceBlendshapes[0].categories;
            this.emotions = this.mapBlendshapesToEmotions(bs);
            this.updateOculomotor(bs);
            this.onEmotionUpdate?.(this.emotions);
            this.onOculomotorUpdate?.(this.oculomotorData);
          }
        } catch { /* skip frame */ }
      }

      this.detectionRafId = requestAnimationFrame(detect);
    };

    detect();
  }

  stopDetection() {
    if (this.detectionRafId) { cancelAnimationFrame(this.detectionRafId); this.detectionRafId = null; }
  }

  // ─── Blendshape → Emotion Mapping ───
  mapBlendshapesToEmotions(blendshapes: any[]): EmotionData {
    const bs: Record<string, number> = {};
    for (const b of blendshapes) bs[b.categoryName] = b.score;

    const happy = Math.min(1, (bs['mouthSmileLeft']||0)*0.5 + (bs['mouthSmileRight']||0)*0.5 + (bs['cheekSquintLeft']||0)*0.3 + (bs['cheekSquintRight']||0)*0.3);
    const sad = Math.min(1, (bs['mouthFrownLeft']||0)*0.5 + (bs['mouthFrownRight']||0)*0.5 + (bs['browInnerUp']||0)*0.4);
    const angry = Math.min(1, (bs['browDownLeft']||0)*0.5 + (bs['browDownRight']||0)*0.5 + (bs['mouthPressLeft']||0)*0.3 + (bs['mouthPressRight']||0)*0.3);
    const fearful = Math.min(1, (bs['browInnerUp']||0)*0.4 + (bs['browOuterUpLeft']||0)*0.3 + (bs['browOuterUpRight']||0)*0.3 + (bs['eyeWideLeft']||0)*0.3 + (bs['eyeWideRight']||0)*0.3);
    const disgusted = Math.min(1, (bs['noseSneerLeft']||0)*0.5 + (bs['noseSneerRight']||0)*0.5 + (bs['mouthShrugUpper']||0)*0.3);
    const surprised = Math.min(1, (bs['browOuterUpLeft']||0)*0.4 + (bs['browOuterUpRight']||0)*0.4 + (bs['jawOpen']||0)*0.4 + (bs['eyeWideLeft']||0)*0.2 + (bs['eyeWideRight']||0)*0.2);

    const total = happy + sad + angry + fearful + disgusted + surprised + 0.01;
    const neutral = Math.max(0, 1 - total);
    const sum = total + neutral;

    const emotions: EmotionData = {
      happy: happy/sum, sad: sad/sum, angry: angry/sum,
      fearful: fearful/sum, disgusted: disgusted/sum,
      surprised: surprised/sum, neutral: neutral/sum,
      arousal: 0, valence: 0,
    };

    emotions.valence = emotions.happy*0.8 + emotions.surprised*0.2 - emotions.sad*0.6 - emotions.angry*0.4 - emotions.fearful*0.3 - emotions.disgusted*0.5;
    emotions.arousal = emotions.angry*0.8 + emotions.fearful*0.7 + emotions.surprised*0.6 + emotions.happy*0.3 - emotions.sad*0.3 - emotions.neutral*0.5;
    emotions.valence = Math.max(-1, Math.min(1, emotions.valence));
    emotions.arousal = Math.max(-1, Math.min(1, emotions.arousal));

    return emotions;
  }

  // ─── Oculomotor Tracking ───
  updateOculomotor(blendshapes: any[]) {
    const bs: Record<string, number> = {};
    for (const b of blendshapes) bs[b.categoryName] = b.score;

    const avgBlink = ((bs['eyeBlinkLeft']||0) + (bs['eyeBlinkRight']||0)) / 2;
    const isBlinking = avgBlink > 0.4;
    if (isBlinking && !this.wasBlinking) this.blinkTimestamps.push(Date.now());
    this.wasBlinking = isBlinking;

    const now = Date.now();
    this.blinkTimestamps = this.blinkTimestamps.filter(t => t > now - 10000);
    const blinkRate = Math.round((this.blinkTimestamps.length / 10000) * 60000);

    const maxDev = Math.max(
      bs['eyeLookOutLeft']||0, bs['eyeLookOutRight']||0,
      bs['eyeLookInLeft']||0, bs['eyeLookInRight']||0,
      bs['eyeLookDownLeft']||0, bs['eyeLookDownRight']||0,
      bs['eyeLookUpLeft']||0, bs['eyeLookUpRight']||0
    );
    const isAverting = maxDev > 0.35;
    this.gazeFrameCount++;
    if (isAverting) this.gazeAvertFrameCount++;
    const gazeAvoidancePct = this.gazeFrameCount > 0 ? Math.round((this.gazeAvertFrameCount / this.gazeFrameCount) * 100) : 0;

    this.oculomotorData = { blinkRate, gazeAvoidancePct };
  }

  // ─── Audio Analysis (pitch autocorrelation → jitter/shimmer) ───
  startAudioAnalysis() {
    if (!this.analyserNode) return;

    const timeData = new Float32Array(this.analyserNode.fftSize);

    const loop = () => {
      if (!this.analyserNode) return;
      this.analyserNode.getFloatTimeDomainData(timeData);

      let sumSq = 0;
      for (let i = 0; i < timeData.length; i++) sumSq += timeData[i] * timeData[i];
      const energy = Math.sqrt(sumSq / timeData.length);

      const sampleRate = this.analyserNode.context.sampleRate;
      const pitch = this.autoCorrelate(timeData, sampleRate);

      if (pitch > 0) {
        this.prevPitches.push(pitch);
        this.prevAmplitudes.push(energy);
        if (this.prevPitches.length > 30) this.prevPitches.shift();
        if (this.prevAmplitudes.length > 30) this.prevAmplitudes.shift();
      }

      let jitter = 0;
      if (this.prevPitches.length > 2) {
        let diffs = 0;
        for (let i = 1; i < this.prevPitches.length; i++) diffs += Math.abs(this.prevPitches[i] - this.prevPitches[i-1]);
        const avgP = this.prevPitches.reduce((a,b) => a+b, 0) / this.prevPitches.length;
        jitter = avgP > 0 ? diffs / (this.prevPitches.length - 1) / avgP : 0;
      }

      let shimmer = 0;
      if (this.prevAmplitudes.length > 2) {
        let diffs = 0;
        for (let i = 1; i < this.prevAmplitudes.length; i++) diffs += Math.abs(this.prevAmplitudes[i] - this.prevAmplitudes[i-1]);
        const avgA = this.prevAmplitudes.reduce((a,b) => a+b, 0) / this.prevAmplitudes.length;
        shimmer = avgA > 0 ? diffs / (this.prevAmplitudes.length - 1) / avgA : 0;
      }

      const meanF0 = this.prevPitches.length > 0 ? this.prevPitches.reduce((a,b) => a+b, 0) / this.prevPitches.length : 0;
      this.vocalData = { jitter, shimmer, meanF0, energy };
      this.onVocalUpdate?.(this.vocalData);

      this.audioRafId = requestAnimationFrame(loop);
    };

    loop();
  }

  stopAudioAnalysis() {
    if (this.audioRafId) { cancelAnimationFrame(this.audioRafId); this.audioRafId = null; }
  }

  autoCorrelate(buf: Float32Array, sampleRate: number): number {
    let rms = 0;
    for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / buf.length);
    if (rms < 0.01) return -1;

    const SIZE = buf.length;
    const corr = new Float32Array(SIZE);
    for (let lag = 0; lag < SIZE; lag++) {
      let sum = 0;
      for (let i = 0; i < SIZE - lag; i++) sum += buf[i] * buf[i + lag];
      corr[lag] = sum;
    }

    let d = 0;
    while (d < SIZE && corr[d] > 0) d++;
    let maxVal = -1, maxPos = -1;
    for (let i = d; i < SIZE; i++) {
      if (corr[i] > maxVal) { maxVal = corr[i]; maxPos = i; }
    }
    return maxPos === -1 ? -1 : sampleRate / maxPos;
  }

  // ─── Speech Recognition ───
  initSpeechRecognition() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { console.warn('SpeechRecognition not supported'); return; }

    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      let finalT = '', interimT = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalT += event.results[i][0].transcript;
        else interimT += event.results[i][0].transcript;
      }
      if (finalT) this.transcript = (this.transcript + ' ' + finalT).trim();

      const display = interimT ? this.transcript + ' ' + interimT : this.transcript;
      this.onTranscriptUpdate?.(display);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        setTimeout(() => { if (this.isListening) try { this.recognition.start(); } catch {} }, 100);
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      this.isListening = false;
    };
  }

  startListening() {
    if (!this.recognition) this.initSpeechRecognition();
    if (!this.recognition || this.isListening) return;
    this.transcript = '';
    try { this.recognition.start(); this.isListening = true; } catch {}
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) try { this.recognition.stop(); } catch {}
  }

  // ─── Start All Real-Time Processing ───
  startProcessing(videoElement?: HTMLVideoElement | null) {
    if (this.isMediaPipeReady && videoElement) this.startDetection(videoElement);
    this.startAudioAnalysis();
    this.startListening();

    // Periodic sampling for averages
    this.sampleInterval = setInterval(() => {
      this.emotionSamples.push({...this.emotions});
      this.vocalSamples.push({...this.vocalData});
    }, 1000);
  }

  // ─── Stop All Processing ───
  stopProcessing() {
    this.stopDetection();
    this.stopAudioAnalysis();
    this.stopListening();
    if (this.sampleInterval) { clearInterval(this.sampleInterval); this.sampleInterval = null; }
  }

  // ─── Get Averaged Data for Backend ───
  getAveragedData() {
    const avgEmo = this.emotionSamples.length > 0
      ? (Object.keys(this.emotions) as (keyof EmotionData)[]).reduce((acc, key) => {
          acc[key] = +(this.emotionSamples.reduce((s, e) => s + (e[key]||0), 0) / this.emotionSamples.length).toFixed(3);
          return acc;
        }, {} as Record<string, number>)
      : {...this.emotions};

    const avgVoc = this.vocalSamples.length > 0
      ? {
          jitter: +(this.vocalSamples.reduce((s,v) => s+v.jitter, 0) / this.vocalSamples.length).toFixed(4),
          shimmer: +(this.vocalSamples.reduce((s,v) => s+v.shimmer, 0) / this.vocalSamples.length).toFixed(4),
          meanF0: +(this.vocalSamples.reduce((s,v) => s+v.meanF0, 0) / this.vocalSamples.length).toFixed(1),
          energy: +(this.vocalSamples.reduce((s,v) => s+v.energy, 0) / this.vocalSamples.length).toFixed(4),
        }
      : {...this.vocalData};

    return {
      emotions: avgEmo,
      vocals: avgVoc,
      oculomotor: {...this.oculomotorData},
      transcript: this.transcript,
    };
  }

  // ─── Full Cleanup ───
  cleanup() {
    this.stopProcessing();
    if (this.faceLandmarker) { try { this.faceLandmarker.close(); } catch {} this.faceLandmarker = null; }
    if (this.audioContext) { try { this.audioContext.close(); } catch {} this.audioContext = null; }
    if (this.mediaStream) { this.mediaStream.getTracks().forEach(t => t.stop()); this.mediaStream = null; }

    // Reset everything
    this.emotions = { happy:0, sad:0, angry:0, fearful:0, disgusted:0, surprised:0, neutral:1, arousal:0, valence:0 };
    this.vocalData = { jitter:0, shimmer:0, meanF0:0, energy:0 };
    this.oculomotorData = { blinkRate:0, gazeAvoidancePct:0 };
    this.transcript = '';
    this.emotionSamples = [];
    this.vocalSamples = [];
    this.prevPitches = [];
    this.prevAmplitudes = [];
    this.blinkTimestamps = [];
    this.wasBlinking = false;
    this.gazeFrameCount = 0;
    this.gazeAvertFrameCount = 0;
    this.isMediaPipeReady = false;
    this.cameraReady = false;
    this.analyserNode = null;
    this.audioSource = null;
  }
}

// Singleton
export const checkInEngine = new CheckInEngineClass();
