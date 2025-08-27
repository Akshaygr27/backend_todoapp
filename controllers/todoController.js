const Todo = require('../models/todoModel');
const UserActivity = require('../models/userActivityModel');
const fs = require('fs');
const path = require('path');
const csvParser  = require('csv-parser');


// Create Todo
exports.createTodo = async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    const todo = await Todo.create({
      userId: req.user.id,
      title,
      dueDate
    });

    await UserActivity.create({ userId: req.user.id, action: 'add' });

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

    await UserActivity.create({ userId: req.user.id, action: 'edit' });

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

    await UserActivity.create({ userId: req.user.id, action: 'delete' });

    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};

// Change Todo Status
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const todo = await Todo.findOne({ _id: id, userId: req.user.id });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.status = status;
    await todo.save();

    await UserActivity.create({ userId: req.user.id, action: 'complete' });

    res.json({ message: 'Status updated', todo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

exports.exportTodos = async (req, res) => {
  try {
    const format = req.query.format;
    if (!['txt', 'csv', 'sql', 'json'].includes(format)) {
      return res.status(400).json({ error: 'Invalid export format' });
    }

    const todos = await Todo.find({ userId: req.user.id }).sort({ createdAt: -1 });
    let content = '';
    const filename = `todos.${format}`;

    switch (format) {
      case 'json':
        content = JSON.stringify(todos, null, 2);
        break;
      case 'txt':
        content = todos.map(todo => `- ${todo.title} [${todo.status}]`).join('\n');
        break;
      case 'csv':
        content = 'ID,Title,Status,DueDate\n';
        content += todos.map(todo => `${todo._id},"${todo.title}",${todo.status},${todo.dueDate || ''}`).join('\n');
        break;
      case 'sql':
        content = todos.map(todo => `INSERT INTO todos (id, title, status, dueDate) VALUES ('${todo._id}', '${todo.title.replace(/'/g, "''")}', '${todo.status}', '${todo.dueDate || ''}');`).join('\n');
        break;
    }

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);

    await UserActivity.create({ userId: req.user.id, action: 'export' });

  } catch (err) {
    res.status(500).json({ error: 'Failed to export todos' });
  }
};

exports.importTodos = async (req, res) => {
  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (data) => {
     
      if (data.Title && data.Status && data.DueDate) {
        results.push({
          title: data.Title,
          status: data.Status,
          dueDate: new Date(data.DueDate),
          userId: req.user.id, 
        });
      }
    })
    .on("end", async () => {
      try {
        await Todo.insertMany(results);
        fs.unlinkSync(filePath); 

        await UserActivity.create({ userId: req.user.id, action: 'import' });
        
        res.status(200).json({ message: "Todos imported successfully." });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to import todos." });
      }
    });
};


