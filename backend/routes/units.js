const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// Data file path
const dataPath = path.join(__dirname, '..', 'data', 'subjects.json');

// Helper function to read subjects data
const readSubjects = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data).subjects;
  } catch (error) {
    console.error('Error reading subjects:', error);
    return [];
  }
};

// Helper function to write subjects data
const writeSubjects = async (subjects) => {
  try {
    await fs.writeFile(dataPath, JSON.stringify({ subjects }, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing subjects:', error);
    return false;
  }
};

// Get units for a subject
router.get('/subjects/:subjectId/units', async (req, res) => {
  try {
    console.log(`Fetching units for subject ${req.params.subjectId}`);
    const subjects = await readSubjects();
    const subject = subjects.find(s => s.id === req.params.subjectId);
    
    if (!subject) {
      console.log('Subject not found');
      return res.status(404).json({ message: 'Subject not found' });
    }

    console.log(`Found ${subject.units.length} units for subject ${subject.name}`);
    res.json(subject.units);
  } catch (err) {
    console.error('Error fetching units:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new unit
router.post('/subjects/:subjectId/units', async (req, res) => {
  try {
    console.log(`Creating unit for subject ${req.params.subjectId}:`, req.body);
    const subjects = await readSubjects();
    const subjectIndex = subjects.findIndex(s => s.id === req.params.subjectId);
    
    if (subjectIndex === -1) {
      console.log('Subject not found');
      return res.status(404).json({ message: 'Subject not found' });
    }

    const newUnit = {
      id: Date.now().toString(),
      name: req.body.name,
      order: req.body.order || subjects[subjectIndex].units.length + 1
    };

    if (!subjects[subjectIndex].units) {
      subjects[subjectIndex].units = [];
    }

    subjects[subjectIndex].units.push(newUnit);
    await writeSubjects(subjects);
    
    console.log('Unit created successfully');
    res.status(201).json(newUnit);
  } catch (err) {
    console.error('Error creating unit:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update a unit
router.put('/subjects/:subjectId/units/:unitId', async (req, res) => {
  try {
    console.log(`Updating unit ${req.params.unitId} for subject ${req.params.subjectId}`);
    const subjects = await readSubjects();
    const subjectIndex = subjects.findIndex(s => s.id === req.params.subjectId);
    
    if (subjectIndex === -1) {
      console.log('Subject not found');
      return res.status(404).json({ message: 'Subject not found' });
    }

    const unitIndex = subjects[subjectIndex].units.findIndex(u => u.id === req.params.unitId);
    if (unitIndex === -1) {
      console.log('Unit not found');
      return res.status(404).json({ message: 'Unit not found' });
    }

    const updatedUnit = {
      ...subjects[subjectIndex].units[unitIndex],
      ...req.body
    };

    subjects[subjectIndex].units[unitIndex] = updatedUnit;
    await writeSubjects(subjects);
    
    console.log('Unit updated successfully');
    res.json(updatedUnit);
  } catch (err) {
    console.error('Error updating unit:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a unit
router.delete('/subjects/:subjectId/units/:unitId', async (req, res) => {
  try {
    console.log(`Deleting unit ${req.params.unitId} from subject ${req.params.subjectId}`);
    const subjects = await readSubjects();
    const subjectIndex = subjects.findIndex(s => s.id === req.params.subjectId);
    
    if (subjectIndex === -1) {
      console.log('Subject not found');
      return res.status(404).json({ message: 'Subject not found' });
    }

    const unitIndex = subjects[subjectIndex].units.findIndex(u => u.id === req.params.unitId);
    if (unitIndex === -1) {
      console.log('Unit not found');
      return res.status(404).json({ message: 'Unit not found' });
    }

    subjects[subjectIndex].units.splice(unitIndex, 1);
    await writeSubjects(subjects);
    
    console.log('Unit deleted successfully');
    res.json({ message: 'Unit deleted' });
  } catch (err) {
    console.error('Error deleting unit:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 