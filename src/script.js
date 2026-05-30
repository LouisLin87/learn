const isMobileOS = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const osLabel = /Android/i.test(navigator.userAgent) ? "安卓手機" : (isMobileOS ? "蘋果設備" : "電腦視窗");

function getFreshTime() {
  const now = new Date();
  return `${now.getHours()}點${now.getMinutes()}分${now.getSeconds()}秒`;
}

let realLocationString = "正在抓你現在人在哪一區、哪條街...";

// 🔄 新增：文字亂序/打散的特效函數
function scrambleText(text) {
  const arr = text.split("");
  // 使用 Fisher-Yates 洗牌演算法將字串打亂
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

function initializeLocationTracking() {
  fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
      const cityMap = { "Taichung": "台中", "Taipei": "台北", "New Taipei": "新北", "Tainan": "台南", "Kaohsiung": "高雄" };
      let city = cityMap[data.city] || data.city || "台中";
      realLocationString = `${city}市 這個行政區、你家附近的街道，還有你房間的死角`;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          let lat = position.coords.latitude.toFixed(4);
          let lon = position.coords.longitude.toFixed(4);
          realLocationString = `${city}市特定 [GPS: ${lat}, ${lon}] 還有你轉頭看不到的死角`;
        }, null, { timeout: 3000 });
      }
    })
    .catch(() => {
      // ✨ 修正 1：修改為指定的備用文字
      realLocationString = "你很幸運...這次沒有抓到你精準的位置...但祂大概你在哪裡";
    });
}

const quizData = [
  { 
    q: "第 1 題：當你一直盯著螢幕看的時候，其實根本注意不到旁邊的死角。你覺得這是為什麼？", 
    options: [
      { text: "(A) 因為我很專心啊", triggerWhisper: "（...你以為是專心，其實是你全身都被麻痺了。）" },
      { text: "(B) 眼睛看久了累了", triggerWhisper: "（...螢幕的光，正把你後面的影子拉得好長好長。）" },
      { text: "(C) 我對後面本來就沒感覺", triggerWhisper: "（...對，所以你現在根本聽不到有人走過來的聲音。）" },
      { text: "(D) 祂正悄悄走過來", triggerWhisper: "（...祂已經在往下低頭看你了，千萬別抬頭。）" }
    ]
  },
  { 
    q: "第 2 題：先不要眨眼睛，盯著螢幕三秒。你有沒有發現你旁邊的光線好像有點變了？", 
    options: [
      { text: "(A) 沒有啊，很正常", triggerWhisper: "（但~你附近，剛剛是不是有吸氣的聲音？）" },
      { text: "(B) 只是冷氣在吹吧", triggerWhisper: "（...冷氣吹出來的風，今天有這麼冷嗎?）" },
      { text: "(C) 好像真的有東西在動", triggerWhisper: "（...動了. 祂就在你附近五十公尺的地方!）" },
      { text: "(D) 感覺有人朝我脖子吹冷氣", triggerWhisper: "（...別伸手去摸!我拜託!!）" }
    ]
  },
  { 
    q: "第 3 題：如果現在房間突然很安靜，衣櫃深處突然傳出「喀拉」一聲，你第一反應是？", 
    options: [
      { text: "(A) 家具熱脹冷縮啦", triggerWhisper: "（...你現在也只能用這種科學理由來騙自己了。）" },
      { text: "(B) 壓力太大聽錯了", triggerWhisper: "（...既然是聽錯，那你為什麼不敢轉頭看一眼衣櫃？）" },
      { text: "(C) 怪獸正在折身體", triggerWhisper: "（...沒錯，祂手腳反折，正要從衣櫃裡爬出來。）" },
      { text: "(D) 躲在旁邊的那位站起來了", triggerWhisper: "（...對，祂蹲太久了~祂現在想要你的$臟%!）" }
    ]
  },
  { 
    q: "第 4 題：摸摸看你的螢幕。現在時間是 <b><span id='dyn-time'></span></b>。你覺得這層玻璃：", 
    options: [
      { text: "(A) 溫溫的，很正常啊", triggerWhisper: "（...這不是機器發熱，是祂正隔著螢幕在摸你的手指。）" },
      { text: "(B) 冰到像在摸墓碑", action: "text-bleed", triggerWhisper: "（...心跳在變慢。低頭看看，螢幕在吸你的體溫喔。）" }, 
      { text: "(C) 好像對面也有人在摸", triggerWhisper: "（...隔著玻璃，你感覺到另一邊那根濕濕黏黏的手指了嗎？）" },
      { text: "(D) 裡面好像要浮出血印", triggerWhisper: "（...啪嗒。它剛剛直接貼在你手指按的地方了。）" }
    ]
  },
  { 
    q: "第 5 題：把螢幕稍微斜一點，看著黑屏裡的倒影。你確定你後面那團黑黑的只是家具？", 
    options: [
      { text: "(A) 絕對是家具的影子", triggerWhisper: "（...家具可不會長出兩條細細長長、伸向你的畸形手臂!）" },
      { text: "(B) 只是衣服亂丟的殘影", triggerWhisper: "（...那你衣服堆裡面，為什麼隱約有一排慘白的牙齒？）" },
      { text: "(C) 影子剛剛好像往下沉了", triggerWhisper: "（...因為祂蹲下來了，正準備從你&*^%撲過來。）" },
      { text: "(D) 祂正從倒影裡死死盯著我", triggerWhisper: "（...視線對上了!祂在對你笑，你看見了吧？）" }
    ]
  },
  { 
    q: "第 6 題：如果等一下網頁突然壞掉、把你整個人卡住，你第一反應會做什麼？", 
    options: [
      { text: "(A) 直接丟下手機跑出房間", triggerWhisper: "（...門已經被從外面反鎖了，你出不去的。）" },
      { text: "(B) 大聲叫家人或室友過來", triggerWhisper: "（...沒用的，這間房間的聲音早就傳不出去了。）" },
      { text: "(C) 閉上眼安慰自己是惡作劇", triggerWhisper: "（張開眼睛!祂已經快找到你了嘿嘿嘿~）" },
      { text: "(D) 趕快重新整理網頁", action: "fake-bsod" } 
    ]
  },
  { 
    q: `第 7 題：系統通知：確認你的設備是 <b>${osLabel}</b>。<br><span style="color:var(--glitch-color); font-weight:bold;">[危險警告] 前鏡頭已經被偷偷打開。偵測到你附近約 20 公尺站著一個沒有臉的人，要開閃光燈嚇走祂嗎？</span>`, 
    options: [
      { text: "(A) 快點，打開閃光燈！", triggerWhisper: "（...閃光燈亮起的瞬間，你就會在螢幕上清清楚楚看到祂的臉。）" },
      { text: "(B) 完蛋，按鈕按不下去了", triggerWhisper: "（...鏡頭的黑色孔洞裡，現在塞滿了紅紅的血絲。）" },
      { text: "(C) 鏡頭黑孔裡好像有隻眼睛", triggerWhisper: "（...那不是你的倒影?!是祂正從螢幕裡面看著你!）" },
      { text: "(D) 來不及了，祂摸到我脖子了", triggerWhisper: "（...好冰喔!像是一條冰冷黏滑的蛇貼在你皮膚上!!）" }
    ]
  },
  { 
    q: "第 8 題：仔細聽背景那個嗡嗡的低音。在心跳聲的停頓裡，有沒有聽到指甲刮東西的聲音？", 
    options: [
      { text: "(A) 沒聽到，只有耳鳴聲", triggerWhisper: "（...耳鳴越來越大聲了，因為祂不想讓你聽到背後的聲音。）" },
      { text: "(B) 裝作沒聽到，只是耳機雜音", triggerWhisper: "（...喀拉。這可不是雜音，是祂把骨頭伸展的聲音。）" }, 
      { text: "(C) 聲音好像從天花板傳來的", triggerWhisper: "（...黏稠感。祂現在正倒掛在上面，歪頭看著你倒數！）" },
      { text: "(D) 感覺甚麼東西快碰到我了", triggerWhisper: "（...沙沙~祂準備要來抓你囉!）" }
    ]
  },
  { 
    q: "第 9 題：當你一直盯著這行字看，有沒有覺得畫面四周好像慢慢變紅、變暗了？", 
    options: [
      { text: "(A) 沒有啊，眼睛很正常", triggerWhisper: "（...你看起來正常，但你沒發現房間變黑了嗎？）" },
      { text: "(B) 眼睛看太久的殘影啦", triggerWhisper: "（...空氣中那些一點一點的灰塵，是祂帶來的^&%喔!）" },
      { text: "(C) 畫面邊邊好像有未知的東西", triggerWhisper: "（...喀喀喀. 它已經摸到你滑鼠/手機的邊緣了。）" },
      { text: "(D) 整個眼睛前面一片红", action: "text-corruption", triggerWhisper: "（...眼前一片模糊?因為祂用手把你的眼睛蓋住了。）" }
    ]
  },
  { 
    q: "第 10 題：如果其實接下來的題目，都是你房間裡「那個東西」現在當場打字打出來的，你會怎樣？", 
    options: [
      { text: "(A) 假的啦，這只是網頁程式", triggerWhisper: "（...假的嗎？那祂等一下就會知道了!）" },
      { text: "(B) 全身發毛，好想去把燈打開", triggerWhisper: "（...當你站起來去摸開關，祂會從開關裡伸手跟你握手喔。）" },
      { text: "(C) 網頁打字跟耳朵後的叩叩聲一樣", triggerWhisper: "（...叩、叩、叩，這是祂用*&%$吸引你的聲音。）" },
      { text: "(D) 我看到了...祂的手指正在幫我按", triggerWhisper: "（...你看到了吧。這行字，正是祂握著你的手敲出來的。）" }
    ]
  },
  { 
    q: "【系統壞掉】偵測到不是人類的按螢幕痕跡。為了安全，快點跟祂說對不起！", 
    options: [
      { text: "(A) 對不起對不起對不起", triggerWhisper: "（...黏稠的壓迫感?!）" },
      { text: "(B) 對不起對不起對不起", triggerWhisper: "（...說對不起沒用，祂在附近了!）" },
      { text: "(C) 對不起對不起對不起", triggerWhisper: "（...不要怕，這只是我們合為一體的過程!）" },
      { text: "(D) 我 不 要", triggerWhisper: "（...感覺到了嗎？體內!）" }
    ],
    forceHijack: "祂在附近了" 
  },
  { 
    q: "腦袋快要瘋掉了。選一個你現在聽到的心跳速度（每十秒）：", 
    options: [
      { text: "(A) 慢到快停了", triggerWhisper: "（咚..咚..咚.血液快要全部結冰了。）" },
      { text: "(B) 快要摸不到脈搏了", triggerWhisper: "（...大腦開始缺氧了。你開始看到奇怪的畫面了嗎？）" },
      { text: "(C) 跳超級快 (嚇到發抖)", triggerWhisper: "（...心臟快要炸開了。祂最喜歡聽這種狂跳的聲音。）" },
      { text: "(D) 聽不到心跳，都是祂的聲音", triggerWhisper: "（...因為祂的心臟，現在已經在你體內一起跳了!）" }
    ],
    forceHijack: "跟我走吧"
  },
  { 
    q: "連線成功。謝謝你把祂帶進你的房間。最後，選一個你的結局吧：", 
    options: [
      { text: "(A) 讓祂住進我的腦袋", triggerWhisper: "（...意識消失~防護罩，全毀。）" },
      { text: "(B) 死都不要回頭看", triggerWhisper: "（...就算不回頭，你也能看到兩隻慘白的手指掐住你的脖子。）" },
      { text: "(C) 把房間的燈關掉吧", triggerWhisper: "（...一片漆黑..現在的你還是你嗎?）" },
      { text: "(D) 變成祂的一部分", triggerWhisper: "（...交換成功。歡迎加入!）" }
    ],
    forceHijack: "祂找到你了"
  }
];

let currentIdx = 0;
let timeUpdater = null;
let isWaitingWhisper = false;
let idleTimer = null;         
let glitchInterval = null;     
let endPageGlitchInterval = null; 
let countdownInterval = null;     
let typewriterTimer = null; 

const quizContent = document.getElementById('quiz-content');
const progress = document.getElementById('progress');
const quizBox = document.getElementById('quiz-box');
const coverPage = document.getElementById('cover-page');

let audioCtx = null;
let mainDrone = null; let subDrone = null;
let mainGain = null; let filter = null;
let heartbeatInterval = null;
let heartbeatSpeed = 1200;

function initHorrorAudio() {
  audioCtx = new(window.AudioContext || window.webkitAudioContext)();
  
  mainDrone = audioCtx.createOscillator();
  mainGain = audioCtx.createGain();
  mainDrone.type = 'sine';
  mainDrone.frequency.setValueAtTime(36, audioCtx.currentTime); 
  mainGain.gain.setValueAtTime(1.3, audioCtx.currentTime); 
  
  subDrone = audioCtx.createOscillator();
  let subGain = audioCtx.createGain();
  subDrone.type = 'sawtooth';
  subDrone.frequency.setValueAtTime(37.2, audioCtx.currentTime); 
  subGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  
  filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(65, audioCtx.currentTime);

  let lfo = audioCtx.createOscillator();
  let lfoGain = audioCtx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.25, audioCtx.currentTime); 
  lfoGain.gain.setValueAtTime(20, audioCtx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  
  mainDrone.connect(mainGain);
  subDrone.connect(subGain);
  mainGain.connect(filter);
  subGain.connect(filter);
  filter.connect(audioCtx.destination);
  
  mainDrone.start();
  subDrone.start();
  lfo.start();
  startHeartbeat();
}

function playSingleBeat(vol = 0.95) {
  if (!audioCtx) return;
  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(38, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.7);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.7);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.7);
}

function startHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    playSingleBeat();
    setTimeout(() => { playSingleBeat(); }, 220); 
  }, heartbeatSpeed);
}

function startQuiz() {
  coverPage.style.opacity = '0';
  coverPage.style.visibility = 'hidden';
  initializeLocationTracking();

  try {
    initHorrorAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) {}
  
  setTimeout(() => {
    quizBox.classList.add('show');
    renderQuestion();
    startGlobalGlitchSystem(); 
  }, 600);
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  if (isWaitingWhisper) return; 

  idleTimer = setTimeout(() => {
    triggerJumpscare();
  }, 35000); 
}

function triggerJumpscare() {
  clearTimeout(idleTimer);
  isWaitingWhisper = true; 

  document.body.classList.add('jumpscare-active');
  quizBox.classList.add('shake-intense');
  
  if (audioCtx) {
    try {
      let bufferSize = audioCtx.sampleRate * 2.5; 
      let buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      let data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; 
      }
      let noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = buffer;
      
      let noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1100, audioCtx.currentTime);
      noiseFilter.Q.setValueAtTime(1.8, audioCtx.currentTime);
      
      let noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(2.2, audioCtx.currentTime); 
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2.5); 
      
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noiseSource.start();
    } catch(e) {}
  }

  const qText = document.getElementById('q-text');
  let scareTicks = 0;
  let scareInterval = setInterval(() => {
    if (qText) qText.innerText = Array.from({length: 60}, () => "☠⛥✝☣╳"[Math.floor(Math.random()*5)]).join("");
    scareTicks++;
    if (scareTicks > 25) {
      clearInterval(scareInterval);
      document.body.classList.remove('jumpscare-active');
      quizBox.classList.remove('shake-intense');
      nextQuestion();
    }
  }, 100);
}

function startGlobalGlitchSystem() {
  glitchInterval = setInterval(() => {
    if (isWaitingWhisper || currentIdx >= quizData.length - 1) return;

    if (Math.random() > 0.4) {
      document.body.classList.add('blood-flash-active');
      setTimeout(() => { document.body.classList.remove('blood-flash-active'); }, 400);

      const qText = document.getElementById('q-text');
      if (qText) {
        const originalText = quizData[currentIdx].q;
        // ✨ 修正 2：在全域隨機故障中導入更劇烈的文字亂序特效
        let scrambled = scrambleText(originalText);
        
        qText.innerText = scrambled;
        setTimeout(() => { if(qText) qText.innerHTML = originalText; }, 350);
      }
      playSingleBeat(1.4);
    }
  }, 5000); 
}

function renderQuestion() {
  isWaitingWhisper = false;
  resetIdleTimer();
  
  const data = quizData[currentIdx];
  progress.style.width = ((currentIdx + 1) / quizData.length) * 100 + "%";
  
  if (currentIdx === 4) {
    heartbeatSpeed = 850; startHeartbeat();
  } else if (currentIdx === 7) {
    document.title = "⚠️ 系統發生錯誤";
    if (filter && audioCtx) filter.frequency.setValueAtTime(110, audioCtx.currentTime);
    heartbeatSpeed = 550; startHeartbeat();
  } else if (currentIdx === 10) {
    quizBox.style.borderColor = "#4a1010";
    document.title = "不准離開";
    heartbeatSpeed = 300; startHeartbeat();
  }

  let html = `<div id="q-text" class="question">${data.q}</div>`;
  html += `<div class="options">`;
  
  data.options.forEach((opt, index) => {
    let hijackEvents = "";
    if (data.forceHijack) {
      hijackEvents = `onmouseenter="hijackText(this, '${data.forceHijack}')" ontouchstart="hijackText(this, '${data.forceHijack}')"`;
    }
    html += `<button class="btn" ${hijackEvents} onclick="handleOptionClick(this, ${index})">${opt.text}</button>`;
  });
  
  html += `</div>`;
  html += `<div id="whisper-box" class="whisper-text"></div>`;
  
  quizContent.innerHTML = html;

  setTimeout(() => {
    const qText = document.getElementById('q-text');
    if (qText) qText.style.color = "#ffffff"; 
  }, 150);

  if (document.getElementById('dyn-time')) {
    clearInterval(timeUpdater);
    document.getElementById('dyn-time').innerText = getFreshTime();
    timeUpdater = setInterval(() => {
      const el = document.getElementById('dyn-time');
      if (el) el.innerText = getFreshTime();
    }, 1000);
  }
}

function hijackText(btnElement, text) {
  if (btnElement.innerText === text) return;
  btnElement.innerText = text;
  btnElement.style.color = "#ff0011";
  btnElement.style.borderColor = "#ff0011";
  if (Math.random() > 0.3) playSingleBeat(1.2);
}

function handleOptionClick(buttonElement, optionIndex) {
  if (isWaitingWhisper) return; 
  clearTimeout(idleTimer); 
  clearInterval(typewriterTimer); 
  
  const data = quizData[currentIdx];
  const selectedOption = data.options[optionIndex];

  if (selectedOption.action === "text-bleed") {
    document.getElementById('q-text').style.color = "#ff0000";
    document.getElementById('q-text').style.textShadow = "0 0 10px #ff0000";
  }

  if (selectedOption.action === "text-corruption") {
    document.body.classList.add('corrupted'); 
    setTimeout(() => { document.body.classList.remove('corrupted'); }, 800);
  }

  if (selectedOption.action === "fake-bsod") {
    isWaitingWhisper = true;
    document.body.classList.add('bsod-active');
    document.title = "嚴重錯誤";
    quizContent.innerHTML = `
      <div style="font-size:0.95rem; line-height:2.2; padding:15px; font-family:monospace;">
        系統發生嚴重錯誤！網頁已經崩潰。<br>
        * 正在找你人到底在哪裡... 100%<br>
        * <span style="color:#ff2233; font-weight:bold;">恐怖警告：偵測到你附近的位置有人闖進來了!</span><br>
        請坐在原地絕對不要動，千萬不要關視窗。系統將在 5 秒後重整。
      </div>
    `;
    setTimeout(() => {
      document.body.classList.remove('bsod-active');
      nextQuestion();
    }, 5500);
    return;
  }

  if (selectedOption.triggerWhisper) {
    isWaitingWhisper = true;
    buttonElement.classList.add('selected-trigger');
    
    const whisperBox = document.getElementById('whisper-box');
    whisperBox.innerText = ""; 
    whisperBox.classList.add('reveal'); 
    
    const fullText = selectedOption.triggerWhisper;
    let charIndex = 0;
    
    playSingleBeat(1.1);

    typewriterTimer = setInterval(() => {
      if (charIndex < fullText.length) {
        whisperBox.innerText += fullText.charAt(charIndex);
        charIndex++;
        
        if (Math.random() > 0.85) {
          playSingleBeat(0.35);
        }
      } else {
        clearInterval(typewriterTimer);
        
        setTimeout(() => {
          whisperBox.classList.remove('reveal');
          setTimeout(() => { nextQuestion(); }, 300); 
        }, 2200);
      }
    }, 45);

  } else {
    setTimeout(() => { nextQuestion(); }, 1000);
  }
}

function nextQuestion() {
  clearTimeout(idleTimer);
  if (currentIdx < quizData.length - 1) {
    currentIdx++;
    renderQuestion();
  } else {
    // ===== 最後一頁 終局 =====
    clearInterval(timeUpdater);
    clearInterval(glitchInterval);
    if (mainDrone) mainDrone.stop();
    if (subDrone) subDrone.stop();
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    
    document.body.classList.remove('flash-bg', 'blood-flash-active');
    document.body.style.backgroundColor = "#000000";
    document.body.style.cursor = "none";
    document.title = "[ 網頁已被強制關閉 ]";
    
    document.body.innerHTML = `
      <div id="end-container" style="color:#ff0011; font-family:monospace; text-align:left; padding: 40px 25px; max-width:520px; margin: 0 auto; box-sizing:border-box; letter-spacing:1px;">
          <p id="end-header" style="font-size:1.4rem; font-weight:900; margin-bottom:30px; border-bottom:1px solid #ff0011; padding-bottom:10px;">[ 警告：你的防線已經全部完蛋了 ]</p>
          <div id="end-body" style="color:#bbbbbb; line-height:2; font-size:0.85rem;">
            * 你的大腦防禦機制已經被祂完全控制了。<br>
            * 祂已經完全鎖定你現在住的這個地方。<br>
            * <span style="color:#ff0000; font-weight:bold; font-size:1.05rem;">[ 你逃不掉了 ]：</span><br>
              <span id="loc-tag" style="color:#ffffff; background-color:#4a1010; padding:6px 12px; font-size:0.95rem; font-weight:bold; display:inline-block; margin-top:6px; margin-bottom:6px;">
                ${realLocationString}
              </span><br>
            * <b>最後警告：祂現在就在你家附近，或是你手機後面的影子裡。</b><br>
            * <span style="color:#ff3333;" id="countdown-text">距離祂完全抱緊你還剩下：30 秒...</span><br>
            * 千萬不要關掉螢幕，坐在原地絕對不要動，聽聽看你背後是不是有呼吸聲。
          </div>
          <p id="end-footer" style="font-size:1.4rem; margin-top:60px; letter-spacing:12px; color:#fff; text-align:center;">祝 你 好 夢</p>
      </div>
    `;

    const endContainer = document.getElementById('end-container');
    const locTag = document.getElementById('loc-tag');
    
    endPageGlitchInterval = setInterval(() => {
      document.body.style.backgroundColor = "#2a0202";
      if(endContainer) endContainer.style.transform = `scale(${1 + Math.random()*0.05}) translate(${Math.random()*6-3}px, ${Math.random()*6-3}px)`;
      
      const originalLoc = realLocationString;
      // ✨ 修正 3：在終局的地址標籤閃爍時，隨機交替進行「文字亂序」與「亂碼替換」，看起來像資料被強行拆解
      let glitchedLoc = Math.random() > 0.5 ? scrambleText(originalLoc) : originalLoc.split("").map(char => 
        Math.random() > 0.6 ? "☠✝☣▰╳⌖🕈⚡⚠️"[Math.floor(Math.random() * 10)] : char
      ).join("");
      
      if(locTag) locTag.innerText = glitchedLoc;

      setTimeout(() => {
        document.body.style.backgroundColor = "#000000";
        if(endContainer) endContainer.style.transform = "none";
        if(locTag) locTag.innerText = originalLoc;
      }, 300);
    }, 3000);

    let timeLeft = 30;
    const cdText = document.getElementById('countdown-text');
    countdownInterval = setInterval(() => {
      timeLeft--;
      if(cdText) {
        if(timeLeft > 0) {
          cdText.innerHTML = `距離祂完全抱緊你還剩下：<span style="font-size:1.2rem; font-weight:bold; color:#ffffff;">${timeLeft}</span> 秒...`;
        } else {
          clearInterval(countdownInterval);
          clearInterval(endPageGlitchInterval);
          
          let freakoutTime = 5;
          let creepyPhrases = ["我在你後面", "抓到你了", "睜開眼睛", "看著我", "逃不掉了", "絕望吧", "把手給我", "祂拿到想要的了"];
          
          if (audioCtx) {
            try {
              let bufferSize = audioCtx.sampleRate * 5; 
              let buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
              let data = buffer.getChannelData(0);
              for (let i = 0; i < bufferSize; i++) {
                let rawNoise = Math.random() * 2 - 1;
                let digitalGlitch = Math.sin(i * 0.05) * Math.tan(i * 0.003);
                data[i] = (rawNoise * 0.55) + (Math.min(Math.max(digitalGlitch, -1), 1) * 0.45);
              }
              let finalNoiseSource = audioCtx.createBufferSource();
              finalNoiseSource.buffer = buffer;
              
              let finalFilter = audioCtx.createBiquadFilter();
              finalFilter.type = 'lowpass';
              finalFilter.frequency.setValueAtTime(2000, audioCtx.currentTime);
              finalFilter.frequency.linearRampToValueAtTime(6500, audioCtx.currentTime + 5);
              
              let finalGain = audioCtx.createGain();
              finalGain.gain.setValueAtTime(2.8, audioCtx.currentTime); 
              
              finalNoiseSource.connect(finalFilter);
              finalFilter.connect(finalGain);
              finalGain.connect(audioCtx.destination);
              finalNoiseSource.start();
            } catch(e) {}
          }
          
          let freakoutInterval = setInterval(() => {
            freakoutTime--;
            document.body.style.backgroundColor = "#ff0000"; 
            
            let randomCreepy = creepyPhrases[Math.floor(Math.random() * creepyPhrases.length)];
            // 套用亂序函數
            let randomGlitchTop = scrambleText("☠✝☣▰╳⌖🕈⚡⚠️☠✝☣▰╳⌖🕈⚡⚠️");
            let randomGlitchBottom = scrambleText("☠✝☣▰╳⌖🕈⚡⚠️☠✝☣▰╳⌖🕈⚡⚠️");
            
            document.body.innerHTML = `
              <div style="color:#ffffff; font-family:monospace; text-align:center; padding: 25vh 20px 0 20px; font-size: 1.8rem; font-weight: bold; letter-spacing: 3px; line-height: 2.2; box-sizing:border-box;">
                  <span style="font-size:1.2rem; color:#000000; opacity:0.7;">${randomGlitchTop}</span><br>
                  <span style="background-color:#000000; padding: 12px 25px; color:#ff0011; border:3px solid #ffffff; font-size:2.2rem; display:inline-block; margin:20px 0;">${randomCreepy}</span><br>
                  <span style="font-size:1.2rem; color:#000000; opacity:0.7;">${randomGlitchBottom}</span><br>
                  <p style="font-size:1rem; color:#000000; font-weight:900; margin-top:30px;">[ 核心徹底燒毀... 斷開物理連結：${freakoutTime} ]</p>
              </div>
            `;
            
            if (freakoutTime <= 0) {
              clearInterval(freakoutInterval);
              try { audioCtx.close(); } catch(e){} 
              try { window.close(); } catch(e){}
              window.location.href = "about:blank"; 
            }
          }, 1000);
        }
      }
    }, 1000);
  }
}