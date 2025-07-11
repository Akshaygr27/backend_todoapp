const validateTodo = (req, res, next) => {
  const { title, dueDate } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const due = new Date(dueDate);
  if (!dueDate || isNaN(due) || due <= new Date()) {
    return res.status(400).json({ error: 'Due date must be a valid future date.' });
  }

  next();
};

module.exports = validateTodo;
