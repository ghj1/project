# import requests as req 
# from bs4 import BeautifulSoup as BS
# import csv
# import re

# # bs 기본형식
# url = 'https://www.saramin.co.kr/zf_user/'
# res = req.get(url)

# print(res.text)
# soup = BS(res.text, "html.parser")

# tds = soup.find_all("td") 

import requests as req
import re
from bs4 import BeautifulSoup as bs
from selenium import webdriver
import time  

# request url
url = 'https://www.saramin.co.kr/zf_user/jobs/relay/view?isMypage=no&rec_idx=41559258&recommend_ids=eJxVz8kNw0AMA8Bq8tdB6ninEPffRRY2YCnPAZcUFkrrYl%2Bl%2FckvFKK%2BaJWReag3HUiTYZQKXxJWrVfZ06WHe6%2BURr4pqInp2tnNv8cQmykxN6y7CVt3FWdv6GTWkHm%2BsRglPrTwipUSNSm8K%2B7uDzfeP%2FI%3D&view_type=search&searchword=%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8&searchType=search&gz=1&t_ref_content=generic&t_ref=search&paid_fl=n#seq=0'
# post 방식으로 데이터를 가져오기 위한 request 시 필요 정보
# 브라우저의 개발자 모드의 network tab의 form 정보 


# post 방식으로 request 요청
res = req.post(url)
# print(res)

soup = bs(res.content, "html.parser")

# print(soup)

print(soup.find_all("div"))