from sre_constants import AT_MULTILINE
import requests as req
import re
from bs4 import BeautifulSoup as bs
from selenium import webdriver
import time  
import pandas as pd
import pymysql
import time 
import datetime

conn = pymysql.connect(host='192.168.16.16',
                       port=3306,
                       user='raaple',
                       passwd='1234',
                       db='raaple',
                       charset='utf8'
                       )
cur = conn.cursor(pymysql.cursors.DictCursor)

sql = """
SELECT search_word, url_link
FROM crawling_list
"""

cur.execute(query=sql)

search_word_url_dict = cur.fetchall()

for key_url in search_word_url_dict:
    browser = webdriver.Chrome('/home/ubuntu/sql/chromedriver')
    browser.get(key_url['url_link'])
    time.sleep(3)
    soup = bs(browser.page_source, "html.parser")



browser = webdriver.Chrome('/home/ubuntu/sql/chromedriver')
for key in ["프로그래머", "파이썬", "python", "머신러닝"]:

    browser = webdriver.Chrome('/home/ubuntu/sql/chromedriver')
    #key_word = input("검색할 키워드를 입력해주세요: ")
    browser.get("https://www.saramin.co.kr/zf_user/search?search_area=main&search_done=y&search_optional_item=n&searchType=search&searchword="+key)



    soup = bs(browser.page_source,'html.parser')
    time.sleep(2)

    all = soup.select("div", class_ = "content")

    jobs = soup.select(".job_tit a")

    for job in jobs:
        link = job.attrs['href']
        title = job.attrs['title']
        flink  = (f"https://www.saramin.co.kr" + link)
        #print(title)
        now = datetime.datetime.now()
        nowDatetime = now.strftime('%Y-%m-%d %H:%M:%S')
        cur.execute(
            """
            INSERT INTO recruit_company(search_word, company, url_link,date_) 
            VALUES(%s,%s,%s,%s)
            """,
            (key,title, flink, nowDatetime)
        )
        conn.commit()



        time.sleep(2)




    browser.quit()

# now = datetime.datetime.now()
# nowDatetime = now.strftime('%Y-%m-%d %H:%M:%S')
# cur.execute(
#     """
#     INSERT INTO crawling_list(search_word, company, url_link,date_) 
#     VALUES(%s,%s,%s,%s)
#     """,
#     (key_word,flink, title, nowDatetime)
# )
# conn.commit()

# # DB 연결 종료
# conn.close()
