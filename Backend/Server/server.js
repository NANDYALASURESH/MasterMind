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
app.use(cookieParser());
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB Atlas.'))
  .catch((err) => console.error('❌ Could not connect to MongoDB Atlas:', err));

// Define Mongoose Schemas and Models (Singleton Pattern for Vercel)
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
savedCourseSchema.index({ username: 1, course_id: 1 }, { unique: true });
const SavedCourse = mongoose.models.SavedCourse || mongoose.model('SavedCourse', savedCourseSchema);

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const otpStore = new Map();

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

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
          .content { padding: 40px 30px; text-align: center; color: #333; }
          .otp-box { background: #f0f4ff; border: 2px dashed #667eea; border-radius: 12px; padding: 20px; margin: 30px 0; display: inline-block; }
          .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 0; font-family: 'Courier New', monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>MasterLearn</h1></div>
          <div class="content">
            <p>Hello, <strong>${username}</strong> 👋</p>
            <p>Use the code below to verify your identity:</p>
            <div class="otp-box"><h2 class="otp-code">${otp}</h2></div>
            <p>This code will expire in 5 minutes.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  await transporter.sendMail(mailOptions);
}

// Routes
app.get('/api/courses', (req, res) => {
  Course.find({}).then(courses => res.json(courses)).catch(err => res.status(500).json({ message: "Error" }));
});

app.post('/api/users', async (req, res) => {
  const { username, name, email, password } = req.body;

  if (!username || !name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpKey = `signup_${username}_${Date.now()}`;

    // Store pending user data in otpStore
    otpStore.set(otpKey, {
      type: 'signup',
      username,
      name,
      email,
      password: hashedPassword,
      otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    await sendOTPEmail(email, otp, name);

    res.json({
      success: true,
      message: 'OTP sent to your email',
      otpKey,
      requiresOTP: true
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const dbUser = await User.findOne({ username });
    if (dbUser && await bcrypt.compare(password, dbUser.password)) {
      const otp = generateOTP();
      const otpKey = `${username}_${Date.now()}`;
      otpStore.set(otpKey, { otp, username, email: dbUser.email, expires: Date.now() + 5 * 60 * 1000 });
      await sendOTPEmail(dbUser.email, otp, dbUser.username);
      return res.json({ success: true, message: "OTP sent", otpKey, requiresOTP: true });
    }
    res.status(400).json({ success: false, message: "Invalid credentials" });
  } catch (err) { res.status(500).json({ success: false, message: "Error" }); }
});

app.post("/api/verify-otp", async (req, res) => {
  const { otpKey, otp } = req.body;
  const otpData = otpStore.get(otpKey);

  if (!otpData || otpData.otp !== otp.trim() || Date.now() > otpData.expires) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  try {
    // If it's a signup, create the user now
    if (otpData.type === 'signup') {
      const user = new User({
        username: otpData.username,
        name: otpData.name,
        email: otpData.email,
        password: otpData.password // already hashed
      });
      await user.save();
    }

    const token = jwt.sign(
      { username: otpData.username, email: otpData.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    otpStore.delete(otpKey);
    return res.json({ success: true, token });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "User already registered during verification" });
    }
    res.status(500).json({ success: false, message: "Error during verification" });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).send();
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post('/api/saved-courses', authenticateToken, async (req, res) => {
  try {
    const savedCourse = new SavedCourse({ username: req.user.username, course_id: req.body.course_id });
    await savedCourse.save();
    res.json({ message: 'Saved' });
  } catch (err) { res.status(500).json({ message: 'Error' }); }
});

app.delete('/api/saved-courses', authenticateToken, async (req, res) => {
  try {
    await SavedCourse.findOneAndDelete({ username: req.user.username, course_id: req.body.course_id });
    res.json({ message: 'Removed' });
  } catch (err) { res.status(500).json({ message: 'Error' }); }
});

app.get('/api/saved-courses', authenticateToken, async (req, res) => {
  try {
    const savedCourses = await SavedCourse.find({ username: req.user.username }).populate('course_id');
    res.json(savedCourses.map(sc => sc.course_id));
  } catch (err) { res.status(500).json({ message: 'Error' }); }
});

app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
}
module.exports = app;
