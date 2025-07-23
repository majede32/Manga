// المتغيرات العامة
let currentLanguage = 'ar';

// تشغيل السكريبت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// تهيئة الموقع
function initializeWebsite() {
    setupBackToTopButton();
    setupFormValidation();
    setupAnimations();
    setupDateTimeConstraints();
    setupServiceTypeHandler();
    updateMinDateTime();
}

// إعداد زر العودة للأعلى
function setupBackToTopButton() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        // إظهار/إخفاء الزر حسب موقع التمرير
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'block';
                backToTopButton.classList.add('fade-in');
            } else {
                backToTopButton.style.display = 'none';
                backToTopButton.classList.remove('fade-in');
            }
        });

        // العودة للأعلى عند النقر
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// إعداد التحقق من صحة النماذج
function setupFormValidation() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            if (validateBookingForm()) {
                submitBookingForm();
            }
            
            bookingForm.classList.add('was-validated');
        });
    }
}

// التحقق من صحة نموذج الحجز
function validateBookingForm() {
    let isValid = true;
    const requiredFields = [
        'patientName',
        'patientAge',
        'patientGender',
        'contactName',
        'contactPhone',
        'pickupLocation',
        'destination',
        'pickupDate',
        'pickupTime',
        'serviceType',
        'medicalCondition',
        'termsAgreement'
    ];

    // التحقق من الحقول المطلوبة
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'checkbox') {
                if (!field.checked) {
                    showFieldError(field, 'هذا الحقل مطلوب');
                    isValid = false;
                }
            } else if (!field.value.trim()) {
                showFieldError(field, 'هذا الحقل مطلوب');
                isValid = false;
            } else {
                clearFieldError(field);
            }
        }
    });

    // التحقق من صحة العمر
    const ageField = document.getElementById('patientAge');
    if (ageField && ageField.value) {
        const age = parseInt(ageField.value);
        if (age < 1 || age > 120) {
            showFieldError(ageField, 'يرجى إدخال عمر صحيح (1-120)');
            isValid = false;
        }
    }

    // التحقق من صحة رقم الهاتف
    const phoneField = document.getElementById('contactPhone');
    if (phoneField && phoneField.value) {
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phoneField.value.replace(/\s/g, ''))) {
            showFieldError(phoneField, 'يرجى إدخال رقم هاتف صحيح');
            isValid = false;
        }
    }

    // التحقق من صحة البريد الإلكتروني
    const emailField = document.getElementById('contactEmail');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            showFieldError(emailField, 'يرجى إدخال بريد إلكتروني صحيح');
            isValid = false;
        }
    }

    // التحقق من التاريخ والوقت
    if (!validateDateTime()) {
        isValid = false;
    }

    return isValid;
}

// التحقق من صحة التاريخ والوقت
function validateDateTime() {
    const dateField = document.getElementById('pickupDate');
    const timeField = document.getElementById('pickupTime');
    
    if (!dateField || !timeField) return true;
    
    const selectedDate = new Date(dateField.value + 'T' + timeField.value);
    const now = new Date();
    
    // التحقق من أن الموعد في المستقبل
    if (selectedDate <= now) {
        showFieldError(dateField, 'يجب أن يكون الموعد في المستقبل');
        return false;
    }
    
    // التحقق من أن الموعد خلال السنة القادمة
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (selectedDate > oneYearFromNow) {
        showFieldError(dateField, 'لا يمكن حجز موعد أكثر من سنة مقدماً');
        return false;
    }
    
    clearFieldError(dateField);
    clearFieldError(timeField);
    return true;
}

// إظهار خطأ في الحقل
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    // البحث عن رسالة الخطأ الموجودة أو إنشاء واحدة جديدة
    let errorDiv = field.parentElement.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.textContent = message;
    }
}

// إزالة خطأ من الحقل
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
}

// إرسال نموذج الحجز
function submitBookingForm() {
    // جمع بيانات النموذج
    const formData = collectFormData();
    
    // إظهار مؤشر التحميل
    showLoadingIndicator();
    
    // محاكاة إرسال البيانات
    setTimeout(() => {
        hideLoadingIndicator();
        showSuccessMessage();
        
        // إرسال البيانات للخادم (يمكن تخصيصه لاحقاً)
        sendDataToServer(formData);
        
        // إعادة تعيين النموذج
        resetForm();
    }, 2000);
}

// جمع بيانات النموذج
function collectFormData() {
    const formData = {
        // معلومات المريض
        patientInfo: {
            name: document.getElementById('patientName')?.value || '',
            age: document.getElementById('patientAge')?.value || '',
            gender: document.getElementById('patientGender')?.value || '',
            weight: document.getElementById('patientWeight')?.value || ''
        },
        
        // معلومات التواصل
        contactInfo: {
            name: document.getElementById('contactName')?.value || '',
            phone: document.getElementById('contactPhone')?.value || '',
            email: document.getElementById('contactEmail')?.value || ''
        },
        
        // تفاصيل الرحلة
        tripDetails: {
            pickupLocation: document.getElementById('pickupLocation')?.value || '',
            destination: document.getElementById('destination')?.value || '',
            pickupDate: document.getElementById('pickupDate')?.value || '',
            pickupTime: document.getElementById('pickupTime')?.value || ''
        },
        
        // نوع الخدمة
        serviceInfo: {
            type: document.getElementById('serviceType')?.value || '',
            equipment: document.getElementById('equipmentNeeded')?.value || ''
        },
        
        // المعلومات الطبية
        medicalInfo: {
            condition: document.getElementById('medicalCondition')?.value || '',
            medications: document.getElementById('medications')?.value || '',
            allergies: document.getElementById('allergies')?.value || '',
            isConscious: document.getElementById('consciousPatient')?.checked || false
        },
        
        // التفاصيل الإضافية
        additionalInfo: {
            specialRequests: document.getElementById('specialRequests')?.value || '',
            returnTrip: document.getElementById('returnTrip')?.checked || false,
            familyAccompany: document.getElementById('familyAccompany')?.checked || false
        },
        
        // معلومات النظام
        systemInfo: {
            timestamp: new Date().toISOString(),
            language: currentLanguage,
            userAgent: navigator.userAgent
        }
    };
    
    return formData;
}

// إرسال البيانات للخادم
function sendDataToServer(formData) {
    // يمكن استبدال هذا بـ API حقيقي
    console.log('بيانات الحجز:', formData);
    
    // مثال على إرسال البيانات باستخدام Fetch API
    /*
    fetch('/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('تم إرسال الحجز بنجاح:', data);
    })
    .catch(error => {
        console.error('خطأ في الإرسال:', error);
        showErrorMessage('حدث خطأ أثناء إرسال الحجز. يرجى المحاولة مرة أخرى.');
    });
    */
}

// إظهار مؤشر التحميل
function showLoadingIndicator() {
    const submitButton = document.querySelector('#bookingForm button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جارٍ الإرسال...';
    }
}

// إخفاء مؤشر التحميل
function hideLoadingIndicator() {
    const submitButton = document.querySelector('#bookingForm button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane me-2"></i>إرسال طلب الحجز';
    }
}

// إظهار رسالة نجاح
function showSuccessMessage() {
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i>
            <strong>تم إرسال طلب الحجز بنجاح!</strong>
            سنتواصل معك خلال 15 دقيقة لتأكيد التفاصيل.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    showAlert(alertHtml);
}

// إظهار رسالة خطأ
function showErrorMessage(message) {
    const alertHtml = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>خطأ!</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    showAlert(alertHtml);
}

// إظهار التنبيه
function showAlert(alertHtml) {
    const alertContainer = document.querySelector('.booking-section .container');
    if (alertContainer) {
        const alertDiv = document.createElement('div');
        alertDiv.innerHTML = alertHtml;
        alertContainer.insertBefore(alertDiv.firstElementChild, alertContainer.firstElementChild);
        
        // التمرير للأعلى لإظهار الرسالة
        window.scrollTo({
            top: alertContainer.offsetTop - 100,
            behavior: 'smooth'
        });
    }
}

// إعادة تعيين النموذج
function resetForm() {
    const form = document.getElementById('bookingForm');
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
        
        // إزالة فئات التحقق
        const fields = form.querySelectorAll('.form-control, .form-select');
        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
    }
}

// إعداد قيود التاريخ والوقت
function setupDateTimeConstraints() {
    updateMinDateTime();
    
    // تحديث القيود عند تغيير التاريخ
    const dateField = document.getElementById('pickupDate');
    if (dateField) {
        dateField.addEventListener('change', updateMinTime);
    }
}

// تحديث أدنى تاريخ ووقت
function updateMinDateTime() {
    const dateField = document.getElementById('pickupDate');
    const timeField = document.getElementById('pickupTime');
    
    if (dateField) {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        dateField.min = todayString;
        
        // تعيين حد أقصى لسنة واحدة
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        dateField.max = maxDate.toISOString().split('T')[0];
    }
    
    updateMinTime();
}

// تحديث أدنى وقت
function updateMinTime() {
    const dateField = document.getElementById('pickupDate');
    const timeField = document.getElementById('pickupTime');
    
    if (dateField && timeField && dateField.value) {
        const selectedDate = new Date(dateField.value);
        const today = new Date();
        
        // إذا كان التاريخ المحدد هو اليوم، تعيين الوقت الحالي كحد أدنى
        if (selectedDate.toDateString() === today.toDateString()) {
            const currentTime = today.toTimeString().slice(0, 5);
            timeField.min = currentTime;
        } else {
            timeField.removeAttribute('min');
        }
    }
}

// التعامل مع تغيير نوع الخدمة
function setupServiceTypeHandler() {
    const serviceTypeField = document.getElementById('serviceType');
    if (serviceTypeField) {
        serviceTypeField.addEventListener('change', updateServiceDetails);
    }
}

// تحديث تفاصيل الخدمة
function updateServiceDetails() {
    const serviceType = document.getElementById('serviceType')?.value;
    const equipmentField = document.getElementById('equipmentNeeded');
    
    if (!serviceType || !equipmentField) return;
    
    // تحديث خيارات المعدات حسب نوع الخدمة
    const equipmentOptions = getEquipmentOptions(serviceType);
    updateEquipmentOptions(equipmentField, equipmentOptions);
    
    // إظهار معلومات إضافية حسب نوع الخدمة
    showServiceInfo(serviceType);
}

// الحصول على خيارات المعدات حسب نوع الخدمة
function getEquipmentOptions(serviceType) {
    const options = {
        emergency: [
            { value: '', text: 'سيتم تحديد المعدات حسب الحالة' },
            { value: 'cardiac', text: 'مراقب قلبي' },
            { value: 'ventilator', text: 'جهاز تنفس صناعي' },
            { value: 'defibrillator', text: 'مزيل الرجفان' }
        ],
        'non-emergency': [
            { value: '', text: 'لا توجد معدات خاصة' },
            { value: 'wheelchair', text: 'كرسي متحرك' },
            { value: 'stretcher', text: 'نقالة طبية' },
            { value: 'oxygen', text: 'أكسجين' }
        ],
        air: [
            { value: '', text: 'معدات الطيران الطبي الكاملة' },
            { value: 'icu', text: 'وحدة عناية مركزة جوية' },
            { value: 'neonatal', text: 'حاضنة أطفال' }
        ],
        icu: [
            { value: 'icu-complete', text: 'معدات العناية المركزة الكاملة' },
            { value: 'ventilator', text: 'جهاز تنفس صناعي' },
            { value: 'cardiac', text: 'مراقب قلبي متقدم' }
        ]
    };
    
    return options[serviceType] || options['non-emergency'];
}

// تحديث خيارات المعدات
function updateEquipmentOptions(selectField, options) {
    selectField.innerHTML = '';
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        selectField.appendChild(optionElement);
    });
}

// إظهار معلومات الخدمة
function showServiceInfo(serviceType) {
    const serviceInfo = {
        emergency: {
            title: 'نقل طارئ',
            description: 'استجابة سريعة خلال 5-10 دقائق مع فريق طبي متخصص',
            icon: 'fas fa-ambulance text-danger'
        },
        'non-emergency': {
            title: 'نقل غير طارئ',
            description: 'نقل مريح ومناسب للمواعيد الطبية',
            icon: 'fas fa-user-injured text-primary'
        },
        air: {
            title: 'نقل جوي',
            description: 'نقل سريع بين المدن مع رعاية طبية كاملة',
            icon: 'fas fa-helicopter text-info'
        },
        icu: {
            title: 'وحدة العناية المركزة',
            description: 'نقل للحالات الحرجة مع معدات العناية المركزة',
            icon: 'fas fa-heartbeat text-warning'
        }
    };
    
    const info = serviceInfo[serviceType];
    if (info) {
        // يمكن إضافة عرض للمعلومات في مكان مخصص
        console.log(`تم اختيار: ${info.title} - ${info.description}`);
    }
}

// تبديل اللغة
function toggleLanguage() {
    currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    
    // هنا يمكن إضافة المنطق لتغيير النصوص
    // مثال بسيط:
    if (currentLanguage === 'en') {
        document.documentElement.lang = 'en';
        document.documentElement.dir = 'ltr';
        // تغيير النصوص للإنجليزية
        updateLanguageTexts('en');
    } else {
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
        // تغيير النصوص للعربية
        updateLanguageTexts('ar');
    }
    
    // تحديث زر اللغة
    const langButton = document.querySelector('button[onclick="toggleLanguage()"]');
    if (langButton) {
        langButton.textContent = currentLanguage === 'ar' ? 'EN' : 'ع';
    }
}

// تحديث نصوص اللغة
function updateLanguageTexts(language) {
    // يمكن إضافة ترجمات هنا
    // مثال بسيط لتغيير عنوان الصفحة
    const translations = {
        ar: {
            title: 'خدمات نقل المرضى والإسعاف - إسعافك'
        },
        en: {
            title: 'Patient Transport & Ambulance Services - Esafak'
        }
    };
    
    document.title = translations[language].title;
}

// إعداد الرسوم المتحركة
function setupAnimations() {
    // مراقب التقاطع للرسوم المتحركة
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // إضافة الرسوم المتحركة للعناصر
    const animatedElements = document.querySelectorAll('.service-card, .stat-item, .feature-item');
    animatedElements.forEach(element => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
}

// دالة مساعدة لتحويل البيانات إلى JSON
function objectToJson(obj) {
    return JSON.stringify(obj, null, 2);
}

// دالة مساعدة لحفظ البيانات محلياً
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ البيانات محلياً:', error);
        return false;
    }
}

// دالة مساعدة لاستخراج البيانات محلياً
function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('خطأ في استخراج البيانات محلياً:', error);
        return null;
    }
}

// تطبيق التدوير التلقائي للشهادات (إذا كانت موجودة)
function setupTestimonialCarousel() {
    const carousel = document.querySelector('#testimonialCarousel');
    if (carousel) {
        const bsCarousel = new bootstrap.Carousel(carousel, {
            interval: 5000,
            wrap: true
        });
    }
}

// إضافة مستمع للأحداث لتحديث الرقم التسلسلي
let bookingCounter = getFromLocalStorage('bookingCounter') || 1;

function generateBookingReference() {
    const prefix = 'ESF';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const counter = String(bookingCounter++).padStart(4, '0');
    
    const reference = `${prefix}${year}${month}${counter}`;
    saveToLocalStorage('bookingCounter', bookingCounter);
    
    return reference;
}

// دالة لطباعة تفاصيل الحجز
function printBookingDetails(formData) {
    const reference = generateBookingReference();
    const printWindow = window.open('', '_blank');
    
    const printContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>تفاصيل الحجز - ${reference}</title>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; }
                .header { text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 20px; }
                .section { margin: 20px 0; }
                .label { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>إسعافك - خدمات النقل الطبي</h1>
                <h2>رقم الحجز: ${reference}</h2>
            </div>
            <!-- تفاصيل الحجز ستضاف هنا -->
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// معالجة الأخطاء العامة
window.addEventListener('error', function(event) {
    console.error('خطأ في JavaScript:', event.error);
    // يمكن إضافة تقرير الأخطاء هنا
});

// معالجة الوعود المرفوضة
window.addEventListener('unhandledrejection', function(event) {
    console.error('وعد مرفوض:', event.reason);
    event.preventDefault();
});