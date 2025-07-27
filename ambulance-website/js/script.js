// إسعافك - ملف JavaScript الرئيسي

// تشغيل الكود عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// تهيئة الموقع
function initializeWebsite() {
    // تفعيل العدادات المتحركة
    animateCounters();
    
    // تفعيل زر العودة للأعلى
    setupBackToTop();
    
    // تفعيل نماذج التحقق
    setupFormValidation();
    
    // تفعيل التأثيرات المتحركة
    setupAnimations();
    
    // تفعيل النقر السلس
    setupSmoothScrolling();
    
    console.log('تم تحميل موقع إسعافك بنجاح');
}

// العدادات المتحركة
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    if (counters.length === 0) return;
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// تحريك عداد واحد
function animateCounter(counter) {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000; // مدة الحركة بالمللي ثانية
    const increment = target / (duration / 16); // 60 FPS
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        counter.textContent = Math.floor(current);
    }, 16);
}

// زر العودة للأعلى
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) return;
    
    // إظهار/إخفاء الزر حسب التمرير
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
            backToTopBtn.style.opacity = '1';
        } else {
            backToTopBtn.style.opacity = '0';
            setTimeout(() => {
                if (window.pageYOffset <= 300) {
                    backToTopBtn.style.display = 'none';
                }
            }, 300);
        }
    });
    
    // النقر للعودة للأعلى
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// تفعيل التحقق من النماذج
function setupFormValidation() {
    // نموذج الحجز
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        setupBookingForm(bookingForm);
    }
    
    // نموذج التواصل
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        setupContactForm(contactForm);
    }
    
    // تفعيل Bootstrap validation
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

// إعداد نموذج الحجز
function setupBookingForm(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // جمع بيانات النموذج
        const formData = {
            patientName: document.getElementById('patientName').value,
            patientAge: document.getElementById('patientAge').value,
            patientGender: document.getElementById('patientGender').value,
            contactNumber: document.getElementById('contactNumber').value,
            pickupLocation: document.getElementById('pickupLocation').value,
            destination: document.getElementById('destination').value,
            serviceType: document.getElementById('serviceType').value,
            preferredDate: document.getElementById('preferredDate').value,
            medicalCondition: document.getElementById('medicalCondition').value,
            mobilityAid: document.getElementById('mobilityAid').value,
            medicalEquipment: document.getElementById('medicalEquipment').value,
            companions: document.getElementById('companions').value,
            insurance: document.getElementById('insurance').value,
            specialRequests: document.getElementById('specialRequests').value
        };
        
        // محاكاة إرسال البيانات
        submitBookingData(formData);
    });
}

// إعداد نموذج التواصل
function setupContactForm(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // جمع بيانات النموذج
        const formData = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            inquiryType: document.getElementById('inquiryType').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // محاكاة إرسال البيانات
        submitContactData(formData);
    });
}

// إرسال بيانات الحجز
function submitBookingData(data) {
    showLoadingState('إرسال طلب الحجز...');
    
    // محاكاة طلب AJAX
    setTimeout(() => {
        hideLoadingState();
        
        // عرض رسالة نجاح
        showSuccessMessage('تم إرسال طلب الحجز بنجاح!', 
            'سنتواصل معك خلال 15 دقيقة لتأكيد الحجز والتفاصيل.');
        
        // إعادة تعيين النموذج
        document.getElementById('bookingForm').reset();
        document.getElementById('bookingForm').classList.remove('was-validated');
        
        // إرسال البيانات إلى الخادم (في التطبيق الحقيقي)
        console.log('بيانات الحجز:', data);
        
        // يمكن هنا إضافة طلب fetch حقيقي للخادم
        // fetch('/api/booking', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // })
        
    }, 2000);
}

// إرسال بيانات التواصل
function submitContactData(data) {
    showLoadingState('إرسال الرسالة...');
    
    setTimeout(() => {
        hideLoadingState();
        
        showSuccessMessage('تم إرسال رسالتك بنجاح!', 
            'سنرد عليك خلال 24 ساعة.');
        
        document.getElementById('contactForm').reset();
        document.getElementById('contactForm').classList.remove('was-validated');
        
        console.log('بيانات التواصل:', data);
        
    }, 1500);
}

// عرض حالة التحميل
function showLoadingState(message) {
    // إنشاء overlay للتحميل
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9999';
    
    overlay.innerHTML = `
        <div class="bg-white p-4 rounded shadow text-center">
            <div class="spinner mb-3"></div>
            <p class="mb-0">${message}</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// إخفاء حالة التحميل
function hideLoadingState() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// عرض رسالة نجاح
function showSuccessMessage(title, message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x';
    alert.style.zIndex = '10000';
    alert.style.marginTop = '20px';
    alert.style.minWidth = '300px';
    
    alert.innerHTML = `
        <h5 class="alert-heading">${title}</h5>
        <p class="mb-0">${message}</p>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // إزالة التنبيه تلقائياً بعد 5 ثوان
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// تفعيل التأثيرات المتحركة
function setupAnimations() {
    // تحريك العناصر عند الدخول للعرض
    const animatedElements = document.querySelectorAll('.service-card, .testimonial-card, .team-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease-out';
        observer.observe(element);
    });
}

// النقر السلس للروابط
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// تبديل اللغة
function toggleLanguage() {
    // محاكاة تبديل اللغة
    const currentLang = document.documentElement.lang;
    
    if (currentLang === 'ar') {
        // تحويل للإنجليزية
        alert('English version is not implemented yet. / النسخة الإنجليزية غير متوفرة حالياً.');
    } else {
        // تحويل للعربية
        window.location.reload();
    }
}

// فتح خرائط جوجل
function openGoogleMaps() {
    const address = 'الرياض، المملكة العربية السعودية';
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    window.open(url, '_blank');
}

// تهيئة خريطة تفاعلية (إذا كان Google Maps API متوفر)
function initializeMap() {
    // هذه الدالة تحتاج إلى Google Maps API
    // يمكن إضافتها لاحقاً عند الحصول على مفتاح API
    
    if (typeof google !== 'undefined' && google.maps) {
        const mapElement = document.getElementById('map');
        
        if (mapElement) {
            const riyadhLocation = { lat: 24.7136, lng: 46.6753 };
            
            const map = new google.maps.Map(mapElement, {
                zoom: 12,
                center: riyadhLocation,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }]
                    }
                ]
            });
            
            // إضافة علامة للموقع
            new google.maps.Marker({
                position: riyadhLocation,
                map: map,
                title: 'إسعافك - خدمات النقل الطبي',
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc3545" width="32" height="32">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                            <circle cx="12" cy="9" r="2.5" fill="white"/>
                        </svg>
                    `)
                }
            });
        }
    }
}

// تحديث الوقت الحالي (للساعة في التذييل)
function updateCurrentTime() {
    const timeElements = document.querySelectorAll('.current-time');
    
    if (timeElements.length > 0) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        timeElements.forEach(element => {
            element.textContent = timeString;
        });
    }
}

// تشغيل تحديث الوقت كل دقيقة
setInterval(updateCurrentTime, 60000);

// معالجة الأخطاء
window.addEventListener('error', function(e) {
    console.error('خطأ في الموقع:', e.error);
    
    // يمكن إضافة تتبع الأخطاء هنا
    // مثل إرسال الخطأ إلى خدمة تتبع الأخطاء
});

// تحسين الأداء - تأجيل تحميل الصور
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// تفعيل تحميل الصور المؤجل
document.addEventListener('DOMContentLoaded', setupLazyLoading);

// تحسين تجربة النماذج
function enhanceFormExperience() {
    // إضافة تأثيرات بصرية للحقول
    const inputs = document.querySelectorAll('.form-control, .form-select');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (this.value) {
                this.parentElement.classList.add('filled');
            } else {
                this.parentElement.classList.remove('filled');
            }
        });
    });
}

// تفعيل تحسينات النماذج
document.addEventListener('DOMContentLoaded', enhanceFormExperience);

// إضافة وظائف إمكانية الوصول
function setupAccessibility() {
    // إضافة تنقل بلوحة المفاتيح
    document.addEventListener('keydown', function(e) {
        // العودة للأعلى بالضغط على Home
        if (e.key === 'Home' && e.ctrlKey) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // الانتقال للمحتوى الرئيسي بالضغط على Tab + Enter
        if (e.key === 'Enter' && e.target.classList.contains('skip-link')) {
            e.preventDefault();
            const mainContent = document.querySelector('main') || document.querySelector('.hero');
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
    
    // إضافة رابط تخطي للمحتوى الرئيسي
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link sr-only';
    skipLink.textContent = 'تخطي إلى المحتوى الرئيسي';
    skipLink.addEventListener('focus', () => skipLink.classList.remove('sr-only'));
    skipLink.addEventListener('blur', () => skipLink.classList.add('sr-only'));
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// تفعيل إمكانية الوصول
document.addEventListener('DOMContentLoaded', setupAccessibility);

// تصدير الدوال للاستخدام العام
window.esafakFunctions = {
    toggleLanguage,
    openGoogleMaps,
    initializeMap,
    showSuccessMessage,
    showLoadingState,
    hideLoadingState
};

console.log('تم تحميل جميع وظائف موقع إسعافك بنجاح ✅');