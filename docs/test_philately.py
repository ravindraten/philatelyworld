import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
import time

# --- Configuration ---
# Replace with your local dev URL or GitHub Pages URL
URL = "http://localhost:5500/docs/index.html" 

@pytest.fixture(scope="module")
def driver():
    options = Options()
    # options.add_argument("--headless") # Uncomment to run without a browser window
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()

def test_page_load(driver):
    """Check if the title and main grid load correctly."""
    driver.get(URL)
    assert "Philately World" in driver.title
    grid = driver.find_element(By.ID, "stampGrid")
    cards = grid.find_elements(By.CLASS_NAME, "stamp-card")
    assert len(cards) > 0

def test_search_filtering(driver):
    """Verify that searching for 'India' filters the cards."""
    search_input = driver.find_element(By.ID, "stampSearch")
    search_input.clear()
    search_input.send_keys("India")
    time.sleep(1) # Wait for JS filter

    grid = driver.find_element(By.ID, "stampGrid")
    cards = grid.find_elements(By.CLASS_NAME, "stamp-card")
    
    for card in cards:
        assert "india" in card.text.lower()

def test_currency_toggle(driver):
    """Check if switching to EUR updates the price symbols."""
    eur_btn = driver.find_element(By.ID, "btnEUR")
    eur_btn.click()
    time.sleep(0.5)

    prices = driver.find_elements(By.CLASS_NAME, "price")
    for price in prices:
        assert "€" in price.text
        assert "₹" not in price.text

def test_lightbox_open_close(driver):
    """Verify lightbox opens on image click and closes on 'X'."""
    first_stamp_img = driver.find_element(By.CSS_SELECTOR, ".stamp-card img")
    first_stamp_img.click()

    modal = driver.find_element(By.ID, "myModal")
    assert modal.is_displayed()

    close_btn = driver.find_element(By.ID, "closeModal")
    close_btn.click()
    time.sleep(0.5)
    assert not modal.is_displayed()

def test_sold_out_logic(driver):
    """Check if '350 different Dutch Antilles' is marked as Sold Out."""
    search_input = driver.find_element(By.ID, "stampSearch")
    search_input.clear()
    search_input.send_keys("Antilles")
    
    card = driver.find_element(By.CLASS_NAME, "stamp-card")
    assert "sold-out" in card.get_attribute("class")
    
    buy_btn = card.find_element(By.CLASS_NAME, "buy-btn")
    assert "disabled" in buy_btn.get_attribute("class")