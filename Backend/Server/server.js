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
  origin: [
    'https://master-mind-hwe81mn9b-sureshs-projects-460bee00.vercel.app',
    'https://master-mind-71wh4evyt-sureshs-projects-460bee00.vercel.app', // Add this if it's needed
  ],
  credentials: true
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
const User = mongoose.model('User', userSchema);

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { type: String, required: true },
  rating: { type: Number },
  price: { type: Number },
  image: { type: String },
  description: { type: String }
});
const Course = mongoose.model('Course', courseSchema);

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
const SavedCourse = mongoose.model('SavedCourse', savedCourseSchema);


// Fetch all courses
app.get('/courses', (req, res) => {
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
app.post('/users', async (req, res) => {
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


// Configure email transporter (example with Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nandhyalasuresh143@gmail.com', // your email
    pass: 'tmbk axpe yxmd agld'  // your app password
  }
});

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

console.log(otpStore,"otpStore")

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Send OTP via email
async function sendOTPEmail(email, otp, username) {
  const mailOptions = {
    from: 'nandhyalasuresh143@gmail.com',
    to: email,
    subject: 'MasterLearn - Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">MasterLearn Login Verification</h2>
        <p>Hello ${username},</p>
        <p>Your OTP for login is:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

// Step 1: Verify credentials and send OTP
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username);

  try {
    const dbUser = await User.findOne({ username }); // Use Mongoose to find user
    console.log("User from DB:", dbUser);

    if (!dbUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (!password || !dbUser.password) {
      return res.status(400).json({
        success: false,
        message: "Password data missing"
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (isPasswordMatched) {
      // Generate and store OTP
      const otp = generateOTP();
      const otpKey = `${username}_${Date.now()}`;
      console.log("OTP:", otp);

      // Store OTP with expiration (5 minutes)
      otpStore.set(otpKey, {
        otp,
        username,
        email: dbUser.email,
        timestamp: Date.now(),
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      });

      // Send OTP via email
      await sendOTPEmail(dbUser.email, otp, dbUser.username);

      // Return success with OTP key (don't send actual OTP)
      return res.json({
        success: true,
        message: "OTP sent to your email",
        otpKey,
        requiresOTP: true
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { otpKey, otp } = req.body;

  try {
    if (!otpKey || !otp) {
      return res.status(400).json({ success: false, message: "OTP and key are required" });
    }

    const otpData = otpStore.get(otpKey);
    if (!otpData) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    if (Date.now() > otpData.expires) {
      otpStore.delete(otpKey);
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    if (otpData.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const jwtToken = jwt.sign(
      { username: otpData.username, email: otpData.email },
      "MY_SECRET_TOKEN",
      { expiresIn: "24h" }
    );

    otpStore.delete(otpKey);

    return res.json({
      success: true,
      message: "Login successful",
      token: jwtToken // send token to frontend
    });

  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Optional: Resend OTP endpoint
app.post("/resend-otp", async (req, res) => {
  const { otpKey } = req.body;

  try {
    const otpData = otpStore.get(otpKey);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP session"
      });
    }

    // Generate new OTP
    const newOtp = generateOTP();

    // Update stored OTP data
    otpStore.set(otpKey, {
      ...otpData,
      otp: newOtp,
      timestamp: Date.now(),
      expires: Date.now() + 5 * 60 * 1000
    });

    // Send new OTP
    await sendOTPEmail(otpData.email, newOtp, otpData.username);

    return res.json({
      success: true,
      message: "New OTP sent to your email"
    });

  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP"
    });
  }
});


// Middleware to authenticate and extract user from JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Authentication token missing." });

  try {
    const decoded = jwt.verify(token, "MY_SECRET_TOKEN");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// Save a course for the logged-in user
app.post('/saved-courses', authenticateToken, async (req, res) => {
  const username = req.user.username;
  const { course_id } = req.body;
  if (!course_id) {
    return res.status(400).json({ message: 'Course ID is required' });
  }
  try {
    const savedCourse = new SavedCourse({
      username,
      course_id
    });
    await savedCourse.save();
    res.json({ message: 'Course saved successfully!' });
  } catch (err) {
    if (err.code === 11000) { // Mongoose duplicate key error
      return res.status(400).json({ message: 'Course already saved' });
    }
    console.error("Error saving course:", err);
    return res.status(500).json({ message: 'Database error' });
  }
});

// Remove a saved course for the logged-in user
app.delete('/saved-courses', authenticateToken, async (req, res) => {
  const username = req.user.username;
  const { course_id } = req.body;
  if (!course_id) {
    return res.status(400).json({ message: 'Course ID is required' });
  }
  try {
    const deletedCourse = await SavedCourse.findOneAndDelete({ username, course_id });
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Saved course not found' });
    }
    res.json({ message: 'Course removed from saved courses' });
  } catch (err) {
    console.error("Error deleting saved course:", err);
    return res.status(500).json({ message: 'Database error' });
  }
});

// Get all saved courses for the logged-in user
app.get('/saved-courses', authenticateToken, async (req, res) => {
  const username = req.user.username;
  try {
    const savedCourses = await SavedCourse.find({ username }).populate('course_id');
    const courses = savedCourses.map(sc => sc.course_id);
    res.json(courses);
  } catch (err) {
    console.error("Error fetching saved courses:", err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/profile', (req, res) => {
  // Check for token in Authorization header first, then cookies
  let token = req.headers.authorization?.split(' ')[1]; // Bearer token
  if (!token) {
    token = req.cookies.jwt_token; // Get token from HttpOnly cookie
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing.' });
  }

  try {
    const decoded = jwt.verify(token, 'MY_SECRET_TOKEN'); // use the same secret as in /login
    res.json({ user: decoded }); // Example: decoded.email, decoded.name
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
});

// ...existing code...
 



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
