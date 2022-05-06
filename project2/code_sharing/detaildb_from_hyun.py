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

# db 연결
conn = pymysql.connect(host='192.168.16.16',
                       port=3306,
                       user='raaple',
                       passwd='1234',
                       db='raaple',
                       charset='utf8'
                       )
cur = conn.cursor(pymysql.cursors.DictCursor)

# 검색어 및 url 가져오기
sql = """
SELECT search_word, url_link
FROM crawling_list
"""

cur.execute(query=sql)

search_word_url_dict = cur.fetchall()

for key_url in search_word_url_dict:
    browser = webdriver.Chrome('/home/ubuntu/문서/rapa/project/project2/driver/chromedriver')
    browser.get(key_url['url_link'])
    time.sleep(3)
    soup = bs(browser.page_source, "html.parser")


    # company 
    com_names = soup.select_one("div.wrap_jv_cont > div.wrap_jv_header > div.jv_header > a.company")
    name = com_names.attrs['title']
    print(name)

    # title 
    titles = soup.select_one("div.wrap_jv_cont > div.wrap_jv_header > div.jv_header > h1")
    for title in titles:
        title_text = title.get_text(strip=True)
        # print(title_text)

    # job_pattern 
    col_1 = ['경력','학력','근무형태']
    col1_dict = dict()
    for i in range(3):
        career = soup.select_one(f"div.wrap_jv_cont > div.jv_cont.jv_summary > div.cont > div:nth-child(1) > dl:nth-child({i+1}) > dd > strong")
        for j in career:
            col1_dict[col_1[i]] = j.text
            # print(j.text)
    # print(col1_dict)

    # salary, addr
    col_2 = []
    temp = []
    i = 0
    while True:
        try:
            tmp = soup.select_one(f"div.wrap_jv_cont > div.jv_cont.jv_summary > div.cont > div:nth-child(2) > dl:nth-child({i+1}) > dt")
            temp.extend(tmp)
            i += 1
            if not tmp:
                break
        except:
            break

    for i in range(len(temp)):
        col_2.append(temp[i].text)

    col2_dict = dict()
    for i in range(len(col_2)):
        career = soup.select_one(f"div.wrap_jv_cont > div.jv_cont.jv_summary > div.cont > div:nth-child(2) > dl:nth-child({i+1}) > dd")
        # print(career)
        col2_dict[col_2[i]] = (career.text).strip().replace('\n','')
        # for j in career:
        #     col2_dict[col_2[i]] = (j.text).strip().replace('\n','')
            # print(j.text)   
    # print(col2_dict)

    work_day = '주 5일'
    death_line = '상시모집'

    # 기술 stack count
    # browser.implicitly_wait(5)
    # soup = bs(chrome.page_source, "html.parser")
    # wait = WebDriverWait(driver, 10) 
    # short_wait = WebDriverWait(driver, 3) 

    # iframe 들어가기
    browser.switch_to.frame("iframe_content_0")

    time.sleep(2)

    soup = bs(browser.page_source, "html.parser")
    detail = soup.getText().split('\n')
    detail.remove('')
    print(detail)

    count_word = {'window_':['Windows','windows','윈도우스','윈도우10','윈도우'],
                'linux':['Linux','linux','리눅스'],
                'mac':['Mac','mac','맥','맥OS','macOS','MacOS','MACOS'],
                'unix':['Unix','unix','유닉스'],
                'ios':['ios','아이오에스','IOS','iOS','Ios'],
                'android':['Android','android','안드로이드','AOS','aos','aOS','Aos'],
                'oracle':['Oracle','oracle','오라클','ORACLE'],
                'mysql_':['Mysql','mysql','마이에스큐엘','MySQL','MYSQL'],
                'cassandra':['Cassandra','cassandra', '카싼드라'],
                'redis':['Redis','redis','레디스'],
                'mongodb':['Mongodb','mongodb','몽고디비','몽고db','MONGODB','MONGO'],
                'sqlite':['SQLite','sqlite'],
                'python':['Python','python','파이썬','파이선','PYTHON'],
                'java':['JAVA','java','Java','자바'],
                'javascript':['javascript','Javascript','자바스크립트'],
                'html5':['HTML5','HTML','html5','html'],
                'css3':['CSS3','CSS','css3','css'],
                'c':['C','c','C언어','c언어','objective-c','objective-C','objectiveC','ObjectiveC','objectivec','Objectivec'],
                'cpp':['C++','c++','cpp','CPP','Cpp','objective-c++','objective-C++','ObjectiveC++','Objectivec++'],
                'django':['django','Django','장고'],
                'ros':['ROS','ros','로스','rOS'],
                'ros2':['ROS2','ros2','로스2','rOS2'],
                'slam':['SLAM','slam','슬램','Slam'],
                '머신러닝':['머신러닝','Machine Learning','machine learning'],
                '딥러닝':['딥러닝','Deep Learning','deep learning','deeplearing','Deeplearning','DeepLearning','deep_learning','Deep_Learning'],
                '데이터 엔지니어링':['데이터 엔지니어링','Data Engineering','data engineering','data_engineering','Data_Engineering'],
                '머신비전':['머신비전','Machine Vision','machine vision','Machine_Vision','machine_vision'],
                'AI':['AI','Ai','ai','aI'],
                'AI비전':['AI 비전','AI비전','ai비전','ai 비전','Ai비전','Ai 비전','aI비전','aI 비전'],
                '빅데이터':['빅데이터','Bigdata','bigdata','big data','Big Data','Big data','big Data','BigData'],
                '영상처리':['영상처리','vision processing','Vision Processing']
    }

    count_dict = dict()
    for keywords in count_word.keys():
        for keyword in count_word[keywords]:

            for line in detail:
                for elem in line.split(' '):
                    tmp = elem.count(keyword)
                    if tmp:
                        if keywords not in count_dict:
                            count_dict[keywords] = 0
                        count_dict[keywords] += tmp

    print(count_dict)

    # iframe 빠져나오기
    browser.switch_to.default_content()

    # 회사 기본정보 db에 입력
    cur.execute(
        """
        INSERT INTO recruit_company(company,addr,title,job_pattern,salary,work_day,death_line) 
        VALUES(%s,%s,%s,%s,%s,%s,%s)
        """,
        (name,col2_dict['근무지역'],title_text,col1_dict['근무형태'],col2_dict['급여'],work_day, death_line)
    )
    conn.commit()

    # Primary Key 얻기
    # 마지막 번호 얻기
    pk_sql = """
    SELECT index_
    FROM recruit_company
    """
    cur.execute(query=pk_sql)

    pk_lst = cur.fetchall()
    last_pk_num = pk_lst[-1]['index_']

    # 기술 스택 db에 입력
    for key, value in count_dict.items():
        if not key or not value:
            break
        cur.execute(f"""
            UPDATE recruit_company
            SET {key} = {value} 
            WHERE index_ = {last_pk_num}
            """
            )
        conn.commit()
    # conn.commit()

browser.quit()