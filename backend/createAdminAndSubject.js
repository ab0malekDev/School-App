const bcrypt = require('bcryptjs');
const { User, Subject } = require('./models');

(async () => {
  try {
    // إنشاء مستخدم admin
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 12);
    const [admin, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        password: hash,
        role: 'admin'
      }
    });
    if (created) {
      console.log('✅ تم إنشاء مستخدم admin بنجاح');
    } else {
      console.log('ℹ️ مستخدم admin موجود مسبقاً');
    }

    // إنشاء مادة تجريبية
    const [subject, subjectCreated] = await Subject.findOrCreate({
      where: { name: 'الرياضيات', type: 'scientific' },
      defaults: {
        description: 'مادة الرياضيات للقسم العلمي'
      }
    });
    if (subjectCreated) {
      console.log('✅ تم إنشاء مادة الرياضيات بنجاح');
    } else {
      console.log('ℹ️ مادة الرياضيات موجودة مسبقاً');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ خطأ أثناء إضافة البيانات:', err);
    process.exit(1);
  }
})(); 