const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  experienceLevel: {
    type: String,
    required: true,
    enum: ['entry', 'Mid-Level', 'Senior', 'Executive']
  },
  candidates: [{
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      
    }
  }],
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for faster queries
jobSchema.index({ company: 1, isActive: 1 });

module.exports = mongoose.model('Job', jobSchema);