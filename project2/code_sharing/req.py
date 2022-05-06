import requests as req
import re
from bs4 import BeautifulSoup as bs
from selenium import webdriver
import time  
import pandas as pd



browser = webdriver.Chrome('/home/ubuntu/sql/chromedriver')
browser.get("https://www.saramin.co.kr/zf_user/search/recruit?search_area=main&search_done=y&search_optional_item=n&searchType=search&searchword=%EB%B9%85%EB%8D%B0%EC%9D%B4%ED%84%B0&recruitPage=1&recruitSort=relation&recruitPageCount=40&inner_com_type=&company_cd=0%2C1%2C2%2C3%2C4%2C5%2C6%2C7%2C9%2C10&show_applied=&quick_apply=&except_read=&mainSearch=n")
# browser.get("http://www.saramin.co.kr/zf_user/search/recruit?search_area=main&search_done=y&search_optional_item=n&searchType=search&searchword=%EB%B9%85%EB%8D%B0%EC%9D%B4%ED%84%B0&recruitPage=1")
time.sleep(3)


soup = bs(browser.page_source,'html.parser')

df = pd.DataFrame(columns=['공고명','회사명','근무지역','채용조건'])

for j in soup.findAll('div',class_='item_recruit'):
    job_name = j.find('h2',class_='job_tit').text.strip()
    company = j.find('strong',class_='corp_name').text
    working_area = j.find('div',class_='job_condition').find('a').text.strip()
    job_info = j.find('div',class_='job_condition')
    [s.extract() for s in job_info('a')]
    job_info = job_info.text.strip()
    df = df.append({'공고명':job_name,'회사명':company,'근무지역':working_area,'채용조건':job_info}, ignore_index = True)


# for i in range(2,3):
#     browser.find_element_by_xpath('//*[@id="recruit_info_list"]/div[2]/div/a[{}]'.format(i)).click()
#     time.sleep(3)
#     for i in soup.findAll('div',class_='item_recruit'):
#         job_name = i.find('h2',class_='job_tit').text.strip()
#         company = i.find('strong',class_='corp_name').text
#         job_info = i.find('div',class_='job_condition').text.strip()
#         df = df.append({'공고명':job_name,'회사명':company,'근무지역':working_area,'채용조건':job_info}, ignore_index = True)


print(df)
browser.quit()