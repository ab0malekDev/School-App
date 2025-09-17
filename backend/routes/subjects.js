const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../middleware/auth');

// Data file path
const dataPath = path.join(__dirname, '..', 'data', 'subjects.json');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'subjects');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to read subjects data
const readSubjects = async () => {
  try {
    const data = await fs.promises.readFile(dataPath, 'utf8');
    return JSON.parse(data).subjects;
  } catch (error) {
    console.error('Error reading subjects:', error);
    return [];
  }
};

// Helper function to write subjects data
const writeSubjects = async (subjects) => {
  try {
    await fs.promises.writeFile(dataPath, JSON.stringify({ subjects }, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing subjects:', error);
    return false;
  }
};

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    console.log('Fetching all subjects');
    const subjects = await readSubjects();
    console.log(`Found ${subjects.length} subjects:`, subjects);
    res.json(subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get a single subject by ID
router.get('/subjects/:id', async (req, res) => {
  try {
    console.log(`Fetching subject with ID: ${req.params.id}`);
    const subjects = await readSubjects();
    const subject = subjects.find(s => s.id === req.params.id);
    
    if (!subject) {
      console.log('Subject not found');
      return res.status(404).json({ message: 'Subject not found' });
    }

    console.log('Found subject:', subject);
    res.json(subject);
  } catch (err) {
    console.error('Error fetching subject:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get subjects by section
router.get('/subjects/section/:section', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Received request for section: ${req.params.section}`);
    console.log('Request headers:', req.headers);
    
    const subjects = await readSubjects();
    console.log('Parsed subjects:', subjects);
    
    const filteredSubjects = subjects.filter(subject => subject.section === req.params.section);
    console.log(`Found ${filteredSubjects.length} subjects for section ${req.params.section}:`, filteredSubjects);
    
    res.json(filteredSubjects);
    console.log('Response sent successfully');
  } catch (err) {
    console.error('Error fetching subjects by section:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create new subject
router.post('/subjects', upload.single('image'), async (req, res) => {
  try {
    console.log('Creating new subject:', req.body);
    console.log('Uploaded file:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const subjects = await readSubjects();
    const newSubject = {
      id: Date.now().toString(),
      name: req.body.name,
      section: req.body.section,
      image: req.file.filename,
      units: []
    };
    
    subjects.push(newSubject);
    await writeSubjects(subjects);
    
    console.log('Subject created successfully');
    res.status(201).json(newSubject);
  } catch (err) {
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.promises.unlink(req.file.path);
    }
    console.error('Error creating subject:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update subject
router.patch('/subjects/:id', upload.single('image'), async (req, res) => {
  try {
    console.log(`Updating subject ${req.params.id}:`, req.body);
    const subjects = await readSubjects();
    const subjectIndex = subjects.findIndex(s => s.id === req.params.id);
    
    if (subjectIndex === -1) {
      console.log('Subject not found');
      return res.status(404).json({ message: 'Subject not found' });
    }

    const updatedSubject = {
      ...subjects[subjectIndex],
      ...req.body
    };

    if (req.file) {
      // Delete old image
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'subjects', subjects[subjectIndex].image);
      if (fs.promises.access(oldImagePath).then(() => true).catch(() => false)) {
        await fs.promises.unlink(oldImagePath);
      }
      updatedSubject.image = req.file.filename;
    }

    subjects[subjectIndex] = updatedSubject;
    await writeSubjects(subjects);
    
    console.log('Subject updated successfully');
    res.json(updatedSubject);
  } catch (err) {
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.promises.unlink(req.file.path);
    }
    console.error('Error updating subject:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update subject (PUT method for compatibility)
router.put('/subjects/:id', upload.single('image'), async (req, res) => {
  try {
    console.log(`Updating subject ${req.params.id} (PUT):`, req.body);
    const subjects = await readSubjects();
    const subjectIndex = subjects.findIndex(s => s.id === req.params.id);
    
    if (subjectIndex === -1) {
      console.log('Subject not found');
      return res.status(404).json({ message: 'Subject not found' });
    }

    const updatedSubject = {
      ...subjects[subjectIndex],
      ...req.body
    };

    if (req.file) {
      // Delete old image
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'subjects', subjects[subjectIndex].image);
      if (fs.promises.access(oldImagePath).then(() => true).catch(() => false)) {
        await fs.promises.unlink(oldImagePath);
      }
      updatedSubject.image = req.file.filename;
    }

    subjects[subjectIndex] = updatedSubject;
    await writeSubjects(subjects);
    
    console.log('Subject updated successfully (PUT)');
    res.json(updatedSubject);
  } catch (err) {
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.promises.unlink(req.file.path);
    }
    console.error('Error updating subject (PUT):', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete subject
router.delete('/subjects/:id', async (req, res) => {
  try {
    console.log(`Deleting subject ${req.params.id}`);
    const subjects = await readSubjects();
    const subjectIndex = subjects.findIndex(s => s.id === req.params.id);
    
    if (subjectIndex === -1) {
      console.log('Subject not found');
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Delete subject image
    const imagePath = path.join(__dirname, '..', 'uploads', 'subjects', subjects[subjectIndex].image);
    if (fs.promises.access(imagePath).then(() => true).catch(() => false)) {
      await fs.promises.unlink(imagePath);
    }

    subjects.splice(subjectIndex, 1);
    await writeSubjects(subjects);
    
    console.log('Subject deleted successfully');
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error('Error deleting subject:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 