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

const stars = [
  { id: 1, x: 12, y: 8, neon: false },
  { id: 2, x: 38, y: 10, neon: false },
  { id: 3, x: 62, y: 9, neon: false },
  { id: 4, x: 86, y: 11, neon: false },
  { id: 5, x: 20, y: 16, neon: true, message: "기쁠 때", fullMessage: "무슨 일이야! 좋은 일이지? 나한테 제일 먼저 자랑해야 해. 네가 거기서 웃으면 나도 여기서 행복해져. 오늘 그 기분 마음껏 즐겨!" },
  { id: 6, x: 48, y: 14, neon: true, message: "심심할 때", fullMessage: "심심하면 뭐 해, 내 생각해야지! 농담이고, 바로 보이스톡 걸어. 시차 따위 무시하고 수다 떨다 보면 시간 순삭될 걸? 대기 중!" },
  { id: 7, x: 74, y: 17, neon: true, message: "외로울 때", fullMessage: "낯선 곳이라 더 외롭지? 몸은 멀리 있어도 마음은 늘 네 옆에 딱 붙어 있어. 고개 들고 하늘 봐, 우린 같은 하늘 아래 있잖아." },
  { id: 9, x: 58, y: 20, neon: true, message: "그리울 때", fullMessage: "나도 너 진짜 보고 싶다. 우리 같이 먹던 떡볶이랑 그 수다들 그립지? 한국 오면 맛집 투어부터 하자. 조금만 더 힘내자!" },
  { id: 11, x: 10, y: 28, neon: true, message: "힘들 때", fullMessage: "거기서 적응하느라 얼마나 애쓰고 있는지 다 알아. 오늘만큼은 씩씩한 척 말고 그냥 투정 부려도 돼. 다 들어줄게. 고생했어 정말." },
  { id: 12, x: 34, y: 30, neon: true, message: "울적할 때", fullMessage: "기분이 축 처지는 날이네. 이럴 땐 맛있는 거 먹고 따뜻한 이불 속에 쏙 들어가. 내일은 분명 오늘보다 더 괜찮은 하루가 될 거야." },
  { id: 13, x: 60, y: 27, neon: true, message: "용기가 필요할 때", fullMessage: "겁나고 두려울 수 있어. 당연한 거야. 근데 넌 내가 아는 사람 중 제일 단단한 애잖아. 망설이지 말고 질러! 내가 뒤에서 든든하게 버티고 있을게." },
  { id: 15, x: 22, y: 34, neon: true, message: "칭찬 받고 싶을 때", fullMessage: "타지에서 혼자 밥 챙겨 먹고, 일하고, 살아가는 것만으로도 넌 진짜 대단해. 오늘 하루도 무사히 보낸 너한테 기립박수! 아주 칭찬해!" },
  { id: 16, x: 46, y: 36, neon: true, message: "몸이 아플 때", fullMessage: "아픈 게 제일 서러운데 어떡해... 약은 먹었어? 입맛 없어도 밥 꼭 챙겨 먹어야 빨리 낫지. 아프지 마 제발. 내가 대신 아파주고 싶다." },
  { id: 17, x: 70, y: 33, neon: true, message: "잠이 안 올 때", fullMessage: "생각이 너무 많아서 그래? 억지로 자려고 하지 마. 지금 우리가 보고 있는 달은 같으니까, 내가 보내는 텔레파시나 받아라! 꿈속에서 만나서 놀자." },
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
  //{ id: 28, x: 92, y: 53, neon: false }, // 오른쪽 구석
  //{ id: 29, x: 42, y: 58, neon: false }, // 중앙 하단
  { id: 30, x: 90, y: 45, neon: false }, // 오른쪽 하단
  //{ id: 31, x: 20, y: 62, neon: false }, // 왼쪽 하단
  { id: 32, x: 50, y: 38, neon: false }, // 중앙 상단 빈 곳 채움
  //{ id: 33, x: 90, y: 32, neon: false }, // 오른쪽 상단 빈 곳 채움
  //{ id: 34, x: 4, y: 35, neon: false },  // 왼쪽 상단 빈 곳 채움
  //{ id: 35, x: 36, y: 65, neon: false }, // 가장 아래쪽
];

const ariesPathIds = [5, 6, 9, 13];

const dailyMessages = {
  1: "새로운 시작, 당신의 용기를 응원합니다.",
  2: "망설이지 말고 한 걸음 더 내디뎌 보세요.",
  3: "당신의 열정이 길을 밝혀줄 거예요.",
  4: "오늘은 스스로를 더 믿어주세요.",
  5: "작은 불꽃이 큰 변화를 만듭니다.",
  6: "솔직한 마음이 가장 큰 무기입니다.",
  7: "도전을 두려워하지 마세요.",
  8: "당신은 생각보다 훨씬 강한 사람입니다.",
  9: "오늘 흘린 땀방울이 내일의 별이 됩니다.",
  10: "잠시 멈춰서 숨을 고르는 것도 용기입니다.",
  11: "당신의 직관을 믿고 나아가세요.",
  12: "따뜻한 말 한마디가 기적을 만듭니다.",
  13: "포기하지 않는 마음이 가장 아름답습니다.",
  14: "당신의 에너지가 주변을 밝힙니다.",
  15: "가장 나다운 모습으로 빛나세요.",
  16: "오늘 하루, 온전히 당신을 위해 쓰세요.",
  17: "실수는 성장을 위한 디딤돌입니다.",
  18: "당신의 앞길에 행운이 가득하기를.",
  19: "지금 그대로도 충분히 멋집니다."
};

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

// 사진 파일 목록
// [Vite 버전으로 수정된 이미지 목록]
const myPhotos = [
  import.meta.env.VITE_PHOTO_1,
  import.meta.env.VITE_PHOTO_2,
  import.meta.env.VITE_PHOTO_3,
  import.meta.env.VITE_PHOTO_4,
  import.meta.env.VITE_PHOTO_5,
];

function App() {

  // App.js 안쪽 상단에 추가
useEffect(() => {
  myPhotos.forEach((src) => {
    const img = new Image();
    img.src = src; // 브라우저가 이 코드를 읽는 순간 미리 사진을 다운로드합니다.
  });
}, []);

// 심심할 때-TMI
const [showTmiModal, setShowTmiModal] = useState(false);

// 기존 handleTMI 수정
const handleTMI = () => { 
    setShowTmiModal(true);
    setShowBoredMenu(false); 
};

  const [activeStar, setActiveStar] = useState(null);
  const [lastActiveStar, setLastActiveStar] = useState(null);
  const [selectedStar, setSelectedStar] = useState(null);
  const [clickPosition, setClickPosition] = useState({ x: 50, y: 50 });
  const [showConstellation, setShowConstellation] = useState(false);
  const [activatedAriesStars, setActivatedAriesStars] = useState([]);
  
  const [showDailyMessage, setShowDailyMessage] = useState(false);
  const [todayMessage, setTodayMessage] = useState("");

  const [showHiddenQuestion, setShowHiddenQuestion] = useState(false);
  const [showHiddenPhoto, setShowHiddenPhoto] = useState(false);
  
  const [photoIndex, setPhotoIndex] = useState(0);

  // 심심할 때 메뉴 상태
  const [showBoredMenu, setShowBoredMenu] = useState(false);

  // 칭찬 기능 상태
  const [activePraise, setActivePraise] = useState(null);
  // 칭찬 오디오 객체 관리
  const praiseAudioRef = useRef(null);

  // 스와이프 감지용 상태
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const activationTimings = [0, 20200, 24100, 30000];

  const [isAriesSeason] = useState(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    // return true; 
    return currentMonth === 3 && currentDay <= 19;
  });

  const starsLayerRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    if (isAriesSeason) {
      const today = new Date().getDate(); 
      setTodayMessage(dailyMessages[today] || dailyMessages[1]);

      const constellationTimer = setTimeout(() => {
        setShowConstellation(true);
      }, 7000);

      const messageTimer = setTimeout(() => {
        setShowDailyMessage(true);
      }, 5000);

      return () => {
        clearTimeout(constellationTimer);
        clearTimeout(messageTimer);
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
    if (selectedStar && selectedStar.id === 9 && !showHiddenQuestion && !showHiddenPhoto) {
      setShowHiddenQuestion(true);
      return;
    }

    // 재생 중인 칭찬 오디오 멈춤
    if (praiseAudioRef.current) {
      praiseAudioRef.current.pause();
      praiseAudioRef.current.currentTime = 0;
      praiseAudioRef.current = null;
    }

    // 모든 상태 초기화
    setSelectedStar(null);
    setShowHiddenQuestion(false);
    setShowHiddenPhoto(false);
    setShowBoredMenu(false); // 심심 메뉴 닫기
    setActivePraise(null);   // 칭찬 버튼 초기화
    setPhotoIndex(0); 
    setTouchStart(0);
    setTouchEnd(0);

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
      console.log("밸런스 게임 버튼 클릭"); 
  };
  const handleKaraoke = () => { 
      console.log("노래방 버튼 클릭"); 
  };

  // 칭찬 오디오 재생 로직
  const handlePraiseAudio = (type) => {
    if (praiseAudioRef.current) {
      praiseAudioRef.current.pause();
      praiseAudioRef.current.currentTime = 0;
    }

    const audioMap = {
      study: "/praise_study.mp3",
      relationship: "/praise_rel.mp3",
      life: "/praise_life.mp3",
      challenge: "/praise_chal.mp3",
      mental: "/praise_mental.mp3",
      exist: "/praise_exist.mp3"
    };

    if (activePraise === type) {
      setActivePraise(null);
      praiseAudioRef.current = null;
      return;
    }

    const audio = new Audio(audioMap[type]);
    praiseAudioRef.current = audio;
    setActivePraise(type); 
    
    audio.play().catch(e => console.log("재생 오류:", e));

    audio.onended = () => {
      setActivePraise(null);
      praiseAudioRef.current = null;
    };
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

      <div className={`season-moon ${showConstellation && isAriesSeason ? "active" : ""}`} />

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
            style={{ animation: `drawPath 30s linear forwards` }}
          />
        </svg>
      )}

      {/* [수정] 별 레이어 - 클릭 영역 확장을 위해 구조 변경 */}
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

          const isClickable = !isAriesSeason && isTargetStar && (isActive || lastActiveStar === star.id);

          return (
            // [Wrapper] 위치와 클릭 이벤트를 담당하는 투명 컨테이너
            <div 
              key={star.id}
              className={`star-wrapper ${isClickable ? "clickable" : ""}`}
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
              onClick={(e) => {
                if (isClickable) handleStarClick(star, e);
              }}
            >
              {/* 별 본체 */}
              <div
                className={`star ${
                  isTargetStar
                    ? `star-message ${isActive ? "star-active" : ""}`
                    : "star-background"
                }`}
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
      </div>

      <div className={`daily-message-container ${showDailyMessage ? "active" : ""}`}>
        {todayMessage}
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

      {/* 기본 메시지 모달 */}
      {selectedStar && !showHiddenQuestion && !showHiddenPhoto && !showBoredMenu && (
        <div className={`message-modal active`}>
          <div className="message-title">{selectedStar.message}</div>
          <div className="message-content">
            {selectedStar.fullMessage}

            {/* [추가 1] 용기가 필요할 때(ID: 13) : 오디오 플레이어 */}
            {selectedStar.id === 13 && (
              <div className="audio-wrapper">
                <div className="audio-label">🎧 Play for Courage</div>
                <audio controls className="custom-audio">
                  <source src="/voice.mp3" type="audio/mpeg" />
                  브라우저가 오디오를 지원하지 않습니다.
                </audio>
              </div>
            )}
            
            {/* [추가 2] 칭찬 받고 싶을 때(ID: 15) : 오디오 버튼 6개 */}
            {selectedStar.id === 15 && (
              <div className="praise-section">
                <div className="praise-grid">
                  <button 
                    className={activePraise === "study" ? "playing" : ""} 
                    onClick={() => handlePraiseAudio("study")}
                  >
                    {activePraise === "study" ? "🔊 재생 중..." : "📚 학업/일"}
                  </button>
                  
                  <button 
                    className={activePraise === "relationship" ? "playing" : ""} 
                    onClick={() => handlePraiseAudio("relationship")}
                  >
                    {activePraise === "relationship" ? "🔊 재생 중..." : "😡 인간관계"}
                  </button>
                  
                  <button 
                    className={activePraise === "life" ? "playing" : ""} 
                    onClick={() => handlePraiseAudio("life")}
                  >
                    {activePraise === "life" ? "🔊 재생 중..." : "🍚 갓생/생활"}
                  </button>
                  
                  <button 
                    className={activePraise === "challenge" ? "playing" : ""} 
                    onClick={() => handlePraiseAudio("challenge")}
                  >
                    {activePraise === "challenge" ? "🔊 재생 중..." : "🔥 용기/도전"}
                  </button>
                  
                  <button 
                    className={activePraise === "mental" ? "playing" : ""} 
                    onClick={() => handlePraiseAudio("mental")}
                  >
                    {activePraise === "mental" ? "🔊 재생 중..." : "☁️ 멘탈관리"}
                  </button>
                  
                  <button 
                    className={activePraise === "exist" ? "playing" : ""} 
                    onClick={() => handlePraiseAudio("exist")}
                  >
                    {activePraise === "exist" ? "🔊 재생 중..." : "🌱 그냥..."}
                  </button>
                </div>
              </div>
            )}

            {/* [추가 3] 심심할 때(ID:6) 버튼 */}
            {selectedStar.id === 6 && (
              <div style={{ marginTop: '20px' }}>
                <button 
                  className="bored-trigger-btn" 
                  onClick={() => setShowBoredMenu(true)}
                >
                  여전히 심심하다면?
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
               가으니의 누구도 궁금해 하지 않은<br/>TMI
             </button>
             <button onClick={handleKaraoke}>
               여기가 바로<br/>퀸크루즈 노래연습장
             </button>
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
               <br/>
               <span style={{fontSize: '0.8rem', opacity: 0.7}}>화면을 누르면 닫혀요</span>
             </div>
           </div>
        </div>
      )}

      <button
        className={`moon-button ${selectedStar ? "active" : ""}`}
        onClick={handleReset}
        aria-label="초기 화면으로 돌아가기"
      />

      <div className="footer-copyright">Developed by Ganiii</div>

    </div>
  );
}

export default App;