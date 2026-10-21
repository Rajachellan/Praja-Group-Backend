const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { ALL_PERMISSION_KEYS } = require('./modules');

const SUPER_ADMIN_EMAIL = 'prajhaconnect@gmail.com';
const SUPER_ADMIN_PASS = 'prajha@2012';

async function seedSuperAdmin() {
  try {
    const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL.toLowerCase() });

    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASS, salt);

      const superAdmin = new User({
        name: 'Prajha Super Admin',
        email: SUPER_ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        role: 'super-admin',
        status: 'active',
        permissions: ALL_PERMISSION_KEYS,
      });

      await superAdmin.save();
      console.log(`[Seed] Super Admin created successfully: ${SUPER_ADMIN_EMAIL}`);
    } else {
      let needsSave = false;

      if (existing.role !== 'super-admin') {
        existing.role = 'super-admin';
        needsSave = true;
      }
      if (existing.status !== 'active') {
        existing.status = 'active';
        needsSave = true;
      }
      if (!existing.permissions || existing.permissions.length < ALL_PERMISSION_KEYS.length) {
        existing.permissions = ALL_PERMISSION_KEYS;
        needsSave = true;
      }

      // Check if password matches SUPER_ADMIN_PASS
      const isMatch = await existing.matchPassword(SUPER_ADMIN_PASS);
      if (!isMatch) {
        const salt = await bcrypt.genSalt(10);
        existing.password = await bcrypt.hash(SUPER_ADMIN_PASS, salt);
        needsSave = true;
      }

      if (needsSave) {
        await existing.save();
        console.log(`[Seed] Super Admin updated with full permissions & verified credentials`);
      }
    }

    // Ensure any legacy users in DB also have valid roles and permissions
    const legacyUsers = await User.find({
      $or: [
        { role: { $exists: false } },
        { role: null },
        { status: { $exists: false } },
        { permissions: { $exists: false } },
      ],
    });

    for (const u of legacyUsers) {
      u.role = u.role || 'admin';
      u.status = u.status || 'active';
      u.permissions = u.permissions && u.permissions.length > 0 ? u.permissions : ALL_PERMISSION_KEYS;
      await u.save();
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed super admin:', error.message);
  }
}

module.exports = seedSuperAdmin;
