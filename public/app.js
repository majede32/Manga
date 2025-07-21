// متغيرات عامة
let currentUser = null;
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// تحديث الوقت الحالي
function updateCurrentTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Africa/Tunis'
    };
    
    const timeString = now.toLocaleDateString('ar-TN', options);
    document.getElementById('currentTime').textContent = timeString;
}

// تشغيل تحديث الوقت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // تحديث كل دقيقة
    
    // إعداد معالجات الأحداث
    setupEventHandlers();
});

// إعداد معالجات الأحداث
function setupEventHandlers() {
    // تسجيل الدخول
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // التسجيل الجديد
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // تقديم الطلب
    document.getElementById('applicationForm').addEventListener('submit', handleApplicationSubmit);
    
    // تتبع الطلب
    document.getElementById('trackForm').addEventListener('submit', handleTrackApplication);
}

// إظهار القسم المحدد
function showSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إزالة الكلاس النشط من جميع أزرار التنقل
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار القسم المحدد
    document.getElementById(sectionId).classList.add('active');
    
    // إضافة الكلاس النشط للزر المناسب
    event.target.classList.add('active');
    
    // مسح الرسائل السابقة
    clearAlerts();
}

// مسح جميع رسائل التنبيه
function clearAlerts() {
    document.querySelectorAll('.alert').forEach(alert => {
        alert.style.display = 'none';
        alert.className = 'alert';
    });
}

// إظهار رسالة تنبيه
function showAlert(elementId, message, type = 'info') {
    const alertElement = document.getElementById(elementId);
    alertElement.textContent = message;
    alertElement.className = `alert ${type}`;
    alertElement.style.display = 'block';
    
    // إخفاء الرسالة تلقائياً بعد 5 ثوان
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}

// معالج تسجيل الدخول
async function handleLogin(event) {
    event.preventDefault();
    
    const idNumber = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!idNumber || !password) {
        showAlert('loginAlert', 'يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}/api/login`, {
            idNumber,
            password
        });
        
        if (response.data.message === 'تم تسجيل الدخول بنجاح') {
            currentUser = response.data.user;
            showAlert('loginAlert', 'تم تسجيل الدخول بنجاح!', 'success');
            
            // تحديث بيانات النموذج
            document.getElementById('appId').value = currentUser.idNumber;
            
            // التوجه إلى صفحة تقديم الطلب
            setTimeout(() => {
                showSection('apply');
            }, 1500);
        }
    } catch (error) {
        const message = error.response?.data?.message || 'خطأ في تسجيل الدخول';
        showAlert('loginAlert', message, 'error');
    }
}

// معالج التسجيل الجديد
async function handleRegister(event) {
    event.preventDefault();
    
    const idNumber = document.getElementById('regId').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    
    // التحقق من البيانات
    if (!idNumber || !email || !phone || !password) {
        showAlert('registerAlert', 'يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('registerAlert', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showAlert('registerAlert', 'البريد الإلكتروني غير صحيح', 'error');
        return;
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}/api/register`, {
            idNumber,
            email,
            phone,
            password
        });
        
        showAlert('registerAlert', 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول', 'success');
        
        // مسح النموذج
        document.getElementById('registerForm').reset();
        
        // التوجه إلى صفحة تسجيل الدخول
        setTimeout(() => {
            showSection('login');
        }, 2000);
        
    } catch (error) {
        const message = error.response?.data?.message || 'خطأ في إنشاء الحساب';
        showAlert('registerAlert', message, 'error');
    }
}

// التحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// معالج تقديم الطلب
async function handleApplicationSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('appName').value.trim();
    const idNumber = document.getElementById('appId').value.trim();
    const address = document.getElementById('appAddress').value.trim();
    
    // التحقق من الحقول النصية
    if (!name || !idNumber || !address) {
        showAlert('applicationAlert', 'يرجى ملء جميع الحقول النصية', 'error');
        return;
    }
    
    // التحقق من الملفات
    const fileFields = ['appIdCard', 'appDrivingLicense', 'appWorkCertificate', 'appFirstAid', 'appIncome'];
    const files = {};
    
    for (let fieldId of fileFields) {
        const fileInput = document.getElementById(fieldId);
        if (!fileInput.files || fileInput.files.length === 0) {
            showAlert('applicationAlert', `يرجى رفع جميع الوثائق المطلوبة`, 'error');
            return;
        }
        
        const file = fileInput.files[0];
        
        // التحقق من نوع الملف
        if (!validateFileType(file)) {
            showAlert('applicationAlert', `نوع الملف غير مدعوم. يُسمح فقط بملفات PDF، JPG، PNG`, 'error');
            return;
        }
        
        // التحقق من حجم الملف (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('applicationAlert', `حجم الملف ${file.name} كبير جداً. الحد الأقصى 5 ميجابايت`, 'error');
            return;
        }
        
        files[fieldId.replace('app', '').toLowerCase()] = file;
    }
    
    // إظهار شريط التقدم واللودر
    document.getElementById('uploadProgress').style.display = 'block';
    document.getElementById('submitLoader').style.display = 'block';
    
    try {
        // إنشاء FormData
        const formData = new FormData();
        formData.append('name', name);
        formData.append('idNumber', idNumber);
        formData.append('address', address);
        
        // إضافة الملفات
        formData.append('idCard', files.idcard);
        formData.append('drivingLicense', files.drivinglicense);
        formData.append('workCertificate', files.workcertificate);
        formData.append('firstAid', files.firstaid);
        formData.append('income', files.income);
        
        // إرسال الطلب مع تتبع التقدم
        const response = await axios.post(`${API_BASE_URL}/api/apply`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                document.getElementById('progressFill').style.width = `${progress}%`;
            }
        });
        
        // إخفاء اللودر وشريط التقدم
        document.getElementById('submitLoader').style.display = 'none';
        document.getElementById('uploadProgress').style.display = 'none';
        
        if (response.data.trackId) {
            showAlert('applicationAlert', 
                `تم تقديم الطلب بنجاح! رقم التتبع الخاص بك هو: ${response.data.trackId}`, 
                'success'
            );
            
            // مسح النموذج
            document.getElementById('applicationForm').reset();
            
            // حفظ رقم التتبع في التخزين المحلي
            localStorage.setItem('lastTrackId', response.data.trackId);
        }
        
    } catch (error) {
        // إخفاء اللودر وشريط التقدم
        document.getElementById('submitLoader').style.display = 'none';
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('progressFill').style.width = '0%';
        
        const message = error.response?.data?.message || 'خطأ في تقديم الطلب';
        showAlert('applicationAlert', message, 'error');
    }
}

// التحقق من نوع الملف
function validateFileType(file) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    return allowedTypes.includes(file.type);
}

// معالج تتبع الطلب
async function handleTrackApplication(event) {
    event.preventDefault();
    
    const trackId = document.getElementById('trackId').value.trim();
    
    if (!trackId) {
        showAlert('trackAlert', 'يرجى إدخال رقم التتبع', 'error');
        return;
    }
    
    try {
        const response = await axios.get(`${API_BASE_URL}/api/track/${trackId}`);
        
        if (response.data) {
            displayTrackingResult(response.data);
        }
        
    } catch (error) {
        const message = error.response?.data?.message || 'رقم التتبع غير صحيح';
        showAlert('trackAlert', message, 'error');
        document.getElementById('statusResult').innerHTML = '';
    }
}

// عرض نتيجة التتبع
function displayTrackingResult(data) {
    const statusElement = document.getElementById('statusResult');
    
    let statusClass = 'status-under-review';
    let statusIcon = 'fas fa-clock';
    
    if (data.status === 'مقبول' || data.status === 'موافق عليه') {
        statusClass = 'status-approved';
        statusIcon = 'fas fa-check-circle';
    } else if (data.status === 'مرفوض') {
        statusClass = 'status-rejected';
        statusIcon = 'fas fa-times-circle';
    }
    
    const submissionDate = new Date(data.submissionDate).toLocaleDateString('ar-TN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    statusElement.innerHTML = `
        <div class="status-card">
            <h3><i class="${statusIcon}"></i> معلومات الطلب</h3>
            <div style="margin: 20px 0;">
                <p><strong>رقم التتبع:</strong> ${data.trackId}</p>
                <p><strong>اسم المتقدم:</strong> ${data.applicantName}</p>
                <p><strong>تاريخ التقديم:</strong> ${submissionDate}</p>
                <p><strong>الحالة:</strong> <span class="status-badge ${statusClass}">${data.status}</span></p>
                ${data.notes ? `<p><strong>ملاحظات:</strong> ${data.notes}</p>` : ''}
            </div>
        </div>
    `;
    
    // مسح رسالة الخطأ إن وجدت
    document.getElementById('trackAlert').style.display = 'none';
}

// استرجاع رقم التتبع الأخير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const lastTrackId = localStorage.getItem('lastTrackId');
    if (lastTrackId) {
        document.getElementById('trackId').value = lastTrackId;
    }
});

// إضافة تأثيرات بصرية لرفع الملفات
document.addEventListener('DOMContentLoaded', function() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const fileArea = this.parentNode;
            const fileName = this.files[0]?.name;
            
            if (fileName) {
                const p = fileArea.querySelector('p');
                p.innerHTML = `<i class="fas fa-check-circle" style="color: #27ae60;"></i> تم اختيار: ${fileName}`;
                fileArea.style.borderColor = '#27ae60';
                fileArea.style.background = '#d4edda';
            }
        });
    });
});

// إضافة تأثير عند التمرير
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// معالجة الأخطاء العامة
window.addEventListener('error', function(event) {
    console.error('خطأ في التطبيق:', event.error);
});

// التحقق من حالة الاتصال
window.addEventListener('online', function() {
    showAlert('applicationAlert', 'تم استعادة الاتصال بالإنترنت', 'success');
});

window.addEventListener('offline', function() {
    showAlert('applicationAlert', 'انقطع الاتصال بالإنترنت. يرجى التحقق من اتصالك', 'error');
});