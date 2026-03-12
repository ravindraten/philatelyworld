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
    driver.get(URL) # Ensure fresh state
    wait = WebDriverWait(driver, 10)
    
    # 1. Click the first stamp image
    first_stamp_img = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".stamp-card img")))
    first_stamp_img.click()

    # 2. Verify modal becomes visible
    modal = wait.until(EC.visibility_of_element_located((By.ID, "myModal")))
    assert modal.is_displayed()

    # 3. Click the close button
    close_btn = driver.find_element(By.ID, "closeModal")
    close_btn.click()

    # 4. FIX: Wait until the modal is actually hidden from the DOM/View
    # This replaces time.sleep(0.5)
    wait.until(EC.invisibility_of_element_located((By.ID, "myModal")))
    
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


def test_privacy_feature(driver):
    """Verify the Privacy Policy modal opens using a JS click to avoid header interception."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)

    # 1. Scroll to the bottom so the footer is rendered
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(1) # Give it a moment to settle

    # 2. Find the trigger
    privacy_trigger = wait.until(EC.presence_of_element_located((By.ID, "privacyTrigger")))

    # 3. FIX: Use JavaScript to click instead of standard .click()
    # This prevents 'ElementClickInterceptedException' caused by the sticky header
    driver.execute_script("arguments[0].click();", privacy_trigger)

    # 4. Verify the modal appears
    privacy_modal = wait.until(EC.visibility_of_element_located((By.ID, "privacyModal")))
    assert privacy_modal.is_displayed()
    assert "Privacy Policy" in privacy_modal.text

    # 5. Click the close button (JS click here too for safety)
    close_btn = driver.find_element(By.ID, "privacyClose")
    driver.execute_script("arguments[0].click();", close_btn)

    # 6. Wait for it to disappear
    wait.until(EC.invisibility_of_element_located((By.ID, "privacyModal")))
    assert not privacy_modal.is_displayed()

@pytest.mark.parametrize("width, height", [
    (1200, 800),  # Desktop
    (768, 1024),  # Tablet (Portrait)
])
def test_promo_visibility_on_scroll_desktop_tablet(driver, width, height):
    """
    Validates that the Sidebar Promo card remains visible on Desktop and Tablet
    resolutions even after the user scrolls down the page.
    """
    # 1. Set the specific viewport size
    driver.set_window_size(width, height)
    driver.get(URL)
    wait = WebDriverWait(driver, 10)

    # 2. Locate the promo card
    promo_card = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "promo-card")))
    
    # 3. Perform a significant scroll
    driver.execute_script("window.scrollTo(0, 800);")
    
    # 4. Small delay to allow scroll-linked JS or transitions to fire
    time.sleep(0.5)

    # 5. Assertions for visibility and layout integrity
    assert promo_card.is_displayed(), f"Promo card hidden at {width}x{height} after scroll"
    
    # Check opacity and scale to ensure no 'scrolled-hidden' logic is active
    opacity = promo_card.value_of_css_property("opacity")
    transform = promo_card.value_of_css_property("transform")
    
    assert float(opacity) > 0.9, f"Promo card is fading out at {width}px width"
    assert "matrix" not in transform or "1, 0, 0, 1" in transform, "Promo card has scaling/offset transforms applied"

    # 6. Verify it hasn't collapsed to zero height
    height_val = promo_card.size['height']
    assert height_val > 100, f"Promo card collapsed to {height_val}px at {width}px width"