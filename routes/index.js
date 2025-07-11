const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middlewares/authValidator');

router.get('/', (req, res) => {
  res.send('Welcome to the Todo API');
});
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

module.exports = router;

