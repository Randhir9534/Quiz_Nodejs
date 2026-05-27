const Category = require('../models/Category');
const Question = require('../models/Question');

class CategoryController {
  // Add a new category
  async addCategory(req, res) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });

      const category = new Category({ name });
      await category.save();

      res.status(201).json({ message: 'Category created', category });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // List categories with question counts using aggregation
  async listCategoriesWithCount(req, res) {
    try {
      const result = await Category.aggregate([
        {
          $lookup: {
            from: 'questions',
            localField: '_id',
            foreignField: 'categories',
            as: 'questions'
          }
        },
        {
          $project: {
            categories:1 ,
            totalQuestions: { $size: '$questions' }
          }
        }
      ]);

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new CategoryController();
