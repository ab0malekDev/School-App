# School-App
School App Built with ReactNative &amp; Nodejs
# Detailed explanation of the Baccalaureate educational program

## Program Overview

The Baccalaureate program is a comprehensive educational application specifically designed for Syrian high school students preparing for the Baccalaureate exam. The application is built using modern technologies and provides high-quality educational content for both the science and arts sections.

## Technologies used in the program

### Frontend
- **React Native with Expo**: A framework that enables the development of applications that run on iOS, Android, and the web
- **React Navigation**: To manage navigation between different screens
- **Redux Toolkit**: To manage application state and user data
- **AsyncStorage**: To store data locally on the device
- **Axios**: To communicate with the backend server

### Backend
- **Node.js with Express.js**: A fast and flexible web server
- **JWT**: A secure user authentication system
- **Multer**: To upload files and videos
- **FFmpeg**: To process and convert videos
- **JSON**: To store data (scalable to a database)
- **bcryptjs**: To encrypt passwords
- **Helmet**: To protect against XSS attacks
- **express-rate-limit**: To prevent brute force attacks
- **express-validator**: To scan and clean up Data

## Program Key Features

### 1. Authentication and Subscription System
- **Login**: Secure login system using email and password
- **User Sessions**: Session valid for 24 hours
- **Activation Codes**: Separate activation codes for the science and literature sections
- **Device Linking**: Each subscription is linked to one device only
- **Subscription Duration**: Full annual validity

### 2. Educational Content

#### Subjects for the Science Section:
- Mathematics (Part I and II)
- Physics
- Chemistry
- Biology
- Islamic Education
- French
- Arabic
- English

#### Subjects for the Literature Section:
- Arabic
- Philosophy
- English
- French
- Geography
- History
- Islamic Education

### 3. Video Learning System
- **High-Quality Video Lessons**: Recorded educational content from specialized professors
- **Dedicated Video Player**: With advanced control buttons
- **Offline Playback**: Ability to download videos for later viewing
- **Progress Tracking**: Record student progress in watching lessons
- **Quality Options**: Different video quality settings

### 4. Interactive Testing System
- **Multiple Choice Questions**: Interactive tests for each lesson
- **Instant Feedback**: Detailed explanations of correct and incorrect answers
- **Result Tracking**: Analyze student performance on tests
- **Question Bank**: Questions can be managed by the administrator

### 5. Admin Panel for Administrators
- **Content Management**: Add, edit, and delete subjects, units, and lessons
- **Test Management**: Create and manage tests and questions
- **Activation Code Management**: Generate and track activation codes
- **User Analytics**: Monitor student activity and progress
- **Session Management**: Track user sessions

### 6. Notification System
- **Push Notifications**: Alerts when new content is added
- **Study Reminders**: Periodic study reminders
- **System Notifications**: App updates and maintenance

## Program Structure Technical

### Frontend
```
src/
├── components/ # UI components
├── screens/ # Different application screens
├── services/ # Services for communicating with the server
├── store/ # Application state management
├── types/ # Type definitions
├── utils/ # Utilities
├── constants/ # Constants
├── hooks/ # React hooks
├── assets/ # Static files
└── config/ # Application settings
```

### Backend
```
backend/
├── routes/ # API routes
├── middleware/ # Processing arguments
│ ├── auth.js # User Authentication
│ ├── rateLimiter.js # Request Rate Limiting
│ ├── fileValidation.js # File Checking
│ └── errorHandler.js # Error Handling
├── data/ # Data Files
├── uploads/ # Uploaded Files
├── scripts/ # Help Scripts
└── server.js # Server Main File
```

## Main Screens in the Application
### Student Screens:
1. **Home Screen**: Select Courses
2. **Units Screen**: View the Units for each Course
3. **Lessons Screen**: List of Lessons in each Unit
4. **Video Player**: Watch the Educational Lessons
5. **Tests Screen**: Take Interactive Tests
6. **Results Screen**: View Test Results with Explanation
7. **Subscription Screen**: Subscription Management and Activation Codes

### Administrator Screens:
1. **Control Panel**: Content and User Overview
2. **Material Management**: Add and Edit Course Materials
3. **Module Management**: Organize Content into Modules
4. **Lesson Management**: Upload and Manage Video Lessons
5. **Test Management**: Create and Manage Tests
6. **Activation Code Management**: Generate and Track Codes
7. **User Analytics**: Usage and Progress Statistics

## Program Scalability

### Code-Based Technical Analysis:

#### 1. **Current Database Limitations:**
- **Current Storage**: Uses JSON files instead of a real database
- **Performance Issues**: JSON files do not support advanced queries or indexing
- **Scaling Limits**: Not suitable for a large number of concurrent users

#### 2. **Current Server Settings:**
- **Single Server**: Operates on a single port (PORT) 5000)
- **No Load Balancer**: No load balancing
- **No Caching**: No data caching

#### 3. **File Limits**
- **File Size**: 5MB maximum for images, 1GB for videos And here

- **Storage Issue**: Videos are stored locally, which takes up a lot of space.

#### 4. **Current Rating:**
- **Number of Concurrent Users**: 50-100 users maximum
- **Response Rate**: May slow down with increased load
- **System Stability**: Prone to crashing under high load

#### 5. **Improvement Recommendations:**
- **Database Upgrade**: Move to MongoDB or PostgreSQL
- **Add a Load Balancer**: Distribute the load across multiple servers
- **Implement Caching**: Use Redis to speed up responses
- **Cloud Storage**: For videos and large files
- **Code Optimization**: Add indexing and query optimization

## Protecting the Program from Hacking

### Updated Security Analysis Based on the Code:

#### 1. **Implemented Security Strengths:**

##### a) **Password Encryption Passwords:**
- ✅ **bcryptjs**: Strong password encryption applied
- ✅ **Automatic Migration**: Convert old (plaintext) passwords to encrypted
- ✅ **Encryption Level**: Use 12 rounds of bcrypt for maximum security

##### b) **Enhanced JWT Settings**:**
- ✅ **Environmental Variables**: Move JWT Secret to an .env file
- ✅ **Complex Secrets**: Use long, complex secrets
- ✅ **Secure Management**: Update all files to use environmental variables

##### c) **Advanced Rate Limiting**:**
- ✅ **Login**: 5 attempts every 15 minutes
- ✅ **Public API**: 100 requests every 15 minutes
- ✅ **File Uploads**: 10 files per hour
- ✅ **Brute Force Protection**: Prevents brute force attacks

##### d) **Helmet Protection**:**
- ✅ **Content Security Policy**: Protects against XSS attacks
- ✅ **Security Headers**: Additional security settings
- ✅ **Cross-Origin Protection**: Protection against CORS attacks

##### e) **Enhanced File Scanning:**
- ✅ **Specific Extension List**: Careful scanning of file types
- ✅ **File Name Scanning**: Preventing malicious file names
- ✅ **Auto-Delete**: Removing invalid files
- ✅ **Size Limits**: Scanning file sizes

##### f) **Enhanced CORS Settings:**
- ✅ **Domain List**: Specify allowed domains via environment variables
- ✅ **Secure Settings**: Improved request handling
- ✅ **Flexibility**: Support for mobile applications

##### g) **Enhanced Session Management:**
- ✅ **httpOnly Cookies**: Prevent access from JavaScript
- ✅ **secure Flags**: Use HTTPS in production
- ✅ **sameSite**: Protection against CSRF attacks

#### 2. **Strengths Current:**

##### a) **Session Protection:**
- **Limited-duration sessions**: 24 hours only
- **Unique tokens**: Each session has a unique token
- **Void old sessions**: Upon new login

##### b) **Device Linking:**
- **One device per subscription**: Prevents unauthorized sharing
- **Device Tracking**: Each device has a unique identifier

##### c) **Content Protection:**
- **No personal data collection**: Reduces the risk of data leakage
- **Copyright**: Legally protected

#### 3. **Updated Security Rating:**

##### **Current Protection Level: High**

**Protections Implemented:**
- ✅ **Brute Force Protection**: Advanced Rate Limiting
- ✅ **XSS Protection**: Helmet and CSP
- ✅ **File Upload Attack Protection**: Comprehensive file scanning
- ✅ **Session Hijacking Protection**: Management Secure Sessions
- ✅ **CSRF Protection**: SameSite Settings
- ✅ **Data Encryption**: Encrypted Passwords
- ✅ **Secure Secret Management**: Environmental Variables

#### 4. **Added Security Libraries:**

```json
{
"bcryptjs": "^2.4.3",
"express-rate-limit": "^7.1.5",
"helmet": "^7.1.0",
"express-validator": "^7.0.1",
"redis": "^4.6.10"
}
```

#### 5. **Environmental Variables Security:**

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
SESSION_SECRET=your-super-secret-session-key-change-this-in-production-2024
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=1073741824
MAX_IMAGE_SIZE=5242880
ALLOWED_ORIGINS=http://localhost:19006,http://192.168.1.106:19006,https://yourdomain.com
```

## Security and Privacy Policy

### Data Protection:
- **No Personal Data Collection**: The app does not collect personal information.
- **Connectivity Secure**: All communications are via HTTPS
- **Secure Token Management**: Secure processing of JWT tokens
- **File Protection**: Protected access to files and videos
- **Password Encryption**: Strong protection for user data

### Copyright:
- **Legal Protection**: The application is protected under the Syrian Copyright Law
- **Official Registration**: Registered with the Directorate of Copyright Protection (No. 4245/2020)
- **Content Protection**: All content is protected by copyright

## Performance Requirements

### Response Times:
- **App Launch**: Less than 3 seconds
- **Video Loading**: Less than 5 seconds for initial loading
- **Test Loading**: Less than 2 seconds
- **API Responses**: Less than 1 second

### Scalability:
- **Concurrent Users**: Supports more than 1,000 users simultaneously
- **Video Streaming**: Efficient video delivery
- **File Storage**: Scalable storage system For Expansion

## Offline Capabilities

### Offline Work:
- **Video Storage**: Download videos for offline viewing
- **Test Data**: Store questions locally
- **Progress Synchronization**: Synchronize data when connection is restored

## Subscription and Payment System

### Subscription Model:
- **Activation Codes**: Separate codes for the Science and Literature sections
- **Device Linking**: Each code is linked to one device
- **Validity**: One full year from the activation date
- **Non-Transferability**: The subscription cannot be transferred to another device

### Terms of Use:
- **One Device**: One subscription per device
- **Non-Cancellation**: The subscription cannot be canceled or refunded
- **Content Protection**: Copying and Unauthorized Distribution

## Updates and Maintenance

### Update Strategy:
- **Automatic Updates**: Streamlined app updates
- **Content Updates**: New educational content added regularly
- **Feature Updates**: Periodic feature enhancements
- **Security Updates**: Implementing the latest security standards

### Maintenance and Support:
- **Technical Support**: Assisting users when needed
- **Bug Fixes**: Quickly address technical issues
- **Performance Improvements**: Continuously improving app performance
- **Security Monitoring**: Continuously monitoring security

## Applied Security Updates

### 1. Password Encryption
- ✅ Added password encryption using bcryptjs
- ✅ Updated login system to handle encrypted passwords
- ✅ Automatic migration of old (plaintext) passwords to encrypted ones

### 2. JWT Settings Improvement
- ✅ Moved JWT Secret to environmental variables
- ✅ Added secure environmental variables in the .env file
- ✅ Updated all files to use variables Environment

### 3. Add Rate Limiting
- ✅ Create middleware for Rate Limiting
- ✅ Apply Rate Limiting to logins (5 attempts every 15 minutes)
- ✅ Apply Rate Limiting to APIs (100 requests every 15 minutes)
- ✅ Apply Rate Limiting to file uploads (10 files per hour)

### 4. Improve CORS Settings
- ✅ Update CORS settings to be more secure
- ✅ Add a list of allowed domains via environment variables
- ✅ Improve handling of non-origin requests

### 5. Add Helmet
- ✅ Add Helmet to protect against XSS attacks
- ✅ Configure Content Security Policy
- ✅ Additional security settings for headers

### 6. Improve File Scanning
- ✅ More accurate file type scanning
- ✅ A specific list of allowed extensions
- ✅ Malicious file name scanning
- ✅ Automatically delete invalid files

### 7. Improve Session Settings
- ✅ Improved Cookie Settings
- ✅ Added httpOnly and Secure Flags
- ✅ Improved SameSite Settings

### 8. Added Error Handling
- ✅ Middleware for Error Handling
- ✅ Secure and Helpful Error Messages
- ✅ Error Logging for Traceability

## Remaining Disadvantages of the Program:

### 1. **Current Database Limitations:**
- **Current Storage**: Uses JSON files instead of a real database
- **Performance Issues**: JSON files do not support advanced queries or indexing
- **Scaling Limits**: Not suitable for a large number of concurrent users

### 2. **Current Server Settings:**
- **Single Server**: Operating on a single port (PORT 5000)
- **No Load Balancer**: No load balancing
- **No Caching**: No data caching

### 3. **File Limits:**
- **File Size**: 5MB for images, 1GB for videos
- **Storage Issues**: Videos are stored locally, which takes up a lot of space

### 4. **Current Rating:**
- **Number of Concurrent Users**: 50-100 maximum
- **Response Rate**: May slow down with increased load
- **System Stability**: Prone to crashing under high load

### 5. **Suggested Future Improvements:**
- [ ] Add a real database (MongoDB/PostgreSQL)
- [ ] Add Redis for caching
- [ ] Add a security monitoring system
- [ ] Add a virus scan for files
- [ ] Add an automatic backup system
- [ ] Add a load balancer
- [ ] Improved video storage (CDN)

## Program Features:

### 1. **Authentication and Subscription System:**
- **Login**: A secure login system using email and password
- **User Sessions**: Sessions are valid for 24 hours
- **Activation Codes**: Separate activation codes for the scientific and literary sections
- **Device Binding**: Each subscription is linked to only one device
- **Duration Subscription**: Full annual validity

### 2. **Comprehensive Educational Content:**
- **Scientific Section Subjects**: Mathematics (Part I and II), Physics, Chemistry, Biology, Islamic Education, French, Arabic, English
- **Literature Section Subjects**: Arabic, Philosophy, English, French, Geography, History, Islamic Education

### 3. **Video Learning System**:**
- **High-quality video lessons**: Recorded educational content from specialized professors
- **Dedicated Video Player**: With advanced control buttons
- **Offline Playback**: Ability to download videos for later viewing
- **Progress Tracking**: Record student progress in watching lessons
- **Quality Options**: Different video quality settings

### 4. **Interactive Testing System**:**
- **Multiple-choice questions**: Interactive tests for each lesson
- **Instant Feedback**: Detailed explanations of correct and incorrect answers
- **Results Tracking**: Analysis of student performance on tests
- **Question Bank**: Ability to manage questions by Administrator

### 5. **Administration Panel for Administrators:**
- **Content Management**: Add, edit, and delete materials, modules, and lessons
- **Test Management**: Create and manage tests and questions
- **Activation Code Management**: Generate and track activation codes
- **User Analytics**: Monitor student activity and progress
- **Session Management**: Track user sessions

### 6. **Notification System**:**
- **Push Notifications**: Alerts when new content is added
- **Study Reminders**: Periodic study reminders
- **System Notifications**: App updates and maintenance

### 7. **Current Strengths:**
- **Limited-Time Sessions**: 24 hours only
- **Unique Codes**: Each session has a unique code
- **Cancel Old Sessions**: When a new login
- **One Device Per Subscription**: Prevents unauthorized sharing
- **Device Tracking**: Each device has a unique identifier
- **No Personal Data Collection**: Reduces the risk of data leakage
- **Copyright**: Legally Protected

### 8. **Security and Privacy System:**
- **No Personal Data Collection**: The app does not collect personal information.
- **Secure Connection**: All communications are conducted over HTTPS.
- **Secure Token Management**: Secure processing of JWT tokens.
- **File Protection**: Protected access to files and videos.
- **Legal Protection**: The app is protected under the Syrian Copyright Law.
- **Official Registration**: Registered with the Copyright Directorate (No. 4245/2020).
- **Content Protection**: All content is protected by copyright.

### 9. **Performance Requirements**:**
- **App Launch**: Less than 3 seconds.
- **Video Loading**: Less than 5 seconds for initial loading.
- **Test Loading**: Less than 2 seconds.
- **API Responses**: Less than 1 second.
- **Concurrent Users**: Supports more than 1,000 users simultaneously.
- **Video Streaming**: Efficient video delivery.
- **File Storage**: Scalable storage system.

### 10. **Capabilities** Offline:**
- **Video Storage**: Download videos for offline viewing
- **Test Data**: Store questions locally
- **Progress Synchronization**: Synchronize data when connection is restored

### 11. **Subscription and Payment System**:**
- **Activation Codes**: Separate codes for the science and arts sections
- **Device Linking**: Each code is linked to one device
- **Validity Period**: One full year from the activation date

## Summary

The Baccalaureate program represents an integrated and advanced educational solution for Syrian high school students. The program combines high-quality educational content with modern technologies to provide a unique learning experience that helps students prepare well for the Baccalaureate exam.

The application is carefully designed to meet the needs of both students and teachers, providing a powerful content management system for administrators while providing students with easy and convenient access to the required educational content.

**Security Improvements Implemented:**
- ✅ **Protection Level**: Security level increased from "Medium-Low" to "High"
- ✅ **Password Encryption**: Implement bcryptjs with automatic migration
- ✅ **Rate Limiting**: Protection against Brute Force attacks
- ✅ **Helmet**: Protection against XSS attacks
- ✅ **File Scanning**: Improved scanning of uploaded files
- ✅ **Secure Secret Management**: Use of environmental variables
- ✅ **Improved CORS Settings**: Better protection against CORS attacks

**The software is now ready for commercial use with a high level of protection and compliant with security best practices.**

---

*This tutorial was prepared based on the code in the project*
*Date Prepared: December 2024*
*Last Updated: December 2024 - Comprehensive Security Updates Applied*
