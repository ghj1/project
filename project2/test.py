from selenium.webdriver import ActionChains
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

driver = webdriver.Chrome(executable_path="/home/ubuntu/문서/rapa/project/project2/driver/chromedriver")
driver.maximize_window()
action_chains = ActionChains(driver)
options = webdriver.ChromeOptions() 

options.add_argument("download.default_directory=C:/Downloads, download.prompt_for_download=False")

# driver = webdriver.Chrome()


driver.get("https://imagecyborg.com/")

action_chains.send_keys(Keys.CONTROL).send_keys("s").perform()