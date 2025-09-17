const { User } = require('./models');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

if (process.argv.length < 3) {
  console.error('يرجى وضع التوكن كـ باراميتر: node checkToken.js <token>');
  process.exit(1);
}

const token = process.argv[2];

(async () => {
  try {
    // فك التوكن
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ التوكن صالح. بيانات التوكن:', decoded);

    // البحث عن المستخدم في قاعدة البيانات
    const user = await User.findOne({ where: { id: decoded.id } });
    if (user) {
      console.log('✅ المستخدم موجود في قاعدة البيانات:', user.toJSON());
    } else {
      console.error('❌ المستخدم غير موجود في قاعدة البيانات. id:', decoded.id);
    }
  } catch (err) {
    console.error('❌ التوكن غير صالح أو منتهي الصلاحية:', err.message);
  }
})();
