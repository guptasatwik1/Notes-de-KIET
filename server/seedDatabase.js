// notes-de-kiet-backend/seedDatabase.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from './models/Department.js'; // Adjust path if needed
import Semester from './models/Semester.js';   // Adjust path if needed

dotenv.config(); // Load .env variables

const MONGODB_URI = process.env.MONGODB_URI;

const departmentsData = [
    { name: "Computer Science", code: "cs" },
    { name: "Computer Science and Engineering", code: "cse" },
    { name: "Computer Science and Engineering (Artificial Intelligence)", code: "csai" },
    { name: "Computer Science and Information Technology", code: "csit" },
    { name: "Information Technology", code: "it" },
    { name: "Computer Science and Engineering (AI & Machine Learning)", code: "csaiml" },
    { name: "Electronics and Communication Engineering", code: "ece" },
    { name: "Electrical and Electronics Engineering", code: "eee" },
    { name: "Mechanical Engineering", code: "me" },
    { name: "Electrical and Computer Engineering", code: "elce" },
];

const numberOfSemesters = 8; // Each department has 8 semesters

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected for seeding.');

        console.log('\n--- Seeding Departments ---');
        const insertedDepartments = [];
        for (const dept of departmentsData) {
            let departmentDoc = await Department.findOne({ code: dept.code });
            if (!departmentDoc) {
                departmentDoc = new Department(dept);
                await departmentDoc.save();
                console.log(`Added department: ${departmentDoc.name} (${departmentDoc.code})`);
            } else {
                console.log(`Department already exists: ${departmentDoc.name} (${departmentDoc.code})`);
            }
            insertedDepartments.push(departmentDoc);
        }

        console.log('\n--- Seeding Semesters ---');
        for (const deptDoc of insertedDepartments) {
            for (let i = 1; i <= numberOfSemesters; i++) {
                let semesterDoc = await Semester.findOne({
                    semesterNumber: i,
                    department: deptDoc._id
                });
                if (!semesterDoc) {
                    semesterDoc = new Semester({
                        semesterNumber: i,
                        department: deptDoc._id
                    });
                    await semesterDoc.save();
                    console.log(`Added Semester ${i} for ${deptDoc.name}`);
                } else {
                    console.log(`Semester ${i} for ${deptDoc.name} already exists.`);
                }
            }
        }

        console.log('\nDatabase seeding completed successfully!');

    } catch (error) {
        console.error('Error during database seeding:', error);
        // Specifically check for connection errors
        if (error.name === 'MongooseServerSelectionError') {
            console.error('Please check your MONGODB_URI and IP whitelist in MongoDB Atlas.');
        }
    } finally {
        // Ensure the MongoDB connection is closed after the script runs
        if (mongoose.connection.readyState === 1) { // 1 means connected
            await mongoose.disconnect();
            console.log('MongoDB disconnected.');
        }
        process.exit(0); // Exit the script gracefully
    }
};

// Run the seeding function
seedDatabase();