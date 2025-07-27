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

# رابط القاعدة للمانجا
base_url = "https://manga-starz.com/manga/return-of-the-mount-hua-sect/{}/"

# نطاق الفصول المطلوبة
start_chapter = 133
end_chapter = 150

def wait_for_cloudflare_bypass(driver, timeout=60):
    """انتظار تجاوز حماية Cloudflare"""
    try:
        print("انتظار تجاوز حماية Cloudflare...")
        wait = WebDriverWait(driver, timeout)
        
        # انتظار اختفاء صفحة "Just a moment"
        wait.until_not(EC.title_contains("Just a moment"))
        
        # انتظار إضافي للتأكد من تحميل المحتوى
        time.sleep(random.uniform(3, 7))
        
        print("تم تجاوز حماية Cloudflare بنجاح!")
        return True
    except Exception as e:
        print(f"فشل في تجاوز حماية Cloudflare: {e}")
        return False

def download_image(img_url, save_path):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Referer': 'https://manga-starz.com/',
            'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br'
        }
        response = requests.get(img_url, stream=True, headers=headers, timeout=30)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            print(f"تم تحميل الصورة: {save_path}")
            return True
        else:
            print(f"فشل تحميل الصورة: {img_url} - كود الحالة: {response.status_code}")
            return False
    except Exception as e:
        print(f"خطأ أثناء تحميل الصورة {img_url}: {e}")
        return False

for chapter in range(start_chapter, end_chapter + 1):
    # إنشاء مجلد للفصل
    chapter_dir = os.path.join(base_dir, f"Chapter_{chapter}")
    if not os.path.exists(chapter_dir):
        os.makedirs(chapter_dir)
    
    # فتح صفحة الفصل
    chapter_url = base_url.format(chapter)
    print(f"جارٍ معالجة الفصل {chapter}: {chapter_url}")
    
    try:
        driver.get(chapter_url)
        
        # انتظار تجاوز Cloudflare
        if not wait_for_cloudflare_bypass(driver):
            print(f"فشل في تجاوز Cloudflare للفصل {chapter}")
            continue
        
        print(f"عنوان الصفحة: {driver.title}")
        print(f"URL الحالي: {driver.current_url}")
        
        # انتظار إضافي لتحميل الصفحة بالكامل
        time.sleep(random.uniform(5, 10))
        
        # محاولة التمرير لأسفل لتحميل الصور الديناميكية
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(2)
        
        # استخراج الصور من الصفحة - تجريب عدة طرق
        image_selectors = [
            "img[src*='.jpg']",
            "img[src*='.png']",
            "img[src*='.jpeg']",
            "img[src*='.webp']",
            "img[data-src*='.jpg']",
            "img[data-src*='.png']",
            "img[data-src*='.jpeg']",
            "img[data-src*='.webp']",
            ".page-break img",
            ".manga-page img",
            ".chapter-content img",
            "#chapter-content img",
            ".reading-content img"
        ]
        
        images_found = []
        for selector in image_selectors:
            try:
                images = driver.find_elements(By.CSS_SELECTOR, selector)
                if images:
                    images_found.extend(images)
                    print(f"تم العثور على {len(images)} صورة باستخدام السيليكتور: {selector}")
            except:
                continue
        
        # إزالة الصور المكررة
        unique_images = []
        seen_urls = set()
        for img in images_found:
            try:
                img_url = img.get_attribute("src") or img.get_attribute("data-src")
                if img_url and img_url not in seen_urls:
                    seen_urls.add(img_url)
                    unique_images.append(img)
            except:
                continue
        
        if not unique_images:
            # إذا لم نجد صور بالطرق المعتادة، نجرب جميع الصور
            all_images = driver.find_elements(By.TAG_NAME, "img")
            print(f"تم العثور على {len(all_images)} صورة إجمالية")
            
            # تصفية الصور المحتملة للمانجا
            for img in all_images:
                try:
                    img_url = img.get_attribute("src") or img.get_attribute("data-src")
                    if img_url and any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                        # التحقق من حجم الصورة
                        try:
                            width = img.size.get('width', 0)
                            height = img.size.get('height', 0)
                            if width > 200 and height > 200:  # صور كبيرة نسبياً
                                unique_images.append(img)
                        except:
                            # إذا فشل الحصول على الحجم، أضف الصورة على أي حال
                            unique_images.append(img)
                except:
                    continue

        downloaded_count = 0
        print(f"محاولة تحميل {len(unique_images)} صورة...")
        
        for idx, img in enumerate(unique_images):
            try:
                # محاولة الحصول على رابط الصورة
                img_url = img.get_attribute("src") or img.get_attribute("data-src")
                
                if img_url and any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    # تنظيف الرابط
                    if img_url.startswith('//'):
                        img_url = 'https:' + img_url
                    elif img_url.startswith('/'):
                        img_url = 'https://manga-starz.com' + img_url
                    
                    # تحديد امتداد الملف
                    if '.jpg' in img_url.lower() or '.jpeg' in img_url.lower():
                        ext = '.jpg'
                    elif '.png' in img_url.lower():
                        ext = '.png'
                    elif '.webp' in img_url.lower():
                        ext = '.webp'
                    else:
                        ext = '.jpg'  # افتراضي
                    
                    img_name = f"page_{downloaded_count + 1:03d}{ext}"
                    save_path = os.path.join(chapter_dir, img_name)
                    
                    if download_image(img_url, save_path):
                        downloaded_count += 1
                    
                    # انتظار قصير بين التحميلات
                    time.sleep(random.uniform(0.5, 2))
                    
            except Exception as e:
                print(f"خطأ أثناء معالجة الصورة {idx + 1}: {e}")
        
        print(f"تم تحميل {downloaded_count} صورة من الفصل {chapter}")
        
        # حفظ تفاصيل الفصل للتصحيح
        if downloaded_count == 0:
            debug_file = os.path.join(chapter_dir, "debug_info.txt")
            with open(debug_file, "w", encoding="utf-8") as f:
                f.write(f"عنوان الصفحة: {driver.title}\n")
                f.write(f"URL: {driver.current_url}\n")
                f.write(f"عدد الصور الموجودة: {len(unique_images)}\n")
                f.write(f"عدد الصور المحملة: {downloaded_count}\n")
        
    except Exception as e:
        print(f"خطأ أثناء معالجة الفصل {chapter}: {e}")
    
    # انتظار عشوائي بين الفصول لتجنب الحظر
    time.sleep(random.uniform(5, 15))

# إغلاق المتصفح
driver.quit()
print("تم تحميل جميع الفصول المطلوبة!")