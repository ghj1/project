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


driver.get("https://www.saramin.co.kr/zf_user/jobs/relay/view?isMypage=no&rec_idx=41559258&recommend_ids=eJxNj8kNA0EIBKPxn4bmejsQ55%2BFR6vVwLNUrRIQdCT9V8Anv4SbVOcgXf1Y7QdpiNZltRrXnjFFByuFdcYvChA5qGEVkwqH1aC3LmtRkH1kmPVFEOGccZ2H5KIiJaesqZK9y8T6151lYxkST%2FkPN%2B4%2F6g%3D%3D&view_type=search&searchword=%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8&searchType=search&gz=1&t_ref_content=generic&t_ref=search&paid_fl=n#seq=0")
driver.implicitly_wait(5)
# soup = bs(chrome.page_source, "html.parser")
# wait = WebDriverWait(driver, 10) 
# short_wait = WebDriverWait(driver, 3) 

driver.switch_to.frame("iframe_content_0")

time.sleep(3)

soup = bs(driver.page_source, "html.parser")
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

# 복지 및 혜택 

driver.switch_to.default_content()

time.sleep(3)
driver.quit()