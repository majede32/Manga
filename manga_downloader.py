import os
import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from urllib.parse import urljoin

# إعدادات المتصفح
chrome_options = Options()
chrome_options.add_argument("--headless")  # تشغيل المتصفح في الخلفية
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")  # إضافة لتجنب مشاكل الذاكرة
chrome_options.add_argument("--remote-debugging-port=9222")  # إضافة منفذ التصحيح
chrome_options.add_argument("--disable-extensions")
chrome_options.add_argument("--disable-web-security")
chrome_options.add_argument("--allow-running-insecure-content")

# إعداد المجلد الأساسي لتخزين الفصول
base_dir = "Manga_Downloads"
if not os.path.exists(base_dir):
    os.makedirs(base_dir)

# إعداد المتصفح باستخدام ChromeDriver
try:
    # محاولة استخدام Chrome المثبت
    chrome_options.binary_location = "/usr/bin/google-chrome-stable"
    # استخدام ChromeDriver المثبت يدوياً
    service = Service("/usr/local/bin/chromedriver")
    driver = webdriver.Chrome(service=service, options=chrome_options)
    print("تم تشغيل المتصفح بنجاح!")
except Exception as e:
    print(f"خطأ في تشغيل المتصفح: {e}")
    exit(1)

# رابط القاعدة للمانجا
base_url = "https://manga-starz.com/manga/return-of-the-mount-hua-sect/{}/"

# نطاق الفصول المطلوبة
start_chapter = 133
end_chapter = 150

def download_image(img_url, save_path):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(img_url, stream=True, headers=headers)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            print(f"تم تحميل الصورة: {save_path}")
        else:
            print(f"فشل تحميل الصورة: {img_url} - Status: {response.status_code}")
    except Exception as e:
        print(f"خطأ أثناء تحميل الصورة {img_url}: {e}")

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
        time.sleep(5)  # زيادة وقت الانتظار لتحميل الصفحة

        # استخراج الصور من الصفحة - محاولة عدة طرق
        # أولاً، محاولة العثور على صور المانجا بطرق مختلفة
        image_selectors = [
            "img[src*='manga-starz']",
            "img[src*='.jpg']",
            "img[src*='.png']",
            "img[src*='.jpeg']",
            ".page-break img",
            ".manga-page img",
            "img[data-src]"
        ]
        
        images_found = []
        for selector in image_selectors:
            try:
                images = driver.find_elements(By.CSS_SELECTOR, selector)
                if images:
                    images_found = images
                    print(f"تم العثور على {len(images)} صورة باستخدام السيليكتور: {selector}")
                    break
            except:
                continue
        
        if not images_found:
            # إذا لم نجد صور بالطرق المعتادة، نجرب جميع الصور
            images_found = driver.find_elements(By.TAG_NAME, "img")
            print(f"تم العثور على {len(images_found)} صورة إجمالية")

        downloaded_count = 0
        for idx, img in enumerate(images_found):
            try:
                # محاولة الحصول على رابط الصورة
                img_url = img.get_attribute("src") or img.get_attribute("data-src")
                
                if img_url and any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    # التحقق من أن الصورة تبدو وكأنها صورة مانجا (حجم معقول)
                    try:
                        width = img.get_attribute("width") or "0"
                        height = img.get_attribute("height") or "0"
                        if width.isdigit() and height.isdigit():
                            if int(width) < 100 or int(height) < 100:
                                continue  # تجاهل الصور الصغيرة
                    except:
                        pass
                    
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
                    download_image(img_url, save_path)
                    downloaded_count += 1
                    
            except Exception as e:
                print(f"خطأ أثناء معالجة الصورة {idx + 1}: {e}")
        
        print(f"تم تحميل {downloaded_count} صورة من الفصل {chapter}")
        
    except Exception as e:
        print(f"خطأ أثناء معالجة الفصل {chapter}: {e}")
    
    # انتظار قصير بين الفصول
    time.sleep(2)

# إغلاق المتصفح
driver.quit()
print("تم تحميل جميع الفصول المطلوبة!")