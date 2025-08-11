// تهيئة الموقع عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    setupEventListeners();
    startAnimations();
    loadUserProgress();
});

// تهيئة الموقع
function initializeWebsite() {
    console.log('🌟 مرحباً بكم في مستقبلنا التعليمي! 🌟');
    
    // تهيئة الأصوات
    setupSounds();
    
    // تهيئة الشخصية التفاعلية
    setupMascot();
    
    // تهيئة النافذة المنبثقة
    setupModal();
    
    // تهيئة التنقل السلس
    setupSmoothScrolling();
}

// إعداد الأصوات
function setupSounds() {
    // أصوات النقر
    window.clickSound = {
        play: function() {
            // محاكاة صوت النقر
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2Y3/LPhScBJX7J8N+USQsUXrPp7alWFAlEneHyu2ojBzuV3PLP');
            audio.volume = 0.1;
            audio.play().catch(() => {});
        }
    };
    
    window.successSound = {
        play: function() {
            // محاكاة صوت النجاح
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2Y3/LPhScBJX7J8N+USQsUXrPp7alWFAlEneHyu2ojBzuV3PLP');
            audio.volume = 0.2;
            audio.play().catch(() => {});
        }
    };
}

// إعداد الشخصية التفاعلية
function setupMascot() {
    const mascot = document.getElementById('mascot');
    const speechBubble = document.getElementById('speech');
    
    if (!mascot || !speechBubble) return;
    
    const phrases = [
        'مرحباً! أنا صديقكم المساعد في رحلة التعلم! 🎓',
        'هيا نتعلم شيئاً جديداً اليوم! 📚',
        'أحسنتم! استمروا في التعلم! ⭐',
        'التعلم متعة حقيقية! 🎉',
        'أنتم رائعون! واصلوا التقدم! 🚀',
        'كل يوم نتعلم شيئاً جديداً! 🌟',
        'المعرفة قوة! 💪',
        'التعلم رحلة ممتعة! 🎈'
    ];
    
    let currentPhraseIndex = 0;
    
    // تغيير الرسالة كل 5 ثوانٍ
    setInterval(() => {
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        speechBubble.querySelector('p').textContent = phrases[currentPhraseIndex];
        
        // إضافة حركة للفقاعة
        speechBubble.style.animation = 'none';
        setTimeout(() => {
            speechBubble.style.animation = 'showSpeech 0.5s ease both';
        }, 10);
    }, 5000);
    
    // التفاعل مع النقر على الشخصية
    mascot.addEventListener('click', function() {
        window.clickSound.play();
        
        // تغيير العبارة فوراً
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        speechBubble.querySelector('p').textContent = phrases[currentPhraseIndex];
        
        // إضافة حركة ممتعة
        mascot.style.animation = 'none';
        setTimeout(() => {
            mascot.style.animation = 'float 3s ease-in-out infinite, pulse 1s ease';
        }, 10);
        
        // إضافة جزيئات متحركة
        createParticles(mascot);
    });
}

// إنشاء جزيئات متحركة
function createParticles(element) {
    const particles = ['⭐', '🌟', '✨', '💫', '🎉', '🎊'];
    
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.cssText = `
            position: absolute;
            font-size: 1.5rem;
            z-index: 1000;
            pointer-events: none;
            left: ${element.offsetLeft + element.offsetWidth/2}px;
            top: ${element.offsetTop + element.offsetHeight/2}px;
        `;
        
        document.body.appendChild(particle);
        
        // حركة الجزيئات
        const angle = (i * 60) * Math.PI / 180;
        const distance = 100;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;
        
        particle.animate([
            { transform: 'translate(0, 0) scale(0)', opacity: 1 },
            { transform: `translate(${targetX}px, ${targetY}px) scale(1)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => particle.remove();
    }
}

// إعداد النافذة المنبثقة
function setupModal() {
    const modal = document.getElementById('modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    
    // إغلاق النافذة
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // إغلاق بمفتاح Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
}

// فتح النافذة المنبثقة
function openModal(title, content) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    modal.style.display = 'flex';
    
    window.clickSound.play();
}

// إغلاق النافذة المنبثقة
function closeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.style.display = 'none';
    window.clickSound.play();
}

// إعداد التنقل السلس
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    window.clickSound.play();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار الصفوف
    const gradeCards = document.querySelectorAll('.grade-card');
    gradeCards.forEach(card => {
        card.addEventListener('click', function() {
            const grade = this.dataset.grade;
            openGrade(grade);
        });
        
        // تأثير عند المرور
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // أزرار الأنشطة
    const activityCards = document.querySelectorAll('.activity-card');
    activityCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // الشارات
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.addEventListener('click', function() {
            if (this.classList.contains('earned')) {
                showBadgeInfo(this);
            } else {
                showLockedBadgeInfo(this);
            }
        });
    });
}

// بدء الرسوم المتحركة
function startAnimations() {
    // تحريك العناصر المتحركة
    const floatingShapes = document.querySelectorAll('.floating-shape');
    floatingShapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 0.5}s`;
    });
    
    // تحريك أيقونات الصفوف
    const gradeIcons = document.querySelectorAll('.grade-icon');
    gradeIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.2}s`;
    });
    
    // تحريك أيقونات الأنشطة
    const activityIcons = document.querySelectorAll('.activity-icon');
    activityIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.3}s`;
    });
}

// فتح صفحة الصف
function openGrade(grade) {
    window.clickSound.play();
    
    // التوجه إلى الصفحة المخصصة للصف إذا كانت متوفرة
    const gradePages = {
        1: 'grade1.html',
        3: 'grade3.html'
    };
    
    if (gradePages[grade]) {
        window.location.href = gradePages[grade];
        return;
    }
    
    const gradeContent = getGradeContent(grade);
    openModal(`الصف ${grade}`, gradeContent);
    
    // إضافة نقاط للتفاعل
    updateUserPoints(10);
}

// الحصول على محتوى الصف
function getGradeContent(grade) {
    const gradeData = {
        1: {
            title: 'الصف الأول - ابدأ رحلتك التعليمية! 🌱',
            subjects: [
                {
                    name: 'اللغة العربية',
                    icon: '📝',
                    activities: ['قراءة قصص تفاعلية', 'كتابة الحروف', 'ألعاب الكلمات']
                },
                {
                    name: 'الرياضيات',
                    icon: '🔢',
                    activities: ['عد الأرقام', 'الأشكال الهندسية', 'ألعاب الجمع البسيط']
                },
                {
                    name: 'العلوم',
                    icon: '🔬',
                    activities: ['استكشاف الحيوانات', 'النباتات', 'الطقس']
                },
                {
                    name: 'البرمجة البسيطة',
                    icon: '🤖',
                    activities: ['ترتيب الكتل', 'حركة الشخصيات', 'الألوان والأشكال']
                }
            ]
        },
        2: {
            title: 'الصف الثاني - استمر في النمو والتعلم! 🌿',
            subjects: [
                {
                    name: 'اللغة العربية',
                    icon: '📚',
                    activities: ['كتابة القصص', 'القراءة التفاعلية', 'المحادثة']
                },
                {
                    name: 'الرياضيات',
                    icon: '➕',
                    activities: ['الجمع والطرح', 'الألغاز الرياضية', 'قياس الأطوال']
                },
                {
                    name: 'اللغة الإنجليزية',
                    icon: '🌍',
                    activities: ['الكلمات الأساسية', 'الأغاني', 'المحادثات البسيطة']
                }
            ]
        },
        3: {
            title: 'الصف الثالث - طور مهاراتك أكثر! 🌳',
            subjects: [
                {
                    name: 'البرمجة مع Scratch',
                    icon: '🎮',
                    activities: ['إنشاء الألعاب', 'الرسوم المتحركة', 'القصص التفاعلية']
                },
                {
                    name: 'العلوم المتقدمة',
                    icon: '⚗️',
                    activities: ['التجارب العلمية', 'الطاقة', 'الضوء والصوت']
                }
            ]
        },
        4: {
            title: 'الصف الرابع - تعلم مهارات متقدمة! 🏆',
            subjects: [
                {
                    name: 'تحليل البيانات',
                    icon: '📊',
                    activities: ['الجداول والرسوم البيانية', 'الإحصاء البسيط', 'جمع البيانات']
                },
                {
                    name: 'البيئة والاستدامة',
                    icon: '🌱',
                    activities: ['مشاريع بيئية', 'إعادة التدوير', 'الطاقة المتجددة']
                }
            ]
        },
        5: {
            title: 'الصف الخامس - استكشف آفاق جديدة! 🎯',
            subjects: [
                {
                    name: 'ريادة الأعمال',
                    icon: '💡',
                    activities: ['مشاريع صغيرة', 'التخطيط', 'العرض والتقديم']
                },
                {
                    name: 'الذكاء الاصطناعي',
                    icon: '🤖',
                    activities: ['مفاهيم أساسية', 'الآلات الذكية', 'المستقبل الرقمي']
                }
            ]
        },
        6: {
            title: 'الصف السادس - استعد للمستقبل! 🚀',
            subjects: [
                {
                    name: 'إدارة المشاريع',
                    icon: '📋',
                    activities: ['التخطيط المتقدم', 'العمل الجماعي', 'حل المشكلات']
                },
                {
                    name: 'التفكير العالمي',
                    icon: '🌐',
                    activities: ['الثقافات المختلفة', 'القضايا العالمية', 'التعاون الدولي']
                }
            ]
        }
    };
    
    const data = gradeData[grade];
    if (!data) return 'محتوى غير متوفر حالياً';
    
    let content = `<h3>${data.title}</h3><div class="subjects-grid">`;
    
    data.subjects.forEach(subject => {
        content += `
            <div class="subject-card">
                <div class="subject-icon">${subject.icon}</div>
                <h4>${subject.name}</h4>
                <ul class="activity-list">
                    ${subject.activities.map(activity => `<li>• ${activity}</li>`).join('')}
                </ul>
                <button class="btn btn-primary" onclick="startSubject('${subject.name}', ${grade})">
                    ابدأ التعلم
                </button>
            </div>
        `;
    });
    
    content += '</div>';
    
    // إضافة CSS للمحتوى
    content += `
        <style>
            .subjects-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            .subject-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 15px;
                text-align: center;
                transition: transform 0.3s ease;
            }
            .subject-card:hover {
                transform: translateY(-5px);
            }
            .subject-icon {
                font-size: 3rem;
                margin-bottom: 10px;
            }
            .activity-list {
                list-style: none;
                padding: 0;
                margin: 15px 0;
                text-align: right;
            }
            .activity-list li {
                padding: 5px 0;
                color: #666;
            }
        </style>
    `;
    
    return content;
}

// فتح نشاط
function openActivity(activityType) {
    window.clickSound.play();
    
    const activityContent = getActivityContent(activityType);
    openModal('الأنشطة التفاعلية', activityContent);
    
    updateUserPoints(5);
}

// الحصول على محتوى النشاط
function getActivityContent(activityType) {
    const activities = {
        games: {
            title: 'ألعاب تعليمية 🎯',
            content: `
                <div class="activity-content">
                    <h3>ألعاب ممتعة وتعليمية</h3>
                    <div class="games-grid">
                        <div class="game-card" onclick="playGame('math')">
                            <div class="game-icon">🔢</div>
                            <h4>لعبة الرياضيات</h4>
                            <p>اجمع النقاط وحل المسائل!</p>
                        </div>
                        <div class="game-card" onclick="playGame('words')">
                            <div class="game-icon">📝</div>
                            <h4>لعبة الكلمات</h4>
                            <p>كون كلمات من الحروف!</p>
                        </div>
                        <div class="game-card" onclick="playGame('memory')">
                            <div class="game-icon">🧠</div>
                            <h4>لعبة الذاكرة</h4>
                            <p>اختبر قوة ذاكرتك!</p>
                        </div>
                    </div>
                </div>
            `
        },
        puzzles: {
            title: 'الألغاز الذكية 🧩',
            content: `
                <div class="activity-content">
                    <h3>ألغاز تطور التفكير</h3>
                    <div class="puzzle-container">
                        <div class="puzzle-item">
                            <h4>🔍 لغز اليوم</h4>
                            <p>ما هو الشيء الذي يمشي بلا أرجل ويطير بلا أجنحة؟</p>
                            <button class="btn btn-primary" onclick="showAnswer('الوقت')">اعرض الجواب</button>
                        </div>
                        <div class="puzzle-item">
                            <h4>🧮 لغز رياضي</h4>
                            <p>إذا كان لديك 5 تفاحات وأعطيت 2 لصديقك، كم تبقى معك؟</p>
                            <button class="btn btn-primary" onclick="showAnswer('3 تفاحات')">اعرض الجواب</button>
                        </div>
                    </div>
                </div>
            `
        },
        stories: {
            title: 'القصص التفاعلية 📚',
            content: `
                <div class="activity-content">
                    <h3>قصص ممتعة وتعليمية</h3>
                    <div class="stories-grid">
                        <div class="story-card" onclick="readStory('adventure')">
                            <div class="story-icon">🏰</div>
                            <h4>مغامرة القلعة السحرية</h4>
                            <p>انضم للمغامرة الشيقة!</p>
                        </div>
                        <div class="story-card" onclick="readStory('science')">
                            <div class="story-icon">🚀</div>
                            <h4>رحلة إلى الفضاء</h4>
                            <p>استكشف الكواكب والنجوم!</p>
                        </div>
                    </div>
                </div>
            `
        },
        coding: {
            title: 'البرمجة للأطفال 💻',
            content: `
                <div class="activity-content">
                    <h3>تعلم البرمجة بطريقة ممتعة</h3>
                    <div class="coding-section">
                        <h4>🎮 إنشاء لعبة بسيطة</h4>
                        <div class="code-blocks">
                            <div class="code-block" draggable="true">ابدأ</div>
                            <div class="code-block" draggable="true">تحرك يميناً</div>
                            <div class="code-block" draggable="true">قفز</div>
                            <div class="code-block" draggable="true">انهي</div>
                        </div>
                        <div class="drop-zone">اسحب الكتل هنا لإنشاء برنامجك</div>
                        <button class="btn btn-success" onclick="runCode()">تشغيل البرنامج</button>
                    </div>
                </div>
            `
        },
        art: {
            title: 'الفنون الرقمية 🎨',
            content: `
                <div class="activity-content">
                    <h3>أبدع بالفنون الرقمية</h3>
                    <div class="art-tools">
                        <canvas id="drawingCanvas" width="400" height="300" style="border: 2px solid #ddd; border-radius: 10px;"></canvas>
                        <div class="color-palette">
                            <div class="color" style="background: red;" onclick="selectColor('red')"></div>
                            <div class="color" style="background: blue;" onclick="selectColor('blue')"></div>
                            <div class="color" style="background: green;" onclick="selectColor('green')"></div>
                            <div class="color" style="background: yellow;" onclick="selectColor('yellow')"></div>
                            <div class="color" style="background: purple;" onclick="selectColor('purple')"></div>
                        </div>
                        <button class="btn btn-primary" onclick="clearCanvas()">مسح الرسمة</button>
                    </div>
                </div>
            `
        },
        music: {
            title: 'الموسيقى والغناء 🎵',
            content: `
                <div class="activity-content">
                    <h3>تعلم الموسيقى والألحان</h3>
                    <div class="music-section">
                        <div class="piano-keys">
                            <div class="key white" onclick="playNote('C')">دو</div>
                            <div class="key white" onclick="playNote('D')">ري</div>
                            <div class="key white" onclick="playNote('E')">مي</div>
                            <div class="key white" onclick="playNote('F')">فا</div>
                            <div class="key white" onclick="playNote('G')">صول</div>
                            <div class="key white" onclick="playNote('A')">لا</div>
                            <div class="key white" onclick="playNote('B')">سي</div>
                        </div>
                        <button class="btn btn-primary" onclick="playMelody()">🎵 عزف لحن جميل</button>
                    </div>
                </div>
            `
        }
    };
    
    const activity = activities[activityType];
    if (!activity) return 'نشاط غير متوفر حالياً';
    
    return `
        <h3>${activity.title}</h3>
        ${activity.content}
        <style>
            .activity-content {
                text-align: center;
            }
            .games-grid, .stories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            .game-card, .story-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 15px;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            .game-card:hover, .story-card:hover {
                transform: translateY(-5px);
            }
            .game-icon, .story-icon {
                font-size: 2.5rem;
                margin-bottom: 10px;
            }
            .puzzle-container {
                display: grid;
                gap: 20px;
                margin: 20px 0;
            }
            .puzzle-item {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 15px;
            }
            .coding-section {
                margin: 20px 0;
            }
            .code-blocks {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin: 20px 0;
            }
            .code-block {
                background: #4ecdc4;
                color: white;
                padding: 10px 15px;
                border-radius: 10px;
                cursor: grab;
                user-select: none;
            }
            .drop-zone {
                min-height: 100px;
                border: 2px dashed #ddd;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 20px 0;
                color: #666;
            }
            .art-tools {
                text-align: center;
            }
            .color-palette {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin: 15px 0;
            }
            .color {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid #ddd;
            }
            .piano-keys {
                display: flex;
                gap: 2px;
                justify-content: center;
                margin: 20px 0;
            }
            .key {
                width: 40px;
                height: 120px;
                border: 1px solid #333;
                display: flex;
                align-items: end;
                justify-content: center;
                cursor: pointer;
                font-size: 12px;
                padding-bottom: 10px;
                transition: all 0.1s ease;
            }
            .key.white {
                background: white;
                color: #333;
            }
            .key:hover {
                background: #f0f0f0;
                transform: scale(0.95);
            }
        </style>
    `;
}

// بدء موضوع دراسي
function startSubject(subjectName, grade) {
    window.successSound.play();
    showMessage(`مرحباً بك في ${subjectName} للصف ${grade}! 🎉`, 'success');
    updateUserPoints(15);
}

// لعب لعبة
function playGame(gameType) {
    window.successSound.play();
    showMessage('اللعبة ستبدأ قريباً! 🎮', 'info');
    updateUserPoints(20);
}

// عرض الإجابة
function showAnswer(answer) {
    showMessage(`الإجابة: ${answer} 🎉`, 'success');
    updateUserPoints(10);
}

// قراءة قصة
function readStory(storyType) {
    window.successSound.play();
    showMessage('القصة ستبدأ قريباً! 📖', 'info');
    updateUserPoints(15);
}

// تشغيل الكود
function runCode() {
    window.successSound.play();
    showMessage('ممتاز! برنامجك يعمل بشكل رائع! 🤖', 'success');
    updateUserPoints(25);
}

// مسح الرسمة
function clearCanvas() {
    const canvas = document.getElementById('drawingCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// اختيار لون
function selectColor(color) {
    window.currentColor = color;
    showMessage(`تم اختيار اللون ${color}! 🎨`, 'info');
}

// عزف نوتة
function playNote(note) {
    window.clickSound.play();
    showMessage(`♪ ${note} ♪`, 'info');
}

// عزف لحن
function playMelody() {
    window.successSound.play();
    showMessage('🎵 لحن جميل! أحسنت! 🎵', 'success');
    updateUserPoints(20);
}

// عرض رسالة
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'info' ? '#2196f3' : '#ff9800'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 3000;
        animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s both;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 300px;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// إضافة أنيميشن CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// تحديث نقاط المستخدم
function updateUserPoints(points) {
    let currentPoints = parseInt(localStorage.getItem('userPoints') || '0');
    currentPoints += points;
    localStorage.setItem('userPoints', currentPoints.toString());
    
    // تحديث العرض
    const pointsDisplay = document.querySelector('.points-count');
    if (pointsDisplay) {
        pointsDisplay.textContent = currentPoints.toLocaleString();
        
        // إضافة تأثير بصري
        pointsDisplay.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            pointsDisplay.style.animation = '';
        }, 500);
    }
    
    // تحديث الشارات
    updateBadges(currentPoints);
    
    // تحديث شريط التقدم
    updateProgressBar(currentPoints);
}

// تحديث الشارات
function updateBadges(totalPoints) {
    const badges = document.querySelectorAll('.badge');
    const milestones = [50, 150, 300, 500, 1000]; // نقاط الحصول على الشارات
    
    badges.forEach((badge, index) => {
        if (totalPoints >= milestones[index]) {
            badge.classList.remove('locked');
            badge.classList.add('earned');
        }
    });
}

// تحديث شريط التقدم
function updateProgressBar(totalPoints) {
    const maxPoints = 1500; // الحد الأقصى للنقاط
    const percentage = Math.min((totalPoints / maxPoints) * 100, 100);
    
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    // تحديث النص
    const progressText = progressFill?.parentElement?.nextElementSibling;
    if (progressText) {
        progressText.textContent = `${Math.round(percentage)}% مكتمل`;
    }
}

// تحميل تقدم المستخدم
function loadUserProgress() {
    const savedPoints = parseInt(localStorage.getItem('userPoints') || '0');
    
    // تحديث العرض
    const pointsDisplay = document.querySelector('.points-count');
    if (pointsDisplay) {
        pointsDisplay.textContent = savedPoints.toLocaleString();
    }
    
    updateBadges(savedPoints);
    updateProgressBar(savedPoints);
}

// إظهار معلومات الشارة
function showBadgeInfo(badge) {
    const badgeTexts = {
        0: 'شارة البداية 🌟 - أهلاً بك في رحلة التعلم!',
        1: 'شارة المثابرة 🎯 - واصل التعلم والممارسة!',
        2: 'شارة القراءة 📚 - أحسنت في القراءة والفهم!',
        3: 'شارة التميز 🏅 - أداء ممتاز ومستوى متقدم!',
        4: 'شارة الإبداع 🎨 - مبدع في الأنشطة الفنية!'
    };
    
    const badgeIndex = Array.from(badge.parentElement.children).indexOf(badge);
    const message = badgeTexts[badgeIndex] || 'شارة رائعة!';
    
    showMessage(message, 'success');
}

// إظهار معلومات الشارة المقفلة
function showLockedBadgeInfo(badge) {
    showMessage('استمر في التعلم لفتح هذه الشارة! 🔒', 'info');
}

// بدء التعلم
function startLearning() {
    window.successSound.play();
    showMessage('مرحباً بك في رحلة التعلم! اختر صفك الدراسي أدناه 📚', 'info');
    
    // التنقل إلى قسم الصفوف
    document.querySelector('#grades').scrollIntoView({
        behavior: 'smooth'
    });
    
    updateUserPoints(5);
}

// عرض العرض التوضيحي
function showDemo() {
    window.clickSound.play();
    
    const demoContent = `
        <div class="demo-content">
            <h3>🎬 العرض التوضيحي</h3>
            <div class="demo-video">
                <div class="video-placeholder">
                    <i class="fas fa-play-circle" style="font-size: 4rem; color: #4ecdc4;"></i>
                    <p>فيديو توضيحي عن كيفية استخدام الموقع</p>
                </div>
            </div>
            <div class="demo-features">
                <h4>ما ستتعلمه:</h4>
                <ul>
                    <li>كيفية التنقل في الموقع</li>
                    <li>اختيار الصف المناسب</li>
                    <li>المشاركة في الأنشطة</li>
                    <li>تتبع التقدم وجمع النقاط</li>
                </ul>
            </div>
            <button class="btn btn-primary" onclick="closeModal()">ابدأ الاستكشاف</button>
        </div>
        <style>
            .demo-content {
                text-align: center;
            }
            .video-placeholder {
                background: #f8f9fa;
                padding: 50px;
                border-radius: 15px;
                margin: 20px 0;
            }
            .demo-features {
                text-align: right;
                margin: 20px 0;
            }
            .demo-features ul {
                list-style: none;
                padding: 0;
            }
            .demo-features li {
                padding: 8px 0;
                color: #555;
            }
            .demo-features li:before {
                content: '✓ ';
                color: #4caf50;
                font-weight: bold;
            }
        </style>
    `;
    
    openModal('العرض التوضيحي', demoContent);
}

// تهيئة الرسم على Canvas (إذا كان موجوداً)
function initCanvas() {
    const canvas = document.getElementById('drawingCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentColor = 'black';
    
    window.currentColor = currentColor;
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = window.currentColor || 'black';
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    function stopDrawing() {
        if (isDrawing) {
            ctx.beginPath();
            isDrawing = false;
        }
    }
}

// مراقب تهيئة Canvas عند فتح النافذة المنبثقة
const originalOpenModal = openModal;
openModal = function(title, content) {
    originalOpenModal(title, content);
    setTimeout(initCanvas, 100); // تأخير صغير للتأكد من تحميل المحتوى
};