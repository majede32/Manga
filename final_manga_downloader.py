import os
import time
import requests
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import random
import re
from urllib.parse import urljoin

print("=" * 60)
print("مُحمل المانجا النهائي - Return of the Mount Hua Sect")
print("الفصول: 133-150")
print("=" * 60)

# إعداد المجلد الأساسي لتخزين الفصول
base_dir = "Manga_Downloads"
if not os.path.exists(base_dir):
    os.makedirs(base_dir)

# إعدادات الفصول
start_chapter = 133
end_chapter = 150
base_url = "https://manga-starz.com/manga/return-of-the-mount-hua-sect/{}/"

def try_requests_method(chapter_url, chapter):
    """محاولة التحميل باستخدام requests"""
    print(f"📡 محاولة requests للفصل {chapter}...")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    })
    
    try:
        response = session.get(chapter_url, timeout=30)
        if response.status_code == 200 and "Just a moment" not in response.text:
            print(f"✅ نجح requests للفصل {chapter}")
            return response.text, session
        else:
            print(f"❌ فشل requests للفصل {chapter} - رمز: {response.status_code}")
            return None, None
    except Exception as e:
        print(f"❌ خطأ في requests للفصل {chapter}: {e}")
        return None, None

def try_selenium_method(chapter_url, chapter):
    """محاولة التحميل باستخدام Selenium"""
    print(f"🌐 محاولة Selenium للفصل {chapter}...")
    
    driver = None
    try:
        options = uc.ChromeOptions()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        
        driver = uc.Chrome(options=options, version_main=138)
        driver.get(chapter_url)
        
        # انتظار تحميل الصفحة
        wait = WebDriverWait(driver, 60)
        try:
            wait.until_not(EC.title_contains("Just a moment"))
        except:
            pass
        
        time.sleep(random.uniform(10, 20))
        
        # التمرير لتحميل المحتوى
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(5)
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(3)
        
        page_source = driver.page_source
        if "Just a moment" not in page_source and len(page_source) > 10000:
            print(f"✅ نجح Selenium للفصل {chapter}")
            return page_source, driver
        else:
            print(f"❌ فشل Selenium للفصل {chapter} - صفحة محمية")
            return None, driver
            
    except Exception as e:
        print(f"❌ خطأ في Selenium للفصل {chapter}: {e}")
        return None, driver

def extract_images_from_html(html_content, chapter_url):
    """استخراج روابط الصور من HTML"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        manga_images = []
        
        # البحث عن جميع عناصر img
        images = soup.find_all('img')
        
        for img in images:
            src = img.get('src')
            data_src = img.get('data-src')
            alt = img.get('alt', '')
            
            img_url = src or data_src
            
            if img_url and any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                # تحويل الرابط النسبي إلى مطلق
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url
                elif img_url.startswith('/'):
                    img_url = urljoin(chapter_url, img_url)
                
                manga_images.append({
                    'url': img_url,
                    'alt': alt
                })
        
        # البحث في النصوص والسكريبتات
        scripts = soup.find_all('script')
        for script in scripts:
            script_content = script.string or ""
            img_urls = re.findall(r'https?://[^\s\'"<>]+\.(?:jpg|jpeg|png|webp)', script_content)
            for url in img_urls:
                if url not in [img['url'] for img in manga_images]:
                    manga_images.append({
                        'url': url,
                        'alt': 'من JavaScript'
                    })
        
        return manga_images
        
    except Exception as e:
        print(f"❌ خطأ في استخراج الصور: {e}")
        return []

def download_image(img_url, save_path, session=None):
    """تحميل صورة واحدة"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Referer': 'https://manga-starz.com/',
            'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
        
        if session:
            response = session.get(img_url, headers=headers, timeout=30)
        else:
            response = requests.get(img_url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            file_size = len(response.content)
            if file_size > 1000:  # تجاهل الصور الصغيرة جداً
                print(f"  ✅ تم تحميل: {os.path.basename(save_path)} ({file_size} بايت)")
                return True
            else:
                os.remove(save_path)  # حذف الصور الصغيرة
                return False
        else:
            print(f"  ❌ فشل تحميل الصورة: رمز {response.status_code}")
            return False
            
    except Exception as e:
        print(f"  ❌ خطأ في تحميل الصورة: {e}")
        return False

def process_chapter(chapter):
    """معالجة فصل واحد"""
    print(f"\n📖 معالجة الفصل {chapter}")
    print("-" * 40)
    
    # إنشاء مجلد للفصل
    chapter_dir = os.path.join(base_dir, f"Chapter_{chapter:03d}")
    if not os.path.exists(chapter_dir):
        os.makedirs(chapter_dir)
    
    chapter_url = base_url.format(chapter)
    html_content = None
    session = None
    driver = None
    
    try:
        # محاولة requests أولاً
        html_content, session = try_requests_method(chapter_url, chapter)
        
        # إذا فشل requests، جرب Selenium
        if not html_content:
            html_content, driver = try_selenium_method(chapter_url, chapter)
        
        if html_content:
        # حفظ HTML للفحص
        with open(os.path.join(chapter_dir, "page_source.html"), "w", encoding="utf-8") as f:
            f.write(html_content)
        
        # استخراج الصور
        images = extract_images_from_html(html_content, chapter_url)
        print(f"🖼️  تم العثور على {len(images)} صورة محتملة")
        
        if images:
            downloaded_count = 0
            
            for idx, img_info in enumerate(images):
                try:
                    img_url = img_info['url']
                    
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
                    
                    if download_image(img_url, save_path, session):
                        downloaded_count += 1
                    
                    # انتظار قصير بين التحميلات
                    time.sleep(random.uniform(0.5, 2))
                    
                except Exception as e:
                    print(f"  ❌ خطأ في معالجة الصورة {idx + 1}: {e}")
            
            # حفظ تقرير
            report = f"""تقرير الفصل {chapter}
URL: {chapter_url}
إجمالي الصور: {len(images)}
الصور المحملة: {downloaded_count}
النجاح: {downloaded_count}/{len(images)}

تفاصيل الصور:
"""
            for i, img in enumerate(images):
                report += f"{i+1}. {img['url']}\n   alt: {img['alt']}\n\n"
            
            with open(os.path.join(chapter_dir, "report.txt"), "w", encoding="utf-8") as f:
                f.write(report)
            
            print(f"📊 ملخص الفصل {chapter}: تم تحميل {downloaded_count} من {len(images)} صورة")
            return downloaded_count
            
            else:
                print(f"❌ لم يتم العثور على صور في الفصل {chapter}")
                return 0
        else:
            print(f"❌ فشل في الوصول للفصل {chapter}")
            return 0
    
    finally:
        # إغلاق المتصفح إذا كان مفتوحاً
        if driver:
            try:
                driver.quit()
            except:
                pass

def main():
    """الدالة الرئيسية"""
    total_downloaded = 0
    successful_chapters = 0
    
    print(f"🚀 بدء تحميل الفصول من {start_chapter} إلى {end_chapter}")
    start_time = time.time()
    
    for chapter in range(start_chapter, end_chapter + 1):
        try:
            downloaded = process_chapter(chapter)
            if downloaded > 0:
                successful_chapters += 1
                total_downloaded += downloaded
            
            # انتظار بين الفصول لتجنب الحظر
            if chapter < end_chapter:
                wait_time = random.uniform(5, 15)
                print(f"⏱️  انتظار {wait_time:.1f} ثانية قبل الفصل التالي...")
                time.sleep(wait_time)
                
        except KeyboardInterrupt:
            print(f"\n⚠️  تم إيقاف التحميل بواسطة المستخدم")
            break
        except Exception as e:
            print(f"❌ خطأ عام في الفصل {chapter}: {e}")
            continue
    
    # تقرير نهائي
    end_time = time.time()
    duration = end_time - start_time
    
    print(f"\n" + "=" * 60)
    print("📋 التقرير النهائي")
    print("=" * 60)
    print(f"الفصول المُعالجة: {end_chapter - start_chapter + 1}")
    print(f"الفصول الناجحة: {successful_chapters}")
    print(f"إجمالي الصور المحملة: {total_downloaded}")
    print(f"المدة الزمنية: {duration/60:.1f} دقيقة")
    print(f"مجلد التحميل: {os.path.abspath(base_dir)}")
    
    if successful_chapters == 0:
        print("\n⚠️  لم يتم تحميل أي فصل بنجاح!")
        print("السبب المحتمل: حماية Cloudflare نشطة")
        print("💡 جرب:")
        print("   - استخدام VPN")
        print("   - المحاولة في وقت لاحق")
        print("   - التحميل اليدوي واستخدام image_organizer.py")
    else:
        print(f"\n🎉 تم تحميل {successful_chapters} فصل بنجاح!")
    
    print("=" * 60)

if __name__ == "__main__":
    main()