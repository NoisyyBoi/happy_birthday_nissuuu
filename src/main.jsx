import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Heart, Sparkles, Gift, Music2, Camera, Moon, Star, ArrowDown, LockKeyhole, Cake, Play, X, Check, RotateCcw } from "lucide-react";
import "./styles.css";

// ─── Midnight target: November 2 2026, 00:00:00 IST (UTC+5:30) ───────────────
// To enable test mode locally: create a file called .env.local in the project
// root containing:  VITE_TEST_COUNTDOWN=true
// Then run `npm run dev`. The video will trigger after 5 seconds.
// To disable: delete .env.local (or set VITE_TEST_COUNTDOWN=false).
// .env.local is gitignored — it will never be committed or deployed.
const _TEST_MODE = import.meta.env.VITE_TEST_COUNTDOWN === "true";
const TARGET_MS = _TEST_MODE
  ? Date.now() + 5_000 + 18_000   // test: 5s countdown then video plays
  : Date.UTC(2026, 10, 1, 18, 30, 0); // production: Nov 2 2026 00:00 IST
const VIDEO_LEAD_MS = 18_000; // start video this many ms before midnight

function Root() {
  // phase: 'countdown' | 'video' | 'birthday'
  const [phase, setPhase] = useState(() => {
    const left = TARGET_MS - Date.now();
    if (left <= 0) return "birthday";
    if (left <= VIDEO_LEAD_MS) return "video";
    return "countdown";
  });

  // live countdown display [hh, mm, ss]
  const [timeLeft, setTimeLeft] = useState(() => {
    const left = Math.max(0, TARGET_MS - Date.now());
    return msToHMS(left);
  });

  const midnightReachedRef = useRef(false);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  function msToHMS(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return [h, m, s];
  }

  // Called when we want to go to birthday phase — never before midnight
  const enterBirthday = useCallback(() => {
    setPhase("birthday");
  }, []);

  // Main countdown tick
  useEffect(() => {
    if (phase !== "countdown") return;

    function tick() {
      const left = TARGET_MS - Date.now();
      setTimeLeft(msToHMS(left));

      if (left <= VIDEO_LEAD_MS) {
        setPhase("video");
      }
    }

    tick(); // immediate first tick
    timerRef.current = setInterval(tick, 500);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Watch midnight arrival during video phase
  useEffect(() => {
    if (phase !== "video") return;

    // Check if midnight already passed when we entered video phase
    if (Date.now() >= TARGET_MS) {
      midnightReachedRef.current = true;
    }

    function tick() {
      if (Date.now() >= TARGET_MS) {
        midnightReachedRef.current = true;
        clearInterval(timerRef.current);
        // If video already ended, go to birthday now
        const vid = videoRef.current;
        if (vid && (vid.ended || vid.paused)) {
          enterBirthday();
        }
      }
    }

    timerRef.current = setInterval(tick, 250);
    return () => clearInterval(timerRef.current);
  }, [phase, enterBirthday]);

  // Attach video event handlers when video phase is active
  useEffect(() => {
    if (phase !== "video") return;
    const vid = videoRef.current;
    if (!vid) return;

    function handleEnded() {
      if (midnightReachedRef.current) {
        enterBirthday();
      } else {
        // Video finished early — wait for midnight, then go
        const msUntilMidnight = Math.max(0, TARGET_MS - Date.now());
        const t = setTimeout(enterBirthday, msUntilMidnight);
        return () => clearTimeout(t);
      }
    }

    function handleError() {
      // Playback failed — fall back to countdown or birthday depending on time
      if (Date.now() >= TARGET_MS) {
        enterBirthday();
      } else {
        setPhase("countdown");
      }
    }

    vid.addEventListener("ended", handleEnded);
    vid.addEventListener("error", handleError);

    // Attempt play (may be blocked by autoplay policy; error handler covers that)
    vid.play().catch(() => {
      // Autoplay blocked — treat as error: fall back gracefully
      handleError();
    });

    return () => {
      vid.removeEventListener("ended", handleEnded);
      vid.removeEventListener("error", handleError);
    };
  }, [phase, enterBirthday]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === "countdown") {
    const [h, m, s] = timeLeft;
    return (
      <div className="cdov-overlay" aria-live="polite" aria-label="Countdown to Nisarga's birthday">
        <div className="cdov-stars" aria-hidden="true">
          {Array.from({ length: 55 }, (_, i) => (
            <i key={i} style={{ left: `${(i * 41) % 100}%`, top: `${(i * 67) % 100}%`, animationDelay: `${(i % 7) * 0.38}s`, opacity: 0.18 + (i % 5) * 0.12 }} />
          ))}
        </div>
        <div className="cdov-moon" aria-hidden="true"><Moon size={30} strokeWidth={1.1} /></div>
        <div className="cdov-content">
          <p className="eyebrow"><Sparkles size={13} /> SOMETHING SPECIAL IS ALMOST HERE</p>
          <h1 className="cdov-name">Nisarga<span className="pink">.</span></h1>
          <p className="cdov-sub">your birthday begins in</p>
          <div className="cdov-clock" aria-label={`${h} hours, ${m} minutes, ${s} seconds`}>
            <div className="cdov-unit">
              <span className="cdov-digit">{String(h).padStart(2, "0")}</span>
              <span className="cdov-label">hours</span>
            </div>
            <span className="cdov-sep" aria-hidden="true">:</span>
            <div className="cdov-unit">
              <span className="cdov-digit">{String(m).padStart(2, "0")}</span>
              <span className="cdov-label">minutes</span>
            </div>
            <span className="cdov-sep" aria-hidden="true">:</span>
            <div className="cdov-unit">
              <span className="cdov-digit">{String(s).padStart(2, "0")}</span>
              <span className="cdov-label">seconds</span>
            </div>
          </div>
          <p className="cdov-note">November 2 · midnight IST ✦</p>
        </div>
        <div className="cdov-bottom">MADE WITH LOVE · JUST FOR YOU</div>
      </div>
    );
  }

  if (phase === "video") {
    return (
      <div className="cdov-video-overlay" aria-label="Playing birthday surprise video">
        <video
          ref={videoRef}
          src="/midnight-countdown-video.mp4"
          playsInline
          preload="auto"
          muted={false}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          aria-hidden="true"
        />
      </div>
    );
  }

  // phase === 'birthday' — render the full existing app, skipping the intro
  return <App skipIntro />;
}

const memories = [
  { date: "REVA UNIVERSITY · BCA DAYS", title: "Before our story began", text: "We knew each other from our BCA days at REVA University. Back then, we weren't talking all that much. Funny how someone who was already part of your world can later become such a special part of it.", photo: "memory-01.jpg", caption: "Where our paths first crossed ✦" },
  { date: "YOUR BIRTHDAY · LAST YEAR", title: "One little birthday wish", text: "Last year, I wished you happy birthday. I had no idea that one simple message would turn into conversations, hanging out, getting closer, and a story I would never want to rush through.", photo: "memory-02.jpg", caption: "One message. A whole new chapter." },
  { date: "SOMEWHERE ALONG THE WAY", title: "And then, there was us", text: "We started spending more time together. We became close, feelings grew, and somehow we found something beautiful in each other. I may not know the exact date our story became love, but I know how special it feels to be here with you.", photo: "memory-03.jpg", caption: "The best things grew naturally ♡" }
];
const photoFiles = Array.from({ length: 25 }, (_, i) => `memory-${String(i + 1).padStart(2, "0")}.jpg`);

const reasons = [
  "The way you make ordinary moments feel special.",
  "Your smile — yes, this is me being completely biased.",
  "The little things you do that you probably don't even notice.",
  "How being around you can make a hard day feel lighter.",
  "Your laugh. I hope I get to hear it a million more times.",
  "Because I can be myself around you.",
  "And because even this list could never fit all the reasons."
];

const gifts = [
  { title: "A little surprise", label: "MYSTERY GIFT · 01", message: "No hints, no spoilers! Your first surprise is waiting for you in real life. Come receive it from me, then tap the button below when it’s yours. ♡" },
  { title: "Something just for you", label: "MYSTERY GIFT · 02", message: "One more little surprise chosen with you in mind. I’m keeping the secret until you open it in person. Come receive it from me, then mark it received here. ✨" },
  { title: "A box of happiness", label: "MYSTERY GIFT · 03", message: "Surprise number three! The website is keeping its lips sealed 🤐 Come get your gift from me, and tap the button when you’ve received it. ♡" },
  { title: "The final mystery", label: "MYSTERY GIFT · 04", message: "The last wrapped surprise is waiting for you in real life. No spoilers here, birthday girl! Come receive it from me, then mark it received to unlock the final birthday message. 💗" }
];

const quiz = [
  { q: "What should we do on a perfect day together?", options: ["A little adventure", "Food + endless talking", "A cosy movie day", "All of these, obviously"], answer: 3, response: "Correct answer: spending time together. The activity is just a bonus. 💗" },
  { q: "What is this website's most important feature?", options: ["The animations", "The stars", "Making Nissuuu smile", "The cake"], answer: 2, response: "You got it. This whole little universe exists to make you smile. ✨" },
  { q: "What is the next thing we should collect?", options: ["More photos", "More inside jokes", "More memories", "Yes"], answer: 3, response: "YES is the only acceptable answer. More memories, please. 🌙" }
];

function App({ skipIntro = false }) {
  const [entered, setEntered] = useState(skipIntro);
  const [activeStep, setActiveStep] = useState(0);
  const [openedStars, setOpenedStars] = useState([]);
  const [receivedGifts, setReceivedGifts] = useState([]);
  const [activeGift, setActiveGift] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);
  const [albumIndex, setAlbumIndex] = useState(0);
  const [albumComplete, setAlbumComplete] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [candlesOut, setCandlesOut] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [showMedia, setShowMedia] = useState(false);

  const stepComplete = activeStep === 3 ? openedStars.length === reasons.length : activeStep === 4 ? albumComplete : activeStep === 5 ? receivedGifts.length === 4 : activeStep === 6 ? quizDone : activeStep === 7 ? candlesOut : true;
  const nextStep = () => { if (stepComplete && activeStep < 7) setActiveStep((step) => step + 1); };
  const answerQuiz = (index) => {
    setAnswers((prev) => [...prev, index]);
    if (quizIndex === quiz.length - 1) setQuizDone(true);
    else setQuizIndex((prev) => prev + 1);
  };

  return (
    <main>
      {!entered && (
        <div className="intro">
          <div className="intro-stars" aria-hidden="true">{Array.from({length: 48}, (_, i) => <i key={i} style={{left: `${(i*37)%100}%`, top: `${(i*61)%100}%`, animationDelay: `${(i%7)*.4}s`, opacity: .25 + (i%5)*.13}} />)}</div>
          <div className="moon-glow"><Moon size={32} strokeWidth={1.1} /></div>
          <div className="intro-content">
            <p className="eyebrow"><Sparkles size={13} /> A LITTLE UNIVERSE, JUST FOR YOU</p>
            <p className="intro-pre">For the girl who makes my world brighter</p>
            <h1>Nisarga<span className="pink">.</span></h1>
            <p className="nickname">my Nissuuu ♡</p>
            <p className="intro-copy">It started with one little birthday wish.<br/>I didn't know it would lead me to something this special.</p>
            <button className="primary-button" onClick={() => {setEntered(true); setActiveStep(0);}}>
              Enter my universe <Sparkles size={16} />
            </button>
            <span className="tiny-note">MADE WITH LOVE · JUST FOR YOU</span>
          </div>
          <div className="intro-bottom">A LITTLE JOURNEY, ONE MOMENT AT A TIME</div>
        </div>
      )}

      {entered && <div className="journey-top"><span className="journey-brand">N<span>.</span></span><div className="journey-progress"><span style={{width: `${((activeStep+1)/8)*100}%`}} /></div><span className="journey-count">{String(activeStep+1).padStart(2,"0")} / 08</span></div>}

      <section className={`hero section journey-step ${activeStep === 0 ? "active-step" : ""}`} id="home">
        <div className="hero-orb orb-one"></div><div className="hero-orb orb-two"></div>
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line"></span> NOVEMBER 02 · YOUR DAY</p>
          <h2>In a universe<br/>full of stars, <em>it's you.</em></h2>
          <p className="hero-text">Last year, a birthday wish started a conversation. Since then, you've become one of my favourite parts of life. This little universe is for the story that grew from that one message.</p>
          <button className="primary-button" onClick={() => setActiveStep(1)}>Start our story <ArrowDown size={16}/></button>
        </div>
        <div className="hero-art" aria-label="Decorative moon and stars">
          <div className="orbit orbit-a"></div><div className="orbit orbit-b"></div>
          <div className="planet"><div className="planet-shade"></div></div>
          <Star className="float-star star-a" size={22} fill="currentColor"/><Star className="float-star star-b" size={13} fill="currentColor"/><Star className="float-star star-c" size={17} fill="currentColor"/>
          <span className="art-note">you are my<br/><i>favourite</i> place</span>
        </div>
        <div className="scroll-cue"><span></span> ONE SCREEN AT A TIME</div>
      </section>

      <section className={`section video-section journey-step ${activeStep === 1 ? "active-step" : ""}`} id="our-video">
        <div className="section-heading centered"><p className="eyebrow"><Heart size={13}/> A MOMENT ON REPEAT</p><h2>Some moments deserve<br/><em>to last a little longer.</em></h2><p>A little memory of us, playing on repeat — just like the way I replay my favourite moments with you.</p></div>
        <div className="video-frame"><video src="/our-video.mp4" autoPlay muted loop playsInline preload="metadata" aria-label="A memory of us" /><span className="video-caption">OUR LITTLE MOMENT ♡</span></div>
      </section>

      <section className={`section story-section journey-step ${activeStep === 2 ? "active-step" : ""}`} id="story">
        <div className="section-heading">
          <p className="eyebrow"><Sparkles size={13}/> CHAPTER ONE</p>
          <h2>Little moments,<br/><em>big feelings.</em></h2>
          <p>I can't choose just one favourite memory with you. Every little moment has become something I want to keep. So here's a little piece of how we became us.</p>
        </div>
        <div className="timeline">
          {memories.map((m, i) => <article className={`timeline-item ${i%2 ? "reverse" : ""}`} key={m.title}>
            <div className="timeline-dot"><Heart size={13} fill="currentColor"/></div>
            <div className="timeline-card">
              <div className={`memory-photo photo-${i+1}`} onClick={() => setActivePhoto(m)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setActivePhoto(m)}>
                <img src={`/photos/${m.photo}`} alt={m.caption} loading="lazy"/><span className="photo-tape"></span>
              </div>
              <div className="timeline-copy"><span className="date-label">{m.date}</span><h3>{m.title}</h3><p>{m.text}</p><button className="mini-link" onClick={() => setActivePhoto(m)}>Open this memory ↗</button></div>
            </div>
          </article>)}
        </div>
        <p className="edit-hint">✦ Every photo here is one of our little pieces of forever. ♡</p>
      </section>

      <section className={`section stars-section journey-step ${activeStep === 3 ? "active-step" : ""}`} id="stars">
        <div className="stars-backdrop"></div>
        <div className="section-heading centered">
          <p className="eyebrow"><Star size={13}/> A SKY FULL OF LITTLE THINGS</p>
          <h2>Reasons I love <em>you.</em></h2>
          <p>Tap a star, Nissuuu. Each one is hiding a little truth.</p>
        </div>
        <div className="star-field">
          {reasons.map((reason, i) => <button key={reason} className={`reason-star rs-${i+1} ${openedStars.includes(i) ? "revealed" : ""}`} onClick={() => setOpenedStars(prev => prev.includes(i) ? prev : [...prev, i])} aria-label={`Reveal reason ${i+1}`}>
            <Star size={openedStars.includes(i) ? 25 : 21} fill="currentColor"/><span>{openedStars.includes(i) ? reason : `0${i+1}`}</span>
          </button>)}
          <div className="star-center"><Heart size={23} fill="currentColor"/><span>for you</span></div>
        </div>
        <p className="star-progress">{openedStars.length} OF {reasons.length} LITTLE REASONS DISCOVERED</p>
      </section>

      <section className={`section scrapbook-section journey-step ${activeStep === 4 ? "active-step" : ""}`} id="scrapbook">
        <div className="section-heading">
          <p className="eyebrow"><Camera size={13}/> THE LITTLE SCRAPBOOK</p>
          <h2>Moments I wish<br/>I could <em>keep forever.</em></h2>
          <p>Photos fade into the camera roll. The feelings behind them never have to.</p>
        </div>
        {!albumComplete ? <div className="album-viewer">
          <div className="album-single-card" key={photoFiles.slice(3)[albumIndex]}>
            <div className="album-single-image"><img src={`/photos/${photoFiles.slice(3)[albumIndex]}`} alt={`Our memory ${albumIndex + 1}`} /></div>
            <div className="album-single-caption"><span>MEMORY {String(albumIndex + 1).padStart(2, "0")} / {photoFiles.length - 3}</span><p>{["a little chaos ♡", "my happy place", "just us", "more days like this"][albumIndex % 4]}</p></div>
          </div>
          <div className="album-viewer-controls">
            <span>{albumIndex + 1} of {photoFiles.length - 3} memories</span>
            <button className="primary-button" onClick={() => { if (albumIndex < photoFiles.length - 4) setAlbumIndex(index => index + 1); else setAlbumComplete(true); }}>
              {albumIndex < photoFiles.length - 4 ? "Next memory ✦" : "Reveal our full album ♡"}
            </button>
          </div>
        </div> : <>
          <p className="album-complete-note"><Heart size={13} fill="currentColor"/> You’ve seen every memory. Here’s our little album, all together.</p>
          <div className="scrapbook-grid">
            {photoFiles.slice(3).map((photo, i) => <button className={`scrap-card scrap-${(i%4)+1}`} key={photo} onClick={() => setActivePhoto({title: ["A little chaos", "My happy place", "Just us", "More days like this"][i%4], date: "A MEMORY TO KEEP", text: "Every photo holds a little moment I want to keep with you. ♡", photo, caption: "A little piece of us"})}>
              <div className="scrap-image"><img src={`/photos/${photo}`} alt={`Memory ${i+4}`} loading="lazy"/></div><span className="scrap-caption">{["a little chaos ♡", "my happy place", "just us", "more days like this"][i%4]}</span>
            </button>)}
          </div>
        </>}
      </section>

      <section className={`section gifts-section journey-step ${activeStep === 5 ? "active-step" : ""}`} id="gifts">
        <div className="section-heading centered">
          <p className="eyebrow"><Gift size={13}/> SOMETHING FOR YOU</p>
          <h2>Little gifts, <em>just because.</em></h2>
          <p>Four mystery gifts are waiting for you. No spoilers here! Tap one, come receive it from me, then mark it received. The final surprise unlocks only when all four are yours. ♡</p>
        </div>
        <p className="gift-progress">{receivedGifts.length} OF 4 GIFTS RECEIVED</p>
        <div className="gift-grid">
          {gifts.map((gift, i) => <button key={gift.title} className={`gift-card ${receivedGifts.includes(i) ? "gift-opened" : ""}`} onClick={() => setActiveGift(i)}>
            <span className="gift-number">0{i+1}</span><div className="gift-icon">{receivedGifts.includes(i) ? <Check size={27}/> : <Gift size={27} strokeWidth={1.2}/>}</div><span className="gift-label">{gift.label}</span><strong>{gift.title}</strong><span className="gift-open">{receivedGifts.includes(i) ? "RECEIVED ✓" : "TAP TO RECEIVE ↗"}</span>
          </button>)}
        </div>
        <div className={`gift-unlock ${receivedGifts.length === 4 ? "unlocked" : ""}`}>
          {receivedGifts.length === 4 ? <><Sparkles size={24}/><h3>Nissuuu… the surprise isn't over! 💗</h3><p>You’ve received all four gifts, but my favourite part is still making memories with you. Happy birthday, my love.</p></> : <><LockKeyhole size={20}/><p>The next little surprise stays locked until you’ve received all 4 gifts. You’ve received <strong>{receivedGifts.length}</strong> so far!</p></>}
        </div>
      </section>

      <section className={`section quiz-section journey-step ${activeStep === 6 ? "active-step" : ""}`} id="quiz">
        <div className="quiz-card">
          <div className="quiz-icon"><Sparkles size={24}/></div>
          <p className="eyebrow">A VERY IMPORTANT LITTLE QUIZ</p>
          <h2>How well do you<br/><em>know us?</em></h2>
          {!quizDone ? <>
            <div className="quiz-progress"><span style={{width: `${(quizIndex/quiz.length)*100}%`}}></span></div>
            <p className="quiz-count">QUESTION {quizIndex+1} OF {quiz.length}</p>
            <h3>{quiz[quizIndex].q}</h3>
            <div className="quiz-options">{quiz[quizIndex].options.map((option, i) => <button key={option} onClick={() => answerQuiz(i)}>{option}<span>↗</span></button>)}</div>
          </> : <div className="quiz-result"><div className="result-heart"><Heart size={25} fill="currentColor"/></div><h3>You passed with flying colours.</h3><p>{quiz[quiz.length-1].response}</p><button className="text-button" onClick={() => {setQuizIndex(0);setQuizDone(false);setAnswers([]);}}>Play again <RotateCcw size={14}/></button></div>}
        </div>
      </section>

      <section className={`section finale-section journey-step ${activeStep === 7 ? "active-step" : ""}`} id="finale">
        <div className="finale-stars"></div>
        <p className="eyebrow"><Cake size={14}/> THE BIG LITTLE MOMENT</p>
        <h2>Make a wish,<br/><em>birthday girl.</em></h2>
        <p className="finale-copy">Close your eyes for a second. Think of something beautiful. Then tap the cake when you're ready.</p>
        <button className={`cake-button ${candlesOut ? "blown" : ""}`} onClick={() => setCandlesOut(true)} aria-label="Blow out the birthday candles">
          <div className="cake-candles">{[0,1,2].map(i => <span key={i} className={`candle candle-${i+1}`}>{!candlesOut && <i className="flame"></i>}</span>)}</div>
          <div className="cake-top"></div><div className="cake-layer layer-top"></div><div className="cake-layer layer-bottom"></div><div className="cake-plate"></div>
        </button>
        <p className="cake-instruction">{candlesOut ? "WISH MADE ✦ NOW LET ME TELL YOU SOMETHING..." : "TAP THE CAKE TO MAKE A WISH"}</p>
        {candlesOut && <div className="birthday-reveal"><Sparkles size={22}/><h3>Happy birthday, my Nissuuu.</h3><p>One birthday wish brought us closer, and I'm so grateful it did. Out of all the stars in this universe, I'm glad I got to know you, grow closer to you, and share this story with you. Happy birthday, Nissuuu. Here's to all the moments we haven't made yet. ♡</p><button className="primary-button" onClick={() => setShowLetter(true)}>One last thing… <Heart size={15}/></button></div>}
        <div className="media-card">
          <div className="media-icon"><Music2 size={21}/></div><div className="media-copy"><strong>A little message from me to you</strong><span>A voice note, a video, or just a few words from my heart.</span></div>
          <button className="play-button" onClick={() => setShowMedia(true)} aria-label="Open voice or video message"><Play size={17} fill="currentColor"/></button>
        </div>
        <p className="signoff">made with all my love <Heart size={12} fill="currentColor"/> for Nissuuu</p>
      </section>

      {entered && <div className="journey-controls">
        <button className="journey-back" onClick={() => setActiveStep((step) => Math.max(0, step-1))} disabled={activeStep === 0}>← Back</button>
        <span className="journey-hint">{activeStep === 3 && openedStars.length < 7 ? `Discover all 7 stars (${openedStars.length}/7)` : activeStep === 4 && !albumComplete ? `View all memories (${albumIndex + 1}/${photoFiles.length - 3})` : activeStep === 5 && receivedGifts.length < 4 ? `Receive all 4 gifts (${receivedGifts.length}/4)` : activeStep === 6 && !quizDone ? "Finish the little quiz to continue" : activeStep === 7 && !candlesOut ? "Make a wish to reveal your letter" : activeStep === 7 ? "Your birthday universe is complete ♡" : "Your next little moment is waiting"}</span>
        {activeStep < 7 ? <button className="journey-next" onClick={nextStep} disabled={!stepComplete}>{activeStep === 6 ? "Continue to the cake" : activeStep === 5 ? "All gifts received ✓" : "Next ✦"}</button> : <button className="journey-next" onClick={() => setShowLetter(true)}>Read your letter ♡</button>}
      </div>}
      <footer className="journey-footer"><span>FOR NISSUUU, ALWAYS ✦</span><span>ONE LITTLE UNIVERSE · A MILLION LITTLE FEELINGS</span></footer>

      {activeGift !== null && <div className="modal-backdrop" onClick={() => setActiveGift(null)}><div className="modal gift-modal" onClick={e => e.stopPropagation()}><button className="close-modal" onClick={() => setActiveGift(null)} aria-label="Close"><X size={19}/></button><div className="modal-sparkle"><Gift size={25}/></div><p className="eyebrow">{gifts[activeGift].label}</p><h2>{gifts[activeGift].title}</h2><p>{receivedGifts.includes(activeGift) ? "You’ve marked this gift as received. Now come give me a smile. ♡" : "Your gift is waiting for you in real life. Come and receive it from me, then tap the button below when it’s yours. ♡"}</p><p className="gift-note">{gifts[activeGift].message}</p>{!receivedGifts.includes(activeGift) ? <button className="primary-button" onClick={() => {setReceivedGifts(prev => [...prev, activeGift]);setActiveGift(null);}}>I’ve received my gift! <Check size={15}/></button> : <button className="primary-button" onClick={() => setActiveGift(null)}>Keep this close <Heart size={15}/></button>}</div></div>}
      {activePhoto && <div className="modal-backdrop" onClick={() => setActivePhoto(null)}><div className="modal photo-modal" onClick={e => e.stopPropagation()}><button className="close-modal" onClick={() => setActivePhoto(null)} aria-label="Close"><X size={19}/></button><div className="photo-modal-art"><img src={`/photos/${activePhoto.photo}`} alt={activePhoto.caption || activePhoto.title}/></div><p className="eyebrow">{activePhoto.date}</p><h2>{activePhoto.title}</h2><p>{activePhoto.text}</p><button className="primary-button" onClick={() => setActivePhoto(null)}>A memory to keep <Heart size={15}/></button></div></div>}
      {showLetter && <div className="modal-backdrop" onClick={() => setShowLetter(false)}><div className="modal letter-modal" onClick={e => e.stopPropagation()}><button className="close-modal" onClick={() => setShowLetter(false)} aria-label="Close"><X size={19}/></button><div className="letter-paper"><span className="eyebrow">TO MY NISSUUU</span><h2>For you, always.</h2><p>Happy birthday, my Nissuuu. It's funny to think that a birthday wish last year became all of this. We started as friends from our BCA days at REVA University, and little by little, you became someone so close to my heart. I can't point to one exact day when everything changed, and I can't pick one favourite memory because every moment with you is special to me.</p><p>Thank you for every conversation, every hangout, every laugh, and every little moment that brought us closer. I hope this new year brings you so much happiness. And I hope we get to make a thousand more memories — because choosing just one favourite with you will always be impossible.</p><p className="letter-sign">With all my love,<br/>your person ♡</p><small>PERSONALIZE THIS LETTER IN src/main.jsx BEFORE SHARING</small></div></div></div>}
      {showMedia && <div className="modal-backdrop" onClick={() => setShowMedia(false)}><div className="modal media-modal" onClick={e => e.stopPropagation()}><button className="close-modal" onClick={() => setShowMedia(false)} aria-label="Close"><X size={19}/></button><div className="modal-sparkle"><Music2 size={25}/></div><p className="eyebrow">A MESSAGE FROM YOUR PERSON</p><h2>Press play, Nissuuu.</h2><p>A little message, saved just for you. Put on your headphones and listen whenever you need a smile. ♡</p><div className="audio-player"><Music2 size={20}/><audio controls preload="metadata" src="/voice-note.mp3">Your browser does not support audio playback.</audio></div><p className="small-muted">A little voice note, just for you. ♡</p><button className="primary-button" onClick={() => setShowMedia(false)}>Keep this close <Heart size={15}/></button></div></div>}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
