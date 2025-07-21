const express = require('express');
const mongoose = require('mongoose');
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

// الاتصال بقاعدة البيانات MongoDB
mongoose.connect('mongodb://localhost:27017/licenseDB', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('تم الاتصال بقاعدة البيانات'))
.catch(err => console.error('خطأ في الاتصال بقاعدة البيانات:', err));

// نموذج المستخدم
const userSchema = new mongoose.Schema({
    idNumber: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    applications: [{
        trackId: { type: String, unique: true },
        name: String,
        address: String,
        status: { type: String, default: 'تحت المراجعة' },
        submissionDate: { type: Date, default: Date.now },
        documents: {
            idCard: String,
            drivingLicense: String,
            workCertificate: String,
            firstAid: String,
            income: String
        },
        notes: String
    }]
});

const User = mongoose.model('User', userSchema);

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
        
        // التحقق من وجود المستخدم
        const existingUser = await User.findOne({ idNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'المستخدم موجود بالفعل' });
        }
        
        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ 
            idNumber, 
            email, 
            phone, 
            password: hashedPassword 
        });
        
        await newUser.save();
        res.status(201).json({ message: 'تم التسجيل بنجاح' });
    } catch (error) {
        console.error('خطأ في التسجيل:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { idNumber, password } = req.body;
        
        const user = await User.findOne({ idNumber });
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
        
        // البحث عن المستخدم وإضافة الطلب
        const user = await User.findOneAndUpdate(
            { idNumber },
            { 
                $push: { 
                    applications: { 
                        trackId,
                        name,
                        address,
                        documents,
                        submissionDate: new Date()
                    } 
                } 
            },
            { new: true, upsert: false }
        );
        
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود. يرجى التسجيل أولاً' });
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
app.get('/api/track/:trackId', async (req, res) => {
    try {
        const { trackId } = req.params;
        
        const user = await User.findOne({ 'applications.trackId': trackId });
        if (!user) {
            return res.status(404).json({ message: 'رقم التتبع غير صحيح' });
        }
        
        const application = user.applications.find(app => app.trackId === trackId);
        
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
app.put('/api/admin/update-status', async (req, res) => {
    try {
        const { trackId, status, notes } = req.body;
        
        const user = await User.findOneAndUpdate(
            { 'applications.trackId': trackId },
            { 
                $set: { 
                    'applications.$.status': status,
                    'applications.$.notes': notes 
                }
            },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: 'الطلب غير موجود' });
        }
        
        res.status(200).json({ message: 'تم تحديث الحالة بنجاح' });
    } catch (error) {
        console.error('خطأ في تحديث الحالة:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// الحصول على جميع الطلبات (للإدارة)
app.get('/api/admin/applications', async (req, res) => {
    try {
        const users = await User.find({}, 'applications');
        const allApplications = [];
        
        users.forEach(user => {
            user.applications.forEach(app => {
                allApplications.push({
                    trackId: app.trackId,
                    name: app.name,
                    status: app.status,
                    submissionDate: app.submissionDate,
                    userIdNumber: user.idNumber
                });
            });
        });
        
        // ترتيب حسب تاريخ التقديم (الأحدث أولاً)
        allApplications.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
        
        res.status(200).json(allApplications);
    } catch (error) {
        console.error('خطأ في استرجاع الطلبات:', error);
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
});

module.exports = app;