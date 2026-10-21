const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { ALL_MODULES, ALL_PERMISSION_KEYS } = require('../utils/modules');

const ROOT_SUPER_ADMIN = 'prajhaconnect@gmail.com';

/**
 * @desc Get available system modules and sections for RBAC assignment
 * @route GET /api/user/sections OR /api/admin/users/sections
 */
async function getAvailableSections(req, res) {
  try {
    return res.status(200).json({
      success: true,
      data: ALL_MODULES,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * @desc Get all registered administrative users with optional filters
 * @route GET /api/user/all OR /api/admin/users
 */
async function getAllUsers(req, res) {
  try {
    const { q, role, status } = req.query;
    const filter = {};

    if (q && q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * @desc Create / Onboard a new administrator or team member
 * @route POST /api/user/register OR POST /api/admin/users
 */
async function addUsers(req, res) {
  const { name, email, password, role, permissions, status } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    const genSalt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, genSalt);

    const userRole = role || 'admin';
    const userStatus = status || 'active';
    let assignedPermissions = Array.isArray(permissions) ? permissions : ['overview'];

    // Super Admin automatically gets all system permissions
    if (userRole === 'super-admin') {
      assignedPermissions = ALL_PERMISSION_KEYS;
    }

    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashPassword,
      role: userRole,
      status: userStatus,
      permissions: assignedPermissions,
    });

    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: 'Administrator onboarded successfully',
      data: userObj,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error: ${err.message}`,
    });
  }
}

/**
 * @desc Update an existing administrator's role, permissions, status, or details
 * @route PUT /api/user/:id OR PUT /api/admin/users/:id
 */
async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, password, role, permissions, status } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    // Check email uniqueness if email is changed
    if (email && email.toLowerCase().trim() !== user.email) {
      const lowerEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: lowerEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already in use by another account',
        });
      }
      user.email = lowerEmail;
    }

    if (name) {
      user.name = name.trim();
    }

    // Check if target user is root super admin
    const isRootAdmin = user.email.toLowerCase() === ROOT_SUPER_ADMIN.toLowerCase();

    // Role update
    if (role) {
      if (isRootAdmin && role !== 'super-admin') {
        return res.status(400).json({
          success: false,
          message: 'The root super-admin account cannot be demoted',
        });
      }
      user.role = role;
    }

    // Status update
    if (status) {
      if (isRootAdmin && status === 'inactive') {
        return res.status(400).json({
          success: false,
          message: 'The root super-admin account cannot be deactivated',
        });
      }
      user.status = status;
    }

    // Permissions update
    if (user.role === 'super-admin') {
      user.permissions = ALL_PERMISSION_KEYS;
    } else if (Array.isArray(permissions)) {
      user.permissions = permissions;
    }

    // Password update
    if (password && password.trim().length >= 6) {
      const genSalt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), genSalt);
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userObj,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error: ${err.message}`,
    });
  }
}

/**
 * @desc Delete an administrator account with safety safeguards
 * @route DELETE /api/user/:id OR DELETE /api/admin/users/:id
 */
async function deleteUser(req, res) {
  const { id } = req.params;
  const requesterEmail = (req.body?.requesterEmail || req.query?.requesterEmail || '').toLowerCase();

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    // Protect root super admin
    if (user.email.toLowerCase() === ROOT_SUPER_ADMIN.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'The root super-admin account cannot be deleted',
      });
    }

    // Prevent self-deletion if requester email is provided
    if (requesterEmail && user.email.toLowerCase() === requesterEmail) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own logged-in account',
      });
    }

    // Prevent deleting the last remaining active super admin
    if (user.role === 'super-admin') {
      const activeSuperAdmins = await User.countDocuments({
        role: 'super-admin',
        status: 'active',
        _id: { $ne: user._id },
      });

      if (activeSuperAdmins === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last remaining active super-admin',
        });
      }
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error: ${err.message}`,
    });
  }
}

/**
 * @desc User Login with RBAC verification & active status check
 * @route POST /api/user/login
 */
async function loginFun(req, res) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const findUser = await User.findOne({ email: cleanEmail });

    if (!findUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const comparePassword = await bcrypt.compare(password, findUser.password);
    if (!comparePassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check account status
    if (findUser.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    // Update lastLogin
    findUser.lastLogin = new Date();

    // Ensure super-admin has full permissions
    if (findUser.role === 'super-admin') {
      findUser.permissions = ALL_PERMISSION_KEYS;
    }

    await findUser.save();

    const userPayload = {
      _id: findUser._id,
      name: findUser.name,
      email: findUser.email,
      role: findUser.role,
      status: findUser.status,
      permissions: findUser.permissions,
      lastLogin: findUser.lastLogin,
    };

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      name: findUser.name,
      email: findUser.email,
      role: findUser.role,
      status: findUser.status,
      permissions: findUser.permissions,
      user: userPayload,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `ErrorName: ${err.name} ErrorMessage: ${err.message}`,
    });
  }
}

module.exports = {
  getAvailableSections,
  getAllUsers,
  addUsers,
  createUser: addUsers,
  updateUser,
  deleteUser,
  loginFun,
};