const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);

const subjectsFilePath = path.join(__dirname, '../data/subjects.json');

// Helper function to read JSON file
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') { return { subjects: [] }; }
    console.error(`Error reading JSON file at ${filePath}:`, error);
    return null;
  }
};

// Helper function to write JSON file
const writeJsonFile = async (filePath, data) => {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing JSON file to ${filePath}:`, error);
    return false;
  }
};


// Get all videos for a lesson
router.get('/subjects/:subjectId/units/:unitId/lessons/:lessonId/videos', async (req, res) => {
  try {
    const data = await readJsonFile(subjectsFilePath);
    if (!data || !data.subjects) {
      return res.status(500).json({ message: 'Failed to read subjects data' });
    }

    const subject = data.subjects.find(s => s.id === req.params.subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const unit = subject.units.find(u => u.id === req.params.unitId);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    const lesson = unit.lessons.find(l => l.id === req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    res.json(lesson.videos || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Handle chunked upload
router.post('/subjects/:subjectId/units/:unitId/lessons/:lessonId/videos/chunk', 
  auth,
  async (req, res) => {
    try {
      const { chunkNumber, totalChunks, fileName, title, description, order, chunkBase64 } = req.body;
      
      if (!chunkBase64) {
        return res.status(400).json({ message: 'Missing chunk data' });
      }

      const tempDir = path.join(__dirname, '../uploads/temp', req.params.lessonId);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const chunkPath = path.join(tempDir, `${fileName}.part${chunkNumber}`);
      const buffer = Buffer.from(chunkBase64, 'base64');
      fs.writeFileSync(chunkPath, buffer);

      if (parseInt(chunkNumber) === parseInt(totalChunks)) {
        const finalDir = path.join(__dirname, '../uploads/videos');
        if (!fs.existsSync(finalDir)) {
          fs.mkdirSync(finalDir, { recursive: true });
        }
        
        const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const finalPath = path.join(finalDir, uniqueName);
        const writeStream = fs.createWriteStream(finalPath);

        for (let i = 1; i <= totalChunks; i++) {
          const partPath = path.join(tempDir, `${fileName}.part${i}`);
          await pipeline(fs.createReadStream(partPath), writeStream, { end: false });
          fs.unlinkSync(partPath);
        }
        writeStream.end();
        await new Promise(resolve => writeStream.on('finish', resolve));

        const stats = fs.statSync(finalPath);
        const videoData = {
          id: Date.now().toString(),
          title: title || fileName,
          description: description || '',
          order: parseInt(order) || 0,
          url: `/uploads/videos/${uniqueName}`,
          duration: 0, // Placeholder, can be extracted with ffprobe if needed
          size: stats.size,
          format: path.extname(fileName).slice(1),
          uploadDate: new Date().toISOString(),
        };

        const data = await readJsonFile(subjectsFilePath);
        const subject = data.subjects.find(s => s.id === req.params.subjectId);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        const unit = subject.units.find(u => u.id === req.params.unitId);
        if (!unit) return res.status(404).json({ message: 'Unit not found' });
        const lesson = unit.lessons.find(l => l.id === req.params.lessonId);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        
        if (!lesson.videos) lesson.videos = [];
        lesson.videos.push(videoData);
        
        await writeJsonFile(subjectsFilePath, data);
        fs.rmdirSync(tempDir, { recursive: true });
        
        return res.status(201).json(videoData);
      }

      res.status(200).json({ message: 'Chunk uploaded successfully' });
    } catch (error) {
      console.error('Chunk upload error:', error);
      res.status(400).json({ message: 'Failed to upload chunk' });
    }
  }
);

// Delete video
router.delete('/subjects/:subjectId/units/:unitId/lessons/:lessonId/videos/:videoId', auth, async (req, res) => {
  try {
    const { subjectId, unitId, lessonId, videoId } = req.params;
    const data = await readJsonFile(subjectsFilePath);
    
    const subject = data.subjects.find(s => s.id === subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    
    const unit = subject.units.find(u => u.id === unitId);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    const lesson = unit.lessons.find(l => l.id === lessonId);
    if (!lesson || !lesson.videos) return res.status(404).json({ message: 'Lesson not found' });

    const videoIndex = lesson.videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) return res.status(404).json({ message: 'Video not found' });

    const videoToDelete = lesson.videos[videoIndex];
    // Construct the full path to the video file
    const videoPath = path.join(__dirname, '..', videoToDelete.url);

    // Delete video file from the filesystem
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    // Remove video reference from the lesson in subjects.json
    lesson.videos.splice(videoIndex, 1);
    await writeJsonFile(subjectsFilePath, data);
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;