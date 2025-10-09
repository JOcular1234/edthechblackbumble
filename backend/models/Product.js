const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    required: [true, 'Product subtitle is required'],
    trim: true,
    maxlength: [200, 'Product subtitle cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Product description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'graphic_design', 
      'logo_branding', 
      'motion_graphic', 
      'websites', 
      'video_creation', 
      'social_media_plan', 
      'content_writing', 
      'app_development', 
      'pitch_deck', 
      'sponsorship_deck', 
      'grant_application', 
      'virtual_assistant'
    ],
    default: 'graphic_design'
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: '$',
    maxlength: [5, 'Currency symbol cannot exceed 5 characters']
  },
  billing: {
    type: String,
    enum: ['One-time', 'Monthly', 'Yearly', 'Weekly'],
    default: 'One-time'
  },
  features: [{
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Feature description cannot exceed 200 characters']
  }],
  gradient: {
    type: String,
    default: 'from-purple-600 to-blue-600',
    trim: true
  },
  hoverGradient: {
    type: String,
    default: 'from-purple-700 to-blue-700',
    trim: true
  },
  popular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Note cannot exceed 500 characters']
  },
  icon: {
    type: String,
    trim: true,
    maxlength: [10, 'Icon cannot exceed 10 characters']
  },
  deliveryTime: {
    type: String,
    trim: true,
    maxlength: [50, 'Delivery time cannot exceed 50 characters']
  },
  revisions: {
    type: String,
    trim: true,
    maxlength: [50, 'Revisions info cannot exceed 50 characters']
  },
  image: {
    type: String,
    trim: true,
    default: null
  },
  imagePublicId: {
    type: String,
    trim: true,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Index for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ popular: 1, isActive: 1 });
productSchema.index({ sortOrder: 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `${this.currency}${this.price}`;
});

// Static method to get products by category
productSchema.statics.getByCategory = function(category, activeOnly = true) {
  const query = { category };
  if (activeOnly) {
    query.isActive = true;
  }
  return this.find(query).sort({ sortOrder: 1, createdAt: -1 });
};

// Static method to get popular products
productSchema.statics.getPopular = function(limit = 3) {
  return this.find({ popular: true, isActive: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(limit);
};

// Static method to get all categories with product counts
productSchema.statics.getCategoriesWithCounts = async function() {
  const categories = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  return categories.map(cat => ({
    category: cat._id,
    count: cat.count
  }));
};

// Pre-save middleware to handle sort order
productSchema.pre('save', async function(next) {
  if (this.isNew && this.sortOrder === 0) {
    const maxOrder = await this.constructor.findOne(
      { category: this.category },
      { sortOrder: 1 }
    ).sort({ sortOrder: -1 });
    
    this.sortOrder = maxOrder ? maxOrder.sortOrder + 1 : 1;
  }
  next();
});

// Method to toggle popular status
productSchema.methods.togglePopular = function() {
  this.popular = !this.popular;
  return this.save();
};

// Method to toggle active status
productSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
