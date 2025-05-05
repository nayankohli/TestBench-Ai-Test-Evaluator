const { Test, Submission, User } = require("../models/index");
const { evaluateAnswer } = require("../utils/helpers");

const testController = {
  getTestByCode: async (req, res) => {
    try {
      const test = await Test.findOne({ code: req.params.code });
      if (!test) {
        return res.status(404).render("error", { message: "Test not found" });
      }

      if (test.status !== "Active" && req.session.detail.role !== "teacher") {
        return res
          .status(403)
          .render("error", { message: "This test is not currently active" });
      }

      const marksDistribution = {
        "1-marker": 0,
        "2-marker": 0,
        "5-marker": 0,
      };

      test.questions.forEach((question) => {
        if (marksDistribution[question.type] !== undefined) {
          marksDistribution[question.type]++;
        }
      });

      res.render("test", {
        test,
        code: req.params.code,
        marksDistribution,
      });
    } catch (err) {
      console.error("Error fetching test:", err);
      res.status(500).render("error", { message: "Error loading test" });
    }
  },

  submitTest: async (req, res) => {
    try {
      console.log("Form submission received:", req.body);

      const test = await Test.findOne({ code: req.params.code });
      if (!test) {
        return res.status(404).render("error", { message: "Test not found" });
      }

      const user = await User.findOne({ email: req.session.detail.email });
      if (!user) {
        return res.status(400).render("error", { message: "User not found" });
      }

      const answers = [];
      let totalScore = 0;

      for (let i = 0; i < test.questions.length; i++) {
        const question = test.questions[i];
        const questionNumber = i + 1;
        const answer = req.body[`question${questionNumber}`] || "";

        console.log(
          `Processing question ${questionNumber}: "${question.question.substring(
            0,
            20
          )}..."`,
          {
            inputName: `question${questionNumber}`,
            answer,
            questionId: question._id,
          }
        );

        answers.push(answer);

        const score = await evaluateAnswer(question, answer);
        totalScore += score;
      }

      console.log("Final answers array:", answers);

      const newSubmission = new Submission({
        student: user._id,
        test: test._id,
        code: req.params.code,
        question: test.questions.map((q) => q.question),
        answer: answers,
        marks: totalScore.toString(),
        timeTaken: parseInt(req.body.timeTaken || 0, 10),
      });

      console.log("Submission being saved:", {
        student: user._id,
        test: test._id,
        questionCount: test.questions.length,
        answerCount: answers.length,
        marks: totalScore.toString(),
      });

      const savedSubmission = await newSubmission.save();
      console.log("Submission saved with ID:", savedSubmission._id);

      if (req.session.detail.role === "student") {
        res.redirect("/student/dashboard");
      } else {
        res.redirect("/teacher/dashboard");
      }
    } catch (error) {
      console.error("Error processing test submission:", error);
      res
        .status(500)
        .render("error", {
          message: "Error submitting test: " + error.message,
        });
    }
  },
};
module.exports = testController;
