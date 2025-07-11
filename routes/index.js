const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middlewares/authValidator');

const authMiddleware = require('../middlewares/authMiddleware');
const validateTodo = require('../middlewares/validateTodo');
const {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo
} = require('../controllers/todoController');

// localhost:3000
router.get('/', (req, res) => {
  res.send('Welcome to the Todo API');
});
// Auth routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
// Protected routes for Todos
router.post('/todo', authMiddleware,validateTodo, createTodo);
router.get('/todo', authMiddleware, getTodos);
router.put('/todo/:id', authMiddleware, validateTodo, updateTodo);
router.delete('/todo/:id', authMiddleware, deleteTodo);

module.exports = router;

