const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'ORD-' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  
  // Customer Information
  customer: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      trim: true
    }
  },
  
  // Service Information
  service: {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    subtitle: {
      type: String
    },
    category: {
      type: String,
      required: true
    },
    features: [{
      type: String
    }],
    image: {
      type: String
    }
  },
  
  // Project Details
  project: {
    description: {
      type: String,
      required: true,
      trim: true
    },
    timeline: {
      type: String,
      required: true,
      enum: ['rush', 'fast', 'standard', 'flexible'],
      default: 'standard'
    },
    additionalRequirements: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date
    },
    expectedDeliveryDate: {
      type: Date
    },
    actualDeliveryDate: {
      type: Date
    }
  },
  
  // Pricing Information
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    timelineAdjustment: {
      type: Number,
      default: 0 // Percentage adjustment for rush/flexible timeline
    }
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['paypal', 'stripe', 'bank_transfer'],
      default: 'paypal'
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String
    },
    paidAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    },
    refundAmount: {
      type: Number,
      min: 0
    }
  },
  
  // Order Status and Lifecycle
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'in_progress', 'under_review', 'revision_requested', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Status History for tracking
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }],
  
  // Team Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Communication and Notes
  notes: [{
    type: {
      type: String,
      enum: ['internal', 'client', 'system'],
      default: 'internal'
    },
    message: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'notes.authorModel'
    },
    authorModel: {
      type: String,
      enum: ['User', 'Admin'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // File Attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'attachments.uploaderModel'
    },
    uploaderModel: {
      type: String,
      enum: ['User', 'Admin'],
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['requirement', 'deliverable', 'revision', 'final'],
      default: 'requirement'
    }
  }],
  
  // Revision Tracking
  revisions: [{
    requestedAt: {
      type: Date,
      default: Date.now
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    completedAt: {
      type: Date
    }
  }],
  
  // Rating and Feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String
    },
    submittedAt: {
      type: Date
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will automatically manage createdAt and updatedAt
});

// Indexes for better query performance
// orderNumber index is automatically created due to unique: true
orderSchema.index({ 'customer.userId': 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ assignedTo: 1 });

// Virtual for full customer name
orderSchema.virtual('customer.fullName').get(function() {
  return `${this.customer.firstName} ${this.customer.lastName}`;
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to add status history entry
orderSchema.methods.addStatusHistory = function(status, note, updatedBy) {
  this.statusHistory.push({
    status,
    note,
    updatedBy,
    timestamp: new Date()
  });
  this.status = status;
  return this.save();
};

// Method to add note
orderSchema.methods.addNote = function(message, author, authorModel, type = 'internal') {
  this.notes.push({
    type,
    message,
    author,
    authorModel,
    timestamp: new Date()
  });
  return this.save();
};

// Method to calculate expected delivery date based on timeline
orderSchema.methods.calculateDeliveryDate = function() {
  const startDate = this.project.startDate || this.createdAt;
  let daysToAdd;
  
  switch(this.project.timeline) {
    case 'rush':
      daysToAdd = 3;
      break;
    case 'fast':
      daysToAdd = 7;
      break;
    case 'standard':
      daysToAdd = 21;
      break;
    case 'flexible':
      daysToAdd = 30;
      break;
    default:
      daysToAdd = 21;
  }
  
  const deliveryDate = new Date(startDate);
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  this.project.expectedDeliveryDate = deliveryDate;
  return deliveryDate;
};

// Static method to generate unique order number
orderSchema.statics.generateOrderNumber = function() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `ORD-${timestamp.slice(-8)}${random}`;
};

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status })
    .populate('customer.userId', 'firstName lastName email')
    .populate('service.productId', 'name category')
    .populate('assignedTo', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to get user orders
orderSchema.statics.getUserOrders = function(userId) {
  return this.find({ 'customer.userId': userId })
    .populate('service.productId', 'name category image')
    .sort({ createdAt: -1 });
};

// Pre-save middleware to update timestamps and calculate delivery dates
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate expected delivery date if not set and project has start date
  if (this.project.startDate && !this.project.expectedDeliveryDate) {
    this.calculateDeliveryDate();
  }
  
  // Add initial status history entry for new orders
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Order created'
    });
  }
  
  next();
});


// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
