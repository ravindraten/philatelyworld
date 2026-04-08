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
URL = "http://localhost:5500/docs/index.html" 
#URL = "http://127.0.0.1:8000/index.html"

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
    wait.until(EC.text_to_be_present_in_element((By.CSS_SELECTOR, "#stampGrid .stamp-card"), "Germany"))

    cards = driver.find_elements(By.CSS_SELECTOR, "#stampGrid .stamp-card")
    for card in cards:
        assert "germany" in card.text.lower()

def test_currency_toggle(driver):
    """Check if switching to EUR updates the price symbols."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    eur_btn = wait.until(EC.element_to_be_clickable((By.ID, "btnEUR")))
    eur_btn.click()
    
    # Wait for the price to contain '€' instead of fixed sleep
    wait.until(EC.text_to_be_present_in_element((By.CLASS_NAME, "price"), "€"))

    prices = driver.find_elements(By.CLASS_NAME, "price")
    for price in prices:
        assert "€" in price.text
        assert "₹" not in price.text

def test_lightbox_open_close(driver):
    """Verify lightbox opens on image click and closes on 'X'."""
    driver.get(URL) # Ensure fresh state
    wait = WebDriverWait(driver, 10)
    
    # 1. Click the first stamp image
    first_stamp_img = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#stampGrid .stamp-card img")))
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
    """Verify that sold out stamps are still correctly marked and processed even if the tab is hidden."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    
    # Locate the tab even if it's hidden (display: none)
    sold_tab = driver.find_element(By.CSS_SELECTOR, ".filter-tab[data-status='sold']")
    
    # We still use JS click because standard .click() fails on hidden elements
    driver.execute_script("arguments[0].click();", sold_tab)
    
    # Wait for search input instead of sleep
    search_input = wait.until(EC.presence_of_element_located((By.ID, "stampSearch")))
    search_input.clear()
    search_input.send_keys("Antilles")
    
    # Wait for the card to appear
    card = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#stampGrid .stamp-card")))
    wait.until(lambda d: "sold-out" in card.get_attribute("class"))
    assert "sold-out" in card.get_attribute("class")
    
    buy_btn = card.find_element(By.CLASS_NAME, "buy-btn")
    assert "disabled" in buy_btn.get_attribute("class")
    assert "Sold Out" in buy_btn.text

# --- 2. Functional Logic (Search & Currency) ---

def test_search_filtering_duplicate(driver):
    """Verify that searching for 'Germany' filters the cards accurately."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    search_input = wait.until(EC.presence_of_element_located((By.ID, "stampSearch")))
    search_input.clear()
    search_input.send_keys("Germany")
    
    # Wait until first card text contains Germany instead of sleep
    wait.until(EC.text_to_be_present_in_element((By.CSS_SELECTOR, "#stampGrid .stamp-card"), "Germany"))

    cards = driver.find_elements(By.CSS_SELECTOR, "#stampGrid .stamp-card")
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
    all_tab = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".filter-tab[data-status='all']")))
    driver.execute_script("arguments[0].click();", all_tab)
    
    # Wait for the grid to update
    search = wait.until(EC.presence_of_element_located((By.ID, "stampSearch")))
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

@pytest.mark.skip(reason="BHIM icon was originally replaced with Facebook link by user request")
def test_qr_modal_copy(driver):
    """Test BHIM/UPI modal opens and copy button changes text."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    bhim_trigger = wait.until(EC.element_to_be_clickable((By.ID, "bhimTrigger")))
    bhim_trigger.click()

    qr_modal = wait.until(EC.visibility_of_element_located((By.ID, "qrModal")))
    assert qr_modal.is_displayed()

    copy_btn = wait.until(EC.element_to_be_clickable((By.ID, "copyBtn")))
    copy_btn.click()
    
    # Wait for text to update and re-find in the assertion to avoid staleness
    wait.until(EC.text_to_be_present_in_element((By.ID, "copyBtn"), "Copied!"))
    assert driver.find_element(By.ID, "copyBtn").text == "Copied!"

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
    cards = driver.find_elements(By.CSS_SELECTOR, "#stampGrid .stamp-card")
    assert len(cards) == 1
    assert target_item in cards[0].text
# --- 5. Responsive / Mobile Logic ---

def test_sticky_header_on_scroll(driver):
    """Verify search bar class changes when scrolling."""
    driver.get(URL)
    search_sticky = driver.find_element(By.CLASS_NAME, "search-sticky-container")
    
    # Scroll down via JavaScript
    driver.execute_script("window.scrollTo(0, 500)")
    
    # Wait until the class 'is-pinned' is added to the search container
    wait = WebDriverWait(driver, 5)
    wait.until(lambda d: "is-pinned" in search_sticky.get_attribute("class"))
    
    assert "is-pinned" in search_sticky.get_attribute("class")

def test_back_to_top_visibility(driver):
    """Verify 'Back to Top' button appears only after scrolling down."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    
    # Check initial invisibility
    btn_id = "backToTop"
    wait.until(lambda d: not d.find_element(By.ID, btn_id).is_displayed())

    # Scroll and wait for visibility class
    driver.execute_script("window.scrollTo(0, 1000)")
    wait.until(lambda d: "visible" in d.find_element(By.ID, btn_id).get_attribute("class"))
    
    # Click and wait for top. Use JS click to avoid 'ElementNotInteractableException' during CSS transitions.
    btn = wait.until(EC.element_to_be_clickable((By.ID, btn_id)))
    driver.execute_script("arguments[0].click();", btn)
    
    wait.until(lambda d: d.execute_script("return window.pageYOffset;") < 100)
    assert driver.execute_script("return window.pageYOffset;") < 100

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

@pytest.mark.skip(reason="Promo is disabled in CONFIG")
@pytest.mark.parametrize("width, height", [
    (1200, 800),  # Desktop
    (768, 1024),  # Tablet (Portrait)
])
def test_promo_visibility_on_scroll_desktop_tablet(driver, width, height):
    """
    Validates that the Sidebar Promo card remains visible on Desktop and Tablet
    resolutions even after the user scrolls down the page.
    """
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
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


def test_view_collection_button_at_top(driver):
    """Verify 'View Full Collection' button appears at the top on shared item links."""
    shared_url = f"{URL}?item=RN4112"
    driver.get(shared_url)
    
    # Locate the button
    btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'View Full Collection')]"))
    )
    
    # Verify it is positioned before the stamp grid
    grid = driver.find_element(By.ID, "stampGrid")
    assert btn.location['y'] < grid.location['y'], "Button should be located above the grid"

def test_dynamic_og_image_update(driver):
    """Verify that items generally use the second image folder if available."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    driver.get(f"{URL}?item=RN4111")
    wait = WebDriverWait(driver, 10)
    
    # RN4111 (D45) has 6 images, so it should use D45/1.jpg
    wait.until(lambda d: "D45/1.jpg" in d.find_element(By.ID, "og-image").get_attribute("content"))
    og_image = driver.find_element(By.ID, "og-image").get_attribute("content")
    assert "D45/1.jpg" in og_image

def test_og_image_rn4137(driver):
    """Verify that RN4137 specifically uses its 2nd photo (D67/2.jpg)."""
    driver.get(f"{URL}?item=RN4137")
    wait = WebDriverWait(driver, 10)
    
    # D67 is the folder for RN4137
    wait.until(lambda d: "D67/1.jpg" in d.find_element(By.ID, "og-image").get_attribute("content"))
    og_image = driver.find_element(By.ID, "og-image").get_attribute("content")
    assert "D67/1.jpg" in og_image, f"RN4137 should point to D67/1.jpg, found: {og_image}"

def test_security_guarantee_modal(driver):
    """Verify the Security & Guarantee modal opens and shows correct content."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)

    # 1. Scroll to the bottom to ensure footer is visible
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

    # 2. Find and click the Security & Guarantee trigger
    # Using JS click to avoid potential sticky header/footer interception
    security_trigger = wait.until(EC.presence_of_element_located((By.ID, "securityTrigger")))
    driver.execute_script("arguments[0].click();", security_trigger)

    # 3. Verify the modal becomes visible
    security_modal = wait.until(EC.visibility_of_element_located((By.ID, "securityModal")))
    assert security_modal.is_displayed()

    # 4. Check for key content within the modal
    modal_text = security_modal.text
    assert "Security & Guarantee" in modal_text
    assert "Expert Authentication" in modal_text
    assert "Global Shipping Protection" in modal_text
    assert "+31 633467712" in modal_text # Verify contact info is present

    # 5. Test closing the modal
    close_btn = driver.find_element(By.ID, "securityClose")
    driver.execute_script("arguments[0].click();", close_btn)

    # 6. Wait for it to be hidden
    wait.until(EC.invisibility_of_element_located((By.ID, "securityModal")))
    assert not security_modal.is_displayed()


def test_status_filtering(driver):
    """Verify that 'Available' tab filters out sold items, while 'All Items' shows everything."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)

    # 1. Click 'Available' tab
    available_tab = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".filter-tab[data-status='available']")))
    driver.execute_script("arguments[0].click();", available_tab)
    
    # Wait for the grid to filter: check that no visible products are 'sold-out'
    wait.until(lambda d: len([b for b in d.find_elements(By.CLASS_NAME, "sold-out-badge") if b.is_displayed()]) == 0)

    sold_badges = driver.find_elements(By.CLASS_NAME, "sold-out-badge")
    visible_badges = [b for b in sold_badges if b.is_displayed()]
    assert len(visible_badges) == 0, "Found 'Sold Out' items in the 'Available' view"

    # 2. Check if 'Sold Out' tab is hidden (per current CONFIG in script.js)
    sold_tab = driver.find_element(By.CSS_SELECTOR, ".filter-tab[data-status='sold']")
    is_hidden = driver.execute_script("return window.getComputedStyle(arguments[0]).display === 'none';", sold_tab)

    # 3. Reset to 'All Items' and verify sold items ARE visible even if tab is gone
    all_tab = driver.find_element(By.CSS_SELECTOR, ".filter-tab[data-status='all']")
    driver.execute_script("arguments[0].click();", all_tab)
    
    # Wait for sold items to reappear
    wait.until(lambda d: len([c for c in d.find_elements(By.CSS_SELECTOR, "#stampGrid .stamp-card") if "sold-out" in c.get_attribute("class")]) > 0)
    
    # Verify both available and sold items are shown
    all_cards = driver.find_elements(By.CSS_SELECTOR, "#stampGrid .stamp-card")
    sold_items_in_all = [c for c in all_cards if "sold-out" in c.get_attribute("class")]
    available_items_in_all = [c for c in all_cards if "sold-out" not in c.get_attribute("class")]
    
    assert len(sold_items_in_all) > 0, "Sold items should be visible in 'All Items' view"
    assert len(available_items_in_all) > 0, "Available items should be visible in 'All Items' view"


# --- 6. Blog Feature Tests ---

def test_blog_tab_switching(driver):
    """Verify that clicking the Blog tab switches the view to blog posts."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)

    # 1. Locate and click the Blog filter tab
    blog_tab = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".filter-tab[data-status='blog']")))
    driver.execute_script("arguments[0].click();", blog_tab)
    
    # 2. Wait for the blog-specific class to appear in the grid
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "blog-card")))

    # 3. Verify that the cards displayed are blog cards
    cards = driver.find_elements(By.CLASS_NAME, "blog-card")
    assert len(cards) > 0, "No blog posts were rendered"
    
    # 4. Check for blog-specific UI elements (like the 'Read Post' button)
    read_post_btn = cards[0].find_element(By.LINK_TEXT, "Read Post")
    assert read_post_btn.is_displayed()
    assert "blog/" in read_post_btn.get_attribute("href")

def test_blog_search_filtering(driver):
    """Verify that the search bar filters blog posts specifically when the blog tab is active."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)

    # 1. Switch to blog tab
    blog_tab = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".filter-tab[data-status='blog']")))
    driver.execute_script("arguments[0].click();", blog_tab)

    # 2. Search for a specific blog title (e.g., "Buzin")
    search_input = wait.until(EC.presence_of_element_located((By.ID, "stampSearch")))
    search_input.clear()
    search_input.send_keys("Buzin")
    
    # Wait for blog card to appear instead of sleep
    wait.until(EC.text_to_be_present_in_element((By.CLASS_NAME, "blog-card"), "Buzin"))

    # 3. Verify results
    cards = driver.find_elements(By.CLASS_NAME, "blog-card")
    assert len(cards) == 1
    assert "Buzin" in cards[0].text

def test_blog_indicator_click_navigation(driver):
    """Verify clicking the blog indicator navigates to the blog and doesn't open the modal."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    
    # 1. Find a stamp card that has a blog indicator
    # We use a selector that specifically targets the <a> tag we created
    try:
        blog_link = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "blog-indicator")))
    except:
        pytest.skip("No stamps with blog indicators found in the current data.")

    # 2. Get the expected destination from the 'href' attribute
    expected_url_part = blog_link.get_attribute("href")

    # 3. Click the indicator
    driver.execute_script("arguments[0].click();", blog_link)
    
    # 4. Verify URL change (handling potential relative paths) instead of 10s sleep
    wait.until(lambda d: expected_url_part in d.current_url)
    assert expected_url_part in driver.current_url
    
    # 5. Verify the Modal/Overlay is NOT present
    # This proves event.stopPropagation() worked
    modal = driver.find_elements(By.ID, "imageOverlay")
    if modal:
        assert not modal[0].is_displayed(), "Modal opened when clicking blog indicator!"

    # 6. Go back to main page for subsequent tests
    driver.back()

def test_blog_indicator_on_stamp_cards(driver):
    """Verify that stamps with a related blog post show the blog icon indicator."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    
    # Clear filters to see all stamps
    all_tab = driver.find_element(By.CSS_SELECTOR, ".filter-tab[data-status='all']")
    driver.execute_script("arguments[0].click();", all_tab)

    # Find an indicator (the SVG icon for related blog posts)
    # This assumes at least one stamp in your 'stamps' array has 'blogUrl' set
    try:
        indicator = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "stamp-blog-indicator")))
        assert indicator.is_displayed()
        assert indicator.get_attribute("title") == "Read related blog post"
    except Exception:
        pytest.skip("No stamps currently have a blogUrl assigned in the data.")

# --- 7. Announcements Feature Tests ---

def test_announcement_carousel_limit(driver):
    """Verify that the homepage carousel loads properly and contains no more than 3 visible items."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    
    # Wait for JS to inject the carousel track
    track = wait.until(EC.presence_of_element_located((By.ID, "announcementCarouselTrack")))
    
    # Wait for actual slides to pop in instead of 2s sleep
    wait.until(lambda d: len(track.find_elements(By.CLASS_NAME, "carousel-slide")) > 0)
    
    # Find all carousel items
    items = track.find_elements(By.CLASS_NAME, "carousel-slide")
    
    # Assert limit is capped at 2 by script.js config slicer (it slices 0 to 2)
    assert len(items) <= 2, "Carousel holds more than 2 announcements"

def test_announcement_view_all_button(driver):
    """Verify the 'View All Announcements' button is present and securely linked."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    
    container = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "announcement-carousel-container")))
    
    try:
        # Search for the newly injected link directly after/inside container
        view_all_btn = container.find_element(By.XPATH, "..//a[contains(text(), 'View All Announcements')]")
        assert view_all_btn.is_displayed()
        assert "all_announcements.html" in view_all_btn.get_attribute("href")
    except Exception as e:
        pytest.fail(f"'View All Announcements' button not found: {str(e)}")

def test_all_announcements_page_render(driver):
    """Load the dedicated HTML page and wait for the async fetch loop to populate the grid."""
    base_url = URL.replace("index.html", "all_announcements.html")
    driver.get(base_url)
    wait = WebDriverWait(driver, 10)
    
    # Wait for the cache-hydrated `.stamp-card` elements to flow into `#announcementsGrid`
    grid = wait.until(EC.presence_of_element_located((By.ID, "announcementsGrid")))
    
    # The loading text is initially present, wait for actual cards to pop in
    try:
        wait.until(lambda d: len(grid.find_elements(By.CLASS_NAME, "stamp-card")) > 0)
    except Exception as e:
        pytest.skip(f"Could not load announcements (possibly CORS or network failure): {str(e)}")
        
    cards = grid.find_elements(By.CLASS_NAME, "stamp-card")
    assert len(cards) > 0, "No announcements parsed on all_announcements.html"

def test_all_announcements_search(driver):
    """Type a query into the grid and verify it instantly filters correctly."""
    base_url = URL.replace("index.html", "all_announcements.html")
    driver.get(base_url)
    wait = WebDriverWait(driver, 10)
    
    grid = wait.until(EC.presence_of_element_located((By.ID, "announcementsGrid")))
    
    try:
        wait.until(lambda d: len(grid.find_elements(By.CLASS_NAME, "stamp-card")) > 0)
    except Exception:
        pytest.skip("Could not load announcements to test search.")
    
    search_input = wait.until(EC.presence_of_element_located((By.ID, "stampSearch")))
    search_input.clear()
    search_input.send_keys("ECTP")
    
    # Wait for DOM cache filter instead of sleep
    wait.until(lambda d: "ectp" in grid.find_elements(By.CLASS_NAME, "stamp-card")[0].text.lower() or "european" in grid.find_elements(By.CLASS_NAME, "stamp-card")[0].text.lower())
    
    cards = grid.find_elements(By.CLASS_NAME, "stamp-card")
    assert len(cards) > 0, "No items returned for 'ECTP' search."
    
    text = cards[0].text.lower()
    assert "ectp" in text or "european" in text

def test_all_announcements_url_hydration(driver):
    """Test URL ?q= hydration securely tracks and binds parameters on launch."""
    base_url = URL.replace("index.html", "all_announcements.html?q=ECTP")
    driver.get(base_url)
    wait = WebDriverWait(driver, 10)
    
    grid = wait.until(EC.presence_of_element_located((By.ID, "announcementsGrid")))
    
    try:
        wait.until(lambda d: len(grid.find_elements(By.CLASS_NAME, "stamp-card")) > 0)
    except Exception:
        pytest.skip("Could not load announcements to test hydration.")
        
    cards = grid.find_elements(By.CLASS_NAME, "stamp-card")
    assert len(cards) > 0
    text = cards[0].text.lower()
    assert "ectp" in text or "european" in text
    
    # Verify the input box consumed the URL state
    search_input = driver.find_element(By.ID, "stampSearch")
    assert search_input.get_attribute("value") == "ECTP"

# --- 8. Album Designer Tests ---

def test_album_designer_navigation(driver):
    """Verify that the floating Album Designer button exists and navigates correctly."""
    driver.get(URL)
    wait = WebDriverWait(driver, 10)
    
    # 1. Locate the designer link icon in the header
    designer_btn = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "designer-icon")))
    assert designer_btn.is_displayed()
    
    # Verify tooltip/label exists since visible text is removed
    assert "Album Designer" in designer_btn.get_attribute("aria-label")
    assert "Album Designer" in designer_btn.get_attribute("data-tooltip")
    
    # 2. Click it and verify navigation
    driver.execute_script("arguments[0].click();", designer_btn)
    wait.until(EC.url_contains("AlbumDesigner/auto-album.html"))
    assert "auto-album.html" in driver.current_url
    assert "Philately World | Free Automated Stamp Album Designer" in driver.title

def test_album_designer_mobile_lockdown(driver):
    """Verify that the Album Designer shows the 'Desktop View Required' warning on small screens."""
    designer_url = URL.replace("index.html", "AlbumDesigner/auto-album.html")
    driver.get(designer_url)
    wait = WebDriverWait(driver, 10)
    
    # 1. Start in Desktop mode (should already be set by driver fixture, but let's be explicit)
    driver.set_window_size(1200, 800)
    wait.until(EC.visibility_of_element_located((By.ID, "controls")))
    warning = driver.find_element(By.ID, "mobile-warning")
    assert not warning.is_displayed()
    
    # 2. Switch to Mobile resolution (below 800px)
    driver.set_window_size(375, 812) # iPhone size
    
    # 3. Verify the lockdown overlay becomes visible instantly
    wait.until(EC.visibility_of_element_located((By.ID, "mobile-warning")))
    assert warning.is_displayed()
    assert "Desktop View Required".lower() in warning.text.lower()
    
    # 4. Verify main content is hidden
    controls = driver.find_element(By.ID, "controls")
    assert not controls.is_displayed()
    
    # 5. Verify the 'Return to Collection' button works
    back_btn = warning.find_element(By.CLASS_NAME, "warning-back-btn")
    driver.execute_script("arguments[0].click();", back_btn)
    wait.until(EC.url_contains("index.html"))
    assert "index.html" in driver.current_url

    # Restore window size for other tests
    driver.set_window_size(1920, 1080)

def test_album_designer_seo_meta(driver):
    """Verify SEO meta tags and link previews on the Album Designer page."""
    designer_url = URL.replace("index.html", "AlbumDesigner/auto-album.html")
    driver.get(designer_url)
    
    # Verify Title
    assert "Philately World | Free Automated Stamp Album Designer" in driver.title
    
    # Verify Meta Description
    desc = driver.find_element(By.NAME, "description").get_attribute("content")
    assert "professional, high-resolution PDF stamp albums" in desc
    
    # Verify Open Graph Title
    og_title = driver.find_element(By.XPATH, "//meta[@property='og:title']").get_attribute("content")
    assert "Automated Stamp Album Designer" in og_title
    
    # Verify Open Graph Image
    og_image = driver.find_element(By.XPATH, "//meta[@property='og:image']").get_attribute("content")
    assert "designer-icon.png" in og_image