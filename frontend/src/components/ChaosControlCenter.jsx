import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Share2, RotateCcw, PhoneCall, PhoneOff, Sparkles } from 'lucide-react';
import * as Tone from 'tone';
import { startSession, logEvent } from '../api.js';

/* ---------------------------------------------------------------
   DATA
--------------------------------------------------------------- */

const STAGES = [
  'welcome', 'diagnostics', 'codingTest', 'wwe', 'colorTest', 'gaslight',
  'finalAnalysis', 'finalDonkey', 'finalBoss', 'finalReport',
  'ending',
];

const MUSIC_OPTIONS = [
  { key: 'drama', label: '🎻 Overdramatic orchestra' },
  { key: 'shaadi', label: '🎉 Grand entrance' },
  { key: 'fia', label: '🚨 Investigation unit' },
  { key: 'existential', label: '😔 2AM existential crisis' },
  { key: 'dj', label: '🕺 DJ grabbed the mic' },
  { key: 'chai', label: '☕ Coffee and heartbreak' },
  { key: 'exam', label: '📚 Exam night panic' },
  { key: 'blackout', label: '👻 Power cut' },
];

const STYLE_NOTES = {
  drama: [{ n: ['C3', 'Eb3', 'G3'], t: 0, d: '2n' }, { n: ['Bb2', 'D3', 'F3'], t: 0.6, d: '2n' }, { n: ['C3', 'Eb3', 'G3'], t: 1.2, d: '1n' }],
  shaadi: [{ n: 'C4', t: 0, d: '16n' }, { n: 'D4', t: 0.12, d: '16n' }, { n: 'E4', t: 0.24, d: '16n' }, { n: 'G4', t: 0.36, d: '16n' }, { n: 'C5', t: 0.48, d: '8n' }],
  fia: [{ n: ['C3', 'F#3'], t: 0, d: '2n' }, { n: ['C3', 'F#3'], t: 0.8, d: '2n' }, { n: ['C3', 'F#3'], t: 1.6, d: '1n' }],
  existential: [{ n: 'A2', t: 0, d: '1n' }, { n: 'A2', t: 1.2, d: '1n' }],
  dj: [{ n: 'C4', t: 0, d: '8n' }, { n: 'E4', t: 0.15, d: '8n' }, { n: 'G4', t: 0.3, d: '8n' }, { n: 'C5', t: 0.45, d: '8n' }, { n: 'E5', t: 0.6, d: '8n' }],
  chai: [{ n: ['A3', 'C4', 'E4'], t: 0, d: '2n' }, { n: ['F3', 'A3', 'C4'], t: 0.7, d: '2n' }],
  exam: [{ n: 'C4', t: 0, d: '16n' }, { n: 'C4', t: 0.1, d: '16n' }, { n: 'C4', t: 0.2, d: '16n' }, { n: 'C4', t: 0.3, d: '16n' }, { n: 'E4', t: 0.4, d: '8n' }],
  blackout: [{ n: 'C4', t: 0, d: '8n' }, { n: 'A3', t: 0.15, d: '8n' }, { n: 'F3', t: 0.3, d: '8n' }, { n: 'C3', t: 0.45, d: '4n' }],
};

const MEME_ACCENTS = ['#c89b3c', '#a63a2e', '#2e6f64', '#8a3f78'];

const CRICKET_LINES = [
  'AND HE SWINGS… AND MISSES! What a shot that wasn’t.',
  'Caught behind! No review available. Decision stands.',
  'That’s a maiden over of poor decisions, ladies and gentlemen.',
  'Umpire’s finger goes up. So does everyone’s eyebrows.',
  'Direct hit! Run out by his own free time.',
  'SIX! Straight into the stands of regret.',
  'New over. Same batsman, same bad decisions.',
  'Full toss, and he still finds a way to miss it.',
];

const RAGE_LINE = 'OUT! Given for excessive appeal to the umpire. Early bath for the rage-clicker.';

const BADGES = [
  { id: 'duck', emoji: '🏏', label: 'Out for a Duck', hint: 'triggered a rage-click' },
  { id: 'rage_legend', emoji: '⚡', label: 'Certified Rage Legend', hint: '3+ rage-click bursts' },
  { id: 'chaos_regular', emoji: '🔥', label: 'Chaos Regular', hint: '3+ replays in one session' },
  { id: 'case_closed', emoji: '📁', label: 'Case Closed', hint: 'reached the ending' },
  { id: 'went_the_distance', emoji: '🥊', label: 'Went the Distance', hint: 'survived the finisher' },
  { id: 'under_surveillance', emoji: '🫏', label: 'Under Surveillance', hint: 'spotted by all three donkeys' },
];

const DIAG_STATS = [
  ['Common Sense', 27],
  ['Confidence', 94],
  ['Patience', 11],
  ['Curiosity', 99],
  ['Impulse Control', 3],
];

const CODING_OPTIONS = [
  { key: 'a', label: '10' },
  { key: 'b', label: '11' },
  { key: 'c', label: 'I use Python' },
  { key: 'd', label: 'I copy code from Stack Overflow' },
];

const GITHUB_ISSUES = [
  '47 bugs',
  '12 unfinished projects',
  '3 README files',
  '0 documentation',
  '"final_final_REAL.cpp"',
];

const WWE_HESITATION_LINES = [
  'HE’S HESITATING!',
  'WHAT IS HE DOING?!',
  'HE’S GOING FOR THE BUTTON!',
  'THE CROWD IS ON THE EDGE OF THEIR SEATS!',
  'OH THIS IS UNBEARABLE TO WATCH!',
];

const WWE_ACTION_RESULTS = {
  fight: { line: 'BAD IDEA.', detail: '💥 CRITICAL HIT. -25 IQ.' },
  run: { line: '🏃 ESCAPE ATTEMPT DETECTED.', detail: 'escape_user.exe\n\nERROR:\nThere is nowhere to run.\n\nNice try.' },
  call: { line: 'Searching contacts…', detail: 'Searching…\nSearching…\n\n0 results found.\n\nWe apologize for the inconvenience.' },
};

const FINAL_STATS = [
  ['Critical Thinking', 31],
  ['Rage', 100],
  ['Curiosity', 100],
  ['Common Sense', 19],
  ['Ability to Leave', 0],
];

const DONKEY_POPUPS = {
  herd: {
    img: '/donkeys/donkey-community.jpeg',
    title: '🫏 WE ARE WATCHING YOU.',
    sub: 'Don’t look behind you.',
    followUp: 'They were getting comfortable.',
  },
  lipstick: {
    img: '/donkeys/lipstick-donkey.jpeg',
    title: '🫏 UPDATE.',
    sub: 'We have informed the donkeys. They have opinions about your recent decisions.',
    followUp: 'Donkey #3 is disappointed.',
  },
  heart: {
    img: '/donkeys/donkey-1.jpeg',
    title: '🫏 STILL WATCHING.',
    sub: 'The donkeys have reviewed your color choice.',
    followUp: 'Consensus: mixed.',
  },
};

const FINAL_DONKEY_IMG = '/donkeys/donkey-3.jpeg';

/* ---------------------------------------------------------------
   HELPERS
--------------------------------------------------------------- */

function fmtTime(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function pickCricketLine() {
  return CRICKET_LINES[Math.floor(Math.random() * CRICKET_LINES.length)];
}

function SafeImage({ src, alt = '', className, style, fallbackSize = 96, fallbackEmoji = '🫏' }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={className}
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fallbackSize, background: 'var(--paper-2)' }}
      >
        {fallbackEmoji}
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} style={style} onError={() => setFailed(true)} />;
}

function DonkeyImage(props) {
  return <SafeImage fallbackEmoji="🫏" {...props} />;
}

/* ---------------------------------------------------------------
   COMPONENT
--------------------------------------------------------------- */

export default function ChaosControlCenter() {
  const [stageIdx, setStageIdx] = useState(0);
  const stage = STAGES[stageIdx];

  const [welcomeStep, setWelcomeStep] = useState(0);

  const [soundOn, setSoundOn] = useState(true);
  const [musicChoice, setMusicChoice] = useState('drama');
  const [caseNumber] = useState(() => String(Math.floor(10000 + Math.random() * 89999)));
  const [dodge, setDodge] = useState({ x: 0, y: 0, count: 0 });
  const [toast, setToast] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [replays, setReplays] = useState(0);

  const [sessionId, setSessionId] = useState(null);

  const [rageClicks, setRageClicks] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [reachedEnding, setReachedEnding] = useState(false);
  const [commentary, setCommentary] = useState(null);

  const [marqueeText, setMarqueeText] = useState('★ WELCOME ★');
  const [donkeyPopup, setDonkeyPopup] = useState(null);
  const [donkeysShown, setDonkeysShown] = useState([]);

  const [diagStep, setDiagStep] = useState(0);
  const [codingAnswer, setCodingAnswer] = useState(null);

  const [wweStep, setWweStep] = useState(0); // 0 intro/pick, 1 reaction shown
  const [wweAction, setWweAction] = useState(null);
  const [shaking, setShaking] = useState(false);

  const [colorChoice, setColorChoice] = useState(null);
  const [colorStep, setColorStep] = useState(0);

  const [gaslightStep, setGaslightStep] = useState(0);
  const [donkeyTextShown, setDonkeyTextShown] = useState(false);
  const [bossStep, setBossStep] = useState(0);
  const [finalReportStep, setFinalReportStep] = useState(0);
  const [closeAttempted, setCloseAttempted] = useState(false);

  const startTimeRef = useRef(Date.now());
  const synthsRef = useRef(null);
  const audioReadyRef = useRef(false);
  const toastTimer = useRef(null);
  const commentaryTimer = useRef(null);
  const clickTimesRef = useRef([]);
  const rageCooldownRef = useRef(false);
  const entranceAudioRef = useRef(null);

  const fireToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const fireCommentary = (msg, tag = '🏏 LIVE') => {
    clearTimeout(commentaryTimer.current);
    setCommentary({ msg, tag });
    commentaryTimer.current = setTimeout(() => setCommentary(null), 2800);
  };

  const unlockBadge = useCallback((id, label) => {
    setUnlockedBadges((prev) => {
      if (prev.includes(id)) return prev;
      fireToast(`🏆 Achievement unlocked: ${label}`);
      logEvent(sessionId, 'badge_unlocked', { metadata: { badge: id } });
      return [...prev, id];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    startSession().then((id) => {
      if (!cancelled) setSessionId(id);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    logEvent(sessionId, 'stage_view', { metadata: { stage } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, sessionId]);

  /* rage-click detector: 4+ clicks anywhere within 1.2s = one "burst" */
  useEffect(() => {
    const onClick = () => {
      const now = Date.now();
      const recent = [...clickTimesRef.current, now].filter((t) => now - t < 1200);
      clickTimesRef.current = recent;
      if (recent.length >= 4 && !rageCooldownRef.current) {
        rageCooldownRef.current = true;
        const burstSize = recent.length;
        clickTimesRef.current = [];
        fireCommentary(RAGE_LINE);
        logEvent(sessionId, 'rage_click', { metadata: { burst_size: burstSize } });
        setRageClicks((n) => {
          const next = n + 1;
          if (next === 1) unlockBadge('duck', 'Out for a Duck');
          if (next >= 3) unlockBadge('rage_legend', 'Certified Rage Legend');
          return next;
        });
        setTimeout(() => { rageCooldownRef.current = false; }, 2000);
      }
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, unlockBadge]);

  const ensureAudio = useCallback(async () => {
    if (!audioReadyRef.current) {
      await Tone.start();
      synthsRef.current = {
        pad: new Tone.PolySynth(Tone.Synth).toDestination(),
        pluck: new Tone.PluckSynth().toDestination(),
        blip: new Tone.Synth().toDestination(),
        bass: new Tone.MembraneSynth().toDestination(),
      };
      synthsRef.current.pad.set({ volume: -8 });
      synthsRef.current.pluck.volume.value = -6;
      synthsRef.current.blip.volume.value = -10;
      synthsRef.current.bass.volume.value = -4;
      audioReadyRef.current = true;
    }
  }, []);

  const playClick = useCallback(async () => {
    if (!soundOn) return;
    await ensureAudio();
    synthsRef.current.blip.triggerAttackRelease('C5', '32n');
  }, [soundOn, ensureAudio]);

  const playSting = useCallback(async () => {
    if (!soundOn) return;
    await ensureAudio();
    const s = synthsRef.current;
    const now = Tone.now();
    const notes = STYLE_NOTES[musicChoice] || STYLE_NOTES.drama;
    notes.forEach(({ n, t, d }) => {
      const target = Array.isArray(n) ? s.pad : s.pluck;
      target.triggerAttackRelease(n, d, now + t);
    });
    if (musicChoice === 'blackout') {
      Tone.Destination.volume.rampTo(-40, 0.6);
      setTimeout(() => Tone.Destination.volume.rampTo(0, 0.3), 1800);
      fireToast('🕯️ bijli chali gayi. audio will return shortly.');
    }
  }, [soundOn, musicChoice, ensureAudio]);

  const playBell = useCallback(async () => {
    if (!soundOn) return;
    await ensureAudio();
    const s = synthsRef.current;
    const now = Tone.now();
    [0, 0.18, 0.36].forEach((t) => s.blip.triggerAttackRelease('A5', '16n', now + t));
  }, [soundOn, ensureAudio]);

  const playFanfare = useCallback(async () => {
    if (!soundOn) return;
    await ensureAudio();
    const s = synthsRef.current;
    const now = Tone.now();
    // rising run building tension...
    ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => s.pluck.triggerAttackRelease(n, '16n', now + i * 0.08));
    // ...then the landing: bass hit + full chord stab
    s.bass.triggerAttackRelease('C2', '8n', now + 0.4);
    s.pad.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '2n', now + 0.4);
  }, [soundOn, ensureAudio]);

  /* Optional custom entrance audio: if you have a properly-licensed hype
     track, drop it at frontend/public/audio/entrance.mp3 and it plays
     automatically here instead. No file there (the default) -> falls
     straight back to the original synthesized bell + fanfare above.
     This intentionally never ships with any real commercial track. */
  const playEntrance = useCallback(async () => {
    if (!soundOn) return;
    const audio = entranceAudioRef.current;
    if (audio) {
      try {
        audio.currentTime = 0;
        await audio.play();
        return;
      } catch {
        // no custom file present, or the browser blocked it - fall through
      }
    }
    await playBell();
    setTimeout(() => playFanfare(), 250);
  }, [soundOn, playBell, playFanfare]);

  const playCritical = useCallback(async () => {
    if (!soundOn) return;
    await ensureAudio();
    synthsRef.current.blip.triggerAttackRelease('C2', '8n');
  }, [soundOn, ensureAudio]);

  const next = async () => {
    await playClick();
    setStageIdx((i) => Math.min(i + 1, STAGES.length - 1));
  };

  const dodgeButton = (e) => {
    if (dodge.count >= 2) return;
    const el = e.currentTarget.parentElement;
    const maxX = Math.max(0, (el?.clientWidth || 200) - 200);
    const nx = Math.random() * maxX - maxX / 2;
    const ny = (Math.random() - 0.5) * 30;
    fireCommentary(pickCricketLine());
    setDodge((d) => ({ x: nx, y: ny, count: d.count + 1 }));
  };

  /* diagnostics: reveal the stat bars, then pop up the first donkey a beat
     later. No "already played" guard here on purpose - React 18 StrictMode
     runs this effect twice in dev (mount, cleanup, mount again), and a
     guard that survives the cleanup would make that second, lasting mount
     skip scheduling entirely. The cleanup below already correctly cancels
     the throwaway first run's timers. */
  useEffect(() => {
    if (stage !== 'diagnostics') return undefined;
    setDiagStep(0);
    const t1 = setTimeout(() => setDiagStep(1), 1300);
    const t2 = setTimeout(() => setDiagStep(2), 2400);
    const t3 = setTimeout(() => {
      setDonkeysShown((prev) => {
        if (prev.includes('herd')) return prev;
        setDonkeyPopup(DONKEY_POPUPS.herd);
        logEvent(sessionId, 'donkey_popup', { metadata: { which: 'herd' } });
        return [...prev, 'herd'];
      });
    }, 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  /* WWE: custom entrance audio if present, else bell + original fanfare,
     plus a quick screen shake on entry. Donkeys weigh in with an "update"
     a few seconds later. */
  useEffect(() => {
    if (stage !== 'wwe') return undefined;
    setShaking(true);
    const entranceTimer = setTimeout(() => playEntrance(), 0);
    const shakeTimer = setTimeout(() => setShaking(false), 500);
    const donkeyTimer = setTimeout(() => {
      setDonkeysShown((prev) => {
        if (prev.includes('lipstick')) return prev;
        setDonkeyPopup(DONKEY_POPUPS.lipstick);
        logEvent(sessionId, 'donkey_popup', { metadata: { which: 'lipstick' } });
        return [...prev, 'lipstick'];
      });
    }, 3200);
    return () => { clearTimeout(entranceTimer); clearTimeout(shakeTimer); clearTimeout(donkeyTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  /* WWE commentator reacts to mouse movement while the user is still deciding */
  useEffect(() => {
    if (stage !== 'wwe' || wweStep !== 0) return undefined;
    let lastFired = 0;
    const onMove = () => {
      const now = Date.now();
      if (now - lastFired < 2200) return;
      lastFired = now;
      if (Math.random() < 0.35) {
        const line = WWE_HESITATION_LINES[Math.floor(Math.random() * WWE_HESITATION_LINES.length)];
        fireCommentary(line, '🔔 LIVE');
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, wweStep]);

  /* colorTest: one more donkey cameo, opinions on the color choice */
  useEffect(() => {
    if (stage !== 'colorTest') return undefined;
    const t = setTimeout(() => {
      setDonkeysShown((prev) => {
        if (prev.includes('heart')) return prev;
        setDonkeyPopup(DONKEY_POPUPS.heart);
        logEvent(sessionId, 'donkey_popup', { metadata: { which: 'heart' } });
        const next = [...prev, 'heart'];
        if (['herd', 'lipstick', 'heart'].every((k) => next.includes(k))) {
          unlockBadge('under_surveillance', 'Under Surveillance');
        }
        return next;
      });
    }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  /* gaslight: reality quietly changes - the marquee at the very top swaps
     permanently, which is the one thing visible across every screen */
  useEffect(() => {
    if (stage !== 'gaslight') return;
    const t = setTimeout(() => setMarqueeText('★ WELCOME BACK ★'), 1600);
    return () => clearTimeout(t);
  }, [stage]);

  /* finalDonkey: image first, text after a beat of silence */
  useEffect(() => {
    if (stage !== 'finalDonkey') return undefined;
    setDonkeyTextShown(false);
    const t = setTimeout(() => setDonkeyTextShown(true), 2000);
    return () => clearTimeout(t);
  }, [stage]);

  /* finalBoss: the rematch bell + shake on entry */
  useEffect(() => {
    if (stage !== 'finalBoss') return undefined;
    setBossStep(0);
    setShaking(true);
    const bellTimer = setTimeout(() => playBell(), 0);
    const t = setTimeout(() => setShaking(false), 500);
    return () => { clearTimeout(bellTimer); clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    if (stage === 'ending') {
      playSting();
      if (!reachedEnding) {
        setReachedEnding(true);
        unlockBadge('case_closed', 'Case Closed');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const doItAgain = async () => {
    await playClick();
    logEvent(sessionId, 'replay_click', { music_choice: musicChoice });
    fireCommentary(pickCricketLine());
    setReplays((r) => {
      const next = r + 1;
      if (next >= 3) unlockBadge('chaos_regular', 'Chaos Regular');
      return next;
    });
    setStageIdx(0);
    setWelcomeStep(0);
    setDodge({ x: 0, y: 0, count: 0 });
    setDiagStep(0); setCodingAnswer(null);
    setWweStep(0); setWweAction(null); setShaking(false);
    setColorChoice(null); setColorStep(0);
    setGaslightStep(0);
    setDonkeyTextShown(false); setBossStep(0);
    setFinalReportStep(0); setCloseAttempted(false);
    setMarqueeText('★ WELCOME ★');
    setDonkeysShown([]); setDonkeyPopup(null);
  };

  const shareChaos = async () => {
    await playClick();
    logEvent(sessionId, 'share_click', { experience_key: colorChoice || '', music_choice: musicChoice });
    fireCommentary('SIX! Over the ropes and straight into the group chat.');
    const elapsed = fmtTime(Date.now() - startTimeRef.current);
    const text = `Case No. ${caseNumber}: chose ${colorChoice || 'no color'} on the color test, fought the website via "${wweAction || 'unknown'}", and wasted ${elapsed}.`;
    try {
      await navigator.clipboard.writeText(text);
      fireToast('copied to clipboard. send it. ruin someone else’s day.');
    } catch {
      fireToast('copy blocked by the browser. the chaos stays local.');
    }
  };

  const dismissDonkey = () => {
    const followUp = donkeyPopup?.followUp;
    setDonkeyPopup(null);
    fireToast('Why did you close it?');
    if (followUp) setTimeout(() => fireToast(followUp), 1500);
  };

  return (
    <div className="cc-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Baloo+2:wght@500;700&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');

        .cc-root {
          --maroon: #2b0f12;
          --maroon-2: #4a171b;
          --gold: #c89b3c;
          --gold-soft: #e0c273;
          --paper: #f4ead2;
          --paper-2: #ead9ae;
          --ink: #241512;
          --stamp: #a63a2e;
          --teal: #2e6f64;
          --pink: #8a3f78;
          --font-display: 'Alfa Slab One', 'Arial Black', Impact, sans-serif;
          --font-fun: 'Baloo 2', 'Arial Rounded MT Bold', sans-serif;
          --font-mono: 'Space Mono', 'Courier New', monospace;
          --font-body: 'Inter', system-ui, sans-serif;

          position: relative;
          min-height: 680px;
          width: 100%;
          background: radial-gradient(1100px 500px at 30% -10%, var(--maroon-2), transparent 55%), var(--maroon);
          color: var(--paper);
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 14px;
          box-sizing: border-box;
          overflow: hidden;
          transition: filter 0.6s ease;
        }
        .cc-root.cc-quiet { filter: saturate(0.5) brightness(0.85); }
        .cc-root * { box-sizing: border-box; }

        .cc-commentary {
          position: absolute;
          top: 12px; left: 50%;
          transform: translateX(-50%);
          width: min(92%, 480px);
          background: #0e2b1c;
          color: #eafaf0;
          border: 1px solid #2e6f45;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 11.5px;
          line-height: 1.4;
          padding: 9px 14px 9px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 26;
          box-shadow: 0 10px 24px rgba(0,0,0,0.4);
          animation: ccSlideDown 0.25s ease both;
        }
        .cc-commentary-tag {
          background: #a63a2e;
          color: #fbe9e5;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 2px 6px;
          border-radius: 3px;
          white-space: nowrap;
        }
        @keyframes ccSlideDown { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }

        .cc-mute {
          position: absolute; top: 14px; right: 14px;
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(244,234,210,0.12);
          border: 1px solid rgba(244,234,210,0.25);
          color: var(--paper);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 25;
        }

        .cc-shell { width: 100%; max-width: 540px; position: relative; }

        .cc-frame {
          border: 9px solid transparent;
          border-image: repeating-linear-gradient(45deg, var(--gold) 0 8px, var(--maroon-2) 8px 16px) 9;
          border-radius: 4px;
        }

        .cc-card {
          background: var(--paper);
          color: var(--ink);
          padding: 30px 26px 26px;
          box-shadow: 0 30px 60px -18px rgba(0,0,0,0.6);
          position: relative;
        }

        .cc-marquee {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-align: center;
          color: var(--gold-soft);
          margin-bottom: 8px;
          animation: ccBlink 2s steps(1) infinite;
        }
        @keyframes ccBlink { 0%, 55% { opacity: 1; } 56%, 100% { opacity: 0.45; } }

        .cc-case-row {
          display: flex; justify-content: space-between;
          font-family: var(--font-mono); font-size: 10.5px;
          color: #5a4a2f; border-bottom: 1px dashed rgba(36,21,18,0.25);
          padding-bottom: 8px; margin-bottom: 16px; letter-spacing: 0.03em;
        }

        .cc-title {
          font-family: var(--font-display);
          font-size: clamp(22px, 5vw, 30px);
          line-height: 1.1;
          margin: 0 0 10px;
        }
        .cc-title-fun {
          font-family: var(--font-fun);
          font-weight: 700;
          font-size: clamp(20px, 4.6vw, 26px);
          margin: 0 0 10px;
          color: var(--maroon-2);
        }

        .cc-body { font-size: 14.5px; line-height: 1.6; color: #3a332c; margin: 0 0 18px; }

        .cc-btn {
          font-family: var(--font-mono); font-weight: 700; font-size: 12.5px;
          letter-spacing: 0.06em; text-transform: uppercase;
          border: none; border-radius: 3px; padding: 13px 18px; cursor: pointer;
          transition: transform 0.12s ease;
        }
        .cc-btn:active { transform: translateY(1px); }
        .cc-btn:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }
        .cc-btn-primary { background: var(--stamp); color: #fbe9e5; box-shadow: 0 4px 0 #7a291f; width: 100%; }
        .cc-btn-teal { background: var(--teal); color: #e9f5f2; box-shadow: 0 4px 0 #1f4d45; }
        .cc-btn-gold { background: var(--gold); color: #3a2a08; box-shadow: 0 4px 0 #8f6f2c; }
        .cc-btn-ghost { background: transparent; color: #5a4a2f; border: 1.5px dashed rgba(90,74,47,0.4); font-size: 10.5px; }
        .cc-btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .cc-btn-row .cc-btn { flex: 1; min-width: 120px; }

        .cc-dodge-wrap { position: relative; height: 66px; }
        .cc-dodge-btn {
          position: absolute; left: 50%;
          transform: translate(calc(-50% + var(--dx,0px)), var(--dy,0px));
          transition: transform 0.28s cubic-bezier(.34,1.56,.64,1);
          width: min(320px, 100%);
        }
        .cc-hint { font-size: 10.5px; color: #8f6f2c; text-align: center; margin-top: 8px; font-family: var(--font-mono); }

        .cc-controls { display: flex; gap: 10px; margin-top: 18px; padding-top: 14px; border-top: 1px dashed rgba(36,21,18,0.2); }
        .cc-select { font-family: var(--font-mono); font-size: 10.5px; background: var(--paper-2); border: 1px solid rgba(36,21,18,0.2); border-radius: 3px; padding: 7px; color: var(--ink); flex: 1; }

        .cc-check-line { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 12.5px; padding: 6px 0; border-bottom: 1px dotted rgba(36,21,18,0.15); }
        .cc-check-danger { color: var(--stamp); font-weight: 700; }

        .cc-chat-bubble { max-width: 78%; padding: 8px 12px; border-radius: 12px; font-size: 13.5px; margin: 5px 0; }
        .cc-chat-friend { background: var(--paper-2); align-self: flex-start; border-bottom-left-radius: 3px; }
        .cc-chat-you { background: var(--teal); color: #eafaf6; align-self: flex-end; border-bottom-right-radius: 3px; margin-left: auto; }
        .cc-chat-col { display: flex; flex-direction: column; min-height: 160px; }

        .cc-bar-row { margin-bottom: 10px; }
        .cc-bar-label { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; margin-bottom: 4px; }
        .cc-bar-track { height: 8px; background: rgba(36,21,18,0.12); border-radius: 4px; overflow: hidden; }
        .cc-bar-fill { height: 100%; background: var(--stamp); border-radius: 4px; transition: width 1.1s ease; }

        .cc-stamp-wrap { display: flex; justify-content: center; margin-bottom: 6px; }
        .cc-stamp {
          width: 96px; height: 96px; border-radius: 50%; border: 4px double var(--stamp);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono); font-weight: 700; font-size: 11px; letter-spacing: 0.05em;
          color: var(--stamp); text-transform: uppercase; text-align: center;
          transform: rotate(-8deg); animation: ccStamp 0.55s cubic-bezier(.2,1.4,.4,1) both;
        }
        @keyframes ccStamp { 0% { transform: scale(3) rotate(-40deg); opacity: 0; } 60% { transform: scale(0.92) rotate(-6deg); opacity: 1; } 100% { transform: scale(1) rotate(-8deg); } }

        .cc-meme {
          border-radius: 6px;
          padding: 16px 12px;
          text-align: center;
          margin: 14px 0;
          background: color-mix(in srgb, var(--meme-accent) 14%, var(--paper));
          border: 2px solid var(--meme-accent);
        }
        .cc-meme-label { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--meme-accent); margin-bottom: 6px; }
        .cc-meme-top, .cc-meme-bottom {
          font-family: var(--font-display); font-size: 16px; text-transform: uppercase;
          letter-spacing: 0.01em; color: var(--ink); line-height: 1.2;
        }
        .cc-meme-emoji { font-size: 40px; margin: 8px 0; }

        .cc-phone-call {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--maroon); color: var(--paper);
          border-radius: 8px; padding: 14px 16px; margin: 12px 0;
        }
        .cc-phone-icon { width: 40px; height: 40px; border-radius: 50%; background: var(--teal); display: flex; align-items: center; justify-content: center; }

        .cc-toast {
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          background: var(--ink); color: var(--paper); font-family: var(--font-mono); font-size: 11.5px;
          padding: 9px 14px; border-radius: 4px; max-width: 90%; text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4); z-index: 30;
        }

        .cc-dashboard {
          position: absolute; inset: 0; background: rgba(20,8,10,0.72);
          display: flex; align-items: center; justify-content: center; z-index: 40; padding: 16px; border-radius: 4px;
        }
        .cc-terminal {
          background: #0f1210; color: #b7f0d6; font-family: var(--font-mono); font-size: 11.5px;
          padding: 18px; border-radius: 6px; max-width: 360px; width: 100%; line-height: 1.7;
          box-shadow: 0 30px 60px rgba(0,0,0,0.6); max-height: 80vh; overflow-y: auto;
        }
        .cc-terminal-close { float: right; background: transparent; border: none; color: #b7f0d6; cursor: pointer; }

        .cc-elapsed { font-family: var(--font-display); font-size: clamp(44px, 12vw, 60px); text-align: center; color: var(--stamp); margin: 6px 0; }

        .cc-footnote { font-family: var(--font-mono); font-size: 10px; color: rgba(244,234,210,0.55); text-align: center; margin-top: 14px; line-height: 1.6; }

        .cc-shake { animation: ccShake 0.5s ease; }
        @keyframes ccShake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-4px, 2px); }
          40% { transform: translate(4px, -2px); }
          60% { transform: translate(-3px, -1px); }
          80% { transform: translate(3px, 1px); }
        }

        .cc-code-block {
          background: #16110d;
          color: #9be8a6;
          font-family: var(--font-mono);
          font-size: 11.5px;
          line-height: 1.6;
          padding: 12px 14px;
          border-radius: 4px;
          margin: 0 0 16px;
          white-space: pre-wrap;
          overflow-x: auto;
        }

        .cc-health-row { display: flex; gap: 14px; margin-bottom: 14px; }
        .cc-health-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-family: var(--font-mono);
          font-size: 11.5px;
          background: var(--paper-2);
          border-radius: 4px;
          padding: 10px;
        }
        .cc-health-label { font-weight: 700; letter-spacing: 0.06em; margin-bottom: 2px; }

        .cc-ring-banner {
          width: 100%;
          height: 130px;
          object-fit: cover;
          border-radius: 6px;
          margin-bottom: 14px;
          display: block;
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }

        .cc-donkey-full {
          display: block;
          width: 100%;
          max-width: 260px;
          margin: 0 auto 14px;
          border-radius: 8px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        }

        .cc-donkey-popup {
          background: var(--paper);
          border-radius: 8px;
          padding: 20px;
          max-width: 300px;
          width: 100%;
          text-align: center;
          position: relative;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }
        .cc-donkey-popup-img {
          width: 100%;
          max-height: 220px;
          object-fit: cover;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .cc-surveillance-tag {
          position: absolute;
          top: 14px; left: 14px;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
          color: rgba(244,234,210,0.45);
          animation: ccBlink 3s steps(1) infinite;
          z-index: 20;
        }

        @media (prefers-reduced-motion: reduce) {
          .cc-marquee, .cc-stamp, .cc-dodge-btn, .cc-commentary, .cc-shake, .cc-surveillance-tag { animation: none !important; transition: none !important; }
        }
      `}</style>

      <button className="cc-mute" onClick={() => setSoundOn((s) => !s)} aria-label="Toggle sound">
        {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      <audio ref={entranceAudioRef} src="/audio/entrance.mp3" preload="none" style={{ display: 'none' }} />

      {commentary && (
        <div className="cc-commentary">
          <span className="cc-commentary-tag">{commentary.tag}</span>
          {commentary.msg}
        </div>
      )}

      <div className="cc-shell">
        <div className="cc-marquee">{marqueeText}</div>

        <div className="cc-frame">
          <div className="cc-card">

            {stage === 'welcome' && (
              <>
                <div className="cc-case-row"><span>CASE No. {caseNumber}</span><span>STATUS: UNKNOWN</span></div>
                {welcomeStep === 0 && (
                  <>
                    <h1 className="cc-title">⚠️ Welcome.</h1>
                    <p className="cc-body">
                      This is a completely normal website.<br />
                      No tracking.<br />
                      No surveillance.<br />
                      No psychological experiments.<br />
                      <strong>Probably.</strong>
                    </p>
                    <div className="cc-dodge-wrap">
                      <button
                        className="cc-btn cc-btn-primary cc-dodge-btn"
                        style={{ '--dx': `${dodge.x}px`, '--dy': `${dodge.y}px` }}
                        onMouseEnter={dodgeButton}
                        onTouchStart={dodgeButton}
                        onClick={() => { playClick(); setWelcomeStep(1); }}
                      >
                        I understand
                      </button>
                    </div>
                    {dodge.count > 0 && dodge.count < 2 && <p className="cc-hint">it does not believe you yet.</p>}
                    {dodge.count >= 2 && <p className="cc-hint">fine. it will hold still.</p>}
                    <div className="cc-controls">
                      <select className="cc-select" value={musicChoice} onChange={(e) => { setMusicChoice(e.target.value); logEvent(sessionId, 'music_selected', { music_choice: e.target.value }); }} aria-label="Soundtrack">
                        {MUSIC_OPTIONS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                      </select>
                    </div>
                  </>
                )}
                {welcomeStep === 1 && (
                  <>
                    <h1 className="cc-title-fun">You understand?</h1>
                    <p className="cc-body">That’s ambitious.</p>
                    <button className="cc-btn cc-btn-primary" onClick={next}>Continue anyway</button>
                  </>
                )}
              </>
            )}

            {stage === 'diagnostics' && (
              <>
                <div className="cc-case-row"><span>CASE No. {caseNumber}</span><span>USER_SCAN.EXE</span></div>
                <h1 className="cc-title-fun">Initializing user_scan.exe…</h1>
                {DIAG_STATS.map(([label, val]) => (
                  <div className="cc-bar-row" key={label}>
                    <div className="cc-bar-label"><span>{label}</span><span>{diagStep >= 1 ? val : 0}%</span></div>
                    <div className="cc-bar-track"><div className="cc-bar-fill" style={{ width: `${diagStep >= 1 ? val : 0}%` }} /></div>
                  </div>
                ))}
                {diagStep >= 1 && <p className="cc-body" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Result: USER IS COOKED.</p>}
                {diagStep >= 1 && <p className="cc-body">Don’t worry. <strong>We’ve seen worse.</strong></p>}
                {diagStep >= 2 && (
                  <>
                    <p className="cc-body">Actually… <strong>no, we haven’t.</strong></p>
                    <button className="cc-btn cc-btn-primary" onClick={next}>Continue</button>
                  </>
                )}
              </>
            )}

            {stage === 'codingTest' && (
              <>
                <div className="cc-case-row"><span>CASE No. {caseNumber}</span><span>SKILL VERIFICATION</span></div>
                <h1 className="cc-title-fun">Coding skill verification</h1>
                <pre className="cc-code-block">{'int x = 10;\ncout << x++;'}</pre>
                <p className="cc-body">What does it print?</p>
                <div className="cc-btn-row" style={{ marginBottom: 14 }}>
                  {CODING_OPTIONS.map((o) => (
                    <button
                      key={o.key}
                      className="cc-btn cc-btn-teal"
                      onClick={() => { setCodingAnswer(o.key); logEvent(sessionId, 'coding_answer', { metadata: { choice: o.key } }); }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {codingAnswer && (
                  <>
                    <p className="cc-body"><strong>Interesting.</strong></p>
                    <pre className="cc-code-block">{'Analyzing answer...\n\nConfidence: HIGH\nAccuracy: UNKNOWN\n\nConclusion:\nYou would survive one semester.\nBarely.'}</pre>
                    <p className="cc-body">Your GitHub has been placed under observation.</p>
                    <pre className="cc-code-block">{`Issues found:\n${GITHUB_ISSUES.map((i) => `✓ ${i}`).join('\n')}`}</pre>
                    <p className="cc-body" style={{ fontWeight: 700 }}>Classic.</p>
                    <button className="cc-btn cc-btn-primary" onClick={next}>Continue</button>
                  </>
                )}
              </>
            )}

            {stage === 'wwe' && (
              <div className={shaking ? 'cc-shake' : ''}>
                <div className="cc-case-row"><span>CASE No. {caseNumber}</span><span>🔔 LIVE EVENT</span></div>
                <SafeImage src="/wrestling/ring.jpeg" alt="" className="cc-ring-banner" fallbackEmoji="🥊" fallbackSize={56} />
                {wweStep === 0 && (
                  <>
                    <h1 className="cc-title" style={{ textAlign: 'center' }}>DING DING DING</h1>
                    <p className="cc-title-fun" style={{ textAlign: 'center', fontSize: 18 }}>YOUR OPPONENT HAS ENTERED THE RING</p>
                    <p className="cc-body" style={{ textAlign: 'center' }}><strong>THE WEBSITE</strong></p>
                    <div className="cc-health-row">
                      <div className="cc-health-col">
                        <span className="cc-health-label">YOU</span>
                        <span>❤️ 100</span>
                        <span>Confidence 89%</span>
                        <span>Brain ???</span>
                      </div>
                      <div className="cc-health-col">
                        <span className="cc-health-label">WEBSITE</span>
                        <span>❤️ 100</span>
                        <span>Confidence 9000%</span>
                        <span>Brain 404</span>
                      </div>
                    </div>
                    <p className="cc-body" style={{ fontStyle: 'italic' }}>🎙️ “OH MY GOD! THE USER HAS WALKED DIRECTLY INTO THE TRAP! THEY STILL THINK THEY CAN WIN!”</p>
                    <div className="cc-btn-row">
                      <button className="cc-btn cc-btn-teal" onClick={() => { setWweAction('fight'); setWweStep(1); playCritical(); logEvent(sessionId, 'wwe_action', { metadata: { choice: 'fight' } }); }}>🥊 Fight</button>
                      <button className="cc-btn cc-btn-teal" onClick={() => { setWweAction('run'); setWweStep(1); logEvent(sessionId, 'wwe_action', { metadata: { choice: 'run' } }); }}>🏃 Run</button>
                      <button className="cc-btn cc-btn-teal" onClick={() => { setWweAction('call'); setWweStep(1); logEvent(sessionId, 'wwe_action', { metadata: { choice: 'call' } }); }}>📞 Call someone smarter</button>
                    </div>
                  </>
                )}
                {wweStep === 1 && wweAction && (
                  <>
                    <p className="cc-title-fun">{WWE_ACTION_RESULTS[wweAction].line}</p>
                    <pre className="cc-code-block">{WWE_ACTION_RESULTS[wweAction].detail}</pre>
                    <button className="cc-btn cc-btn-primary" onClick={next}>Continue</button>
                  </>
                )}
              </div>
            )}

            {stage === 'colorTest' && (
              <>
                <div className="cc-case-row"><span>CASE No. {caseNumber}</span><span>CHOOSE YOUR DESTINY</span></div>
                {!colorChoice ? (
                  <>
                    <h1 className="cc-title">Pick the color that represents you.</h1>
                    <div className="cc-btn-row">
                      <button className="cc-btn cc-btn-teal" style={{ background: '#1a1512' }} onClick={() => { setColorChoice('black'); logEvent(sessionId, 'color_choice', { metadata: { choice: 'black' } }); }}>⬛ BLACK</button>
                      <button className="cc-btn cc-btn-teal" style={{ background: '#e8ddc4', color: '#241512' }} onClick={() => { setColorChoice('white'); logEvent(sessionId, 'color_choice', { metadata: { choice: 'white' } }); }}>⬜ WHITE</button>
                      <button className="cc-btn cc-btn-teal" style={{ background: 'linear-gradient(90deg,#e24a4a,#e2b94a,#4ae27e,#4a9be2,#a24ae2)' }} onClick={() => { setColorChoice('multi'); logEvent(sessionId, 'color_choice', { metadata: { choice: 'multi' } }); }}>🌈 MULTICOLOR</button>
                    </div>
                  </>
                ) : colorChoice === 'black' ? (
                  <>
                    <h1 className="cc-title">🚨 FEDERAL CURIOSITY INVESTIGATION UNIT</h1>
                    <p className="cc-body">
                      <strong>CONGRATULATIONS.</strong> Your completely innocent color choice has somehow
                      triggered a 47-page administrative investigation.
                    </p>
                    <pre className="cc-code-block">{'Charges:\n• Excessive confidence\n• Suspicious button clicking\n• First-degree bad decision making\n• Possession of unauthorized vibes'}</pre>
                    <p className="cc-body"><strong>YOU ARE NOT ACTUALLY ARRESTED.</strong> But your dignity has been detained.</p>
                    {colorStep === 0 && <button className="cc-btn cc-btn-primary" onClick={() => setColorStep(1)}>Appeal</button>}
                    {colorStep === 1 && (
                      <>
                        <p className="cc-body">Appeal rejected. Reason: <strong>you clicked the wrong color.</strong></p>
                        <button className="cc-btn cc-btn-primary" onClick={next}>Continue</button>
                      </>
                    )}
                  </>
                ) : colorChoice === 'white' ? (
                  <>
                    <h1 className="cc-title">WHITE?</h1>
                    <p className="cc-body">Really? You had three choices, and you picked <strong>the default.</strong></p>
                    <p className="cc-body">
                      You have been enrolled in a mandatory support group for people whose entire personality
                      is "no preference." Attendance is required. The snacks are also beige.
                    </p>
                    {colorStep === 0 && <button className="cc-btn cc-btn-primary" onClick={() => setColorStep(1)}>I regret everything</button>}
                    {colorStep === 1 && (
                      <>
                        <p className="cc-body">Too late.</p>
                        <button className="cc-btn cc-btn-primary" onClick={next}>Continue</button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <h1 className="cc-title">WHY ARE YOU LIKE THIS?</h1>
                    <p className="cc-body">You were given three colors. You somehow chose <strong>all of them.</strong> Maximum indecision detected.</p>
                    <pre className="cc-code-block">{'Personality.exe\n\nERROR 0x00000404\nToo many vibes detected.'}</pre>
                    <p className="cc-body">Honestly? <strong>Respect.</strong></p>
                    <button className="cc-btn cc-btn-primary" onClick={next}>Continue</button>
                  </>
                )}
              </>
            )}

            {stage === 'gaslight' && (
              <>
                <div className="cc-case-row"><span>CASE No. {caseNumber}</span><span>…</span></div>
                {gaslightStep === 0 && (
                  <>
                    <h1 className="cc-title">Wait.</h1>
                    <p className="cc-body">Didn’t you see that already?</p>
                    <button className="cc-btn cc-btn-teal" onClick={() => setGaslightStep(1)}>Continue</button>
                  </>
                )}
                {gaslightStep === 1 && (
                  <>
                    <p className="cc-body">The donkey. It was standing somewhere else before.</p>
                    <button className="cc-btn cc-btn-teal" onClick={() => setGaslightStep(2)}>Continue</button>
                  </>
                )}
                {gaslightStep >= 2 && (
                  <>
                    <p className="cc-body">You don’t remember?</p>
                    <p className="cc-body" style={{ fontWeight: 700 }}>That’s okay. We do.</p>
                    <button className="cc-btn cc-btn-primary" onClick={next}>Continue</button>
                  </>
                )}
              </>
            )}

            {stage === 'finalAnalysis' && (
              <>
                <div className="cc-case-row"><span>CASE No. {caseNumber}</span><span>FINAL USER ASSESSMENT</span></div>
                <h1 className="cc-title-fun">Final user assessment</h1>
                {FINAL_STATS.map(([label, val]) => (
                  <div className="cc-bar-row" key={label}>
                    <div className="cc-bar-label"><span>{label}</span><span>{val}%</span></div>
                    <div className="cc-bar-track"><div className="cc-bar-fill" style={{ width: `${val}%` }} /></div>
                  </div>
                ))}
                <p className="cc-title" style={{ fontSize: 20, marginTop: 10 }}>YOU SHOULD HAVE CLOSED THE TAB 2 MINUTES AGO.</p>
                <p className="cc-body">But you didn’t. That’s what makes this funny.</p>
                <button className="cc-btn cc-btn-primary" onClick={next}>Continue</button>
              </>
            )}

            {stage === 'finalDonkey' && (
              <>
                <div className="cc-case-row"><span>CASE No. {caseNumber}</span><span>…</span></div>
                <DonkeyImage src={FINAL_DONKEY_IMG} alt="" className="cc-donkey-full" fallbackSize={130} />
                {donkeyTextShown && (
                  <>
                    <p className="cc-body" style={{ textAlign: 'center', fontWeight: 700 }}>He knows.</p>
                    <p className="cc-body" style={{ textAlign: 'center', fontWeight: 700 }}>We all know.</p>
                    <p className="cc-body" style={{ textAlign: 'center' }}>Don’t worry. He won’t tell anyone.</p>
                    <p className="cc-body" style={{ textAlign: 'center' }}><strong>Probably.</strong></p>
                    <button className="cc-btn cc-btn-primary" onClick={next}>Continue</button>
                  </>
                )}
              </>
            )}

            {stage === 'finalBoss' && (
              <div className={shaking ? 'cc-shake' : ''}>
                <div className="cc-case-row"><span>CASE No. {caseNumber}</span><span>🔔 REMATCH</span></div>
                <SafeImage src="/wrestling/ring.jpeg" alt="" className="cc-ring-banner" fallbackEmoji="🥊" fallbackSize={56} />
                {bossStep === 0 && (
                  <>
                    <h1 className="cc-title" style={{ textAlign: 'center' }}>CONGRATULATIONS.</h1>
                    <p className="cc-body" style={{ textAlign: 'center' }}>You defeated the website.</p>
                    <p className="cc-body" style={{ textAlign: 'center' }}>… <strong>DING DING DING</strong></p>
                    <p className="cc-title-fun" style={{ textAlign: 'center', fontSize: 20 }}>PHASE 2</p>
                    <div className="cc-health-row">
                      <div className="cc-health-col"><span className="cc-health-label">WEBSITE</span><div className="cc-bar-track"><div className="cc-bar-fill" style={{ width: '100%' }} /></div></div>
                      <div className="cc-health-col"><span className="cc-health-label">YOU</span><div className="cc-bar-track"><div className="cc-bar-fill" style={{ width: '11%' }} /></div></div>
                    </div>
                    <p className="cc-body" style={{ fontStyle: 'italic' }}>🎙️ “AND THE WEBSITE IS GOING FOR THE FINISHER!”</p>
                    <button className="cc-btn cc-btn-primary" onClick={() => { setBossStep(1); unlockBadge('went_the_distance', 'Went the Distance'); }}>FINISH HIM</button>
                  </>
                )}
                {bossStep === 1 && (
                  <>
                    <p className="cc-title-fun" style={{ fontSize: 20 }}>💀 SEGMENTATION FAULT</p>
                    <p className="cc-body">Your dignity has been accessed illegally.</p>
                    <button className="cc-btn cc-btn-primary" onClick={next}>Continue</button>
                  </>
                )}
              </div>
            )}

            {stage === 'finalReport' && (
              <>
                <div className="cc-case-row"><span>CASE No. {caseNumber}</span><span>FINAL REPORT</span></div>
                {!closeAttempted && (
                  <>
                    <h1 className="cc-title-fun">User performance report</h1>
                    <pre className="cc-code-block">{'Intelligence        31%\nCommon Sense        19%\nProgramming         42%\nRage               100%\nPatience             4%\nAbility to leave     0%\n\nDonkey approval:    ❌\nWWE status:         Defeated\n\nOverall rating: ⭐⭐⭐⭐⭐'}</pre>
                    <p className="cc-body" style={{ fontWeight: 700 }}>Excellent victim.</p>
                    <button className="cc-btn cc-btn-primary" onClick={() => setCloseAttempted(true)}>Close website</button>
                  </>
                )}
                {closeAttempted && finalReportStep === 0 && (
                  <>
                    <p className="cc-title-fun">ERROR 403</p>
                    <p className="cc-body">Permission denied.</p>
                    <button className="cc-btn cc-btn-primary" onClick={() => setFinalReportStep(1)}>Try again</button>
                  </>
                )}
                {finalReportStep === 1 && (
                  <>
                    <p className="cc-body">…</p>
                    <p className="cc-body" style={{ fontWeight: 700 }}>You came back voluntarily. We don’t even have to prank you anymore.</p>
                    <DonkeyImage src={FINAL_DONKEY_IMG} alt="" className="cc-donkey-full" style={{ maxWidth: 160 }} fallbackSize={72} />
                    <p className="cc-body" style={{ textAlign: 'center' }}>He’ll be waiting.</p>
                    <button className="cc-btn cc-btn-primary" onClick={next}>Continue</button>
                  </>
                )}
              </>
            )}

            {stage === 'ending' && (
              <>
                <div className="cc-case-row"><span>CASE No. {caseNumber}</span><span>CLOSED</span></div>
                <h1 className="cc-title" style={{ textAlign: 'center' }}>Congratulations.</h1>
                <p className="cc-body" style={{ textAlign: 'center' }}>You have successfully wasted:</p>
                <ElapsedTimer startRef={startTimeRef} />
                <p className="cc-body" style={{ textAlign: 'center' }}>of your precious life.</p>
                <div className="cc-btn-row" style={{ marginBottom: 12 }}>
                  <button className="cc-btn cc-btn-gold" onClick={doItAgain}>
                    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      <RotateCcw size={13} /> Yes
                    </span>
                  </button>
                  <button className="cc-btn cc-btn-gold" onClick={doItAgain}>Obviously</button>
                </div>
                <button className="cc-btn cc-btn-teal" style={{ width: '100%', marginBottom: 10 }} onClick={shareChaos}>
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Share2 size={13} /> Send this to someone
                  </span>
                </button>
                <button className="cc-btn cc-btn-ghost" style={{ width: '100%' }} onClick={() => setShowDashboard(true)}>
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Sparkles size={12} /> View chaos control center
                  </span>
                </button>
                {replays > 0 && <p className="cc-hint" style={{ marginTop: 10 }}>{replays} replay(s) this session. HAHAHAHAHAHA.</p>}
              </>
            )}

          </div>
        </div>

        <p className="cc-footnote">anonymous session analytics only · no names, no accounts, no donkeys harmed</p>
      </div>

      {showDashboard && (
        <div className="cc-dashboard">
          <div className="cc-terminal">
            <button className="cc-terminal-close" onClick={() => setShowDashboard(false)} aria-label="Close">[x]</button>
            {'🇵🇰'} CHAOS CONTROL CENTER<br />
            {'-'.repeat(34)}<br />
            YOUR SESSION<br />
            &nbsp;&nbsp;time wasted&nbsp;&nbsp;&nbsp;&nbsp;{fmtTime(Date.now() - startTimeRef.current)}<br />
            &nbsp;&nbsp;color choice&nbsp;&nbsp;&nbsp;{colorChoice || 'unrecorded'}<br />
            &nbsp;&nbsp;coding answer&nbsp;{codingAnswer || 'unrecorded'}<br />
            &nbsp;&nbsp;wwe action&nbsp;&nbsp;&nbsp;&nbsp;{wweAction || 'unrecorded'}<br />
            &nbsp;&nbsp;rage clicks&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{rageClicks}<br />
            {'-'.repeat(34)}<br />
            ACHIEVEMENTS<br />
            {BADGES.map((b) => (
              <React.Fragment key={b.id}>
                {unlockedBadges.includes(b.id) ? '✔' : '□'} {b.emoji} {b.label}
                <br />
              </React.Fragment>
            ))}
            {'-'.repeat(34)}<br />
            SITE-WIDE (sample data)<br />
            &nbsp;&nbsp;chose BLACK&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;41%<br />
            &nbsp;&nbsp;chose WHITE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;22%<br />
            &nbsp;&nbsp;chose MULTICOLOR&nbsp;37%<br />
            &nbsp;&nbsp;most replayed&nbsp;&nbsp;WWE interruption<br />
            &nbsp;&nbsp;donkeys spotted&nbsp;3,214<br />
            &nbsp;&nbsp;segfaults survived&nbsp;1,093<br />
            {'-'.repeat(34)}<br />
            hook this panel to the Django API<br />for real numbers.
          </div>
        </div>
      )}

      {donkeyPopup && (
        <div className="cc-dashboard" onClick={dismissDonkey}>
          <div className="cc-donkey-popup" onClick={(e) => e.stopPropagation()}>
            <button className="cc-terminal-close" onClick={dismissDonkey} aria-label="Close" style={{ color: 'var(--ink)' }}>[x]</button>
            <DonkeyImage src={donkeyPopup.img} alt="" className="cc-donkey-popup-img" fallbackSize={100} />
            <p className="cc-body" style={{ fontWeight: 700, marginBottom: 4 }}>{donkeyPopup.title}</p>
            <p className="cc-body" style={{ marginBottom: 0 }}>{donkeyPopup.sub}</p>
          </div>
        </div>
      )}

      {STAGES.indexOf(stage) >= STAGES.indexOf('diagnostics') && (
        <div className="cc-surveillance-tag">donkey surveillance: ACTIVE</div>
      )}

      {toast && <div className="cc-toast">{toast}</div>}
    </div>
  );
}

function ElapsedTimer({ startRef }) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <div className="cc-elapsed">{fmtTime(Date.now() - startRef.current)}</div>;
}
