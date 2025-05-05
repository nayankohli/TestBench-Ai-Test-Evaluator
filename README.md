# 🧠 TestBench - AI Test Evaluator

TestBench is an intelligent online test-taking platform built with Node.js, Express, and MongoDB. It leverages **Anthropic's Claude API** to evaluate student answers automatically using AI. The platform is designed for two roles — **Students** and **Teachers** — to simplify test creation, submission, and evaluation with minimal manual effort.

---

## 🚀 Features

### 👩‍🏫 Teacher Portal
- Create tests **manually** or **generate using AI**
- Manage test details and activate/deactivate tests
- View all student **submissions** and their **scores**
- Secure and role-based dashboard

### 🎓 Student Portal
- Attempt **activated** tests assigned by teachers
- View **scores and performance history**
- AI-evaluated feedback with automated scoring

### ⚙️ Admin & Core
- Role-based authentication (`student`, `teacher`)
- Secure session-based login
- MongoDB integration for storing users, tests, and submissions
- Claude API integration for **AI-generated questions** and **AI-based answer evaluation**

---

## 🧬 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Templating Engine:** EJS
- **Authentication:** express-session
- **AI Integration:** [Anthropic Claude API](https://www.anthropic.com/)
- **Others:** dotenv, body-parser, path

---

## 🧱 Project Structure

```
testbench/
├── config/
│   └── db.js               # MongoDB connection logic
├── models/
│   └── index.js             # User, Test, Submission, TempUser Schemas
├── routes/
│   ├── auth.js             # Auth routes
│   ├── teacher.js          # Teacher-specific operations
│   ├── student.js          # Student-specific operations
│   └── test.js             # Test handling logic
├── public/                 # Static assets
├── uploads/                # Uploaded files
├── views/                  # EJS templates
├── server.js               # Entry point
└── .env                    # Environment variables
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
SESSION_SECRET=your_session_secret
BASE_URL=/
MONGO_URI=your_mongodb_connection_string
CLAUDE_API_KEY=your_anthropic_claude_api_key
```

---

## 🛠️ Setup & Installation

```bash
# Clone the repository
git clone https://github.com/your-username/testbench-ai-evaluator.git
cd testbench-ai-evaluator

# Install dependencies
npm install

# Create a .env file as shown above

# Run the server
node server.js
```

---

## 📌 Schema Overview

### 👥 User Schema

```js
{
  email: String,
  password: String,
  role: 'teacher' | 'student',
  name: String
}
```

### 📘 Test Schema

```js
{
  subject: String,
  topic: String,
  totalQuestions: Number,
  questions: [
    {
      id: String,
      question: String,
      answer: String,
      type: '1-marker' | '2-marker' | '5-marker',
      marks: Number
    }
  ],
  teacher: ObjectId,
  code: String,
  status: 'Active' | 'Inactive',
  totalMarks: Number,
  testDuration: Number
}
```

### 📝 Submission Schema

```js
{
  student: ObjectId,
  test: ObjectId,
  question: [String],
  answer: [String],
  marks: String,
  timeTaken: Number
}
```

---

## 🤖 AI Capabilities

- **AI Question Generation:** Teachers can use Claude AI to auto-generate test questions.
- **AI Answer Evaluation:** Student responses are analyzed and scored by Claude AI with high accuracy and fairness.

---

## 🎯 Future Improvements

- Add AI-based feedback generation for students
- Admin dashboard for managing all users and tests
- Real-time timer & auto-submission
- Export test results to PDF

---

## 🙌 Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue for suggestions, bugs, or improvements.

---

## 🧑‍💻 Author

**Nayan**  
[LinkedIn](https://www.linkedin.com/in/your-profile) • [Portfolio](https://your-portfolio.com) • [Email](mailto:nayan1480.be22@chitkarauniversity.edu.in)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## ⭐ Show Your Support

If you like this project, consider giving it a ⭐ on GitHub to help others discover it!
