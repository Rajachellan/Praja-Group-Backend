const express = require('express');

const router = express.Router();

const {
  getAvailableSections,
  getAllUsers,
  addUsers,
  updateUser,
  deleteUser,
  loginFun,
} = require('../controllers/userController');

// Authentication
router.post('/user/login', loginFun);
router.post('/user/register', addUsers);

// RBAC & User Management routes (accessible via /api/user/*)
router.get('/user/sections', getAvailableSections);
router.get('/user/all', getAllUsers);
router.post('/user/create', addUsers);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);

// Admin-prefixed route aliases (accessible via /api/admin/users/*)
router.get('/admin/users/sections', getAvailableSections);
router.get('/admin/users', getAllUsers);
router.post('/admin/users', addUsers);
router.put('/admin/users/:id', updateUser);
router.delete('/admin/users/:id', deleteUser);

module.exports = router;