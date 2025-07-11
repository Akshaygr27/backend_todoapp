const Todo = require('../models/todoModel');

// Create Todo
exports.createTodo = async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    const todo = await Todo.create({
      userId: req.user.id,
      title,
      dueDate
    });
    res.status(201).json({ message: 'Todo created', todo });
  } catch (err) {
    res.status(500).json({ error: 'Server error while creating todo.' });
  }
};

// Get Todos with filtering and pagination
exports.getTodos = async (req, res) => {
  try {
    const { status = 'all', page = 1, search = '' } = req.query;
    const filter = { userId: req.user.id };

    if (status !== 'all') filter.status = status;

    if (search.trim()) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const limit = 5;
    const skip = (parseInt(page) - 1) * limit;

    const todos = await Todo.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    const count = await Todo.countDocuments(filter);

    res.json({
      total: count,
      page: parseInt(page),
      todos
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

// Edit Todo
exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, dueDate } = req.body;

    const todo = await Todo.findOne({ _id: id, userId: req.user.id });

    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.title = title;
    todo.dueDate = dueDate;
    await todo.save();

    res.json({ message: 'Todo updated', todo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

// Delete Todo
exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};
