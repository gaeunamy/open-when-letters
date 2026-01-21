import React, { useState, useEffect, useRef } from "react";
import './index.css';

// [불꽃놀이 컴포넌트]
const FireworkCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const createParticle = (x, y, color) => {
      const particleCount = 30; // 폭발 시 파티클 개수
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: x,
          y: y,
          radius: Math.random() * 3 + 1,
          color: color,
          velocity: {
            x: (Math.random() - 0.5) * 6,
            y: (Math.random() - 0.5) * 6
          },
          alpha: 1,
          decay: Math.random() * 0.015 + 0.005 // 사라지는 속도
        });
      }
    };

    const colors = ['#ff0043', '#14fc56', '#1e90ff', '#ffe87f', '#ffffff'];
    
    // 자동 폭발 루프
    let timer = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(5, 7, 13, 0.2)'; // 잔상 효과
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 일정 시간마다 랜덤 폭발
      timer++;
      if (timer % 25 === 0) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.6); // 화면 상단 60% 영역에서만
        const color = colors[Math.floor(Math.random() * colors.length)];
        createParticle(x, y, color);
      }

      // 파티클 업데이트
      particles.forEach((p, index) => {
        if (p.alpha > 0) {
          p.velocity.y += 0.05; // 중력
          p.x += p.velocity.x;
          p.y += p.velocity.y;
          p.alpha -= p.decay;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        } else {
          particles.splice(index, 1);
        }
      });
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', // 클릭 통과
        zIndex: 15 // 별(0)보다 위, 메시지창(20)보다 아래
      }}
    />
  );
};

const CourageAudio = ({ onPlayStatusChange }) => { // 1. props 추가
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handlePlay = () => {
    setIsPlaying(true);
    if (onPlayStatusChange) onPlayStatusChange(true); // 2. 재생 알림
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (onPlayStatusChange) onPlayStatusChange(false); // 3. 정지 알림
  };

  return (
    <div className="audio-wrapper">
      <div className="audio-label">🎧 용기가 필요한 너에게</div>
      
      {/* 별 입자 효과만 */}
      {isPlaying && (
        <div className="audio-effects">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="star-particle"
              style={{
                left: `${5 + Math.random() * 90}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      
      <audio 
        ref={audioRef}
        controls 
        className="custom-audio"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handlePause}
      >
        <source src="/voice1.m4a" type="audio/mp4" />
        브라우저가 오디오를 지원하지 않습니다.
      </audio>
    </div>
  );
};
const GaeunDiagnosis = ({ onBack }) => {
  // 1. 초기 상태 설정
  const [phase, setPhase] = useState('intro'); 
  // [중요] 초기값을 ''(빈 문자열)로 설정 -> CSS에서 opacity: 0 상태로 시작
  const [fadeClass, setFadeClass] = useState(''); 

  const [volume, setVolume] = useState(0);
  const [randomResult, setRandomResult] = useState("");
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  const results = [
    "'가은 결핍증'입니다. \n즉시 가은이에게 보이스톡을 거세요.",
    "음... 엄살은 아니군요. \n당장 이불 속으로 들어가서 맛있는 간식 먹으며 푹 쉬세요! 명령입니다.",
    "많이 피곤한가 봐요. 따뜻한 물 마시고 꿀잠 자기!",
    "마음이 서러워서 생긴 병이네요. \n가은쌤이 실시간으로 응원 기운 보내는 중...",
    "이건 약도 없어요. \n가은이랑 맛있는 거 먹어야 낫는 병입니다. 한국 올 날만 기다리기!"
  ];

  // 2. 인트로 애니메이션 효과
  useEffect(() => {
    if (phase === 'intro') {
      // (1) 0.1초 뒤에 'fade-in' 클래스 추가 -> 서서히 나타남
      const fadeInTimer = setTimeout(() => {
        setFadeClass('fade-in'); 
      }, 100);

      // (2) 3초 뒤 'fade-out' 클래스로 변경 -> 서서히 사라짐
      const fadeOutTimer = setTimeout(() => {
        setFadeClass('fade-out'); // [수정] setIntroFade -> setFadeClass
      }, 3000);

      // (3) 4초 뒤(사라진 후) 다음 단계로 이동
      const nextPhaseTimer = setTimeout(() => {
        setPhase('idle');
      }, 4500);

      return () => {
        clearTimeout(fadeInTimer);
        clearTimeout(fadeOutTimer);
        clearTimeout(nextPhaseTimer);
      };
    }
  }, [phase]);

  // 음성 감지 시작
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      const updateVolume = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average);
        animationRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
      setPhase('recording');
    } catch (err) {
      alert("마이크 권한이 필요해요!");
    }
  };

  // 진단 시작
  const handleStop = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    
    setPhase('processing');
    
    setTimeout(() => {
      const pick = results[Math.floor(Math.random() * results.length)];
      setRandomResult(pick);
      setPhase('result');
    }, 4500);
  };

  return (
    <div className="diagnosis-container" style={{ textAlign: 'center', position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* 3. 인트로 레이어 */}
      {/* [수정] 변수명 introFade -> fadeClass로 변경 */}
      {phase === 'intro' && (
        <div className={`intro-overlay ${fadeClass}`}>
          <div className="intro-message">
            안녕하세요<br/>
            <b>가은쌤의 마음클리닉</b>입니다.<br/><br/>
            <span style={{ fontSize: '1rem', opacity: 0.9 }}>
              버튼을 누르고 증상을 얘기해 주세요.
            </span>
          </div>
        </div>
      )}

      <div className="color-burst-container">
        <div className={`color-burst-effect ${phase === 'result' ? 'active' : ''}`} />
      </div>

      {phase !== 'intro' && (
        phase !== 'result' ? (
          <div style={{ animation: 'fadeIn 1s ease-in' }}>
            <div 
              className={`breathing-circle ${phase === 'processing' ? 'processing-pulse' : ''}`}
              style={{ 
                transform: `scale(${1 + volume / 100})`,
                margin: '0 auto 100px'
              }} 
            />
            
            <div className="diagnosis-guide">
              {phase === 'idle' && "버튼을 누르고 어디가 아픈지 말해줘"}
              {phase === 'recording' && "가은쌤이 듣고 있어... (말하는 중)"}
              {phase === 'processing' && <span className="flashing-text">진단 중... 가은쌤 분석 중...</span>}
            </div>

            <button 
              className={`mic-button ${phase === 'recording' ? 'active' : ''}`}
              onMouseDown={startListening}
              onMouseUp={handleStop}
              onTouchStart={startListening}
              onTouchEnd={handleStop}
              disabled={phase === 'processing'}
            >
              {phase === 'recording' ? "🎤" : "🎙️"}
            </button>
          </div>
        ) : (
          <div className="finish-container">
            <div className="message-content" style={{ fontSize: '1.2rem', color: '#ffe87f', whiteSpace: 'pre-wrap' }}>
              {randomResult}
            </div>
            <button className="bored-trigger-btn" onClick={onBack} style={{ marginTop: '40px' }}>
              돌아가기
            </button>
          </div>
        )
      )}
    </div>
  );
};

const BreathingCircle = () => {
  const [phase, setPhase] = useState('inhale');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <>
      <div className={`breathing-circle ${phase}`} />
      <div className="breathing-text">
        원을 따라 천천히 호흡해 보세요.
      </div>
    </>
  );
};

const HuggingButton = () => {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showFinishText, setShowFinishText] = useState(false);
  const intervalRef = useRef(null);
  const burstTimerRef = useRef(null);

  const handleStart = () => {
    setPressing(true);
    setCompleted(false);
    setShowFinishText(false);
    let count = 0;
    
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);

    intervalRef.current = setInterval(() => {
      if (navigator.vibrate) {
        navigator.vibrate([70, 100, 70]);
      }
      
      count += 0.1;
      setProgress(count);
      
      if (count >= 3) {
        clearInterval(intervalRef.current);
        setCompleted(true);
        setPressing(false);

        // 3초 완료 시점에 버스트 효과를 보여주고 0.8초 뒤 멘트 표시
        burstTimerRef.current = setTimeout(() => {
          setShowFinishText(true);
        }, 800); 
      }
    }, 800);
  };

  const handleEnd = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!completed) {
      setPressing(false);
      setProgress(0);
    }
  };

  // 진행도에 따라 하트 컨테이너가 커짐
  const containerScale = 1 + (progress * 0.6);

  return (
    <div style={{ position: 'relative', textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* 색감이 퍼지는 버스트 효과 레이어 */}
      <div className="color-burst-container">
        <div 
          className={`color-burst-effect ${completed && !showFinishText ? 'active' : ''}`} 
          style={{
            // [수정] 포옹 기능에서만 분홍색 하트 파동이 퍼지도록 인라인 스타일 적용
            background: 'radial-gradient(circle, rgba(255, 122, 144, 0.9) 0%, rgba(255, 122, 144, 0.4) 50%, transparent 100%)'
          }}
        />
      </div>

      {!completed ? (
        <div style={{ opacity: completed ? 0 : 1, transition: 'opacity 0.3s' }}>
          <div style={{
            fontSize: '1rem', color: '#ffe87f', marginBottom: '40px', opacity: 0.8,
            visibility: pressing ? 'hidden' : 'visible'
          }}>
            3초간 꾹 눌러봐
          </div>
          
          <div
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
            className="heart-container"
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              transform: `scale(${containerScale})`,
              margin: '0 auto'
            }}
          >
            {/* 누를 때 beating 클래스가 붙어 두근거림 */}
            <div className={`css-heart ${pressing ? 'beating' : ''}`} />
          </div>
        </div>
      ) : showFinishText ? (
        <div className="finish-container">
          <div className="heart-container finish-heart">
             <div className="css-heart" style={{ transform: 'rotate(-45deg) scale(1)' }} />
          </div>
          <div className="praise-finish-text">
            포옹 에너지 전달 완료!
          </div>
        </div>
      ) : null}
    </div>
  );
};

const ScratchCard = () => {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const messages = [
    { text: "오늘은 맛있는 디저트 먹기 🍰", sub: "달콤한 게 최고의 약이야!" },
    { text: "좋아하는 음악 들으며 산책하기 🎵", sub: "날씨 좋으면 더 좋고!" },
    { text: "오늘 하루는 그냥 쉬어도 돼 💤", sub: "충전의 시간도 필요해" },
    { text: "친구한테 수다 떨기 📞", sub: "말하다 보면 기분이 풀릴 거야" },
    { text: "좋아하는 영화/드라마 정주행 🎬", sub: "현실 도피도 가끔은 필요해" },
    { text: "따뜻한 차 한 잔 마시기 ☕", sub: "여유를 가져봐" },
    { text: "고양이 영상 보기 🐱", sub: "귀여운 게 힐링이지!" },
    { text: "일찍 자고 푹 쉬기 😴", sub: "내일은 더 나아질 거야" },
  ];

  const [currentMessage] = useState(() => messages[Math.floor(Math.random() * messages.length)]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정
    canvas.width = 320;
    canvas.height = 200;

    // 스크래치 영역 그리기 (은색 코팅)
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 텍스트
    ctx.fillStyle = '#666';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('문질러서 확인하세요!', canvas.width / 2, canvas.height / 2);
    
  }, []);

  const scratch = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let x, y;
    if (e.type.includes('touch')) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // 긁힌 정도 계산
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    
    const percent = (transparent / (pixels.length / 4)) * 100;
    setScratchPercent(percent);

    if (percent > 70 && !revealed) {
      setRevealed(true);
    }
  };

  const handleStart = () => setIsScratching(true);
  const handleEnd = () => setIsScratching(false);

  return (
    <div style={{ textAlign: 'center', userSelect: 'none' }}>
      <div style={{
        fontSize: '1rem',
        color: '#ffe87f',
        marginBottom: '30px',
        opacity: 0.8
      }}>
        {revealed ? '💝' : '손가락으로 문질러봐!'}
      </div>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* 뒷면 (숨겨진 메시지) */}
        <div style={{
          width: '320px',
          height: '200px',
          background: 'linear-gradient(135deg, rgba(255, 232, 127, 0.2), rgba(255, 200, 100, 0.2))',
          border: '2px solid #ffe87f',
          borderRadius: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          gap: '15px'
        }}>
          <div style={{
            fontSize: '1.3rem',
            color: '#ffe87f',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            {currentMessage.text}
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 232, 127, 0.8)',
            textAlign: 'center'
          }}>
            {currentMessage.sub}
          </div>
        </div>

        {/* 스크래치 레이어 */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseMove={isScratching ? scratch : null}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onTouchMove={scratch}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            cursor: 'pointer',
            borderRadius: '15px',
            opacity: revealed ? 0 : 1,
            transition: 'opacity 0.5s'
          }}
        />
      </div>

      {revealed && (
        <div style={{
          marginTop: '30px',
          color: 'rgba(255, 232, 127, 0.7)',
          fontSize: '0.9rem',
          animation: 'fadeIn 0.5s'
        }}>
          ✨ 오늘 하루 화이팅! ✨
        </div>
      )}
    </div>
  );
};

const stars = [
  { id: 1, x: 12, y: 8, neon: false },
  { id: 2, x: 38, y: 10, neon: false },
  { id: 3, x: 62, y: 9, neon: false },
  { id: 4, x: 86, y: 11, neon: false },
  { id: 5, x: 20, y: 16, neon: true, message: "기쁠 때", fullMessage: "무슨 일이야! 좋은 일이지? 얼른 나한테 자랑해. 네가 거기서 웃으면 나도 여기서 행복해져. 오늘 그 기분 마음껏 즐겨!" },
  { id: 6, x: 48, y: 14, neon: true, message: "심심할 때", fullMessage: "심심할 땐 역시 가니 생각이지! 농담이고 바로 연락해. 시차 따윈 우리의 수다를 막을 수 없어. 아아 대기 중이다 오바!" },
  { id: 7, x: 74, y: 17, neon: true, message: "외로울 때", fullMessage: "낯선 곳이라 더 외롭지? 지구 반대편에 있어도 마음은 늘 네 옆에 있어. 고개 들고 하늘 봐, 우린 같은 하늘 아래 있잖아 (오글)" },
  { id: 9, x: 58, y: 20, neon: true, message: "그리울 때", fullMessage: "보고 싶다 황혜솔~ 우리 함께 아지트에서 나누던 수다들이 그립다. 한국 오면 바로 맛집 투어+수다 20020407시간이야. 조금만 더 힘내자!" },
  { id: 11, x: 10, y: 28, neon: true, message: "힘들 때", fullMessage: "거기서 적응하느라 얼마나 애쓰고 있는지 다 알아. 오늘만큼은 씩씩한 척 말고 그냥 투정 부려도 돼. 다 들어줄게. 고생했어 정말." },
  { id: 12, x: 34, y: 30, neon: true, message: "울적할 때", fullMessage: "기분이 축 처지는 날이네. 이럴 땐 맛있는 거 먹고 따뜻한 이불 속에 쏙 들어가. 내일은 분명 오늘보다 더 괜찮은 하루가 될 거야." },
  { id: 13, x: 60, y: 27, neon: true, message: "용기가 필요할 때", fullMessage: "겁나고 두려울 수 있어. 당연한 거야. 그래도 하나만 기억해줘. 넌 내가 아는 사람 중 제일 단단하고 멋있는 친구야. 망설이지 말고 질러! " },
  { id: 15, x: 22, y: 34, neon: true, message: "칭찬 받고 싶을 때", fullMessage: "타지에서 혼자 밥 챙겨 먹고, 공부하고, 살아가는 것만으로도 넌 진짜 대단해. 오늘 하루도 무사히 보낸 너한테 박수~~!" },
  { id: 16, x: 46, y: 36, neon: true, message: "몸이 아플 때", fullMessage: "아픈 게 제일 서러운데 어떡해... 약은 먹었어? 입맛 없어도 밥 꼭 챙겨 먹고. 푹 쉬고 얼른 나아라♡" },
  { id: 17, x: 70, y: 33, neon: true, message: "잠이 안 올 때", fullMessage: "생각이 너무 많아서 그래? 별에게 오늘 하루 있었던 일, 하고 싶은 말 다 전해봐. 네 이야기가 밤하늘을 더욱 빛나게 할 거야." },
  { id: 8, x: 30, y: 22, neon: false },
  { id: 10, x: 82, y: 24, neon: false },
  { id: 14, x: 88, y: 29, neon: false },
  { id: 18, x: 5, y: 18, neon: false },
  { id: 19, x: 95, y: 21, neon: false },
  { id: 20, x: 6, y: 32, neon: false },
  { id: 21, x: 94, y: 34, neon: false },

  // === [신규 추가] 배경 흰색 별 (화면 중간~아래 영역 채움) ===
  { id: 22, x: 15, y: 42, neon: false }, // 왼쪽 중간
  { id: 23, x: 85, y: 40, neon: false }, // 오른쪽 중간
  { id: 24, x: 55, y: 45, neon: false }, // 중앙
  { id: 25, x: 32, y: 50, neon: false }, // 왼쪽 아래
  { id: 26, x: 78, y: 50, neon: false }, // 오른쪽 아래
  { id: 27, x: 5, y: 47, neon: false },  // 왼쪽 구석
  { id: 30, x: 90, y: 45, neon: false }, // 오른쪽 하단
  { id: 32, x: 50, y: 38, neon: false }, // 중앙 상단 빈 곳 채움
];

const ariesPathIds = [5, 6, 9, 13];

const balanceGameList = [
  { id: 1, q1: "웃음 참아야 할 상황에서만 터짐", q2: "웃어도 되는 상황에서만 웃음 안 나옴" },
  { id: 2, q1: "평생 양말이 항상 한 짝씩만 사라짐", q2: "양말은 멀쩡한데 신발에서 항상 삑삑 소리남" },
  { id: 3, q1: "재채기할 때마다 이상한 소리 나옴 (랜덤)", q2: "하품하면 눈물이 오열하듯이 나옴" },
  { id: 4, q1: "사람들이 내 농담을 10초 후에 이해함", q2: "바로 이해하는데 아무도 안 웃음" },
  { id: 5, q1: "회의 때 한 말만 꼭 밈으로 돌아다님", q2: "아무 말도 안 했는데 내 이름이 밈이 됨" },
  { id: 6, q1: "잠꼬대가 항상 인생 명언", q2: "말실수하면 항상 랩처럼 라임 맞음" },
  { id: 7, q1: "연인이 나를 볼 때마다 자동으로 함박웃음(무음)", q2: "내 이름만 불러도 얼굴 빨개짐" },
  { id: 8, q1: "싸워도 먼저 사과하면서 ‘그래도 사랑해’ 덧붙임", q2: "사과는 안 하는데 이불 같이 덮고 자자고 함" },
  { id: 9, q1: "연인이 내 손잡을 때마다 괜히 힘줌", q2: "걸을 때 항상 내 쪽으로 몸 기울어짐" },
  { id: 10, q1: "연인이 나랑 헤어질 상상만 해도 울어버림", q2: "연인이 ‘우리 나중에 어떻게 늙을지’ 매일 말함" },
  { id: 11, q1: "연인이 나 부를 때 항상 별명 + 애칭 풀콤보", q2: "연인이 나 부를 때 항상 풀네임 + 진지한 눈빛" },
  { id: 12, q1: "교수님이 내 얼굴은 확실히 기억함 (이유는 모름)", q2: "이름은 아시는데 얼굴을 모르심 (예시 들 때 항상 혜솔이는~ 이러심)" },
  { id: 13, q1: "팀플에서 내가 말하면 다들 메모함 (매우 진지)", q2: "내가 말만 하면 웃음 터짐 (내용은 안 중요)" },
  { id: 14, q1: "인사할 때 포옹 타이밍 매번 어색", q2: "작별 인사에서 혼자만 손 흔듦" },
  { id: 15, q1: "파티에서 딱 한 번 춤췄는데 그 영상이 돌고 있음", q2: "한 번도 안 춰서 ‘전설의 미스터리녀’로 불림" }
];

const gaeunTmiList = [
  "1. 가은이는 고딩 때 비공식 성우로 활동한 적이 있다. \n(정말 “비공식”임)",
  "2. 가은이가 먹을 수 있는 오이 요리는 피클과 오이짠지무침 뿐이다. \n(무려 2개나 있음ㄷㄷ)",
  "3. 가은이는 소문난 문구 덕후이다. \n(근데 이제 한 명만 알고 있는)",
  "4. 가은이는 구름 한 점 없는 푸른 하늘의 날씨를 좋아한다. \n(정말 구름 1도 없어야 한다)",
  "5. 가은이가 초딩 때 수학 교과서에 있는 정의를 한 글자도 틀리지 않고 말한 적이 있다. \n(근데 지금은 기억력 왜 이 모양)",
  "6. 가은이는 방송부를 하며 매주 화요일마다 반에 늦게 들어갔다. \n(종 친 후에 들어가 문을 열면 모든 친구들이 나를 돌아보는 삶, 이게 슈스지 뭐야. 아마 이때부터 약간 관종이 된 게 아닐까 싶다)",
  "7. 가은이는 비 오는 날에 우산 안 쓰고 다니는 걸 좋아한다. \n(하지만 미친 여자처럼 보일까봐 자제 중이다)",
  "8. 가은이는 이미 웨딩드레스와 웨딩홀을 확정 지어놨다. \n(물론 예약금 안 넣었다 아직은. 비커즈...유 노 왓 암 생?)",
  "9. 가은이는 패션 리더가 되고 싶어하며 실제로 크롭티 유행의 선두자다. \n(고딩 때는 친구들의 코디로 일한 적이 있다. 이 또한 “비공식”이다. 특히 사이즈 문의 필요하면 언제나 환영)",
  "10. 가은이는 지금 혜솔이가 보고 싶다."
];

const praiseData = {
  "학업·일": "황혜솔 공부 잘하는 거 모르는 사람 있냐?\n일단 나는 잘하는 거 진작에 알고 있었다.\n\n거기서도 잘하는 건 반칙이세요🙏",
  "인간관계": "파워 인싸가 되었다는 소식 들었다.\n역시 넌 E야.\n\n뭐? 남친도 생겼다고? 이 사람 봐라.\n우리한테 바로 얘기해줘야지. 얼른 카톡 ㄱ",
  "갓생·생활": "공부도 하고 친구도 사귀고 파티도 하고\n여행도 다니며 우리랑 연락도 계속하고..\n\n너 이거 갓생이야. 너 갓생러야.",
  "용기·도전": "넌 이미 혼자서 새로운 곳에 가서\n새로운 사람을 만나고 새로운 하루를 보내고 있잖아.\n\n이거 모두 용기가 없으면 할 수 없는 일인 거 알지?\n넌 용감하고 대단한 사람이야. 늘 기억해.",
  "멘탈관리": "이야 그 상황에서 화도 안 내고/울지도 않고/웃지도 않고/욕도 안 하고 어떻게 참았냐.(나였으면 이미 박살 내거나/울거나/욕먹거나 셋 중 하나다)\n\n넌 정말 성숙한 사람이야.\n너가 오늘 참고 넘어간 건 너가 부족해서가 아니야.\n\n걔가 이상한 거지. 웃기는 놈들이네.\n카톡으로 다 풀어!!!",
  "그냥": "넌 최고야\n\n다 뿌셔버려"
};

// 사진 파일 목록
const myPhotos = [
  import.meta.env.VITE_PHOTO_1,
  import.meta.env.VITE_PHOTO_2,
  import.meta.env.VITE_PHOTO_3,
  import.meta.env.VITE_PHOTO_4,
  import.meta.env.VITE_PHOTO_5,
];

function App() {

  useEffect(() => {
    // 접속한 기기가 안드로이드인지 확인
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.indexOf("android") > -1;
    
    if (isAndroid) {
      document.documentElement.classList.add('android');
    } else if (/iphone|ipad|ipod/.test(ua)) {
      document.documentElement.classList.add('ios');
    }
  }, []);

useEffect(() => {
  myPhotos.forEach((src) => {
    const img = new Image();
    img.src = src; // 브라우저가 이 코드를 읽는 순간 미리 사진을 다운로드
  });
}, []);

// 사용법 모달 상태 
const [showGuide, setShowGuide] = useState(false);

// 오디오 재생 상태 관리
const [isAudioPlaying, setIsAudioPlaying] = useState(false);

// 힘들 때
const [showBreathing, setShowBreathing] = useState(false);

// 울적할 때
const [showScratch, setShowScratch] = useState(false);

// 몸이 아플 때
const [showDiagnosis, setShowDiagnosis] = useState(false);

// 칭찬받고 싶을 때
const [activePraise, setActivePraise] = useState(null);

// 잠이 안 올 때
const [showStarLetter, setShowStarLetter] = useState(false); // 편지지 모달
const [starMessage, setStarMessage] = useState("");         // 입력 메시지
const [userStars, setUserStars] = useState([]);             // 하늘에 띄워진 별들 목록
const [isFlying, setIsFlying] = useState(false);             // 날아가는 애니메이션 중인지

// 텍스트가 길어지면 별의 중앙을 유지하며 높이를 조절
const handleTextChange = (e) => {
  const target = e.target;
  const maxHeight = 140;

  // 1. 현재 높이를 잠시 기억해둡니다.
  const previousHeight = target.style.height;
  
  // 2. 높이를 측정하기 위해 잠시 초기화합니다.
  target.style.height = 'auto';
  const currentScrollHeight = target.scrollHeight;

  // 3. 만약 새 높이가 한계선을 넘는다면?
  if (currentScrollHeight > maxHeight) {
    // [중요] 높이를 초기화(auto) 상태로 두지 않고, 이전 높이로 되돌립니다.
    target.style.height = previousHeight;
    return; // 더 이상 글자가 적히지 않게 차단!
  }

  // 4. 한계선 이하라면 정상적으로 글자를 업데이트하고 높이를 맞춥니다.
  setStarMessage(target.value);
  target.style.height = currentScrollHeight + 'px';
};

const handleSendStar = () => {
  if (!starMessage.trim()) return;

  const targetX = Math.random() * 85 + 8;
  const targetY = Math.random() * 55 + 8;

  setSelectedStar(null);
  setIsFlying(true);

  setTimeout(() => {
    const newStar = {
      id: Date.now(),
      x: targetX,
      y: targetY,
      message: starMessage
    };

    const updatedStars = [...userStars, newStar];
    
    setUserStars(updatedStars);
    localStorage.setItem('stars', JSON.stringify(updatedStars));

    setIsFlying(false);
    setShowStarLetter(false);
    setStarMessage("");
  }, 800);
};

// 사이트 접속 시 저장된 별을 불러오는 기능입니다.
useEffect(() => {
  const savedStars = localStorage.getItem('stars');
  if (savedStars) {
    // 저장된 글자 데이터를 다시 배열 형태로 바꿔서 화면에 띄웁니다.
    setUserStars(JSON.parse(savedStars));
  }
}, []); 

// 별 수거 확인 모달 상태
const [showStarCollectModal, setShowStarCollectModal] = useState(false);

const handleCollectStars = () => {
  // 별 개수 카운트
  const count = userStars.length;
  setCollectedCount(count);

  // 별 삭제
  setUserStars([]); // 화면에서 삭제
  localStorage.removeItem('stars'); // 저장소에서 삭제

  setShowStarCollectModal(false);
  
  setTimeout(() => {
    setShowCollectionCompleteModal(true);
  }, 500);

  setShowStarLetter(false); // 편지지도 닫기
};

const handleCancelCollect = () => {
  setShowStarCollectModal(false);
};

const handleCloseCompleteModal = () => {
  setShowCollectionCompleteModal(false);
};

// 수거 완료 모달 상태
const [showCollectionCompleteModal, setShowCollectionCompleteModal] = useState(false);

// 방금 수거한 별의 개수 저장
const [collectedCount, setCollectedCount] = useState(0);

// 심심할 때-밸겜
const [showBalanceModal, setShowBalanceModal] = useState(false);
const [balanceSelections, setBalanceSelections] = useState({}); // { 1: 'q1', 2: 'q2' } 형태로 저장

// 심심할 때-노래방
const [showKaraoke, setShowKaraoke] = useState(false);

// 심심할 때-TMI
const [showTmiModal, setShowTmiModal] = useState(false);

  const [activeStar, setActiveStar] = useState(null);
  const [lastActiveStar, setLastActiveStar] = useState(null);
  const [selectedStar, setSelectedStar] = useState(null);
  const [clickPosition, setClickPosition] = useState({ x: 50, y: 50 });
  const [showConstellation, setShowConstellation] = useState(false);
  const [activatedAriesStars, setActivatedAriesStars] = useState([]);

  const [showHiddenQuestion, setShowHiddenQuestion] = useState(false);
  const [showHiddenPhoto, setShowHiddenPhoto] = useState(false);
  
  const [photoIndex, setPhotoIndex] = useState(0);

  // 심심할 때 메뉴 상태
  const [showBoredMenu, setShowBoredMenu] = useState(false);

  // 외로울 때 기능 상태
  const [showHugging, setShowHugging] = useState(false);

  // 스와이프 감지용 상태
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const activationTimings = [0, 2020, 3110, 3800];

  const [isAriesSeason] = useState(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate(); 
    return currentMonth === 3 && currentDay <= 12;
  });

  // // [테스트용] 양자리 
  // const [isAriesSeason] = useState(true);

  const starsLayerRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    if (isAriesSeason) {
      const constellationTimer = setTimeout(() => {
        setShowConstellation(true);
      }, 7000);

      return () => {
        clearTimeout(constellationTimer);
      };
    }
  }, [isAriesSeason]);

  useEffect(() => {
    if (showConstellation && isAriesSeason) {
      ariesPathIds.forEach((id, index) => {
        setTimeout(() => {
          setActivatedAriesStars(prev => [...prev, id]); 
        }, activationTimings[index]);
      });
    }
  }, [showConstellation, isAriesSeason]);

  const startStarCycle = (startIndex = 0) => {
    if (isAriesSeason) return; 

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const messageStars = stars.filter((s) => s.neon);
    let index = startIndex;

    intervalRef.current = setInterval(() => {
      if (lastIndexRef.current !== -1 && messageStars[lastIndexRef.current]) {
         const fadingStarId = messageStars[lastIndexRef.current].id;
         setLastActiveStar(fadingStarId);
         setTimeout(() => {
           setLastActiveStar((prev) => (prev === fadingStarId ? null : prev));
         }, 2500);
      }
      setActiveStar(null);
      timeoutRef.current = setTimeout(() => {
        if (messageStars.length > 0) {
            index = index % messageStars.length;
            setActiveStar(messageStars[index].id);
            lastIndexRef.current = index;
            index++;
        }
      }, 200);
    }, 2800);
  };

  useEffect(() => {
    const introTimeout = setTimeout(() => {
      if (!isAriesSeason) {
        startStarCycle(lastIndexRef.current + 1);
      }
    }, 3500); 

    return () => {
      clearTimeout(introTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isAriesSeason]);

  useEffect(() => {
    if (!selectedStar) {
      if (!isAriesSeason && lastIndexRef.current !== -1) {
        startStarCycle(lastIndexRef.current + 1);
      }
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [selectedStar, isAriesSeason]);

  const handleStarClick = (star, event) => {
    if (isAriesSeason && !ariesPathIds.includes(star.id)) return;
    if (!isAriesSeason && !star.neon) return;
    
    // showBoredMenu가 켜져 있을 때도 클릭 방지
    if (showHiddenQuestion || showHiddenPhoto || showBoredMenu) return;

    let canClick = false;
    if (isAriesSeason) {
        canClick = activatedAriesStars.includes(star.id);
    } else {
        canClick = activeStar === star.id || lastActiveStar === star.id;
    }

    if (!canClick) return;

    if (isAriesSeason) return;

    const targetStars = isAriesSeason 
      ? stars.filter(s => ariesPathIds.includes(s.id))
      : stars.filter(s => s.neon);

    const clickedIndex = targetStars.findIndex((s) => s.id === star.id);
    if (clickedIndex !== -1) {
      lastIndexRef.current = clickedIndex;
    }

    // 클릭 위치 저장 (Wrapper 기준이므로 별도 보정 없이 그대로 사용)
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (rect.left / window.innerWidth) * 100;
    const y = (rect.top / window.innerHeight) * 100;

    setClickPosition({ x, y });
    setSelectedStar(star);

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (!isAriesSeason) setActiveStar(null); 
  };

  const handleReset = () => {
    // 별 편지지가 열려있을 때는 별 수거 확인 모달 띄우기
    if (showStarLetter && !isFlying) {
      setShowStarCollectModal(true);
      return;
    }
  
    if (selectedStar && selectedStar.id === 9 && !showHiddenQuestion && !showHiddenPhoto) {
      setShowHiddenQuestion(true);
      return;
    }
  
    // 모든 상태 초기화
    setSelectedStar(null);
    setShowHiddenQuestion(false);
    setShowHiddenPhoto(false);
    setShowBoredMenu(false);
    setActivePraise(null);
    setPhotoIndex(0); 
    setTouchStart(0);
    setTouchEnd(0);
    setShowBreathing(false);
    setShowKaraoke(false);
    setShowHugging(false);
    setShowScratch(false); 
    setShowStarLetter(false);
  
    if (!isAriesSeason) {
        setActiveStar(null);
        setLastActiveStar(null); 
    }
  };

  const handleAnswer = () => {
    setShowHiddenQuestion(false);
    setShowHiddenPhoto(true);
  };

  // 다음 사진
  const handleNextPhoto = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % myPhotos.length);
  };

  // 이전 사진
  const handlePrevPhoto = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? myPhotos.length - 1 : prev - 1));
  };

  // 터치 시작
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  // 터치 이동
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // 터치 끝 (스와이프 판단)
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; 

    if (distance > minSwipeDistance) {
      handleNextPhoto(null);
    } else if (distance < -minSwipeDistance) {
      handlePrevPhoto(null);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // 심심 메뉴 각 버튼 핸들러
  const handleBalanceGame = () => { 
    setShowBalanceModal(true);
    setShowBoredMenu(false); 
  };
  const handleTMI = () => { 
    setShowTmiModal(true);
    setShowBoredMenu(false); 
  };
  const handleKaraoke = () => { 
    setShowKaraoke(true);
    setShowBoredMenu(false);
  };

  const handleSelectOption = (gameId, option) => {
    setBalanceSelections(prev => ({
        ...prev,
        [gameId]: option
    }));
  };

  // 칭찬 버튼 클릭 핸들러
  const handlePraiseClick = (key) => {
    // 이미 선택된 버튼을 다시 누르면 원래 메시지로 돌아감
    if (activePraise === key) {
      setActivePraise(null);
    } else {
      setActivePraise(key);
    }
  };

  const getPathD = () => {
    if (ariesPathIds.length === 0) return "";
    const points = ariesPathIds.map(id => stars.find(s => s.id === id)).filter(Boolean);
    if (points.length === 0) return "";
    return points.reduce((acc, point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${acc} ${command} ${point.x} ${point.y}`;
    }, "");
  };

  return (
    <div className="sky">
      <div className="intro-text">
        유난히 반짝이는 별을 찾아보세요.<br/>
        당신을 위한 따뜻한 이야기가 기다리고 있습니다.
      </div>

      {showConstellation && (
        <svg 
          className="constellation-svg"
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <path 
            pathLength="1"
            d={getPathD()} 
            className="constellation-path" 
            style={{ animation: `drawPath 40s linear forwards` }}
          />
        </svg>
      )} 
      
      {/* 별 레이어 - 클릭 영역 확장을 위해 구조 변경 */}
      <div className="stars-layer" ref={starsLayerRef}>
        {stars.map((star) => {
          const isTargetStar = isAriesSeason 
            ? ariesPathIds.includes(star.id)
            : star.neon;

          let isActive = false;
          if (isAriesSeason) {
            isActive = activatedAriesStars.includes(star.id);
          } else {
            isActive = activeStar === star.id;
          }

          const isClickable = isAriesSeason 
          ? (isTargetStar && isActive) 
          : (isTargetStar && (isActive || lastActiveStar === star.id));

          const activeStyle = (isAriesSeason && isActive) ? {
            animation: `starGlow ${2 + (star.id % 4) * 0.5}s infinite ease-in-out`,
            animationDelay: '2.5s' /* 중요: 등장 효과(2.5s)가 끝난 뒤 실행 */
          } : {};

          return (
            <div 
              key={star.id}
              className={`star-wrapper ${isClickable ? "clickable" : ""}`}
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
              onClick={(e) => {
                if (isClickable) handleStarClick(star, e);
              }}
            >
              {/* 별 본체에 activeStyle(애니메이션) 적용 */}
              <div
                className={`star ${
                  isTargetStar
                    ? `star-message ${isActive ? "star-active" : ""}`
                    : "star-background"
                }`}
                style={activeStyle} 
              />
        
              {/* 텍스트 라벨 */}
              {isTargetStar && star.message && !isAriesSeason && (
                <div
                  className={`star-message-label ${isActive ? "active" : ""}`}
                >
                  {star.message}
                </div>
              )}
            </div>
          );
        })} 
        
        {userStars.map(star => (
          <div 
            key={star.id} 
            data-star-id={star.id}
            className="user-star star-message star-active" 
            style={{ 
              position: 'absolute',
              left: `${star.x}%`, 
              top: `${star.y}%`,
            }}
            onClick={() => alert(`별의 기억: ${star.message}`)} // 클릭 시 메시지 확인
          />
        ))}
      </div>

      {selectedStar && selectedStar.id === 5 && !showHiddenQuestion && !showHiddenPhoto && (
        <FireworkCanvas />
      )} 

      <div
        className={`starlight-overlay ${selectedStar ? "active" : ""}`}
        style={{
          "--click-x": `${clickPosition.x}%`,
          "--click-y": `${clickPosition.y}%`,
        }}
      />

      <div className={`dim-overlay ${isAudioPlaying ? 'active' : ''}`} />

      {/* 기본 메시지 모달 */}
      {selectedStar && !showHiddenQuestion && !showHiddenPhoto && !showBoredMenu && 
      !showStarLetter && !showStarCollectModal && !showCollectionCompleteModal 
      && !showBalanceModal && !showTmiModal && !showKaraoke && (
        <div className={`message-modal active ${isAudioPlaying ? 'audio-playing' : ''}`}>
          <div className="message-title">{selectedStar.message}</div>
          <div className="message-content">
            {/* 15번 별(칭찬)이 아닐 때만 기본 메시지를 보여줌 */}
            {selectedStar.id !== 15 && selectedStar.fullMessage}

            {/* [추가 1] 용기가 필요할 때(ID: 13) : 오디오 플레이어 */}
            {selectedStar.id === 13 && (
              <CourageAudio onPlayStatusChange={setIsAudioPlaying} />
            )}

            {/* 울적할 때(ID: 12) : 스크래치 카드 버튼 */}
            {selectedStar.id === 12 && (
              <div style={{ marginTop: '20px' }}>
                <button 
                  className="bored-trigger-btn" 
                  onClick={() => setShowScratch(true)}
                >
                  행운의 스크래치 카드 🍀
                </button>
              </div>
            )} 
            
            {/* 몸이 아플 때(ID: 16) 섹션 */}
            {selectedStar.id === 16 && (
              <div style={{ marginTop: '20px' }}>
                <button 
                  className="bored-trigger-btn diagnosis-btn" 
                  onClick={() => setShowDiagnosis(true)}
                >
                  🚑 가은쌤한테 진단 받기
                </button>
              </div>
            )} 
            
            {/* 잠이 안 올 때(ID: 17) 섹션 */}
            {selectedStar.id === 17 && (
              <div style={{ marginTop: '20px' }}>
                <button className="bored-trigger-btn" onClick={() => setShowStarLetter(true)}>
                  ✨ 별과 얘기하기
                </button>
              </div>
            )}
            
            {/* [최종 수정] 칭찬 받고 싶을 때(ID: 15) 섹션 */}
            {selectedStar.id === 15 && (
              <div className="praise-section">
                {/* activePraise가 있을 때만 메시지를 보여줍니다. 
                  원래 있던 selectedStar.fullMessage 부분은 삭제했습니다.
                */}
                <div className="message-content" style={{ 
                  whiteSpace: 'pre-wrap', 
                  marginBottom: '30px', 
                  minHeight: '120px', 
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {activePraise ? (
                    praiseData[activePraise]
                  ) : (
                    <span style={{ opacity: 0.5, fontSize: '0.9rem' }}>
                      아래 키워드 중 하나를 선택해봐!
                    </span>
                  )}
                </div>
            
                <div className="praise-grid">
                  {Object.keys(praiseData).map((key) => (
                    <button 
                      key={key} 
                      className={activePraise === key ? "playing" : ""} 
                      onClick={() => handlePraiseClick(key)}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            )} 
            

            {/* [추가 3] 심심할 때(ID:6) 버튼 */}
            {selectedStar.id === 6 && (
              <div style={{ marginTop: '20px' }}>
                <button 
                  className="bored-trigger-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    setShowBoredMenu(true);
                  }}
                >
                  여전히 심심하다면?
                </button>
              </div>
            )} 
            
            {/* 힘들 때(ID: 11) : 숨 고르기 버튼 */}
            {selectedStar.id === 11 && (
              <div style={{ marginTop: '20px' }}>
                <button 
                  className="bored-trigger-btn" 
                  onClick={() => setShowBreathing(true)}
                >
                  함께 숨 고르기 🌬️
                </button>
              </div>
            )} 

            {/* 외로울 때(ID: 7) : 가상 포옹 버튼 */}
            {selectedStar.id === 7 && (
              <div style={{ marginTop: '20px' }}>
                <button 
                  className="bored-trigger-btn" 
                  onClick={() => setShowHugging(true)}
                >
                  포옹 보내기 💝
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 심심 메뉴 모달 */}
      {showBoredMenu && (
        <div className="bored-menu-modal active">
           <div className="bored-menu-list">
             <button onClick={handleBalanceGame}>
               N의 상상력을 자극하라!<br/>밸런스 게임
             </button>
             <button onClick={handleTMI}>
               가으니의 누구도 궁금해 하지 않은 TMI
             </button>
             <button onClick={handleKaraoke}
             onMouseEnter={(e) => e.currentTarget.blur()}
             >
               여기가 바로<br/>퀸크루즈 노래연습장
             </button>
           </div>
        </div>
      )} 
      
      {showBalanceModal && (
        <div className="hidden-modal active balance-modal">
          <div className="hidden-text balance-title">Balance Game</div>
          <div className="balance-scroll-container">
            {balanceGameList.map((game) => (
              <div key={game.id} className="balance-item">
                <div 
                  className={`balance-option ${balanceSelections[game.id] === 'q1' ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(game.id, 'q1')}
                >
                  {game.q1}
                </div>
                <div className="balance-vs">VS</div>
                <div 
                  className={`balance-option ${balanceSelections[game.id] === 'q2' ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(game.id, 'q2')}
                >
                  {game.q2}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden-buttons">
            <button onClick={() => setShowBalanceModal(false)}>완료!</button>
          </div>
        </div>
      )}
      
      {showTmiModal && (
        <div className="hidden-modal active tmi-modal">
          <div className="hidden-text tmi-title">Gaeun's TMI List</div>
          <div className="tmi-scroll-container">
            {gaeunTmiList.map((tmi, index) => (
              <div key={index} className="tmi-item">
                {tmi}
              </div>
            ))}
          </div>
          <div className="hidden-buttons">
            <button onClick={() => setShowTmiModal(false)}>다 읽었어!</button>
          </div>
        </div>
      )} 
      
      {showHugging && (
        <div 
          className="full-screen-modal"
          onClick={() => setShowHugging(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <HuggingButton />
          </div>
          
          <div style={{
            position: 'absolute',
            bottom: '40px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.9rem',
            opacity: 0.7
          }}>
            화면을 터치하면 돌아갑니다
          </div>
        </div>
      )} 
      
      {showScratch && (
        <div 
          className="full-screen-modal"
          style={{ background: 'rgba(5, 7, 13, 0.98)'}}
          onClick={() => setShowScratch(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ScratchCard />
          </div>
          
          <div style={{
            position: 'absolute',
            bottom: '40px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.9rem',
            opacity: 0.7
          }}>
            화면을 터치하면 돌아갑니다
          </div>
        </div>
      )} 
      
      {showDiagnosis && (
        <div 
          className="full-screen-modal"
          style={{background: 'rgba(5, 7, 13, 0.98)', zIndex: 200 }}
        >
          <GaeunDiagnosis onBack={() => setShowDiagnosis(false)} />
        </div>
      )}
      
      {showKaraoke && (
        <div className="hidden-modal active karaoke-modal">
          <div className="hidden-text karaoke-title">🎤 퀸크루즈 노래연습장</div>
          <div className="karaoke-content"> 
            <audio controls className="custom-audio">
              <source src="/sound1.mp3" type="audio/mpeg" />
              브라우저가 오디오를 지원하지 않습니다.
            </audio>
            <div className="karaoke-subtitle">
              우리의 특별한 노래를 들어봐 🎵
            </div>
          </div>
          <div className="hidden-buttons">
            <button onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.blur();
              setShowKaraoke(false);

              setTimeout(() => {
                setShowKaraoke(false);
              }, 50);
            }}>나가기</button>
          </div>
        </div>
      )}

      {showHiddenQuestion && (
        <div className="hidden-modal active">
          <div className="hidden-text">혹시 가은이가 보고 싶으신가요?</div>
          <div className="hidden-buttons">
            <button onClick={handleAnswer}>YES</button>
            <button onClick={handleAnswer}>NO</button>
          </div>
        </div>
      )} 
      
      {showHiddenPhoto && (
        <div className="photo-modal active" onClick={handleReset}>
           <div 
             className="photo-content" 
             onClick={(e) => e.stopPropagation()}
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}
           >
             <img 
               src={myPhotos[photoIndex]} 
               alt="내 사진" 
               onClick={handleNextPhoto}
             />
             
             <div className="photo-controls">
               <button className="nav-btn" onClick={handlePrevPhoto}>&lt;</button>
               <span className="page-counter">{photoIndex + 1} / {myPhotos.length}</span>
               <button className="nav-btn" onClick={handleNextPhoto}>&gt;</button>
             </div>
             
             <div className="photo-caption">
               보고 싶었지?
             </div>
           </div>
           <div style={{
             position: 'absolute',
             bottom: '40px',
             color: 'rgba(255, 255, 255, 0.5)',
             fontSize: '0.9rem',
             opacity: 0.7
           }}>
             화면을 터치하면 돌아갑니다
           </div>
        </div>
      )} 
      
      {(showStarLetter || isFlying) && !showStarCollectModal && !showCollectionCompleteModal && (
        <div className={`star-letter-modal ${isFlying ? 'flying' : 'active'}`}>
          {/* 1. 메시지를 담은 통통한 별 */}
          <div className="star-paper">
            {!isFlying ? (
              <div className="textarea-wrapper"> 
              {/* 1. 안내 문구 (글자가 없을 때만 보임) */}
              {starMessage === "" && (
                <div className="custom-placeholder">
                  밤하늘에 보낼 메시지를<br/>적어보세요
                </div>
              )} 
              
              {/* 2. 실제 입력창 */}
              <textarea 
                value={starMessage}
                onChange={handleTextChange}
                rows={1} 
              />
            </div>
          ) : (
            <div className="flying-star-core" /> 
          )}
        </div>
      
          {/* 2. 별 아래 버튼들 (날아가는 중에는 숨김) */}
          {!isFlying && (
            <div className="star-letter-buttons">
              <button className="bored-trigger-btn send-star-btn" onClick={handleSendStar}>
                별 띄우기 ✨
              </button>
              <button className="bored-trigger-btn" onClick={() => {
                setShowStarLetter(false);
                setStarMessage("");
              }}>
                닫기
              </button>
            </div>
          )}
        </div>
      )}
      
      {showBreathing && (
        <div 
          className="full-screen-modal"
          style={{ paddingTop: '60px' }}
          onClick={() => setShowBreathing(false)}
        >
          <BreathingCircle />
          <div style={{
            position: 'absolute',
            bottom: '40px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.9rem',
            opacity: 0.7
          }}>
            화면을 터치하면 돌아갑니다
          </div>
        </div>
      )}
      
      {/* 별 수거 확인 모달 */}
      {showStarCollectModal && (
        <div className="hidden-modal active">
          <div className="hidden-text">별을 수거하시겠습니까?</div>
          <div className="hidden-buttons">
            <button onClick={handleCollectStars}>YES</button>
            <button onClick={handleCancelCollect}>NO</button>
          </div>
        </div>
      )} 
      
      {/* 수거 완료 알림 모달 */}
      {showCollectionCompleteModal && (
        /* 1. 밸런스 게임/TMI와 같은 너비(90%)를 확보하기 위해 inline style 추가 */
        <div className="hidden-modal active" style={{ width: '90%', maxWidth: '450px' }}>
          <div className="hidden-text" style={{ whiteSpace: 'nowrap' }}> {/* 2. 한 줄 고정 */}
            별을 안전하게 수거하였습니다.<br/>
            <span style={{ fontSize: '0.85rem', color: '#ffe87f', opacity: 0.8 }}>
              (수거한 별: {collectedCount}개)
            </span>
          </div>
          <div className="hidden-buttons">
            <button onClick={handleCloseCompleteModal}>확인</button>
          </div>
        </div>
      )}
      
      <button
        className={`moon-button ${selectedStar && !showHugging && !showScratch && !showBreathing && !showHiddenPhoto &&
        !showBalanceModal && !showTmiModal && !showKaraoke? "active" : ""}`}
        onClick={handleReset}
        aria-label="초기 화면으로 돌아가기"
      />

      <div className="footer-copyright">Developed by Ganiii</div>

      <button 
        className={`guide-button ${selectedStar || showHiddenQuestion || showHiddenPhoto || showBoredMenu || showStarLetter || showDiagnosis || showHugging || showScratch ? "hidden" : ""} ${showGuide ? "paused" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowGuide(true);
        }}
        style={{ zIndex: 999 }}
      >
        ?
      </button>

      {/* 사용법 모달 */}
      {showGuide && (
        <div className="hidden-modal active guide-modal-content">
          <div className="guide-title">별을 여행하는 법</div>
          
          <div className="guide-body">
            <div className="guide-step">
              <span className="step-num">1.</span>
              <p>고요한 밤하늘을 가만히 올려다보세요.</p>
            </div>
            <div className="guide-step">
              <span className="step-num">2.</span>
              <p>유난히 반짝이며 말을 거는 별을 찾아보세요.</p>
            </div>
            <div className="guide-step">
              <span className="step-num">3.</span>
              <p>지금 내 마음에 닿는 별을 선택해 위로를 받아보세요.</p>
            </div>
            <div className="guide-step">
              <span className="step-num">4.</span>
              <p>숨겨진 선물이 있다면 마음껏 즐겨주세요.</p>
            </div>

            <hr className="guide-divider" />

            <div className="guide-extra">
              <p>✨ <b>나만의 별자리</b></p>
              <p className="sub-text">별과 별 사이를 이어 그림을 그려보세요.</p>
              
              <p>💌 <b>별에게 편지 쓰기</b></p>
              <p className="sub-text">'잠이 안 올 때' 별을 찾아 45자 이내의 편지를 띄워보세요. 나의 이야기가 별이 되어 떠오릅니다.</p>
              
              <p>🌙 <b>달의 비밀</b></p>
              <p className="sub-text">오른쪽 위 달을 누르면 처음으로 돌아가요. '잠이 안 올 때' 별에서는 띄운 별들을 수거할 수도 있어요.</p>
            </div>
          </div>

          <div className="hidden-buttons">
            <button onClick={() => setShowGuide(false)}>닫기</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;