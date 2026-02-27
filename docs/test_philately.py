import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

# --- Configuration ---
# Replace with your local dev URL or GitHub Pages URL
#URL = "http://localhost:5500/docs/index.html" 
URL = "http://127.0.0.1:5500/docs/index.html"

@pytest.fixture(scope="module")
def driver():
    options = Options()
    options.add_argument("--headless=new") # Modern headless mode
    options.add_argument("--no-sandbox")   # Required for Linux/CI environments
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080") # Set a standard 'desktop' size
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
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
    """Verify that searching for 'Germany' filters the cards accurately."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    
    search_input = wait.until(EC.presence_of_element_located((By.ID, "stampSearch")))
    search_input.clear()
    search_input.send_keys("Germany")

    # Instead of sleep, wait until the first card contains 'Germany'
    wait.until(EC.text_to_be_present_in_element((By.CLASS_NAME, "stamp-card"), "Germany"))

    cards = driver.find_elements(By.CLASS_NAME, "stamp-card")
    for card in cards:
        assert "germany" in card.text.lower()

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

# --- 2. Functional Logic (Search & Currency) ---

def test_search_filtering(driver):
    """Verify that searching for 'Germany' filters the cards accurately."""
    search_input = driver.find_element(By.ID, "stampSearch")
    search_input.clear()
    search_input.send_keys("Germany")
    time.sleep(0.5) 

    cards = driver.find_elements(By.CLASS_NAME, "stamp-card")
    for card in cards:
        # Check title or country for match
        text = card.text.lower()
        assert "germany" in text

def test_currency_conversion_math(driver):
    """Switch to EUR and verify price is formatted correctly and value is reduced (INR > EUR)."""
    driver.get(URL)
    # Get initial INR price from first card
    inr_text = driver.find_element(By.CLASS_NAME, "price").text.replace('₹', '').replace(',', '')
    inr_val = float(inr_text)

    eur_btn = driver.find_element(By.ID, "btnEUR")
    eur_btn.click()
    
    eur_text = driver.find_element(By.CLASS_NAME, "price").text.replace('€', '')
    eur_val = float(eur_text)

    assert "€" in driver.find_element(By.CLASS_NAME, "price").text
    assert eur_val < inr_val  # EUR should be significantly lower than INR value

# --- 3. Interaction (Modals & Lightbox) ---

def test_lightbox_navigation(driver):
    """Test opening a card with multiple images and clicking 'Next'."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    
    # Search for an item known to have multiple images
    search = driver.find_element(By.ID, "stampSearch")
    search.send_keys("RN4078")
    
    # Click the image once it's clickable
    first_img = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".stamp-card img")))
    first_img.click()

    # Verify initial caption
    caption = wait.until(EC.visibility_of_element_located((By.ID, "caption")))
    assert "(1/14)" in caption.text

    # Click next
    next_btn = driver.find_element(By.ID, "nextBtn")
    next_btn.click()
    
    # Wait for the caption text to update to (2/14)
    wait.until(EC.text_to_be_present_in_element((By.ID, "caption"), "(2/14)"))
    assert "(2/14)" in caption.text

def test_qr_modal_copy(driver):
    """Test BHIM/UPI modal opens and copy button changes text."""
    driver.get(URL)
    bhim_trigger = driver.find_element(By.ID, "bhimTrigger")
    bhim_trigger.click()

    qr_modal = driver.find_element(By.ID, "qrModal")
    assert qr_modal.is_displayed()

    copy_btn = driver.find_element(By.ID, "copyBtn")
    copy_btn.click()
    wait = WebDriverWait(driver, 10)
    wait.until(EC.text_to_be_present_in_element((By.ID, "copyBtn"), "Copied!"))
    assert copy_btn.text == "Copied!"

# --- 4. Deep Linking Scenario ---

def test_deep_link_item(driver):
    """Verify that visiting a URL with ?item= filters the view immediately."""
    # 1. Navigate to the deep link
    target_item = "RN4072"
    driver.get(f"{URL}?item={target_item}")
    
    wait = WebDriverWait(driver, 10)

    # 2. Wait for the 'View Full Collection' button (Back Button)
    # This button only appears IF the URL parameter logic in script.js has executed.
    back_btn = wait.until(EC.visibility_of_element_located((By.XPATH, "//button[contains(text(), 'View Full Collection')]")))
    
    # # 3. Verify the search input was automatically filled by the script
    # search_input = driver.find_element(By.ID, "stampSearch")
    # assert search_input.get_attribute("value") == target_item

    # 4. Verify only one card is displayed
    cards = driver.find_elements(By.CLASS_NAME, "stamp-card")
    assert len(cards) == 1
    assert target_item in cards[0].text
# --- 5. Responsive / Mobile Logic ---

def test_sticky_header_on_scroll(driver):
    """Verify header class changes when scrolling (Requires JS execution in headless)."""
    driver.get(URL)
    header = driver.find_element(By.TAG_NAME, "header")
    
    # Scroll down via JavaScript
    driver.execute_script("window.scrollTo(0, 500)")
    
    # Wait until the class 'is-pinned' is added to the header
    wait = WebDriverWait(driver, 5)
    wait.until(lambda d: "is-pinned" in header.get_attribute("class"))
    
    assert "is-pinned" in header.get_attribute("class")

def test_back_to_top_visibility(driver):
    """Verify 'Back to Top' button appears only after scrolling down."""
    driver.get(URL)
    btn = driver.find_element(By.ID, "backToTop")
    assert not btn.is_displayed()

    driver.execute_script("window.scrollTo(0, 1000)")
    time.sleep(0.5)
    assert "visible" in btn.get_attribute("class")
    
    btn.click()
    time.sleep(1)
    # Check if we are back near the top
    scroll_pos = driver.execute_script("return window.pageYOffset;")
    assert scroll_pos < 100

def test_dynamic_link_preview_meta(driver):
    """Verify that visiting ?item=RN4078 updates the document title and meta tags."""
    target_item = "RN4078"
    driver.get(f"{URL}?item={target_item}")
    
    wait = WebDriverWait(driver, 10)
    # Wait for the JS to update the page title
    wait.until(EC.title_contains("Eastern European"))
    
    # Check if the OG image tag was updated to the correct folder
    og_image = driver.find_element(By.ID, "og-image").get_attribute("content")
    assert "D13" in og_image  # RN4078 is in folder D13

def test_tab_switching_visibility(driver):
    """Verify that switching to Hub hides gallery and shows hub section."""
    driver.get(URL)
    
    # 1. Click the Hub tab
    hub_tab = driver.find_element(By.ID, "tabHub")
    hub_tab.click()
    time.sleep(0.5) # Wait for transition
    
    # 2. Check visibility
    gallery = driver.find_element(By.ID, "gallerySection")
    hub = driver.find_element(By.ID, "hubSection")
    search_container = driver.find_element(By.ID, "searchBarContainer")
    
    assert not gallery.is_displayed()
    assert hub.is_displayed()
    assert not search_container.is_displayed() # Search should be hidden in Hub
    assert "active" in hub_tab.get_attribute("class")

def test_hub_content_loading(driver):
    """Verify that articles from hubData.js are loaded into the sidebar and main area."""
    driver.get(URL)
    driver.find_element(By.ID, "tabHub").click()
    time.sleep(0.5)
    
    # Check if the sidebar loaded articles from hubData.js
    article_links = driver.find_elements(By.CSS_SELECTOR, "#articleList li a")
    assert len(article_links) > 0
    
    # Check if the default first article ("How to Start...") is loaded in main view
    main_content = driver.find_element(By.ID, "hubActiveContent")
    assert "How to Start Stamp Collecting" in main_content.text

def test_article_navigation(driver):
    """Verify that clicking a sidebar article updates the main content area."""
    driver.get(URL)
    driver.find_element(By.ID, "tabHub").click()
    time.sleep(0.5)
    
    # Find the "How to Identify Fake Stamps" link (usually the 3rd one based on your hubData.js)
    # We use a text-based selector to find the specific link
    fake_stamps_link = driver.find_element(By.LINK_TEXT, "How to Identify Fake Stamps")
    fake_stamps_link.click()
    time.sleep(0.3)
    
    main_content = driver.find_element(By.ID, "hubActiveContent")
    assert "How to Identify Fake Stamps" in main_content.text
    assert "Perforations" in main_content.text # Content from hubData.js

# def test_sticky_nav_stacking(driver):
#     """Verify that sub-nav becomes sticky at the top when in Hub mode."""
#     driver.get(URL)
    
#     # 1. Switch to Hub Mode
#     driver.find_element(By.ID, "tabHub").click()
#     time.sleep(0.5)
    
#     # 2. Scroll deep into the page
#     driver.execute_script("window.scrollTo(0, 1000)")
#     time.sleep(0.5)
    
#     # 3. Get the element's position relative to the VIEWPORT
#     # getBoundingClientRect().top returns 0 if the element is touching the top of the screen
#     sticky_top = driver.execute_script(
#         "return document.getElementById('mainSubNav').getBoundingClientRect().top;"
#     )
    
#     print(f"Sub-nav viewport top: {sticky_top}") # Debugging info
    
#     # In Hub mode, search is hidden, so sub-nav should be at 0px
#     # We allow a small margin for sub-pixel rendering (like 180.46 vs 180)
#     assert abs(sticky_top) <= 5