// دوال مساعدة لتحسين تجربة المستخدم

// فئة لإدارة حالة التطبيق
class AppState {
    constructor() {
        this.currentUser = null;
        this.lastTrackId = localStorage.getItem('lastTrackId');
        this.theme = localStorage.getItem('theme') || 'light';
        this.language = localStorage.getItem('language') || 'ar';
    }

    setUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    getUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('currentUser');
            this.currentUser = stored ? JSON.parse(stored) : null;
        }
        return this.currentUser;
    }

    setTrackId(trackId) {
        this.lastTrackId = trackId;
        localStorage.setItem('lastTrackId', trackId);
    }

    getTrackId() {
        return this.lastTrackId;
    }

    clearUser() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }
}

// مثيل واحد لحالة التطبيق
const appState = new AppState();

// فئة للتحقق من صحة البيانات
class Validator {
    static isValidIdNumber(idNumber) {
        // التحقق من رقم بطاقة التعريف التونسية (8 أرقام)
        return /^\d{8}$/.test(idNumber);
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPhoneNumber(phone) {
        // التحقق من رقم الهاتف التونسي
        const phoneRegex = /^(\+216|00216|216)?[2-9]\d{7}$/;
        return phoneRegex.test(phone.replace(/\s|-/g, ''));
    }

    static isValidPassword(password) {
        // كلمة المرور يجب أن تكون 6 أحرف على الأقل
        return password.length >= 6;
    }

    static isValidFileType(file) {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        return allowedTypes.includes(file.type);
    }

    static isValidFileSize(file, maxSizeMB = 5) {
        const maxSize = maxSizeMB * 1024 * 1024;
        return file.size <= maxSize;
    }
}

// فئة لمعالجة الملفات
class FileHandler {
    static async convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 بايت';
        
        const k = 1024;
        const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static getFileIcon(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const icons = {
            pdf: 'fas fa-file-pdf',
            jpg: 'fas fa-file-image',
            jpeg: 'fas fa-file-image',
            png: 'fas fa-file-image',
            doc: 'fas fa-file-word',
            docx: 'fas fa-file-word',
            default: 'fas fa-file'
        };
        return icons[extension] || icons.default;
    }
}

// فئة لمعالجة التواريخ
class DateFormatter {
    static formatArabicDate(date) {
        const arabicDate = new Date(date);
        return arabicDate.toLocaleDateString('ar-TN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }

    static formatArabicDateTime(date) {
        const arabicDate = new Date(date);
        return arabicDate.toLocaleDateString('ar-TN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static getRelativeTime(date) {
        const now = new Date();
        const targetDate = new Date(date);
        const diffInMs = now - targetDate;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) return 'الآن';
        if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
        if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
        if (diffInDays < 30) return `منذ ${diffInDays} يوم`;
        
        return DateFormatter.formatArabicDate(date);
    }
}

// فئة لمعالجة واجهة المستخدم
class UIHelpers {
    static showLoader(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loader"></div>';
            element.style.display = 'block';
        }
    }

    static hideLoader(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }

    static disableButton(buttonId, loadingText = 'جارٍ المعالجة...') {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
        }
    }

    static enableButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || button.textContent;
        }
    }

    static highlightElement(elementId, duration = 2000) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.background = '#fff3cd';
            element.style.transition = 'background 0.3s ease';
            
            setTimeout(() => {
                element.style.background = '';
            }, duration);
        }
    }

    static scrollToElement(elementId, offset = 100) {
        const element = document.getElementById(elementId);
        if (element) {
            const targetPosition = element.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// فئة لإدارة التخزين المحلي
class StorageManager {
    static save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            return false;
        }
    }

    static load(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('خطأ في حذف البيانات:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
            return false;
        }
    }
}

// فئة للتعامل مع الشبكة والاتصال
class NetworkManager {
    static async checkConnection() {
        try {
            const response = await fetch('/api/health', { 
                method: 'HEAD',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    static isOnline() {
        return navigator.onLine;
    }

    static onConnectionChange(callback) {
        window.addEventListener('online', () => callback(true));
        window.addEventListener('offline', () => callback(false));
    }
}

// فئة لمعالجة الأخطاء
class ErrorHandler {
    static handle(error, context = 'عام') {
        console.error(`خطأ في ${context}:`, error);
        
        // تحديد نوع الخطأ
        if (error.code === 'NETWORK_ERROR') {
            notifications.showError('خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت');
        } else if (error.code === 'VALIDATION_ERROR') {
            notifications.showWarning(error.message || 'بيانات غير صحيحة');
        } else if (error.code === 'AUTH_ERROR') {
            notifications.showError('خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى');
            appState.clearUser();
        } else {
            notifications.showError(error.message || 'حدث خطأ غير متوقع');
        }
    }

    static createError(code, message) {
        const error = new Error(message);
        error.code = code;
        return error;
    }
}

// فئة للتحليلات البسيطة
class Analytics {
    static track(event, data = {}) {
        const analyticsData = {
            event,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...data
        };
        
        // حفظ في التخزين المحلي لأغراض التحليل
        const analytics = StorageManager.load('analytics', []);
        analytics.push(analyticsData);
        
        // الاحتفاظ بآخر 100 حدث فقط
        if (analytics.length > 100) {
            analytics.splice(0, analytics.length - 100);
        }
        
        StorageManager.save('analytics', analytics);
        
        console.log('تتبع الحدث:', event, data);
    }

    static getAnalytics() {
        return StorageManager.load('analytics', []);
    }

    static clearAnalytics() {
        StorageManager.remove('analytics');
    }
}

// تصدير الفئات للاستخدام العام
window.AppState = AppState;
window.Validator = Validator;
window.FileHandler = FileHandler;
window.DateFormatter = DateFormatter;
window.UIHelpers = UIHelpers;
window.StorageManager = StorageManager;
window.NetworkManager = NetworkManager;
window.ErrorHandler = ErrorHandler;
window.Analytics = Analytics;
window.appState = appState;