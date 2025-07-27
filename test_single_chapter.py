import os
import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from urllib.parse import urljoin
import random

# إعدادات المتصفح المحسنة لتجاوز Cloudflare
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-extensions")
chrome_options.add_argument("--disable-web-security")
chrome_options.add_argument("--allow-running-insecure-content")

# إضافة user agent واقعي
chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36")

# إضافة إعدادات إضافية لتجاوز الكشف
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
chrome_options.add_experimental_option('useAutomationExtension', False)

# إعداد المجلد الأساسي لتخزين الفصول
base_dir = "Manga_Downloads"
if not os.path.exists(base_dir):
    os.makedirs(base_dir)

# إعداد المتصفح باستخدام ChromeDriver
try:
    chrome_options.binary_location = "/usr/bin/google-chrome-stable"
    service = Service("/usr/local/bin/chromedriver")
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    # إخفاء أثار webdriver
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    print("تم تشغيل المتصفح بنجاح!")
except Exception as e:
    print(f"خطأ في تشغيل المتصفح: {e}")
    exit(1)

def wait_for_cloudflare_bypass(driver, timeout=120):
    """انتظار تجاوز حماية Cloudflare"""
    try:
        print("انتظار تجاوز حماية Cloudflare...")
        wait = WebDriverWait(driver, timeout)
        
        # انتظار اختفاء صفحة "Just a moment"
        wait.until_not(EC.title_contains("Just a moment"))
        
        # انتظار إضافي للتأكد من تحميل المحتوى
        time.sleep(random.uniform(5, 10))
        
        print("تم تجاوز حماية Cloudflare بنجاح!")
        return True
    except Exception as e:
        print(f"فشل في تجاوز حماية Cloudflare: {e}")
        return False

# اختبار فصل واحد فقط
chapter = 133
chapter_url = f"https://manga-starz.com/manga/return-of-the-mount-hua-sect/{chapter}/"

print(f"جارٍ اختبار الفصل {chapter}: {chapter_url}")

try:
    driver.get(chapter_url)
    
    # انتظار تجاوز Cloudflare
    if wait_for_cloudflare_bypass(driver):
        print(f"عنوان الصفحة: {driver.title}")
        print(f"URL الحالي: {driver.current_url}")
        
        # انتظار إضافي لتحميل الصفحة بالكامل
        time.sleep(10)
        
        # محاولة التمرير لأسفل لتحميل الصور الديناميكية
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(2)
        
        # البحث عن جميع الصور في الصفحة
        all_images = driver.find_elements(By.TAG_NAME, "img")
        print(f"إجمالي الصور المكتشفة: {len(all_images)}")
        
        # تحليل الصور الموجودة
        print("\n--- تحليل الصور ---")
        for idx, img in enumerate(all_images[:10]):  # أول 10 صور فقط
            try:
                src = img.get_attribute("src")
                data_src = img.get_attribute("data-src")
                alt = img.get_attribute("alt")
                class_name = img.get_attribute("class")
                
                print(f"صورة {idx + 1}:")
                print(f"  src: {src}")
                print(f"  data-src: {data_src}")
                print(f"  alt: {alt}")
                print(f"  class: {class_name}")
                print("  ---")
            except Exception as e:
                print(f"خطأ في الصورة {idx + 1}: {e}")
        
        # حفظ مصدر الصفحة للفحص
        page_source = driver.page_source
        with open("test_page_source.html", "w", encoding="utf-8") as f:
            f.write(page_source)
        print("\nتم حفظ مصدر الصفحة في test_page_source.html")
        
    else:
        print("فشل في تجاوز Cloudflare")
        
except Exception as e:
    print(f"خطأ عام: {e}")

finally:
    driver.quit()
    print("تم إغلاق المتصفح")