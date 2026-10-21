const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please Provide Valid Email Address"],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['super-admin', 'admin', 'editor', 'viewer'],
      default: 'admin',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    permissions: {
      type: [String],
      default: ['overview', 'blogs', 'uploaded-blogs', 'leads', 'careers', 'jobEnquiry'],
    },
    lastLogin: {
      type: Date,
    },
    profileImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

schema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const model = mongoose.model("Users", schema);

module.exports = model;