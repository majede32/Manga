import os
import time
import requests
from bs4 import BeautifulSoup
import random
import re
from urllib.parse import urljoin, urlparse

# إعداد المجلد الأساسي لتخزين الفصول
base_dir = "Manga_Downloads"
if not os.path.exists(base_dir):
    os.makedirs(base_dir)

# إعداد جلسة requests مع headers واقعية
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    'Cache-Control': 'max-age=0'
})

# رابط القاعدة للمانجا
base_url = "https://manga-starz.com/manga/return-of-the-mount-hua-sect/{}/"

# نطاق الفصول المطلوبة
start_chapter = 133
end_chapter = 133  # نختبر فصل واحد أولاً

def get_page_content(url, retries=3):
    """محاولة الحصول على محتوى الصفحة مع عدة محاولات"""
    for attempt in range(retries):
        try:
            print(f"محاولة {attempt + 1} للوصول إلى: {url}")
            
            # انتظار عشوائي قبل الطلب
            time.sleep(random.uniform(2, 5))
            
            response = session.get(url, timeout=30)
            
            print(f"رمز الاستجابة: {response.status_code}")
            print(f"عنوان الصفحة المستخرج: {response.headers.get('Content-Type', 'غير محدد')}")
            
            if response.status_code == 200:
                # فحص إذا كانت الصفحة تحتوي على Cloudflare challenge
                if "Just a moment" in response.text or "cloudflare" in response.text.lower():
                    print("تم اكتشاف حماية Cloudflare")
                    # محاولة استخراج معلومات التحدي
                    if "challenge-platform" in response.text:
                        print("يتطلب حل تحدي Cloudflare")
                    continue
                else:
                    print(f"تم الحصول على المحتوى بنجاح! الحجم: {len(response.text)} حرف")
                    return response.text
            else:
                print(f"فشل الطلب برمز: {response.status_code}")
                
        except requests.RequestException as e:
            print(f"خطأ في الطلب: {e}")
            
        # انتظار أطول بين المحاولات
        if attempt < retries - 1:
            wait_time = random.uniform(10, 20)
            print(f"انتظار {wait_time:.1f} ثانية قبل المحاولة التالية...")
            time.sleep(wait_time)
    
    return None

def extract_images_from_html(html_content, base_url):
    """استخراج روابط الصور من HTML"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        print("البحث عن الصور في HTML...")
        
        # البحث عن جميع عناصر img
        images = soup.find_all('img')
        print(f"تم العثور على {len(images)} عنصر img")
        
        manga_images = []
        
        for img in images:
            src = img.get('src')
            data_src = img.get('data-src')
            alt = img.get('alt', '')
            class_name = img.get('class', [])
            
            img_url = src or data_src
            
            if img_url:
                # تحويل الرابط النسبي إلى مطلق
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url
                elif img_url.startswith('/'):
                    img_url = urljoin(base_url, img_url)
                
                # فحص إذا كانت الصورة من أنواع المدعومة
                if any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    manga_images.append({
                        'url': img_url,
                        'alt': alt,
                        'class': ' '.join(class_name) if isinstance(class_name, list) else str(class_name)
                    })
                    print(f"صورة محتملة: {img_url[:100]}...")
        
        # البحث عن روابط الصور في النصوص والسكريبتات
        scripts = soup.find_all('script')
        for script in scripts:
            script_content = script.string or ""
            # البحث عن روابط الصور في الكود
            img_urls = re.findall(r'https?://[^\s\'"<>]+\.(?:jpg|jpeg|png|webp)', script_content)
            for url in img_urls:
                if url not in [img['url'] for img in manga_images]:
                    manga_images.append({
                        'url': url,
                        'alt': 'من JavaScript',
                        'class': 'script-found'
                    })
                    print(f"صورة من script: {url[:100]}...")
        
        print(f"إجمالي الصور المستخرجة: {len(manga_images)}")
        return manga_images
        
    except Exception as e:
        print(f"خطأ في استخراج الصور: {e}")
        return []

def download_image(img_url, save_path):
    """تحميل صورة واحدة"""
    try:
        print(f"تحميل: {img_url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Referer': 'https://manga-starz.com/',
            'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
        
        response = session.get(img_url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            print(f"✓ تم تحميل: {save_path} ({len(response.content)} بايت)")
            return True
        else:
            print(f"✗ فشل التحميل: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ خطأ في التحميل: {e}")
        return False

# معالجة الفصول
for chapter in range(start_chapter, end_chapter + 1):
    print(f"\n{'='*60}")
    print(f"معالجة الفصل {chapter}")
    print(f"{'='*60}")
    
    # إنشاء مجلد للفصل
    chapter_dir = os.path.join(base_dir, f"Chapter_{chapter}")
    if not os.path.exists(chapter_dir):
        os.makedirs(chapter_dir)
    
    # تكوين رابط الفصل
    chapter_url = base_url.format(chapter)
    
    # الحصول على محتوى الصفحة
    html_content = get_page_content(chapter_url)
    
    if html_content:
        # حفظ HTML للفحص
        with open(os.path.join(chapter_dir, "page_source.html"), "w", encoding="utf-8") as f:
            f.write(html_content)
        print("تم حفظ مصدر الصفحة")
        
        # استخراج الصور
        images = extract_images_from_html(html_content, chapter_url)
        
        if images:
            # تحميل الصور
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
                    
                    if download_image(img_url, save_path):
                        downloaded_count += 1
                    
                    # انتظار قصير بين التحميلات
                    time.sleep(random.uniform(1, 3))
                    
                except Exception as e:
                    print(f"خطأ في معالجة الصورة {idx + 1}: {e}")
            
            # حفظ تقرير
            report = f"""تقرير الفصل {chapter}
URL: {chapter_url}
إجمالي الصور: {len(images)}
الصور المحملة: {downloaded_count}
النجاح: {downloaded_count}/{len(images)}

تفاصيل الصور:
"""
            for i, img in enumerate(images):
                report += f"{i+1}. {img['url']}\n   alt: {img['alt']}\n   class: {img['class']}\n\n"
            
            with open(os.path.join(chapter_dir, "report.txt"), "w", encoding="utf-8") as f:
                f.write(report)
            
            print(f"\nملخص الفصل {chapter}:")
            print(f"تم تحميل {downloaded_count} من {len(images)} صورة")
            
        else:
            print("لم يتم العثور على أي صور")
    else:
        print("فشل في الحصول على محتوى الصفحة")
    
    # انتظار بين الفصول
    if chapter < end_chapter:
        wait_time = random.uniform(10, 20)
        print(f"\nانتظار {wait_time:.1f} ثانية قبل الفصل التالي...")
        time.sleep(wait_time)

print(f"\n{'='*60}")
print("اكتمل تحميل جميع الفصول!")
print(f"{'='*60}")