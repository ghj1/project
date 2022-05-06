import pymysql





import random
import time
# py sound for linux, pip install pyglet 설치
import pyglet
import datetime
import keyboard


words = []                                   # 영어 단어 리스트(1000개 로드)
game_cnt = 1                                 # 게임 시도 횟수
corr_cnt = 0                                 # 정답 개수
check = dict()                               # 중복 단어 확인 dictionary

# DB 생성
conn = pymysql.connect(host='192.168.16.16',
                       port=3306,
                       user='raaple',
                       passwd='1234',
                       db='raaple',
                       charset='utf8'
                       )
cur = conn.cursor()

# DB 테이블 생성
# id 자동 증가
# 정답수
# 걸린 시간
# 저장한 시간.
cur.execute("""
                CREATE TABLE if not exists wordgameDB(id INTEGER PRIMARY KEY AUTO_INCREMENT, 
                                                     corr_cnt TEXT not null,
                                                     timelapse TEXT not null,
                                                     regdate TEXT not null
                                                     )
            """
            )
