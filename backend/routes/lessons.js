const express = require('express');
const router = express.Router();
const { Subject, Unit, Lesson, Device, Video } = require('../models');
const auth = require('../middleware/auth');

// Get all lessons for a unit
router.get('/subjects/:subjectId/units/:unitId/lessons', async (req, res) => {
  try {
    const deviceId = req.header('X-Device-ID');
    let isSubscribed = false;
    if (deviceId) {
      const device = await Device.findOne({ where: { deviceId } });
      if (device && new Date() < new Date(device.subscriptionExpiresAt)) {
        isSubscribed = true;
      }
    }
    const unit = await Unit.findOne({ where: { id: req.params.unitId, subjectId: req.params.subjectId } });
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    const lessons = await Lesson.findAll({ where: { unitId: unit.id } });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new lesson
router.post('/subjects/:subjectId/units/:unitId/lessons', auth, async (req, res) => {
  try {
    if (!req.body.name || !req.body.description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    const unit = await Unit.findOne({ where: { id: req.params.unitId, subjectId: req.params.subjectId } });
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    const newLesson = await Lesson.create({
      unitId: unit.id,
      name: req.body.name,
      description: req.body.description,
      order: req.body.order || 0
    });
    res.status(201).json(newLesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a lesson
router.patch('/subjects/:subjectId/units/:unitId/lessons/:lessonId', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ where: { id: req.params.lessonId, unitId: req.params.unitId } });
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    if (req.body.name) lesson.name = req.body.name;
    if (req.body.description) lesson.description = req.body.description;
    if (req.body.order) lesson.order = req.body.order;
    await lesson.save();
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update lesson' });
  }
});

// Delete a lesson
router.delete('/subjects/:subjectId/units/:unitId/lessons/:lessonId', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ where: { id: req.params.lessonId, unitId: req.params.unitId } });
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    await lesson.destroy();
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete lesson' });
  }
});

module.exports = router; 