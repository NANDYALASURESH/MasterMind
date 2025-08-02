const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173', // Replace with your frontend origin
    credentials: true,
  })
);

// Connect to SQLite database
const db = new sqlite3.Database('course.db', (err) => {
  if (err) {
    console.error('❌ Could not connect to database:', err.message);
  } else {
    console.log('✅ Connected to course.db database.');
    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating users table:', err.message);
      } else {
        console.log('✅ Users table ensured.');
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        instructor TEXT NOT NULL,
        rating REAL,
        price REAL,
        image TEXT,
        description TEXT
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating courses table:', err.message);
      } else {
        console.log('✅ Courses table ensured.');
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS saved_courses (
        username TEXT NOT NULL,
        course_id INTEGER NOT NULL,
        PRIMARY KEY (username, course_id),
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating saved_courses table:', err.message);
      } else {
        console.log('✅ Saved_courses table ensured.');
      }
    });


  }
});

// Fetch all courses
app.get('/courses', (req, res) => {
  const query = `SELECT * FROM courses`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching courses:", err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.json(rows);
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

    const stmt = db.prepare(
      `INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)`
    );
    stmt.run(username, name, email, hashedPassword, function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Username or email already exists' });
        }
        return res.status(500).json({ message: 'Database error' });
      }
      res.json({ message: 'User registered successfully!' });
    });
    stmt.finalize();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
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
    const dbUser = await getUserByUsername(username);
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

// Step 2: Verify OTP and complete login
app.post("/verify-otp", async (req, res) => {
  const { otpKey, otp } = req.body;

  try {
    if (!otpKey || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP and key are required" 
      });
    }

    const otpData = otpStore.get(otpKey);

    if (!otpData) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired OTP" 
      });
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expires) {
      otpStore.delete(otpKey);
      return res.status(400).json({ 
        success: false, 
        message: "OTP has expired" 
      });
    }

    // Verify OTP
    if (otpData.otp !== otp.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP" 
      });
    }

    // OTP is valid, generate JWT token
    const jwtToken = jwt.sign(
      { username: otpData.username, email: otpData.email },
      "MY_SECRET_TOKEN"
    );

    // Clean up OTP
    otpStore.delete(otpKey);

    return res.json({ 
      success: true, 
      message: "Login successful", 
      jwtToken 
    });

  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
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
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "MY_SECRET_TOKEN");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// Save a course for the logged-in user
app.post('/saved-courses', authenticateToken, (req, res) => {
  const username = req.user.username;
  const { course_id } = req.body;
  if (!course_id) {
    return res.status(400).json({ message: 'Course ID is required' });
  }
  const stmt = db.prepare(
    `INSERT INTO saved_courses (username, course_id) VALUES (?, ?)`
  );
  stmt.run(username, course_id, function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ message: 'Course already saved' });
      }
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Course saved successfully!' });
  });
  stmt.finalize();
});

// Remove a saved course for the logged-in user
app.delete('/saved-courses', authenticateToken, (req, res) => {
  const username = req.user.username;
  const { course_id } = req.body;
  if (!course_id) {
    return res.status(400).json({ message: 'Course ID is required' });
  }
  const stmt = db.prepare(
    `DELETE FROM saved_courses WHERE username = ? AND course_id = ?`
  );
  stmt.run(username, course_id, function (err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Saved course not found' });
    }
    res.json({ message: 'Course removed from saved courses' });
  });
  stmt.finalize();
});

// Get all saved courses for the logged-in user
app.get('/saved-courses', authenticateToken, (req, res) => {
  const username = req.user.username;
  const query = `SELECT c.* FROM saved_courses sc JOIN courses c ON sc.course_id = c.id WHERE sc.username = ?`;
  db.all(query, [username], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(rows);
  });
});


app.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

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
