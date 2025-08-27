const { body } = require('express-validator');

exports.validateAdminLogin = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];