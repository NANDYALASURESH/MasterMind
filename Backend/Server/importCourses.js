// MasterMind/Backend/Server/importCourses.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables (ensure dotenv is installed and configured in your backend)
require('dotenv').config({ path: '../.env' }); // Adjust path if .env is in a different location

const mongoUri = process.env.MONGODB_URI;

// Define the Course Schema (must match the one in server.js)
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { type: String, required: true },
  rating: { type: Number }, // Changed from String to Number based on schema in server.js
  price: { type: Number }, // Changed from String to Number based on schema in server.js
  image: { type: String },
  description: { type: String },
  // The 'id' field from your JSON might be unnecessary as MongoDB uses _id by default
});
const Course = mongoose.model('Course', courseSchema);

async function importCourses() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas for import.');

    const coursesDataPath = path.join(__dirname, 'enhanced_courses_dataset_with_images.json');
    const coursesData = JSON.parse(fs.readFileSync(coursesDataPath, 'utf8'));

    let insertedCount = 0;
    let skippedCount = 0;

    for (const course of coursesData) {
      try {
        // Create a new course document, mapping the JSON fields to the Mongoose schema
        // Ensure 'rating' and 'price' are numbers, not strings as they appear in the JSON example.
        // Convert 'rating' and 'price' to numbers, handle potential non-numeric values
        const rating = parseFloat(course.rating);
        const price = parseFloat(course.price.replace('$', '')); // Assuming price like "$10.00"

        const newCourse = new Course({
          title: course.title,
          category: course.tags && course.tags.length > 0 ? course.tags[0] : 'Uncategorized', // Using first tag as category
          instructor: course.instructor,
          rating: isNaN(rating) ? null : rating,
          price: isNaN(price) ? null : price,
          image: course.image,
          description: course.description
        });

        // Use insertMany for efficiency, but loop for individual error handling
        await newCourse.save();
        insertedCount++;
      } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error (if title, etc. were unique)
          // For courses, it's possible titles might be duplicated or we might enforce unique constraints later.
          // For now, we'll just log and skip if a duplicate key error occurs.
          console.warn(`Skipping duplicate course: ${course.title}`);
          skippedCount++;
        } else {
          console.error(`Error inserting course ${course.title}:`, error.message);
        }
      }
    }

    console.log(`\nImport complete: ${insertedCount} courses inserted, ${skippedCount} duplicates skipped.`);
  } catch (error) {
    console.error('❌ Data import failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('Disconnected from MongoDB Atlas.');
  }
}

importCourses();