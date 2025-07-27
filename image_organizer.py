import os
import shutil
import re
from pathlib import Path

def organize_manga_images(source_folder, destination_folder="Organized_Manga"):
    """
    تنظيم صور المانجا المحملة يدوياً إلى مجلدات فصول
    """
    
    if not os.path.exists(source_folder):
        print(f"المجلد المصدر غير موجود: {source_folder}")
        return
    
    # إنشاء مجلد الوجهة
    if not os.path.exists(destination_folder):
        os.makedirs(destination_folder)
    
    # قائمة امتدادات الصور المدعومة
    image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    
    # البحث عن جميع الصور في المجلد المصدر
    image_files = []
    for root, dirs, files in os.walk(source_folder):
        for file in files:
            if any(file.lower().endswith(ext) for ext in image_extensions):
                image_files.append(os.path.join(root, file))
    
    print(f"تم العثور على {len(image_files)} صورة")
    
    # تجميع الصور حسب الفصل (بناءً على اسم الملف)
    chapters = {}
    
    for img_path in image_files:
        filename = os.path.basename(img_path)
        
        # محاولة استخراج رقم الفصل من اسم الملف
        chapter_match = re.search(r'(\d+)', filename)
        if chapter_match:
            chapter_num = int(chapter_match.group(1))
            
            if chapter_num not in chapters:
                chapters[chapter_num] = []
            chapters[chapter_num].append(img_path)
        else:
            # إذا لم نجد رقم فصل، ضعها في مجلد "Unknown"
            if 'unknown' not in chapters:
                chapters['unknown'] = []
            chapters['unknown'].append(img_path)
    
    # تنظيم الصور في مجلدات الفصول
    for chapter, images in chapters.items():
        if chapter == 'unknown':
            chapter_folder = os.path.join(destination_folder, "Unknown_Chapter")
        else:
            chapter_folder = os.path.join(destination_folder, f"Chapter_{chapter:03d}")
        
        if not os.path.exists(chapter_folder):
            os.makedirs(chapter_folder)
        
        # ترقيم الصور
        for idx, img_path in enumerate(sorted(images)):
            ext = os.path.splitext(img_path)[1]
            new_filename = f"page_{idx + 1:03d}{ext}"
            new_path = os.path.join(chapter_folder, new_filename)
            
            # نسخ الصورة
            shutil.copy2(img_path, new_path)
            print(f"نُسخت: {os.path.basename(img_path)} -> {new_filename}")
    
    print(f"\nتم تنظيم الصور في {len(chapters)} فصل")
    print(f"مجلد الوجهة: {destination_folder}")

def rename_images_in_folder(folder_path):
    """
    إعادة تسمية الصور في مجلد واحد بترقيم متسلسل
    """
    if not os.path.exists(folder_path):
        print(f"المجلد غير موجود: {folder_path}")
        return
    
    image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    
    # جمع جميع الصور
    image_files = []
    for file in os.listdir(folder_path):
        if any(file.lower().endswith(ext) for ext in image_extensions):
            image_files.append(file)
    
    # ترتيب الصور
    image_files.sort()
    
    print(f"إعادة تسمية {len(image_files)} صورة في {folder_path}")
    
    # إعادة تسمية مؤقتة لتجنب التضارب
    temp_names = []
    for idx, filename in enumerate(image_files):
        old_path = os.path.join(folder_path, filename)
        ext = os.path.splitext(filename)[1]
        temp_name = f"temp_{idx:03d}{ext}"
        temp_path = os.path.join(folder_path, temp_name)
        
        os.rename(old_path, temp_path)
        temp_names.append(temp_name)
    
    # التسمية النهائية
    for idx, temp_name in enumerate(temp_names):
        temp_path = os.path.join(folder_path, temp_name)
        ext = os.path.splitext(temp_name)[1]
        final_name = f"page_{idx + 1:03d}{ext}"
        final_path = os.path.join(folder_path, final_name)
        
        os.rename(temp_path, final_path)
        print(f"  {temp_name} -> {final_name}")

def create_chapter_folders(base_folder, start_chapter, end_chapter):
    """
    إنشاء مجلدات فارغة للفصول
    """
    if not os.path.exists(base_folder):
        os.makedirs(base_folder)
    
    for chapter in range(start_chapter, end_chapter + 1):
        chapter_folder = os.path.join(base_folder, f"Chapter_{chapter:03d}")
        if not os.path.exists(chapter_folder):
            os.makedirs(chapter_folder)
            print(f"تم إنشاء: {chapter_folder}")

if __name__ == "__main__":
    print("مُنظم صور المانجا")
    print("=" * 50)
    
    while True:
        print("\nاختر عملية:")
        print("1. تنظيم الصور من مجلد إلى مجلدات فصول")
        print("2. إعادة تسمية الصور في مجلد واحد")
        print("3. إنشاء مجلدات فصول فارغة")
        print("4. خروج")
        
        choice = input("\nاختيارك (1-4): ").strip()
        
        if choice == "1":
            source = input("مسار المجلد المصدر: ").strip()
            dest = input("مسار مجلد الوجهة (اتركه فارغاً للافتراضي): ").strip()
            if not dest:
                dest = "Organized_Manga"
            organize_manga_images(source, dest)
            
        elif choice == "2":
            folder = input("مسار المجلد: ").strip()
            rename_images_in_folder(folder)
            
        elif choice == "3":
            base = input("مسار المجلد الأساسي: ").strip()
            start = int(input("رقم الفصل الأول: "))
            end = int(input("رقم الفصل الأخير: "))
            create_chapter_folders(base, start, end)
            
        elif choice == "4":
            print("شكراً لك!")
            break
            
        else:
            print("اختيار غير صحيح!")