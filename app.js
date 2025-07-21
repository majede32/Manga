const express = require('express');
const multer = require('multer');
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// إعداد CORS للسماح بالطلبات من الواجهة الأمامية
app.use(cors());

// إعداد middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// إعداد multer لرفع الملفات
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('نوع الملف غير مدعوم. يُسمح فقط بملفات JPG، PNG، و PDF'));
        }
    }
});

// إعداد قاعدة البيانات المحلية (JSON)
const DB_FILE = './database.json';

// إنشاء ملف قاعدة البيانات إذا لم يكن موجوداً
function initDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            users: [],
            applications: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
}

// قراءة البيانات من الملف
function readDatabase() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('خطأ في قراءة قاعدة البيانات:', error);
        return { users: [], applications: [] };
    }
}

// كتابة البيانات إلى الملف
function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('خطأ في كتابة قاعدة البيانات:', error);
        return false;
    }
}

// البحث عن مستخدم
function findUser(idNumber) {
    const db = readDatabase();
    return db.users.find(user => user.idNumber === idNumber);
}

// إضافة مستخدم جديد
function addUser(userData) {
    const db = readDatabase();
    
    // التحقق من وجود المستخدم
    if (db.users.find(user => user.idNumber === userData.idNumber)) {
        return { success: false, message: 'المستخدم موجود بالفعل' };
    }
    
    const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
        applications: []
    };
    
    db.users.push(newUser);
    
    if (writeDatabase(db)) {
        return { success: true, user: newUser };
    } else {
        return { success: false, message: 'خطأ في حفظ البيانات' };
    }
}

// إضافة طلب لمستخدم
function addApplication(idNumber, applicationData) {
    const db = readDatabase();
    const userIndex = db.users.findIndex(user => user.idNumber === idNumber);
    
    if (userIndex === -1) {
        return { success: false, message: 'المستخدم غير موجود' };
    }
    
    const newApplication = {
        id: Date.now().toString(),
        trackId: applicationData.trackId,
        ...applicationData,
        submissionDate: new Date().toISOString(),
        status: 'تحت المراجعة'
    };
    
    db.users[userIndex].applications.push(newApplication);
    db.applications.push({
        ...newApplication,
        userIdNumber: idNumber
    });
    
    if (writeDatabase(db)) {
        return { success: true, application: newApplication };
    } else {
        return { success: false, message: 'خطأ في حفظ الطلب' };
    }
}

// البحث عن طلب بواسطة رقم التتبع
function findApplication(trackId) {
    const db = readDatabase();
    return db.applications.find(app => app.trackId === trackId);
}

// تحديث حالة طلب
function updateApplicationStatus(trackId, status, notes) {
    const db = readDatabase();
    
    // تحديث في قائمة التطبيقات العامة
    const appIndex = db.applications.findIndex(app => app.trackId === trackId);
    if (appIndex !== -1) {
        db.applications[appIndex].status = status;
        db.applications[appIndex].notes = notes;
        db.applications[appIndex].updatedAt = new Date().toISOString();
    }
    
    // تحديث في ملف المستخدم
    for (let user of db.users) {
        const userAppIndex = user.applications.findIndex(app => app.trackId === trackId);
        if (userAppIndex !== -1) {
            user.applications[userAppIndex].status = status;
            user.applications[userAppIndex].notes = notes;
            user.applications[userAppIndex].updatedAt = new Date().toISOString();
            break;
        }
    }
    
    return writeDatabase(db);
}

// تهيئة قاعدة البيانات
initDatabase();

// إنشاء مجلد الأرشيف إذا لم يكن موجوداً
if (!fs.existsSync('./archives/')) {
    fs.mkdirSync('./archives/', { recursive: true });
}

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// تسجيل مستخدم جديد
app.post('/api/register', async (req, res) => {
    try {
        const { idNumber, email, phone, password } = req.body;
        
        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = addUser({
            idNumber,
            email,
            phone,
            password: hashedPassword
        });
        
        if (result.success) {
            res.status(201).json({ message: 'تم التسجيل بنجاح' });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        console.error('خطأ في التسجيل:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { idNumber, password } = req.body;
        
        const user = findUser(idNumber);
        if (!user) {
            return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
        }
        
        res.status(200).json({ 
            message: 'تم تسجيل الدخول بنجاح', 
            user: { 
                idNumber: user.idNumber,
                email: user.email 
            }
        });
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// تقديم طلب ترخيص
app.post('/api/apply', upload.fields([
    { name: 'idCard', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'workCertificate', maxCount: 1 },
    { name: 'firstAid', maxCount: 1 },
    { name: 'income', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, idNumber, address } = req.body;
        
        // التحقق من وجود جميع الملفات المطلوبة
        const requiredFiles = ['idCard', 'drivingLicense', 'workCertificate', 'firstAid', 'income'];
        for (let field of requiredFiles) {
            if (!req.files[field] || req.files[field].length === 0) {
                return res.status(400).json({ 
                    message: `الوثيقة المطلوبة مفقودة: ${field}` 
                });
            }
        }
        
        // إنشاء رقم تتبع فريد
        const trackId = 'TRK' + Date.now() + Math.floor(Math.random() * 1000);
        
        // حفظ مسارات الوثائق
        const documents = {
            idCard: req.files['idCard'][0].path,
            drivingLicense: req.files['drivingLicense'][0].path,
            workCertificate: req.files['workCertificate'][0].path,
            firstAid: req.files['firstAid'][0].path,
            income: req.files['income'][0].path
        };
        
        // إضافة الطلب إلى قاعدة البيانات
        const result = addApplication(idNumber, {
            trackId,
            name,
            address,
            documents
        });
        
        if (!result.success) {
            return res.status(404).json({ message: result.message });
        }
        
        // إنشاء ملف ZIP يحتوي على جميع الوثائق
        try {
            const zip = new JSZip();
            
            // إضافة ملف معلومات الطلب
            const applicationInfo = `
معلومات طلب ترخيص التاكسي الجماعي
=====================================

رقم التتبع: ${trackId}
اسم المتقدم: ${name}
رقم بطاقة التعريف: ${idNumber}
العنوان: ${address}
تاريخ التقديم: ${new Date().toLocaleString('ar-TN')}

الوثائق المرفقة:
- بطاقة التعريف
- رخصة السياقة
- شهادة العمل
- شهادة الإسعاف
- التصريح السنوي بالدخل

وفقاً للأمر عدد 581 لسنة 2023
ولاية منوبة - تونس
            `;
            
            zip.file('معلومات_الطلب.txt', applicationInfo);
            
            // إضافة الوثائق إلى الملف المضغوط
            for (const [docType, docPath] of Object.entries(documents)) {
                if (fs.existsSync(docPath)) {
                    const docContent = fs.readFileSync(docPath);
                    const fileExtension = path.extname(docPath);
                    zip.file(`${docType}${fileExtension}`, docContent);
                }
            }
            
            // حفظ الملف المضغوط
            const zipPath = path.join(__dirname, 'archives', `${trackId}.zip`);
            const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
            fs.writeFileSync(zipPath, zipContent);
            
            console.log(`تم إنشاء ملف الأرشيف: ${zipPath}`);
        } catch (zipError) {
            console.error('خطأ في إنشاء ملف ZIP:', zipError);
        }
        
        res.status(200).json({ 
            message: 'تم تقديم الطلب بنجاح',
            trackId: trackId
        });
        
    } catch (error) {
        console.error('خطأ في تقديم الطلب:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// تتبع الطلب
app.get('/api/track/:trackId', (req, res) => {
    try {
        const { trackId } = req.params;
        
        const application = findApplication(trackId);
        if (!application) {
            return res.status(404).json({ message: 'رقم التتبع غير صحيح' });
        }
        
        res.status(200).json({ 
            trackId,
            status: application.status,
            submissionDate: application.submissionDate,
            applicantName: application.name,
            notes: application.notes || 'لا توجد ملاحظات'
        });
    } catch (error) {
        console.error('خطأ في تتبع الطلب:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// تحديث حالة الطلب (للإدارة)
app.put('/api/admin/update-status', (req, res) => {
    try {
        const { trackId, status, notes } = req.body;
        
        const success = updateApplicationStatus(trackId, status, notes);
        
        if (success) {
            res.status(200).json({ message: 'تم تحديث الحالة بنجاح' });
        } else {
            res.status(500).json({ message: 'خطأ في تحديث الحالة' });
        }
    } catch (error) {
        console.error('خطأ في تحديث الحالة:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// الحصول على جميع الطلبات (للإدارة)
app.get('/api/admin/applications', (req, res) => {
    try {
        const db = readDatabase();
        
        // ترتيب حسب تاريخ التقديم (الأحدث أولاً)
        const sortedApplications = db.applications.sort((a, b) => 
            new Date(b.submissionDate) - new Date(a.submissionDate)
        );
        
        res.status(200).json(sortedApplications);
    } catch (error) {
        console.error('خطأ في استرجاع الطلبات:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// إحصائيات النظام
app.get('/api/stats', (req, res) => {
    try {
        const db = readDatabase();
        
        const stats = {
            totalUsers: db.users.length,
            totalApplications: db.applications.length,
            pendingApplications: db.applications.filter(app => app.status === 'تحت المراجعة').length,
            approvedApplications: db.applications.filter(app => app.status === 'مقبول' || app.status === 'موافق عليه').length,
            rejectedApplications: db.applications.filter(app => app.status === 'مرفوض').length
        };
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('خطأ في استرجاع الإحصائيات:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// معالجة الأخطاء العامة
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت' });
        }
    }
    res.status(500).json({ message: error.message || 'خطأ في الخادم' });
});

// تشغيل الخادم
app.listen(port, () => {
    console.log(`الخادم يعمل على البورت ${port}`);
    console.log(`يمكنك زيارة الموقع على: http://localhost:${port}`);
    console.log('تم استبدال MongoDB بنظام ملفات JSON محلي');
});

module.exports = app;