const SAVE_API_URL = "https://backend-bzep.onrender.com/api/save-query";
const AUTOCOMPLETE_API_URL = "https://backend-bzep.onrender.com/api/autocomplete";
const TOP_QUERIES_API_URL = "https://backend-bzep.onrender.com/api/top-queries";
var language = navigator.language;
function showSearchEngine(lang) {
    lang = language;
    const button = document.getElementById("mysterybtn");
    if (lang.includes("zh")) {
        button.innerHTML = "百度";
        button.onclick = () => search("baidu");
    }
    else if (lang.includes("ru")) {
        button.innerHTML = "ЯНДЕКС";
        button.onclick = () => search("yandex");
    }
}
function mobile() {
    return window.innerWidth <= 480;
}

let currentSearchEngine;

function saveQuery(query, token) {
    if (!query) return;

    fetch(SAVE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, token }),
        keepalive: true
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
    if (!query) {
        Swal.fire({
            title: '검색어를 입력해주세요',
            icon: 'warning',
            confirmButtonText: '확인',
            confirmButtonColor: 'orange',
            scrollbarPadding: false,
            allowEnterKey: false
        }); return;
    }

    currentSearchEngine = engine;

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
        case 'baidu': url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`; break;
        case 'yandex': url = `https://yandex.ru/search/?text=${encodeURIComponent(query)}`; break;
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
    let searchQueryList = JSON.parse(localStorage.getItem("searchQueryList")) || [];
    searchQueryList.push(query);
    localStorage.setItem("searchQueryList", JSON.stringify(searchQueryList));
    f8Pressed = false;

    grecaptcha.ready(() => {
        grecaptcha.execute('6Lc5l-0rAAAAAE6lLGJAPEJx2Pb8N5OVu-Tazxu2', { action: 'search' }).then((token) => {
            saveQuery(query, token);
        });
    });
}

// 인기 검색어 불러오기
async function loadTopQueries() {
    try {
        grecaptcha.ready(async () => {
            const token = await grecaptcha.execute('6Lc5l-0rAAAAAE6lLGJAPEJx2Pb8N5OVu-Tazxu2', { action: 'top_queries' });
            const res = await fetch(TOP_QUERIES_API_URL, {
                headers: { 'X-Recaptcha-Token': token }
            });
            const data = await res.json();
            if (!res.ok) {
                console.error('[인기 검색어 TOP10] API 요청 실패:', data);
                const list = document.getElementById("top-queries");
                list.innerHTML = "<li>인기 검색어를 불러오지 못했습니다.</li>";
                return;
            }
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
        });
    } catch (err) {
        console.error("인기 검색어 불러오기 처리 중 에러:", err);
        const list = document.getElementById("top-queries");
        list.innerHTML = "<li>인기 검색어를 불러오는 중 오류가 발생했습니다.</li>";
    }
}
const WEEKLY_TOP_QUERIES_API_URL = "https://backend-bzep.onrender.com/api/weekly-top-queries";
async function loadWeeklyTopQueries() {
    try {
        grecaptcha.ready(async () => {
            const token = await grecaptcha.execute('6Lc5l-0rAAAAAE6lLGJAPEJx2Pb8N5OVu-Tazxu2', { action: 'weekly_queries' });
            const res = await fetch(WEEKLY_TOP_QUERIES_API_URL, {
                headers: { 'X-Recaptcha-Token': token }
            });
            const data = await res.json();
            if (!res.ok) {
                console.error('[주간 인기 검색어] API 요청 실패:', data);
                const list = document.getElementById("weekly-top-queries");
                list.innerHTML = "<li>주간 인기 검색어를 불러오지 못했습니다.</li>";
                return;
            }
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
        });
    } catch (err) {
        console.error("주간 인기 검색어 불러오기 처리 중 에러:", err);
        const list = document.getElementById("weekly-top-queries");
        list.innerHTML = "<li>주간 인기 검색어를 불러오는 중 오류가 발생했습니다.</li>";
    }
}

function onRecaptchaScriptLoad() {
    // reCAPTCHA 스크립트가 로드된 후 호출됩니다.
    loadTopQueries();
    loadWeeklyTopQueries();
}

// 페이지 로드 시 인기 검색어 자동 로딩
window.addEventListener("DOMContentLoaded", () => {
    // grecaptcha를 사용하지 않는 다른 함수들은 여기에서 호출합니다.
    loadNewsDashboard();
    loadExchangeRates();
    setupNotepad();
    loadReadLaterLinks();
    showSearchEngine();
});

let usdToKrwRate = 0;

async function loadExchangeRates() {
    const exchangeRateDisplay = document.getElementById('exchange-rate-display');
    exchangeRateDisplay.innerHTML = '환율 정보를 불러오는 중...';
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        usdToKrwRate = data.usd.krw;
        exchangeRateDisplay.innerHTML = `1달러 = ${usdToKrwRate.toFixed(2)}원`;

        const krwInput = document.getElementById('krw-input');
        if (krwInput) {
            krwInput.addEventListener('input', convertCurrency);
        }

    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        exchangeRateDisplay.innerHTML = '환율 정보 로딩 실패';
    }
}

function convertCurrency() {
    const krwInput = document.getElementById('krw-input');
    const usdOutput = document.getElementById('usd-output');
    const krwAmount = parseFloat(krwInput.value);

    if (isNaN(krwAmount) || krwAmount <= 0) {
        usdOutput.innerHTML = "";
        return;
    }

    if (usdToKrwRate > 0) {
        const usdAmount = krwAmount / usdToKrwRate;
        usdOutput.innerHTML = `${krwAmount.toLocaleString()}원은 약 ${usdAmount.toFixed(2)}달러입니다.`;
    } else {
        usdOutput.innerHTML = "환율 정보가 없습니다.";
    }
}

function setupNotepad() {
    const notepad = document.getElementById('notepad');
    if (notepad) {
        const savedNote = localStorage.getItem('notepadContent');
        if (savedNote) {
            notepad.value = savedNote;
        }
        notepad.addEventListener('input', () => {
            localStorage.setItem('notepadContent', notepad.value);
        });
    }
}

// HTML 태그를 제거하고 텍스트를 자르는 헬퍼 함수
function stripHtmlAndTruncate(html, maxLength) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let text = doc.body.textContent || "";
    if (text.length > maxLength) {
        text = text.substring(0, maxLength) + '...';
    }
    return text;
}

async function loadNewsDashboard() {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '<p style="text-align:center;">최신 뉴스를 불러오는 중... <img src="loading.gif"/></p>';

    const rssUrl = 'https://news.google.com/rss?hl=ko';
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const articles = data.items;

        newsContainer.innerHTML = ''; // Clear loading message

        let maxItems = mobile() ? 5 : 10;

        articles.slice(0, maxItems).forEach(article => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <h3><a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.title}</a></h3>
                <p>${stripHtmlAndTruncate(article.description || '', 150)}</p>
                <p class="news-source">${new Date(article.pubDate).toLocaleString()}</p>
            `;
            newsContainer.appendChild(newsItem);
        });

    } catch (error) {
        console.error('Error fetching or parsing news data:', error);
        newsContainer.innerHTML = '<p style="text-align:center;">뉴스 로딩에 실패했습니다.</p>';
    }
}

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
            Swal.fire({
                title: '최근에 사용한 검색엔진이 없습니다',
                icon: 'error',
                confirmButtonText: '확인',
                confirmButtonColor: 'red',
                scrollbarPadding: false,
                allowEnterKey: false
            });
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
// 음성인식 하는 코드

function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        Swal.fire({
            title: '이 브라우저는 음성인식을 지원하지 않아요. 크롬을 사용해주세요.',
            icon: 'error',
            confirmButtonText: '확인',
            confirmButtonColor: 'red',
            cancelButtonText: "취소",
            showCancelButton: true,
            scrollbarPadding: false,
            allowEnterKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "https://www.google.com/intl/ko_kr/chrome/";
            }
        }); return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();

    recognition.onresult = function (event) {
        inputBox.value = event.results[0][0].transcript;
    };

    recognition.onerror = function (event) {
        Swal.fire({
            title: '음성 인식 오류: ' + event.error,
            icon: 'error',
            confirmButtonText: '확인',
            confirmButtonColor: 'red',
            scrollbarPadding: false,
            allowEnterKey: false
        });
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

const newsAgencyMap = {
    'MBC뉴스': '문화방송',
    'SBS뉴스': '서울방송',
    'KBS뉴스': '한국방송',
    'YTN뉴스': '연합텔레비젼뉴스',
    '조선일보': '조선일보',
    '한겨레': '한겨레',
    '연합뉴스TV': '연합뉴스',
    '뉴시스': '뉴시스',
    '스포츠조선': '스포츠조선',
    '오마이뉴스': '오마이뉴스',
    '블로터': '블로터닷넷',
    'Korea JoongAng Daily': '코리아 중앙 데이리',
    '아시아경제': '아세아경제',
    '지디넷 코리아': '지디넷 코리아',
    '아이뉴스24': '아이뉴스24',
    '경인일보': '경인일보',
    '인천일보': '인천일보',
    '기호일보': '기호일보',
    'The Korea Times': '코리아타임스',
    '이데일리': '이데이리',
    '한국금융신문': '한국금융신문',
    'JTBC': '제이티비씨',
    '뉴스타파': '뉴스타파',
    '디지털데일리': '디지탈데이리'
};

function updateNewsAgencyNames(theme) {
    const newsLinks = document.querySelectorAll('.m-news ul li a');
    newsLinks.forEach(link => {
        if (!link.dataset.originalName) {
            link.dataset.originalName = link.textContent;
        }

        if (theme === 'window') {
            const originalName = link.dataset.originalName;
            const newName = newsAgencyMap[originalName];
            if (newName) {
                link.textContent = newName;
            }
        } else {
            link.textContent = link.dataset.originalName;
        }
    });
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
    updateNewsAgencyNames(value);
}

setTime(language);
setInterval(function () {
    setTime(language);
}, 1000)
getWeather("서울 특별시")

const savedTheme = localStorage.getItem("테마") || "none";
document.body.className = savedTheme === "none" ? "" : savedTheme;
document.getElementById('theme-select').value = savedTheme;
updateNewsAgencyNames(savedTheme);

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
// 검색창 고정 하는 코드
const input = document.getElementById('query');
const sentinel = document.getElementById('query-sentinel');
const inputContainer = document.getElementById('inputContainer');
const body = document.querySelector('body');

const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) {
        inputContainer.style.position = 'fixed';
        inputContainer.style.top = '10px';
        inputContainer.style.left = '50%';
        inputContainer.style.transform = 'translateX(-50%)';
        inputContainer.style.zIndex = '999';
        inputContainer.style.width = '85%';
        inputContainer.style.padding = '10px';
        inputContainer.style.paddingLeft = '30px';
        inputContainer.style.borderRadius = '50px';

        if (body.className == 'dark') {
            inputContainer.style.backgroundColor = 'rgba(1, 1, 1, 0.36)';
            inputContainer.style.backdropFilter = 'blur(5px)';
            inputContainer.style.border = '1px solid rgba(0, 0, 0, 0.94)';
            input.style.backgroundColor = 'rgba(83, 83, 83, 0.31)'
        }
        else if (body.className == 'white') {
            inputContainer.style.backgroundColor = 'white';
        }
        else if (body.className == 'yellow') {
            inputContainer.style.backgroundColor = 'lightyellow';
        }
        else if (body.className == 'window') {
            inputContainer.style.backgroundColor = '';
        }
        else {
            inputContainer.style.backgroundColor = 'rgba(52, 214, 255, 0.33)';
            inputContainer.style.backdropFilter = 'blur(5px)'
            inputContainer.style.border = '1px solid rgba(0, 174, 255, 0.68)';
            input.style.backgroundColor = 'rgba(255, 255, 255, 0.62)'
        }
    } else {
        inputContainer.style.position = '';
        inputContainer.style.top = '';
        inputContainer.style.left = '';
        inputContainer.style.transform = '';
        inputContainer.style.zIndex = '';
        inputContainer.style.width = '';
        inputContainer.style.backgroundColor = '';
        inputContainer.style.padding = '';
        inputContainer.style.paddingLeft = '';
        inputContainer.style.backdropFilter = '';
        inputContainer.style.border = '';
        input.style.backgroundColor = '';
    }
}, { threshold: 0 });

observer.observe(sentinel);

logo();

// === "나중에 볼 링크" 기능 시작 ===
const READ_LATER_KEY = 'readLaterLinks';
const MAX_LINKS = 5;

function loadReadLaterLinks() {
    const listElement = document.getElementById('read-later-list');
    if (!listElement) return;

    const links = JSON.parse(localStorage.getItem(READ_LATER_KEY) || '[]');
    listElement.innerHTML = '';

    if (links.length === 0) {
        listElement.innerHTML = '<p style="text-align:center;">저장된 링크가 없습니다. 링크를 우클릭해 저장하세요.</p>';
        return;
    }

    links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.text;
        a.target = '_blank'; // Open in new tab
        a.rel = 'noopener noreferrer';
        li.appendChild(a);
        listElement.appendChild(li);
    });

}
function removeLink() {
    localStorage.setItem(READ_LATER_KEY, '');
    loadReadLaterLinks();

}

function saveToReadLater(url, text) {
    let links = JSON.parse(localStorage.getItem(READ_LATER_KEY) || '[]');

    // Prevent duplicates
    if (links.some(link => link.url === url)) {
        Swal.fire({
            title: '이미 저장된 링크입니다.',
            icon: 'info',
            confirmButtonText: '확인',
            confirmButtonColor: 'orange',
        });
        return;
    }

    // Add new link to the beginning
    links.unshift({ url, text });

    // Keep only the latest 5
    if (links.length > MAX_LINKS) {
        links = links.slice(0, MAX_LINKS);
    }

    localStorage.setItem(READ_LATER_KEY, JSON.stringify(links));
    loadReadLaterLinks();
    Swal.fire({
        title: '링크를 저장했습니다.',
        icon: 'success',
        confirmButtonText: '확인',
        confirmButtonColor: 'green',
        timer: 1500
    });
}

document.addEventListener('contextmenu', function (e) {
    const target = e.target.closest('a');
    if (!target || !target.href) {
        removeCustomContextMenu();
        return;
    }

    e.preventDefault();
    removeCustomContextMenu(); // Remove any existing menu

    const menu = document.createElement('div');
    menu.id = 'custom-context-menu';
    menu.style.top = `${e.pageY}px`;
    menu.style.left = `${e.pageX}px`;

    const saveButton = document.createElement('button');
    saveButton.innerHTML = '링크 저장하기';
    saveButton.onclick = function () {
        const text = target.innerHTML.replace(/<[^>]*>?/gm, '').trim();
        saveToReadLater(target.href, text || target.href);
        removeCustomContextMenu();
    };

    menu.appendChild(saveButton);
    document.body.appendChild(menu);
});

function removeCustomContextMenu() {
    const existingMenu = document.getElementById('custom-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
}

document.addEventListener('click', removeCustomContextMenu);
// === "나중에 볼 링크" 기능 끝 ===

const queryHistory = document.getElementById("queryHistory");
var searchQueryList = JSON.parse(localStorage.getItem("searchQueryList")) || [];

let recentQueries = searchQueryList.slice(-5).reverse(); // 최신순으로 정렬

// <li> 태그로 표시
queryHistory.innerHTML = ""; // 초기화
recentQueries.forEach(query => {
    const li = document.createElement("li");
    li.textContent = query;
    li.style.cursor = "pointer";
    li.onclick = () => {
        input.value = li.textContent; // 클릭하면 input에 값 넣기
    };
    queryHistory.appendChild(li);
});