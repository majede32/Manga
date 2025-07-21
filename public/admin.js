// متغيرات عامة
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
let allApplications = [];
let allUsers = [];
let currentStats = {};

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    setupEventHandlers();
});

// إعداد معالجات الأحداث
function setupEventHandlers() {
    // نموذج تحديث الحالة
    document.getElementById('statusForm').addEventListener('submit', handleStatusUpdate);
    
    // إغلاق النافذة المنبثقة بالنقر خارجها
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('statusModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// تحميل لوحة المعلومات
async function loadDashboard() {
    try {
        await Promise.all([
            loadStats(),
            loadApplications(),
            loadUsers()
        ]);
        updateDashboard();
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        showAlert('خطأ في تحميل البيانات', 'error');
    }
}

// تحميل الإحصائيات
async function loadStats() {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/stats`);
        currentStats = response.data;
    } catch (error) {
        console.error('خطأ في تحميل الإحصائيات:', error);
        currentStats = {
            totalUsers: 0,
            totalApplications: 0,
            pendingApplications: 0,
            approvedApplications: 0,
            rejectedApplications: 0
        };
    }
}

// تحميل الطلبات
async function loadApplications() {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/applications`);
        allApplications = response.data;
    } catch (error) {
        console.error('خطأ في تحميل الطلبات:', error);
        allApplications = [];
    }
}

// تحميل المستخدمين
async function loadUsers() {
    try {
        // نحتاج إلى إنشاء endpoint جديد للمستخدمين
        const response = await axios.get(`${API_BASE_URL}/api/admin/users`);
        allUsers = response.data;
    } catch (error) {
        console.error('خطأ في تحميل المستخدمين:', error);
        allUsers = [];
    }
}

// تحديث لوحة المعلومات
function updateDashboard() {
    // تحديث الإحصائيات
    updateStatsGrid();
    
    // تحديث أحدث الطلبات
    updateRecentApplications();
    
    // تحديث جداول الإدارة
    updateApplicationsTable();
    updateUsersTable();
    updateReportsData();
}

// تحديث شبكة الإحصائيات
function updateStatsGrid() {
    const statsGrid = document.getElementById('statsGrid');
    const stats = [
        {
            icon: 'fas fa-users',
            number: currentStats.totalUsers,
            label: 'إجمالي المستخدمين',
            color: '#3498db'
        },
        {
            icon: 'fas fa-file-alt',
            number: currentStats.totalApplications,
            label: 'إجمالي الطلبات',
            color: '#9b59b6'
        },
        {
            icon: 'fas fa-clock',
            number: currentStats.pendingApplications,
            label: 'تحت المراجعة',
            color: '#f39c12'
        },
        {
            icon: 'fas fa-check-circle',
            number: currentStats.approvedApplications,
            label: 'مقبولة',
            color: '#27ae60'
        },
        {
            icon: 'fas fa-times-circle',
            number: currentStats.rejectedApplications,
            label: 'مرفوضة',
            color: '#e74c3c'
        }
    ];
    
    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card" style="background: linear-gradient(135deg, ${stat.color}, ${adjustBrightness(stat.color, -20)})">
            <div class="stat-icon"><i class="${stat.icon}"></i></div>
            <div class="stat-number">${stat.number}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');
}

// تحديث أحدث الطلبات
function updateRecentApplications() {
    const recentApplicationsBody = document.getElementById('recentApplicationsBody');
    const recentApps = allApplications.slice(0, 5); // أحدث 5 طلبات
    
    if (recentApps.length === 0) {
        recentApplicationsBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #7f8c8d;">
                    <i class="fas fa-inbox"></i> لا توجد طلبات حتى الآن
                </td>
            </tr>
        `;
        return;
    }
    
    recentApplicationsBody.innerHTML = recentApps.map(app => `
        <tr>
            <td>${app.trackId}</td>
            <td>${app.name}</td>
            <td>${formatDate(app.submissionDate)}</td>
            <td><span class="status-badge ${getStatusClass(app.status)}">${app.status}</span></td>
            <td>
                <button class="action-btn" onclick="openStatusModal('${app.trackId}', '${app.status}', '${app.notes || ''}')">
                    <i class="fas fa-edit"></i> تحديث
                </button>
            </td>
        </tr>
    `).join('');
}

// تحديث جدول الطلبات
function updateApplicationsTable() {
    const applicationsBody = document.getElementById('applicationsBody');
    
    if (allApplications.length === 0) {
        applicationsBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #7f8c8d;">
                    <i class="fas fa-inbox"></i> لا توجد طلبات حتى الآن
                </td>
            </tr>
        `;
        return;
    }
    
    applicationsBody.innerHTML = allApplications.map(app => `
        <tr>
            <td>${app.trackId}</td>
            <td>${app.name}</td>
            <td>${app.userIdNumber}</td>
            <td>${formatDate(app.submissionDate)}</td>
            <td><span class="status-badge ${getStatusClass(app.status)}">${app.status}</span></td>
            <td>
                <button class="action-btn" onclick="openStatusModal('${app.trackId}', '${app.status}', '${app.notes || ''}')">
                    <i class="fas fa-edit"></i> تحديث
                </button>
                <button class="action-btn approve" onclick="quickUpdateStatus('${app.trackId}', 'مقبول')">
                    <i class="fas fa-check"></i> قبول
                </button>
                <button class="action-btn reject" onclick="quickUpdateStatus('${app.trackId}', 'مرفوض')">
                    <i class="fas fa-times"></i> رفض
                </button>
            </td>
        </tr>
    `).join('');
}

// تحديث جدول المستخدمين
function updateUsersTable() {
    const usersBody = document.getElementById('usersBody');
    
    if (allUsers.length === 0) {
        usersBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #7f8c8d;">
                    <i class="fas fa-user-slash"></i> لا توجد مستخدمين مسجلين
                </td>
            </tr>
        `;
        return;
    }
    
    usersBody.innerHTML = allUsers.map(user => `
        <tr>
            <td>${user.idNumber}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td>${user.applications ? user.applications.length : 0}</td>
            <td>
                <button class="action-btn" onclick="viewUserDetails('${user.idNumber}')">
                    <i class="fas fa-eye"></i> عرض
                </button>
            </td>
        </tr>
    `).join('');
}

// تحديث بيانات التقارير
function updateReportsData() {
    // حساب طلبات اليوم
    const today = new Date().toISOString().split('T')[0];
    const todayApps = allApplications.filter(app => 
        app.submissionDate.split('T')[0] === today
    ).length;
    
    // حساب طلبات الأسبوع
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekApps = allApplications.filter(app => 
        new Date(app.submissionDate) >= weekAgo
    ).length;
    
    // حساب معدل القبول
    const approvalRate = currentStats.totalApplications > 0 
        ? Math.round((currentStats.approvedApplications / currentStats.totalApplications) * 100)
        : 0;
    
    document.getElementById('todayApplications').textContent = todayApps;
    document.getElementById('weekApplications').textContent = weekApps;
    document.getElementById('approvalRate').textContent = `${approvalRate}%`;
}

// إظهار القسم المحدد
function showSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إزالة الكلاس النشط من جميع الأزرار
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار القسم المحدد
    document.getElementById(sectionId).classList.add('active');
    
    // إضافة الكلاس النشط للزر المناسب
    event.target.classList.add('active');
}

// فتح نافذة تحديث الحالة
function openStatusModal(trackId, currentStatus, notes) {
    document.getElementById('modalTrackId').value = trackId;
    document.getElementById('modalStatus').value = currentStatus;
    document.getElementById('modalNotes').value = notes || '';
    document.getElementById('statusModal').style.display = 'block';
}

// إغلاق النافذة المنبثقة
function closeModal() {
    document.getElementById('statusModal').style.display = 'none';
}

// معالج تحديث الحالة
async function handleStatusUpdate(event) {
    event.preventDefault();
    
    const trackId = document.getElementById('modalTrackId').value;
    const status = document.getElementById('modalStatus').value;
    const notes = document.getElementById('modalNotes').value;
    
    try {
        const response = await axios.put(`${API_BASE_URL}/api/admin/update-status`, {
            trackId,
            status,
            notes
        });
        
        if (response.data.message) {
            showAlert('تم تحديث حالة الطلب بنجاح', 'success');
            closeModal();
            await loadDashboard(); // إعادة تحميل البيانات
        }
    } catch (error) {
        console.error('خطأ في تحديث الحالة:', error);
        showAlert('خطأ في تحديث حالة الطلب', 'error');
    }
}

// تحديث سريع للحالة
async function quickUpdateStatus(trackId, status) {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/admin/update-status`, {
            trackId,
            status,
            notes: `تم ${status} الطلب تلقائياً`
        });
        
        if (response.data.message) {
            showAlert(`تم ${status} الطلب بنجاح`, 'success');
            await loadDashboard(); // إعادة تحميل البيانات
        }
    } catch (error) {
        console.error('خطأ في تحديث الحالة:', error);
        showAlert('خطأ في تحديث حالة الطلب', 'error');
    }
}

// تصفية الطلبات
function filterApplications() {
    const searchTerm = document.getElementById('searchApplications').value.toLowerCase();
    const filteredApps = allApplications.filter(app => 
        app.trackId.toLowerCase().includes(searchTerm) ||
        app.name.toLowerCase().includes(searchTerm) ||
        app.userIdNumber.includes(searchTerm) ||
        app.status.includes(searchTerm)
    );
    
    const applicationsBody = document.getElementById('applicationsBody');
    applicationsBody.innerHTML = filteredApps.map(app => `
        <tr>
            <td>${app.trackId}</td>
            <td>${app.name}</td>
            <td>${app.userIdNumber}</td>
            <td>${formatDate(app.submissionDate)}</td>
            <td><span class="status-badge ${getStatusClass(app.status)}">${app.status}</span></td>
            <td>
                <button class="action-btn" onclick="openStatusModal('${app.trackId}', '${app.status}', '${app.notes || ''}')">
                    <i class="fas fa-edit"></i> تحديث
                </button>
                <button class="action-btn approve" onclick="quickUpdateStatus('${app.trackId}', 'مقبول')">
                    <i class="fas fa-check"></i> قبول
                </button>
                <button class="action-btn reject" onclick="quickUpdateStatus('${app.trackId}', 'مرفوض')">
                    <i class="fas fa-times"></i> رفض
                </button>
            </td>
        </tr>
    `).join('');
}

// تصفية المستخدمين
function filterUsers() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const filteredUsers = allUsers.filter(user => 
        user.idNumber.includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.phone.includes(searchTerm)
    );
    
    const usersBody = document.getElementById('usersBody');
    usersBody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.idNumber}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td>${user.applications ? user.applications.length : 0}</td>
            <td>
                <button class="action-btn" onclick="viewUserDetails('${user.idNumber}')">
                    <i class="fas fa-eye"></i> عرض
                </button>
            </td>
        </tr>
    `).join('');
}

// تصدير الطلبات
function exportApplications(format) {
    if (format === 'csv') {
        exportToCSV();
    } else if (format === 'pdf') {
        exportToPDF();
    }
}

// تصدير إلى CSV
function exportToCSV() {
    const csvContent = [
        ['رقم التتبع', 'اسم المتقدم', 'رقم الهوية', 'تاريخ التقديم', 'الحالة'],
        ...allApplications.map(app => [
            app.trackId,
            app.name,
            app.userIdNumber,
            formatDate(app.submissionDate),
            app.status
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `طلبات_الترخيص_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// تصدير إلى PDF (مبسط)
function exportToPDF() {
    const printContent = `
        <html dir="rtl">
        <head>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background-color: #f2f2f2; }
                h1 { text-align: center; color: #2c3e50; }
            </style>
        </head>
        <body>
            <h1>تقرير طلبات ترخيص التاكسي الجماعي</h1>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
            <table>
                <thead>
                    <tr>
                        <th>رقم التتبع</th>
                        <th>اسم المتقدم</th>
                        <th>رقم الهوية</th>
                        <th>تاريخ التقديم</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${allApplications.map(app => `
                        <tr>
                            <td>${app.trackId}</td>
                            <td>${app.name}</td>
                            <td>${app.userIdNumber}</td>
                            <td>${formatDate(app.submissionDate)}</td>
                            <td>${app.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// إنشاء تقرير شامل
function generateReport() {
    const reportData = {
        date: new Date().toLocaleDateString('ar-SA'),
        stats: currentStats,
        applications: allApplications,
        users: allUsers
    };
    
    showAlert('جارٍ إنشاء التقرير...', 'info');
    // هنا يمكن إضافة منطق إنشاء تقرير أكثر تفصيلاً
    setTimeout(() => {
        showAlert('تم إنشاء التقرير بنجاح', 'success');
    }, 2000);
}

// عرض تفاصيل المستخدم
function viewUserDetails(idNumber) {
    const user = allUsers.find(u => u.idNumber === idNumber);
    if (user) {
        alert(`تفاصيل المستخدم:\nرقم الهوية: ${user.idNumber}\nالبريد: ${user.email}\nالهاتف: ${user.phone}\nعدد الطلبات: ${user.applications ? user.applications.length : 0}`);
    }
}

// دوال مساعدة
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusClass(status) {
    if (status === 'مقبول' || status === 'موافق عليه') return 'status-approved';
    if (status === 'مرفوض') return 'status-rejected';
    return 'status-pending';
}

function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function showAlert(message, type) {
    // إنشاء عنصر التنبيه
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    // تحديد لون التنبيه
    if (type === 'success') alert.style.background = '#27ae60';
    else if (type === 'error') alert.style.background = '#e74c3c';
    else alert.style.background = '#3498db';
    
    alert.textContent = message;
    document.body.appendChild(alert);
    
    // إظهار التنبيه
    setTimeout(() => alert.style.transform = 'translateX(0)', 100);
    
    // إخفاء التنبيه
    setTimeout(() => {
        alert.style.transform = 'translateX(400px)';
        setTimeout(() => document.body.removeChild(alert), 300);
    }, 3000);
}