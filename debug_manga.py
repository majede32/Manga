import os
import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from urllib.parse import urljoin

# إعدادات المتصفح - تشغيل خفي
chrome_options = Options()
chrome_options.add_argument("--headless")  # تشغيل خفي
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-extensions")
chrome_options.add_argument("--disable-web-security")
chrome_options.add_argument("--allow-running-insecure-content")

# إعداد المتصفح باستخدام ChromeDriver
try:
    chrome_options.binary_location = "/usr/bin/google-chrome-stable"
    service = Service("/usr/local/bin/chromedriver")
    driver = webdriver.Chrome(service=service, options=chrome_options)
    print("تم تشغيل المتصفح بنجاح!")
except Exception as e:
    print(f"خطأ في تشغيل المتصفح: {e}")
    exit(1)

# اختبار فصل واحد فقط
chapter = 133
chapter_url = f"https://manga-starz.com/manga/return-of-the-mount-hua-sect/{chapter}/"

print(f"جارٍ فتح الصفحة: {chapter_url}")

try:
    driver.get(chapter_url)
    time.sleep(10)  # انتظار أطول لتحميل الصفحة
    
    # طباعة عنوان الصفحة
    print(f"عنوان الصفحة: {driver.title}")
    
    # طباعة URL الحالي
    print(f"URL الحالي: {driver.current_url}")
    
    # البحث عن جميع الصور في الصفحة
    all_images = driver.find_elements(By.TAG_NAME, "img")
    print(f"إجمالي الصور المكتشفة: {len(all_images)}")
    
    # تحليل الصور الموجودة
    print("\n--- تحليل الصور ---")
    for idx, img in enumerate(all_images[:20]):  # أول 20 صورة فقط
        try:
            src = img.get_attribute("src")
            data_src = img.get_attribute("data-src")
            alt = img.get_attribute("alt")
            width = img.get_attribute("width")
            height = img.get_attribute("height")
            class_name = img.get_attribute("class")
            
            print(f"صورة {idx + 1}:")
            print(f"  src: {src}")
            print(f"  data-src: {data_src}")
            print(f"  alt: {alt}")
            print(f"  width: {width}")
            print(f"  height: {height}")
            print(f"  class: {class_name}")
            print("  ---")
        except Exception as e:
            print(f"خطأ في الصورة {idx + 1}: {e}")
    
    # البحث عن عناصر أخرى قد تحتوي على صور المانجا
    print("\n--- البحث عن عناصر محتملة للمانجا ---")
    
    # البحث عن div elements التي قد تحتوي على صور
    containers = driver.find_elements(By.CSS_SELECTOR, "div[class*='page'], div[class*='manga'], div[class*='chapter'], div[class*='reader']")
    print(f"عدد الحاويات المحتملة: {len(containers)}")
    
    for idx, container in enumerate(containers[:5]):
        try:
            class_name = container.get_attribute("class")
            id_name = container.get_attribute("id")
            print(f"حاوية {idx + 1}: class='{class_name}', id='{id_name}'")
            
            # البحث عن صور داخل هذه الحاوية
            imgs_in_container = container.find_elements(By.TAG_NAME, "img")
            print(f"  صور داخل الحاوية: {len(imgs_in_container)}")
        except Exception as e:
            print(f"خطأ في الحاوية {idx + 1}: {e}")
    
    # البحث عن script tags التي قد تحتوي على URLs للصور
    print("\n--- البحث في Script Tags ---")
    scripts = driver.find_elements(By.TAG_NAME, "script")
    for script in scripts:
        try:
            content = script.get_attribute("innerHTML")
            if content and ("jpg" in content or "png" in content or "jpeg" in content):
                print("تم العثور على script يحتوي على روابط صور:")
                # طباعة جزء من المحتوى
                print(content[:500] + "..." if len(content) > 500 else content)
                break
        except:
            continue
    
    # حفظ مصدر الصفحة للتحليل اليدوي
    page_source = driver.page_source
    with open("debug_page_source.html", "w", encoding="utf-8") as f:
        f.write(page_source)
    print("\nتم حفظ مصدر الصفحة في debug_page_source.html")
    
    # input("اضغط Enter للمتابعة...")  # تعطيل الانتظار للتشغيل الخفي
    
except Exception as e:
    print(f"خطأ عام: {e}")

finally:
    driver.quit()