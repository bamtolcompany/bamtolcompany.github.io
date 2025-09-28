    const SAVE_API_URL = "https://backend-bzep.onrender.com/api/save-query";
    const AUTOCOMPLETE_API_URL = "https://backend-bzep.onrender.com/api/autocomplete";
    const TOP_QUERIES_API_URL = "https://backend-bzep.onrender.com/api/top-queries";
    var language = navigator.language;
    function mobile() {
      return window.innerWidth <= 480;
    }

    function saveQuery(query) {
      if (!query) return;

      fetch(SAVE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      })
        .then(res => res.json())
        .then(data => console.log("Query saved:", data))
        .catch(err => console.error("저장 실패:", err));
    }
    let f8Pressed = false;

    document.addEventListener("keydown", function (event) {
      if (event.key === "F8") {
        f8Pressed = true;
      }
    });

    document.addEventListener("keyup", function (event) {
      if (event.key === "F8") {
        f8Pressed = false;
      }
    });

    function search(engine) {
      const input = document.getElementById('query');
      const query = input.value.trim();
      if (!query) { alert("검색어를 입력하세요"); return; }

      saveQuery(query);

      let url = '';
      switch (engine) {
        case 'google': url = `https://www.google.com/search?q=${encodeURIComponent(query)}`; break;
        case 'naver': url = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`; break;
        case 'daum': url = `https://search.daum.net/search?q=${encodeURIComponent(query)}`; break;
        case 'yahoo': url = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`; break;
        case 'bing': url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`; break;
        case 'nate': url = `https://search.daum.net/nate?q=${encodeURIComponent(query)}`; break;
        case 'zum': url = `https://search.zum.com/search.zum?query=${encodeURIComponent(query)}`; break;
        case 'youtube': url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`; break;
        case 'images': url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`; break;
        case 'ai': url = `https://www.google.com/search?udm=50&aep=11&q=${encodeURIComponent(query)}`; break;
        case 'blog': url = `https://search.naver.com/search.naver?ssc=tab.blog.all&sm=tab_jum&query=${encodeURIComponent(query)}`; break;
        case 'naverKnowledgeIn': url = `https://search.naver.com/search.naver?ssc=tab.kin.kqna&where=kin&sm=tab_jum&query=${encodeURIComponent(query)}`; break;
      }
      if (mobile()) {
        window.location.href = url;
      }
      else {
        if (f8Pressed) {
          window.open(url, '_blank', 'width=600,height=400');

        }
        else {
          window.open(url, '_blank');
        }
      }
      localStorage.setItem("recentSearchEngine", engine);
      f8Pressed = false;
    }

    // 인기 검색어 불러오기
    async function loadTopQueries() {
      try {
        const res = await fetch(TOP_QUERIES_API_URL);
        const data = await res.json();
        const list = document.getElementById("top-queries");
        list.innerHTML = "";

        data.forEach(item => {
          const li = document.createElement("li");
          li.classList.add("list")
          li.textContent = item.query;
          li.style.cursor = "pointer";
          li.addEventListener("click", () => {
            document.getElementById('query').value = item.query;
          });
          list.appendChild(li);
        });
      } catch (err) {
        console.error("인기 검색어 불러오기 에러:", err);
      }
    }
    const WEEKLY_TOP_QUERIES_API_URL = "https://backend-bzep.onrender.com/api/weekly-top-queries";
    async function loadWeeklyTopQueries() {
      try {
        const res = await fetch(WEEKLY_TOP_QUERIES_API_URL);
        const data = await res.json();
        const list = document.getElementById("weekly-top-queries");
        list.innerHTML = "";

        data.forEach(item => {
          const li = document.createElement("li");
          li.classList.add("list")
          li.textContent = item.query;
          li.style.cursor = "pointer";
          li.addEventListener("click", () => {
            document.getElementById('query').value = item.query;
          });
          list.appendChild(li);
        });
      } catch (err) {
        console.error("인기 검색어 불러오기 에러:", err);
      }
    }

    // 페이지 로드 시 인기 검색어 자동 로딩
    window.addEventListener("DOMContentLoaded", () => {
      loadTopQueries();
      loadWeeklyTopQueries();
    });

    const inputBox = document.getElementById('query');
    const autocompleteList = document.getElementById('autocomplete-list');

    inputBox.addEventListener('input', async () => {
      const q = inputBox.value.trim();
      if (!q) { autocompleteList.style.display = 'none'; return; }

      try {
        const res = await fetch(`${AUTOCOMPLETE_API_URL}?q=${encodeURIComponent(q)}`);
        const suggestions = await res.json();

        autocompleteList.innerHTML = '';
        if (suggestions.length === 0) { autocompleteList.style.display = 'none'; return; }

        suggestions.forEach(s => {
          const li = document.createElement('li');
          li.textContent = s;
          li.addEventListener('click', () => {
            inputBox.value = s;
            autocompleteList.style.display = 'none';
          });
          autocompleteList.appendChild(li);
        });
        autocompleteList.style.display = 'block';
      } catch (err) {
        console.error("자동완성 에러:", err);
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#query') && !e.target.closest('#autocomplete-list')) {
        autocompleteList.style.display = 'none';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== inputBox) {
        e.preventDefault();
        inputBox.focus();
        return;
      }
      if (e.key === 'Enter' && inputBox.value.startsWith('@google')) {
        inputBox.value = inputBox.value.replace(/^@google\s*/, '');
        search('google');
      }
      else if (e.key === 'Enter' && inputBox.value.startsWith('@naver')) {
        inputBox.value = inputBox.value.replace(/^@naver\s*/, '');
        search('naver');
      }
      else if (e.key === 'Enter' && inputBox.value.startsWith('@daum')) {
        inputBox.value = inputBox.value.replace(/^@daum\s*/, '');
        search('daum');
      }
      else if (e.key === 'Enter' && inputBox.value.startsWith('@yahoo')) {
        inputBox.value = inputBox.value.replace(/^@yahoo\s*/, '');
        search('yahoo');
      }
      else if (e.key === 'Enter' && inputBox.value.startsWith('@youtube')) {
        inputBox.value = inputBox.value.replace(/^@youtube\s*/, '');
        search('youtube');
      }
      else if (e.key === 'Enter' && inputBox.value.startsWith('@bing')) {
        inputBox.value = inputBox.value.replace(/^@bing\s*/, '');
        search('bing');
      }
      else if (e.key === 'Enter' && inputBox.value.startsWith('@ai')) {
        inputBox.value = inputBox.value.replace(/^@ai\s*/, '');
        search('ai');
      }
      else if (e.key === 'Enter') {
        const engine = localStorage.getItem("recentSearchEngine");
        if (engine == null) {
          alert("최근에 사용한 검색엔진이 없습니다");
          return;
        }
        search(engine);
      }

      if (e.ctrlKey && e.altKey) {
        e.preventDefault();
        const key = e.key.toUpperCase();
        switch (key) {
          case 'G': search('google'); break;
          case 'N': search('naver'); break;
          case 'Y': search('youtube'); break;
        }
      }
    });


    function startVoiceRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) { alert("이 브라우저는 음성 인식을 지원하지 않아요. 크롬을 사용해주세요."); return; }

      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.start();

      recognition.onresult = function (event) {
        inputBox.value = event.results[0][0].transcript;
      };

      recognition.onerror = function (event) {
        alert("음성 인식 오류: " + event.error);
      };
    }
    function setTime(lang) {
      const time = document.getElementById("time");
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      };
      var today = new Date();
      var month = today.getMonth() + 1;
      var day = today.getDate();
      if (month === 3 && day === 1) {
        time.innerHTML = Intl.DateTimeFormat(lang, options).format(new Date()) + "/ 3.1절";
      }
      else if (month === 7 && day === 17) {
        time.innerHTML = Intl.DateTimeFormat(lang, options).format(new Date()) + "/ 제헌절";
      }
      else if (month === 8 && day === 15) {
        time.innerHTML = Intl.DateTimeFormat(lang, options).format(new Date()) + "/ 광복절";
      }
      else if (month === 10 && day === 3) {
        time.innerHTML = Intl.DateTimeFormat(lang, options).format(new Date()) + "/ 개천절";
      }
      else if (month === 10 && day === 9) {
        time.innerHTML = Intl.DateTimeFormat(lang, options).format(new Date()) + "/ 한글날";
      }
      else {
        time.innerHTML = Intl.DateTimeFormat(lang, options).format(new Date());
      }
    }
    function getWeather(location) {
      if (!location) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getCityName(lat, lon, function (city) {
              fetchWeather(lat, lon, city);
            });
          }, function (err) {
            console.error(err);
            fetchWeather(37.5665, 126.9780, "Seoul");
          });
        } else {
          fetchWeather(37.5665, 126.9780, "Seoul");
        }
      } else {
        // 도시 이름으로 좌표 가져오기
        getCityCoordinates(location, function (lat, lon, city) {
          fetchWeather(lat, lon, city);
        });
      }
    }

    function getCityName(lat, lon, callback) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {
          const city = data.address.city || data.address.town || data.address.village || data.address.county || "Unknown";
          callback(city);
        })
        .catch(err => {
          console.error(err);
          callback("Unknown");
        });
    }

    function getCityCoordinates(city, callback) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            callback(parseFloat(data[0].lat), parseFloat(data[0].lon), city);
          } else {
            callback(37.5665, 126.9780, "Seoul");
          }
        })
        .catch(err => {
          console.error(err);
          callback(37.5665, 126.9780, "Seoul");
        });
    }

    function weatherCodeToText(code) {
      if (code === 0) return "맑음";
      if ([1, 2, 3].includes(code)) return "구름 조금/흐림";
      if ([45, 48].includes(code)) return "안개";
      if ([51, 53, 55].includes(code)) return "이슬비";
      if ([61, 63, 65].includes(code)) return "비";
      if ([71, 73, 75].includes(code)) return "눈";
      if ([80, 81, 82].includes(code)) return "소나기";
      if ([95, 96, 99].includes(code)) return "뇌우";
      return "알 수 없음";
    }

    function fetchWeather(lat, lon, city) {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(res => res.json())
        .then(data => {
          const weather = data.current_weather;
          const statusText = weatherCodeToText(weather.weathercode);
          if (city == "Unknown") {
            document.getElementById("weather").innerHTML = `현재위치 날씨: ${statusText}, 온도: ${weather.temperature}°C, 풍속: ${weather.windspeed} km/h`
          }
          else if (city != "Unknown") {
            document.getElementById("weather").innerHTML =
              `${city} 날씨: ${statusText}, 온도: ${weather.temperature}°C, 풍속: ${weather.windspeed} km/h`;
          }
          if (city == "Seoul") {
            document.getElementById("weather").innerHTML = `서울특별시 날씨: ${statusText}, 온도: ${weather.temperature}°C, 풍속: ${weather.windspeed} km/h`
          }
        })
        .catch(err => {
          console.error(err);
          document.getElementById("weather").innerHTML = "날씨 정보를 가져올 수 없습니다.";
        });
    }

    function setTheme(value) {
      document.body.className = value === 'none' ? '' : value;
      localStorage.setItem("테마", document.body.className);

      let retroLink = document.getElementById("retro-css");
      if (value === "window") {
        if (!retroLink) {
          retroLink = document.createElement("link");
          retroLink.id = "retro-css";
          retroLink.rel = "stylesheet";
          retroLink.href = "https://unpkg.com/98.css";
          document.head.appendChild(retroLink);
        }
      } else {
        if (retroLink) retroLink.remove();
      }
    }

    setTime(language);
    setInterval(function () {
      setTime(language);
    }, 1000)
    getWeather("서울 특별시")

    const savedTheme = localStorage.getItem("테마") || "none";
    document.body.className = savedTheme === "none" ? "" : savedTheme;
    document.getElementById('theme-select').value = savedTheme;

    if (savedTheme === "window") {
      const retroLink = document.createElement("link");
      retroLink.id = "retro-css";
      retroLink.rel = "stylesheet";
      retroLink.href = "https://unpkg.com/98.css";
      document.head.appendChild(retroLink);
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker 등록 성공'))
        .catch(() => console.log('Service Worker 등록 실패'));
    }
    function logo() {
      var specialLogo = document.getElementById("specialLogo");
      const date = new Date();
      var formatted = new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric"
      }).format(date);
      if (formatted == "10/6") {
        specialLogo.src = "추석.png";
      }
    }
    logo();