const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middlewares/authValidator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const authMiddleware = require('../middlewares/authMiddleware');
const validateTodo = require('../middlewares/validateTodo');
const {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
  changeStatus,
  exportTodos,
  importTodos
} = require('../controllers/todoController');


const adminMiddleware = require('../middlewares/adminMiddleware');
const { validateAdminLogin } = require('../middlewares/adminValidator');
const {
  adminLogin,
} = require('../controllers/adminController');

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
router.patch('/todo/:id/status', authMiddleware, changeStatus);
router.get('/todo/export', authMiddleware, exportTodos);
router.post('/todo/import', authMiddleware, upload.single('file'), importTodos);

// Admin routes
router.post('/admin/login', validateAdminLogin, adminLogin);

module.exports = router;

