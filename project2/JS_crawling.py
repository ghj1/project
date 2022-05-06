from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.keys import Keys
import time
import pyautogui as pg

#browser exposes an executable file
#Through Selenium test we will invoke the executable file which will then
#invoke actual browser
driver = webdriver.Chrome(executable_path="/home/ubuntu/문서/rapa/project/project2/driver/chromedriver")
# to maximize the browser window
driver.maximize_window()
#get method to launch the URL
driver.get("https://www.saramin.co.kr/zf_user/search?search_area=main&search_done=y&search_optional_item=n&searchType=recently&searchword=%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8")
#to refresh the browse

# pyautogui.hotkey('ctrl','s')
# time.sleep(1)
# # pyautogui.write('hello_world')
# pyautogui.hotkey('alt','s')


def image_scroll_mouse_click(img):
    while True:
        if pg.locateOnScreen('next_page.png'):
            np = pg.locateOnScreen('next_page.png')
            ct = pg.center(np)
            pg.moveTo(ct)
            pg.click()
            return ct
        else:
            pg.scroll(-100)


print("다음 페이지 클릭 :",image_scroll_mouse_click('next_page.png'))            