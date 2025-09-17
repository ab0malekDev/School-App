const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const subjectsFilePath = path.join(__dirname, '../data/subjects.json');

// Helper functions to read/write JSON
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') { return { subjects: [] }; }
    console.error(`Error reading JSON file:`, error);
    return null;
  }
};

const writeJsonFile = async (filePath, data) => {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing JSON file:`, error);
    return false;
  }
};


// Get all quizzes for a lesson
router.get('/subjects/:subjectId/units/:unitId/lessons/:lessonId/quizzes', async (req, res) => {
  try {
    const data = await readJsonFile(subjectsFilePath);
    const subject = data.subjects.find(s => s.id === req.params.subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const unit = subject.units.find(u => u.id === req.params.unitId);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });
    const lesson = unit.lessons.find(l => l.id === req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    res.json(lesson.quizzes || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new quiz
router.post('/subjects/:subjectId/units/:unitId/lessons/:lessonId/quizzes', auth, async (req, res) => {
  try {
    const data = await readJsonFile(subjectsFilePath);
    const subject = data.subjects.find(s => s.id === req.params.subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const unit = subject.units.find(u => u.id === req.params.unitId);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });
    const lesson = unit.lessons.find(l => l.id === req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const newQuiz = {
      id: Date.now().toString(),
      title: req.body.title,
      description: req.body.description,
      questions: req.body.questions || [],
      order: req.body.order || 0
    };

    if (!lesson.quizzes) lesson.quizzes = [];
    lesson.quizzes.push(newQuiz);
    
    await writeJsonFile(subjectsFilePath, data);
    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a quiz
router.delete('/subjects/:subjectId/units/:unitId/lessons/:lessonId/quizzes/:quizId', auth, async (req, res) => {
  try {
    const { subjectId, unitId, lessonId, quizId } = req.params;
    const data = await readJsonFile(subjectsFilePath);
    
    const subject = data.subjects.find(s => s.id === subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const unit = subject.units.find(u => u.id === unitId);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });
    const lesson = unit.lessons.find(l => l.id === lessonId);
    if (!lesson || !lesson.quizzes) return res.status(404).json({ message: 'Lesson not found' });

    const quizIndex = lesson.quizzes.findIndex(q => q.id === quizId);
    if (quizIndex === -1) return res.status(404).json({ message: 'Quiz not found' });

    lesson.quizzes.splice(quizIndex, 1);
    await writeJsonFile(subjectsFilePath, data);
    
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router; 