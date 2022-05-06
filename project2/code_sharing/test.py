from os import chown
from bs4.element import SoupStrainer
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
from sre_constants import AT_MULTILINE
import requests as req
import re
from bs4 import BeautifulSoup as bs
from selenium import webdriver
import time  




driver_path = '/home/ubuntu/문서/rapa/project/project2/driver/chromedriver'
driver = webdriver.Chrome(driver_path)
# wait = WebDriverWait(chrome, 10) 
# short_wait = WebDriverWait(chrome, 3) 

# 주소
address = "https://www.saramin.co.kr/zf_user/jobs/relay/view?isMypage=no&rec_idx=41534456&recommend_ids=eJxNj8sRxDAIQ6vZOxLIwHkLSf9drLOe2Dm%2BEfoQCIc7rgI%2B%2BQ2EkKGJ9kdvoHurSmrwKi7kgOWtjuUtDZvIXsehFB80FdT%2BRE2kuW%2FvxGRtL5Vp2DNkEs%2BxCww7ajBf6GbwOh9lzlmPOnvdSq9elMX2BqvLT1RlFe%2BoHxuBP9E%3D&view_type=list&gz=1&t_ref_content=ing_recruit&t_ref=company_info_view#seq=0"
test_addr = "https://www.saramin.co.kr/zf_user/jobs/relay/view?isMypage=no&rec_idx=41559258&recommend_ids=eJxNj8kNA0EIBKPxn4bmejsQ55%2BFR6vVwLNUrRIQdCT9V8Anv4SbVOcgXf1Y7QdpiNZltRrXnjFFByuFdcYvChA5qGEVkwqH1aC3LmtRkH1kmPVFEOGccZ2H5KIiJaesqZK9y8T6151lYxkST%2FkPN%2B4%2F6g%3D%3D&view_type=search&searchword=%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8&searchType=search&gz=1&t_ref_content=generic&t_ref=search&paid_fl=n#seq=0"

driver.get(address)
driver.implicitly_wait(5)
# soup = bs(chrome.page_source, "html.parser")
driver.switch_to.frame("iframe_content_0")

time.sleep(3)

# selector
table = "body > div > div > table > tbody > tr:nth-child(3) > td > table"
sentence = "body > div > div > div:nth-child(2) > div:nth-child(2) > div > pre"

soup = bs(driver.page_source, "html.parser")

def text_crawler(select):
    lst = []
    sintros = soup.select(select)
    for intro in sintros:
        it = intro.text
        lst.extend(it.split('\n'))
        print(it)
    return lst

print()
temp = text_crawler(table)
print(temp)
# temp.remove(' ')
print(temp)

for i in text_crawler(table):
    print(i.count('C/C++'))

driver.switch_to.default_content()
# [].remove('')
time.sleep(3)
# driver.quit()