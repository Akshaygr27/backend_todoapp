const validateTodo = (req, res, next) => {
  const { title, dueDate } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!dueDate || isNaN(due) || due < today) {
    return res.status(400).json({ error: 'Due date must be today or future date.' });
  }

  next();
};

module.exports = validateTodo;
