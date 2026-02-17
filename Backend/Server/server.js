const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config({ path: '../.env' });



const app = express();

app.use(express.json());
const PORT = process.env.PORT || 3000;


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow env var or local frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  // allow cookies, auth headers, etc.
}));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB Atlas.'))
  .catch((err) => console.error('❌ Could not connect to MongoDB Atlas:', err));

// Define Mongoose Schemas and Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { type: String, required: true },
  rating: { type: Number },
  price: { type: Number },
  image: { type: String },
  description: { type: String }
});
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

const savedCourseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }
}, {
  unique: {
    fields: ['username', 'course_id'],
    errorMessage: 'Course already saved for this user.'
  }
});
savedCourseSchema.index({ username: 1, course_id: 1 }, { unique: true }); // Ensure unique combination
const SavedCourse = mongoose.models.SavedCourse || mongoose.model('SavedCourse', savedCourseSchema);


// Fetch all courses
app.get('/api/courses', (req, res) => {
  Course.find({})
    .then(courses => {
      res.json(courses);
    })
    .catch(err => {
      console.error("Error fetching courses:", err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    });
});


// Signup endpoint
app.post('/api/users', async (req, res) => {
  const { username, name, email, password } = req.body;

  if (!username || !name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      name,
      email,
      password: hashedPassword
    });

    await user.save();
    res.json({ message: 'User registered successfully!' });
  } catch (err) {
    if (err.code === 11000) { // Mongoose duplicate key error
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});



const getUserByUsername = (username) => {
  return User.findOne({ username });
};

// You'll need to install these packages:
// npm install nodemailer crypto


// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ...

// Send OTP via email (Enhanced Template)
async function sendOTPEmail(email, otp, username) {
  const mailOptions = {
    from: `"MasterLearn Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Your Login Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 40px 30px; text-align: center; color: #333; }
          .greeting { font-size: 18px; margin-bottom: 20px; color: #555; }
          .otp-box { background: #f0f4ff; border: 2px dashed #667eea; border-radius: 12px; padding: 20px; margin: 30px 0; display: inline-block; }
          .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 0; font-family: 'Courier New', monospace; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
          .warning { color: #e53e3e; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MasterLearn</h1>
          </div>
          <div class="content">
            <p class="greeting">Hello, <strong>${username}</strong> 👋</p>
            <p>You requested a secure login to your account. Use the code below to verify your identity:</p>
            
            <div class="otp-box">
              <h2 class="otp-code">${otp}</h2>
            </div>
            
            <p>This code will expire in <strong>5 minutes</strong>.</p>
            <p class="warning">If you didn't request this code, please ignore this email or contact support immediately.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MasterLearn. All rights reserved.</p>
            <p>This is an automated message, please do not reply directly.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  await transporter.sendMail(mailOptions);
}

// ...

const jwtToken = jwt.sign(
  { username: otpData.username, email: otpData.email },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
);

// ...

// Middleware to authenticate and extract user from JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Authentication token missing." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// ...

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  res.json({ user: decoded });
} catch (error) {
  res.status(403).json({ message: 'Invalid token' });
}

// ...existing code...




// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
