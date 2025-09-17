const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const multer = require('multer');
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const unitsRoutes = require('./routes/units');
const subjectsRoutes = require('./routes/subjects');
const lessonsRoutes = require('./routes/lessons');
const videosRoutes = require('./routes/videos');
const quizzesRoutes = require('./routes/quizzes');
const devicesRoutes = require('./routes/devices');
const sessionsRoutes = require('./routes/sessions');
const activationCodesRoutes = require('./routes/activationCodes');
const notificationsRoutes = require('./routes/notifications');
const tokensRoutes = require('./routes/tokens');
const session = require('express-session');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads', 'subjects');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Keep original file extension
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type more thoroughly
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:19006', 'http://192.168.1.106:19006'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Body parser limits
app.use(express.json({ limit: parseInt(process.env.MAX_FILE_SIZE) || '1024mb' }));
app.use(express.urlencoded({ extended: true, limit: parseInt(process.env.MAX_FILE_SIZE) || '1024mb' }));

// Rate limiting
app.use('/api', apiLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Data file path
const dataPath = path.join(__dirname, 'data', 'subjects.json');

// Ensure data directory exists
const ensureDataDirectory = async () => {
  const dir = path.join(__dirname, 'data');
  try {
    await fsPromises.access(dir);
    console.log('Data directory exists');
  } catch {
    await fsPromises.mkdir(dir);
    console.log('Created data directory');
  }
};

// Initialize data file if it doesn't exist
const initializeDataFile = async () => {
  try {
    await fsPromises.access(dataPath);
    const data = await fsPromises.readFile(dataPath, 'utf8');
    console.log('Data file exists');
    console.log('Current data:', data);
  } catch {
    const initialData = { subjects: [] };
    await fsPromises.writeFile(dataPath, JSON.stringify(initialData, null, 2));
    console.log('Created data file with initial structure');
  }
};

// Initialize data storage
const initializeDataStorage = async () => {
  await ensureDataDirectory();
  await initializeDataFile();
  console.log('Data storage initialized successfully');
};

initializeDataStorage();

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  next();
});

// Routes
app.use('/api', unitsRoutes); // Add units routes
app.use('/api', subjectsRoutes); // Add subjects routes
app.use('/api', lessonsRoutes); // Add lessons routes
app.use('/api', videosRoutes); // Add videos routes
app.use('/api', quizzesRoutes);
app.use('/api/devices', devicesRoutes); // Use devices routes
app.use('/api/auth', authRoutes);
app.use('/api', sessionsRoutes); // Add sessions routes
app.use('/api/activation-codes', activationCodesRoutes); // Add activation codes routes
app.use('/api/notifications', notificationsRoutes);
app.use('/api/tokens', tokensRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`API available at http://10.0.2.2:${PORT}/api`);
  console.log('Security features enabled: Helmet, Rate Limiting, CORS');
}); 