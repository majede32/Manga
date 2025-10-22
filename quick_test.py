import requests
import time

print("🔍 اختبار سريع للوصول للموقع...")

# إعداد جلسة requests
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

# اختبار الفصل 133
test_url = "https://manga-starz.com/manga/return-of-the-mount-hua-sect/133/"

try:
    print(f"📡 محاولة الوصول إلى: {test_url}")
    response = session.get(test_url, timeout=30)
    
    print(f"🔢 رمز الاستجابة: {response.status_code}")
    print(f"📄 طول المحتوى: {len(response.text)} حرف")
    print(f"🏷️  Content-Type: {response.headers.get('Content-Type', 'غير محدد')}")
    
    if "Just a moment" in response.text:
        print("❌ تم اكتشاف صفحة Cloudflare")
    elif "cloudflare" in response.text.lower():
        print("❌ تم اكتشاف حماية Cloudflare")
    elif response.status_code == 403:
        print("❌ تم رفض الوصول (403 Forbidden)")
    elif response.status_code == 200:
        print("✅ تم الوصول بنجاح!")
        
        # البحث عن إشارات المانجا في الصفحة
        if "manga" in response.text.lower():
            print("📚 تم العثور على كلمة 'manga' في الصفحة")
        if "chapter" in response.text.lower():
            print("📖 تم العثور على كلمة 'chapter' في الصفحة")
        if "image" in response.text.lower():
            print("🖼️  تم العثور على كلمة 'image' في الصفحة")
        
        # حفظ عينة من المحتوى للفحص
        with open("quick_test_sample.html", "w", encoding="utf-8") as f:
            f.write(response.text[:5000])  # أول 5000 حرف
        print("💾 تم حفظ عينة من المحتوى في quick_test_sample.html")
    else:
        print(f"❌ خطأ: رمز الاستجابة {response.status_code}")

except requests.RequestException as e:
    print(f"❌ خطأ في الشبكة: {e}")
except Exception as e:
    print(f"❌ خطأ عام: {e}")

print("\n" + "="*50)
print("اكتمل الاختبار السريع")