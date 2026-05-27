const Question = require('../models/Question');
const Category = require('../models/Category');
const User = require('../models/User');
const mongoose = require('mongoose');
const moment = require('moment-timezone');

class QuestionController {
  // Add a new multiple choice question with category assignment
  async addQuestion(req, res) {
    try {
      const { question, options, correctOption,categoryId } = req.body;
    //   const category = await Category.create(req.body);

      if (!question || !options || options.length < 2 || correctOption === undefined ) {
        return res.status(400).json({ error: 'Invalid question data' });
      }


      const Questions= new Question({ question, options, correctOption, categories: categoryId });
      await Questions.save();

      res.status(201).json({ message: 'Question added', Questions });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Submit an answer for a question
  async submitAnswer(req, res) {
  try {
    const { selectedOption } = req.body;
    const questionId = req.params.id;

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const isCorrect = selectedOption == question.correctOption;

    question.answers.push({
      userId: req.user.id, // Make sure req.user is set via auth middleware
      selectedOption,
      isCorrect,
      submittedAt: new Date()
    });

    await question.save();

    res.json({
      message: 'Answer submitted',
      correct: isCorrect
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

  // Get questions by category
  async listQuestionsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const questions = await Question.aggregate([
        {
          $match: {
            categories: new mongoose.Types.ObjectId(categoryId)
          }
        },
        {
          $project: {
            question: 1,
            options: 1
          }
        }
      ]);

      res.json(questions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Search question and get user's answer with submit time
  async searchWithUserAnswers(req, res) {
  try {
    let query={}
     if(req.body.search){
        const search=req.body.search
        query={
            $or:[{question:{$regex:search,options:'i'}}]
        }
     }
    const userId = req.user.id; // Assumes auth middleware sets req.user


    const results = await Question.aggregate([
    //   {
    //     $match: {
    //       question: { $regex: query, $options: 'i' }
    //     }
    //   },
      {
        $project: {
          question: 1,
          options: 1,
          matchedAnswer: {
            $filter: {
              input: "$answers",
              as: "ans",
              cond: { $eq: ["$$ans.userId", new mongoose.Types.ObjectId(userId)] }
            }
          }
        }
      },
      {
        $unwind: "$matchedAnswer"
      },
      {
        $project: {
          question: 1,
          options: 1,
          selectedOption: "$matchedAnswer.selectedOption",
          isCorrect: "$matchedAnswer.isCorrect",
          submittedAt: "$matchedAnswer.submittedAt",
          userId:"$matchedAnswer.userId"
        }
      }
    ]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}}

module.exports = new QuestionController();
