import os
import time
import requests
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import random

# إعداد المجلد الأساسي لتخزين الفصول
base_dir = "Manga_Downloads"
if not os.path.exists(base_dir):
    os.makedirs(base_dir)

# إعداد المتصفح باستخدام undetected-chromedriver
try:
    options = uc.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    driver = uc.Chrome(options=options, version_main=138)
    print("تم تشغيل المتصفح بنجاح!")
except Exception as e:
    print(f"خطأ في تشغيل المتصفح: {e}")
    exit(1)

# رابط القاعدة للمانجا
base_url = "https://manga-starz.com/manga/return-of-the-mount-hua-sect/{}/"

# نطاق الفصول المطلوبة
start_chapter = 133
end_chapter = 150

def wait_for_page_load(driver, timeout=60):
    """انتظار تحميل الصفحة بالكامل"""
    try:
        print("انتظار تحميل الصفحة...")
        
        # انتظار حتى لا يكون العنوان "Just a moment"
        wait = WebDriverWait(driver, timeout)
        wait.until_not(EC.title_contains("Just a moment"))
        
        # انتظار إضافي
        time.sleep(random.uniform(10, 20))
        
        print(f"تم تحميل الصفحة: {driver.title}")
        return True
    except Exception as e:
        print(f"فشل في تحميل الصفحة: {e}")
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
        
        session = requests.Session()
        response = session.get(img_url, stream=True, headers=headers, timeout=30)
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

# اختبار فصل واحد أولاً
test_chapter = 133
chapter_dir = os.path.join(base_dir, f"Chapter_{test_chapter}")
if not os.path.exists(chapter_dir):
    os.makedirs(chapter_dir)

chapter_url = base_url.format(test_chapter)
print(f"جارٍ اختبار الفصل {test_chapter}: {chapter_url}")

try:
    driver.get(chapter_url)
    
    if wait_for_page_load(driver):
        print(f"عنوان الصفحة: {driver.title}")
        print(f"URL الحالي: {driver.current_url}")
        
        # التمرير في الصفحة لتحميل المحتوى الديناميكي
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(5)
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(3)
        
        # البحث عن الصور
        all_images = driver.find_elements(By.TAG_NAME, "img")
        print(f"إجمالي الصور المكتشفة: {len(all_images)}")
        
        # تحليل وحفظ معلومات الصور
        manga_images = []
        for idx, img in enumerate(all_images):
            try:
                src = img.get_attribute("src")
                data_src = img.get_attribute("data-src")
                alt = img.get_attribute("alt") or ""
                class_name = img.get_attribute("class") or ""
                
                img_url = src or data_src
                if img_url and any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    # تصفية الصور الصغيرة (أيقونات، لوجو، إلخ)
                    try:
                        size = img.size
                        width = size.get('width', 0)
                        height = size.get('height', 0)
                        
                        # قبول الصور الكبيرة فقط
                        if width > 300 and height > 300:
                            manga_images.append({
                                'url': img_url,
                                'alt': alt,
                                'class': class_name,
                                'width': width,
                                'height': height
                            })
                            print(f"صورة مانجا محتملة {len(manga_images)}: {img_url[:100]}...")
                    except:
                        # إذا فشل الحصول على الحجم، أضف الصورة على أي حال
                        manga_images.append({
                            'url': img_url,
                            'alt': alt,
                            'class': class_name,
                            'width': 'unknown',
                            'height': 'unknown'
                        })
                        print(f"صورة مانجا محتملة {len(manga_images)}: {img_url[:100]}...")
                        
            except Exception as e:
                print(f"خطأ في تحليل الصورة {idx + 1}: {e}")
        
        print(f"تم العثور على {len(manga_images)} صورة مانجا محتملة")
        
        # تحميل الصور
        downloaded_count = 0
        for idx, img_info in enumerate(manga_images):
            try:
                img_url = img_info['url']
                
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
                    ext = '.jpg'
                
                img_name = f"page_{downloaded_count + 1:03d}{ext}"
                save_path = os.path.join(chapter_dir, img_name)
                
                if download_image(img_url, save_path):
                    downloaded_count += 1
                
                # انتظار قصير بين التحميلات
                time.sleep(random.uniform(1, 3))
                
            except Exception as e:
                print(f"خطأ أثناء تحميل الصورة {idx + 1}: {e}")
        
        print(f"تم تحميل {downloaded_count} صورة من الفصل {test_chapter}")
        
        # حفظ مصدر الصفحة للتحليل
        page_source = driver.page_source
        with open(f"chapter_{test_chapter}_source.html", "w", encoding="utf-8") as f:
            f.write(page_source)
        print(f"تم حفظ مصدر الصفحة في chapter_{test_chapter}_source.html")
        
        # حفظ تقرير التصحيح
        debug_report = f"""تقرير التصحيح للفصل {test_chapter}
عنوان الصفحة: {driver.title}
URL: {driver.current_url}
إجمالي الصور: {len(all_images)}
صور المانجا المحتملة: {len(manga_images)}
الصور المحملة: {downloaded_count}

تفاصيل الصور:
"""
        for i, img_info in enumerate(manga_images):
            debug_report += f"{i+1}. {img_info['url']}\n   الحجم: {img_info['width']}x{img_info['height']}\n   الفئة: {img_info['class']}\n\n"
        
        with open(os.path.join(chapter_dir, "debug_report.txt"), "w", encoding="utf-8") as f:
            f.write(debug_report)
        
    else:
        print("فشل في تحميل الصفحة")

except Exception as e:
    print(f"خطأ عام: {e}")

finally:
    driver.quit()
    print("تم إغلاق المتصفح")

print("اكتمل الاختبار!")