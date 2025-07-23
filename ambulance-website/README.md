# إسعافك - موقع خدمات النقل الطبي والإسعاف
# Esafak - Medical Transport & Ambulance Services Website

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=flat&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

## 📋 وصف المشروع | Project Description

**العربية:**
موقع إلكتروني شامل لشركة خدمات النقل الطبي والإسعاف "إسعافك" يوفر منصة رقمية متكاملة لحجز خدمات النقل الطبي الطارئ وغير الطارئ. الموقع مصمم باللغة العربية مع دعم RTL ويتضمن جميع الميزات الحديثة لتجربة مستخدم متميزة.

**English:**
A comprehensive website for "Esafak" medical transport and ambulance services company, providing an integrated digital platform for booking emergency and non-emergency medical transport services. The website is designed in Arabic with RTL support and includes all modern features for an excellent user experience.

## ✨ الميزات الرئيسية | Key Features

### 🌐 واجهة المستخدم | User Interface
- **تصميم عربي RTL** - Arabic RTL Design
- **تصميم متجاوب** - Responsive Design (Mobile, Tablet, Desktop)
- **تجربة مستخدم حديثة** - Modern UX/UI
- **ألوان طبية مهنية** - Professional Medical Color Scheme
- **رسوم متحركة سلسة** - Smooth Animations

### 📱 الصفحات | Pages
- **الصفحة الرئيسية** - Homepage with hero section, services overview, testimonials
- **صفحة الخدمات** - Detailed services page with pricing
- **صفحة الحجز** - Comprehensive booking form
- **صفحة من نحن** - About us with team information
- **صفحة التواصل** - Contact page with form and map

### 🚑 الخدمات | Services
- **نقل طارئ** - Emergency Transport
- **نقل غير طارئ** - Non-Emergency Transport  
- **نقل جوي** - Air Transport
- **عناية مركزة** - ICU Transport
- **خدمات إضافية** - Additional specialized services

### 📋 نماذج تفاعلية | Interactive Forms
- **نموذج حجز شامل** - Comprehensive booking form with validation
- **نموذج تواصل** - Contact form with multiple inquiry types
- **التحقق من البيانات** - Real-time form validation
- **رسائل تأكيد** - Success/error messages

### 🎨 تقنيات التصميم | Design Technologies
- **Bootstrap 5** - للشبكة والمكونات
- **Font Awesome 6** - للأيقونات
- **Google Fonts (Cairo)** - للخطوط العربية
- **CSS Animations** - للحركات والتأثيرات
- **CSS Variables** - لسهولة التخصيص

## 📁 هيكل المشروع | Project Structure

```
ambulance-website/
├── index.html              # الصفحة الرئيسية | Homepage
├── services.html           # صفحة الخدمات | Services Page
├── booking.html            # صفحة الحجز | Booking Page
├── about.html              # صفحة من نحن | About Page
├── contact.html            # صفحة التواصل | Contact Page
├── css/
│   └── style.css          # ملف التنسيق الرئيسي | Main CSS File
├── js/
│   └── script.js          # ملف JavaScript الرئيسي | Main JS File
├── images/                # مجلد الصور | Images Directory
└── README.md              # ملف التوثيق | Documentation
```

## 🚀 التشغيل والإعداد | Setup & Installation

### متطلبات النظام | System Requirements
- متصفح ويب حديث | Modern Web Browser
- خادم ويب محلي (اختياري) | Local Web Server (Optional)

### خطوات التشغيل | Installation Steps

**العربية:**
1. **تحميل المشروع**
   ```bash
   git clone https://github.com/your-username/esafak-website.git
   cd esafak-website
   ```

2. **فتح الموقع**
   - افتح ملف `index.html` في المتصفح مباشرة
   - أو استخدم خادم محلي مثل Live Server في VS Code

3. **للتطوير المتقدم**
   ```bash
   # تشغيل خادم Python البسيط
   python -m http.server 8000
   
   # أو خادم Node.js
   npx http-server
   ```

**English:**
1. **Download Project**
   ```bash
   git clone https://github.com/your-username/esafak-website.git
   cd esafak-website
   ```

2. **Open Website**
   - Open `index.html` directly in browser
   - Or use local server like Live Server in VS Code

3. **For Advanced Development**
   ```bash
   # Run Python simple server
   python -m http.server 8000
   
   # Or Node.js server
   npx http-server
   ```

## 🔧 التخصيص | Customization

### تغيير الألوان | Color Customization
```css
:root {
  --primary-color: #dc3545;    /* الأحمر الطبي | Medical Red */
  --secondary-color: #007bff;  /* الأزرق | Blue */
  --success-color: #28a745;    /* الأخضر | Green */
  --warning-color: #ffc107;    /* الأصفر | Yellow */
}
```

### إضافة خدمات جديدة | Adding New Services
1. أضف قسم جديد في `services.html`
2. أضف خيار جديد في نموذج الحجز
3. حدث JavaScript للتعامل مع الخدمة الجديدة

### تخصيص النماذج | Form Customization
- عدل ملف `js/script.js` لإضافة تحقق مخصص
- أضف حقول جديدة في HTML
- حدث CSS للتنسيق

## 🌐 التكامل مع الخدمات | Service Integration

### خرائط جوجل | Google Maps
```html
<!-- إضافة مفتاح API -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"></script>
```

### خدمة الإيميل | Email Service
```javascript
// مثال للتكامل مع EmailJS
emailjs.send("service_id", "template_id", formData)
  .then(response => console.log('تم الإرسال', response))
  .catch(error => console.error('خطأ', error));
```

### قاعدة البيانات | Database Integration
```javascript
// مثال للتكامل مع Firebase
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const db = getFirestore();
await addDoc(collection(db, "bookings"), formData);
```

## 📱 التصميم المتجاوب | Responsive Design

### نقاط التوقف | Breakpoints
- **الهاتف** | Mobile: `< 576px`
- **الجهاز اللوحي** | Tablet: `576px - 768px`
- **سطح المكتب الصغير** | Small Desktop: `768px - 992px`
- **سطح المكتب الكبير** | Large Desktop: `> 992px`

### اختبار التجاوب | Responsive Testing
```bash
# أدوات مفيدة للاختبار
- Chrome DevTools
- Firefox Responsive Design Mode
- Online tools: responsivedesignchecker.com
```

## 🔍 تحسين محركات البحث | SEO Optimization

### العلامات الوصفية | Meta Tags
```html
<meta name="description" content="خدمات نقل طبي طارئ وغير طارئ في السعودية">
<meta name="keywords" content="إسعاف, نقل مرضى, خدمات طبية, الرياض">
<meta property="og:title" content="إسعافك - خدمات النقل الطبي">
```

### البيانات المنظمة | Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "إسعافك",
  "description": "خدمات النقل الطبي والإسعاف"
}
```

## 🛡️ الأمان | Security

### حماية النماذج | Form Protection
- التحقق من البيانات في الواجهة الأمامية والخلفية
- حماية من XSS و SQL Injection
- استخدام HTTPS في الإنتاج

### خصوصية البيانات | Data Privacy
- الامتثال للوائح حماية البيانات
- تشفير البيانات الحساسة
- سياسة خصوصية واضحة

## 📊 الأداء | Performance

### تحسين التحميل | Loading Optimization
- ضغط الصور والملفات
- تحميل JavaScript بشكل غير متزامن
- استخدام CDN للمكتبات

### مقاييس الأداء | Performance Metrics
```bash
# أدوات القياس
- Google PageSpeed Insights
- GTmetrix
- Lighthouse
```

## 🌍 الاستضافة | Hosting

### خيارات الاستضافة | Hosting Options
- **GitHub Pages** - مجاني للمشاريع المفتوحة
- **Netlify** - سهل الاستخدام مع CI/CD
- **Vercel** - مثالي لمشاريع JavaScript
- **AWS S3** - للمشاريع الكبيرة

### نشر الموقع | Deployment
```bash
# GitHub Pages
git push origin main

# Netlify
npm run build
netlify deploy --prod

# Vercel
vercel --prod
```

## 🤝 المساهمة | Contributing

### إرشادات المساهمة | Contribution Guidelines
1. Fork المشروع
2. أنشئ فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. اكتب الكود والتوثيق
4. اختبر التغييرات
5. أرسل Pull Request

### معايير الكود | Code Standards
- استخدم أسماء متغيرات وصفية بالعربية أو الإنجليزية
- اكتب تعليقات واضحة
- اتبع بنية المشروع الحالية
- اختبر على متصفحات متعددة

## 📝 الترخيص | License

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 التواصل | Contact

**المطور** | Developer: [اسمك]  
**البريد الإلكتروني** | Email: your.email@example.com  
**GitHub**: [@yourusername](https://github.com/yourusername)

## 🙏 شكر وتقدير | Acknowledgments

- Bootstrap Team لإطار العمل الرائع
- Font Awesome لمكتبة الأيقونات
- Google Fonts للخطوط العربية الجميلة
- المجتمع المفتوح للمساهمات والأفكار

---

**ملاحظة**: هذا مشروع تعليمي ونموذج أولي. في التطبيق الحقيقي، تأكد من الامتثال للوائح الطبية المحلية والحصول على التراخيص المطلوبة.

**Note**: This is an educational project and prototype. In real implementation, ensure compliance with local medical regulations and obtain required licenses.