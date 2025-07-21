// نظام الإشعارات للمنصة
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }

    init() {
        // إنشاء حاوية الإشعارات
        this.container = document.createElement('div');
        this.container.id = 'notifications-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);

        // تحميل الإشعارات المحفوظة
        this.loadSavedNotifications();
    }

    // إظهار إشعار
    show(message, type = 'info', duration = 5000, persistent = false) {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date(),
            persistent
        };

        // إضافة الإشعار للقائمة
        this.notifications.push(notification);

        // إنشاء عنصر الإشعار
        const element = this.createElement(notification);
        this.container.appendChild(element);

        // حفظ الإشعار إذا كان مستمراً
        if (persistent) {
            this.saveNotification(notification);
        }

        // إخفاء الإشعار تلقائياً إذا لم يكن مستمراً
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.hide(notification.id);
            }, duration);
        }

        return notification.id;
    }

    // إخفاء إشعار محدد
    hide(notificationId) {
        const element = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (element) {
            element.style.transform = 'translateX(-120%)';
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }

        // إزالة من القائمة
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        
        // إزالة من التخزين المحلي
        this.removeStoredNotification(notificationId);
    }

    // إنشاء عنصر الإشعار
    createElement(notification) {
        const element = document.createElement('div');
        element.setAttribute('data-notification-id', notification.id);
        element.style.cssText = `
            background: ${this.getBackgroundColor(notification.type)};
            color: white;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transform: translateX(-120%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            cursor: pointer;
            min-width: 300px;
            max-width: 400px;
            font-family: 'Tajawal', Arial, sans-serif;
            font-weight: 500;
            position: relative;
            direction: rtl;
        `;

        // إضافة أيقونة حسب النوع
        const icon = this.getIcon(notification.type);
        const timeString = this.formatTime(notification.timestamp);

        element.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="${icon}" style="font-size: 1.2rem;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 5px;">${notification.message}</div>
                    <div style="font-size: 0.8rem; opacity: 0.9;">${timeString}</div>
                </div>
                <button onclick="notifications.hide(${notification.id})" style="
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 5px;
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // إظهار الإشعار مع تأثير الانزلاق
        setTimeout(() => {
            element.style.transform = 'translateX(0)';
        }, 50);

        // إضافة معالج النقر لإخفاء الإشعار
        element.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I') {
                this.hide(notification.id);
            }
        });

        return element;
    }

    // الحصول على لون الخلفية حسب النوع
    getBackgroundColor(type) {
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        return colors[type] || colors.info;
    }

    // الحصول على الأيقونة حسب النوع
    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // تنسيق الوقت
    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `منذ ${hours} ساعة`;
        
        const days = Math.floor(hours / 24);
        return `منذ ${days} يوم`;
    }

    // حفظ الإشعار في التخزين المحلي
    saveNotification(notification) {
        const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
        stored.push({
            ...notification,
            timestamp: notification.timestamp.toISOString()
        });
        localStorage.setItem('notifications', JSON.stringify(stored));
    }

    // إزالة إشعار من التخزين المحلي
    removeStoredNotification(notificationId) {
        const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
        const filtered = stored.filter(n => n.id !== notificationId);
        localStorage.setItem('notifications', JSON.stringify(filtered));
    }

    // تحميل الإشعارات المحفوظة
    loadSavedNotifications() {
        const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // تصفية الإشعارات القديمة (أكثر من يوم)
        const recentNotifications = stored.filter(n => 
            new Date(n.timestamp) > oneDayAgo
        );
        
        // عرض الإشعارات المحفوظة
        recentNotifications.forEach(n => {
            n.timestamp = new Date(n.timestamp);
            this.notifications.push(n);
            const element = this.createElement(n);
            this.container.appendChild(element);
        });
        
        // تحديث التخزين المحلي
        localStorage.setItem('notifications', JSON.stringify(
            recentNotifications.map(n => ({
                ...n,
                timestamp: n.timestamp.toISOString()
            }))
        ));
    }

    // مسح جميع الإشعارات
    clear() {
        this.notifications.forEach(n => this.hide(n.id));
        localStorage.removeItem('notifications');
    }

    // إشعارات خاصة بالمنصة
    showSuccess(message, persistent = false) {
        return this.show(message, 'success', 5000, persistent);
    }

    showError(message, persistent = true) {
        return this.show(message, 'error', 8000, persistent);
    }

    showWarning(message, persistent = false) {
        return this.show(message, 'warning', 6000, persistent);
    }

    showInfo(message, persistent = false) {
        return this.show(message, 'info', 5000, persistent);
    }

    // إشعارات خاصة بالعمليات
    showApplicationSubmitted(trackId) {
        return this.showSuccess(
            `تم تقديم طلبك بنجاح! رقم التتبع: ${trackId}`,
            true
        );
    }

    showApplicationStatusChanged(trackId, status) {
        const message = `تم تحديث حالة طلبك ${trackId} إلى: ${status}`;
        if (status === 'مقبول') {
            return this.showSuccess(message, true);
        } else if (status === 'مرفوض') {
            return this.showError(message, true);
        } else {
            return this.showInfo(message, true);
        }
    }

    showWelcome(userName) {
        return this.showInfo(`مرحباً ${userName}! يمكنك الآن تقديم طلب الترخيص`);
    }

    showSystemMaintenance() {
        return this.showWarning('النظام تحت الصيانة. قد تواجه بعض التأخير في المعالجة.', true);
    }
}

// إنشاء مثيل واحد للاستخدام العام
const notifications = new NotificationSystem();

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}