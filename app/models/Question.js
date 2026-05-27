const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String],
  correctOption: { type: Number, required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  answers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    selectedOption: Number,
    isCorrect: Boolean,           
    submittedAt: Date,
    timeZone: String              
  }]
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
