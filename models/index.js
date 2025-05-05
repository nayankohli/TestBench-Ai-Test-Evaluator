const mongoose = require('mongoose');
const { Schema } = mongoose;

// User Schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['teacher', 'student'],
        required: true
    },
    name: String,
}, { timestamps: true });

// Test Schema
const testSchema = new Schema({
    subject: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    questions: [{
        id: String,
        question: String,
        answer: String,
        type: {
            type: String,
            enum: ['1-marker', '2-marker', '5-marker']
        },
        marks: Number
    }],
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Inactive'
    },
    totalMarks: {
        type: Number
    },
    testDuration: {
        type: Number, 
        required: false
    }
}, { timestamps: true });

// Submission Schema
const submissionSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    test: {
        type: Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    question: [String],
    answer: [String],
    marks: String,
    timeTaken: {
        type: Number, 
        required: false
    }
}, { timestamps: true });

const tempUserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: String,
  role: String,
  otp: String,
  otpExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 
  }
});

const TempUser = mongoose.model('TempUser', tempUserSchema);

const User = mongoose.model('User', userSchema);
const Test = mongoose.model('Test', testSchema);
const Submission = mongoose.model('Submission', submissionSchema);

module.exports = {
    User,
    Test,
    Submission,
    TempUser
};