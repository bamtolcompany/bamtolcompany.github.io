from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

# --- 헤드리스 모드 설정 ---
chrome_options = Options()
# chrome_options.add_argument("--headless")
chrome_options.add_argument("--window-size=1920,1080") # 일부 웹사이트에서는 창 크기가 필요할 수 있습니다.
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36") # User-Agent 설정

# 테스트할 검색어
TEST_QUERY = "가나초콜릿"
SEARCH_COUNT = 500

print("Selenium을 사용하여 브라우저 자동화 테스트를 시작합니다...")

# WebDriver 설정 및 브라우저 실행
try:
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=chrome_options)
    
    # 웹사이트로 이동
    driver.get("https://bamtolcompany.github.io/")
    print(f"'{driver.title}' 웹사이트에 접속했습니다.")
    
    # 3초 대기 (페이지 로딩)
    time.sleep(3)
    
    for i in range(SEARCH_COUNT):
        print(f"\n{i+1}번째 검색을 시작합니다...")
        # 검색어 입력창 찾기 및 검색어 입력
        search_box = driver.find_element(By.ID, "query")
        search_box.clear()
        search_box.send_keys(TEST_QUERY)
        print(f"검색어 '{TEST_QUERY}'를 입력했습니다.")
        
        # '구글 검색' 버튼 찾기 및 클릭
        google_search_button = driver.find_element(By.XPATH, "//button[text()='구글 검색']")
        google_search_button.click()
        print("'구글 검색' 버튼을 클릭했습니다.")
        
        # API 호출이 발생할 시간을 주기 위해 잠시 대기
        time.sleep(1) 

    print(f"\n총 {SEARCH_COUNT}회의 검색을 시도했습니다. reCAPTCHA가 봇의 활동을 감지하여 검색어 저장을 차단해야 합니다.")
    print("5초 후 테스트가 종료됩니다.")
    
    # 최종 확인을 위해 잠시 대기
    time.sleep(5)

except Exception as e:
    print(f"테스트 중 오류가 발생했습니다: {e}")

finally:
    if 'driver' in locals():
        driver.quit()
        print("\n테스트가 종료되었습니다.")