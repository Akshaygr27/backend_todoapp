// middlewares/authValidator.js
const { body } = require('express-validator');

exports.validateSignup = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('username').notEmpty().isLength({ min: 3 }).withMessage('Username must be at least 3 chars'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  })
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password required')
];
