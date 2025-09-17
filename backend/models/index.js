const User = require('./User');
const Session = require('./Session');
const ActivationCode = require('./ActivationCode');
const Device = require('./Device');
const Subject = require('./Subject');
const Unit = require('./Unit');
const Lesson = require('./Lesson');
const Video = require('./Video');
const Quiz = require('./Quiz');
const Question = require('./Question');
const Option = require('./Option');
const StudentAnswer = require('./StudentAnswer');
const Result = require('./Result');
const Notification = require('./Notification');
const Upload = require('./Upload');

// العلاقات بين الجداول
User.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Device, { foreignKey: 'userId' });
Device.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ActivationCode, { foreignKey: 'userId' });
ActivationCode.belongsTo(User, { foreignKey: 'userId' });

Device.hasMany(ActivationCode, { foreignKey: 'deviceId', sourceKey: 'deviceId' });
ActivationCode.belongsTo(Device, { foreignKey: 'deviceId', targetKey: 'deviceId' });

// علاقات المواد والوحدات والدروس والفيديوهات
Subject.hasMany(Unit, { foreignKey: 'subjectId' });
Unit.belongsTo(Subject, { foreignKey: 'subjectId' });

Unit.hasMany(Lesson, { foreignKey: 'unitId' });
Lesson.belongsTo(Unit, { foreignKey: 'unitId' });

Lesson.hasMany(Video, { foreignKey: 'lessonId' });
Video.belongsTo(Lesson, { foreignKey: 'lessonId' });

Lesson.hasMany(Quiz, { foreignKey: 'lessonId' });
Quiz.belongsTo(Lesson, { foreignKey: 'lessonId' });

Quiz.hasMany(Question, { foreignKey: 'quizId' });
Question.belongsTo(Quiz, { foreignKey: 'quizId' });

Question.hasMany(Option, { foreignKey: 'questionId' });
Option.belongsTo(Question, { foreignKey: 'questionId' });

User.hasMany(StudentAnswer, { foreignKey: 'userId' });
StudentAnswer.belongsTo(User, { foreignKey: 'userId' });

Question.hasMany(StudentAnswer, { foreignKey: 'questionId' });
StudentAnswer.belongsTo(Question, { foreignKey: 'questionId' });

Option.hasMany(StudentAnswer, { foreignKey: 'optionId' });
StudentAnswer.belongsTo(Option, { foreignKey: 'optionId' });

User.hasMany(Result, { foreignKey: 'userId' });
Result.belongsTo(User, { foreignKey: 'userId' });

Quiz.hasMany(Result, { foreignKey: 'quizId' });
Result.belongsTo(Quiz, { foreignKey: 'quizId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Upload, { foreignKey: 'userId' });
Upload.belongsTo(User, { foreignKey: 'userId' });

Lesson.hasMany(Upload, { foreignKey: 'lessonId' });
Upload.belongsTo(Lesson, { foreignKey: 'lessonId' });

module.exports = {
  User,
  Session,
  ActivationCode,
  Device,
  Subject,
  Unit,
  Lesson,
  Video,
  Quiz,
  Question,
  Option,
  StudentAnswer,
  Result,
  Notification,
  Upload
}; 