const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blackbumble-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, popular, active = 'true', search } = req.query;
    
    let query = {};
    
    // Filter by active status
    if (active === 'true') {
      query.isActive = true;
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by popular
    if (popular === 'true') {
      query.popular = true;
    }
    
    // Add search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search
      query.$or = [
        { name: searchRegex },
        { subtitle: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { features: { $in: [searchRegex] } },
        { tags: { $in: [searchRegex] } }
      ];
    }
    
    const products = await Product.find(query)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .sort({ sortOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: search ? `Found ${products.length} products for "${search}"` : 'Products retrieved successfully',
      data: { products, count: products.length, searchTerm: search || null }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving products'
    });
  }
});

// @route   GET /api/products/search
// @desc    Advanced search products
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 20, page = 1 } = req.query;
    
    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    let query = { isActive: true };
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }
    
    // Create search regex
    const searchRegex = new RegExp(q.trim(), 'i');
    
    // Advanced search across multiple fields with scoring
    const searchQuery = {
      ...query,
      $or: [
        { name: searchRegex },
        { subtitle: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { features: { $in: [searchRegex] } },
        { tags: { $in: [searchRegex] } }
      ]
    };
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute search with pagination
    const [products, totalCount] = await Promise.all([
      Product.find(searchQuery)
        .populate('createdBy', 'username firstName lastName')
        .populate('updatedBy', 'username firstName lastName')
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(searchQuery)
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;
    
    res.status(200).json({
      success: true,
      message: `Found ${totalCount} products for "${q}"`,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        },
        searchTerm: q,
        category: category || null
      }
    });
    
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during search'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all categories with product counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.getCategoriesWithCounts();
    
    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving categories'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error retrieving product'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin)
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      subtitle,
      description,
      category,
      price,
      currency,
      billing,
      features: featuresString,
      gradient,
      hoverGradient,
      popular,
      note,
      icon,
      deliveryTime,
      revisions,
      sortOrder
    } = req.body;

    // Parse features from JSON string
    let features;
    try {
      features = JSON.parse(featuresString || '[]');
    } catch (error) {
      features = [];
    }

    // Handle uploaded image
    let imageUrl = null;
    let imagePublicId = null;
    if (req.file) {
      imageUrl = req.file.path;
      imagePublicId = req.file.filename;
    }

    // Validation
    if (!name || !subtitle || !category || !price || !features || features.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name, subtitle, category, price, and at least one feature are required'
      });
    }

    // Create new product
    const product = new Product({
      name,
      subtitle,
      description,
      category,
      price,
      currency: currency || '$',
      billing: billing || 'One-time',
      features,
      gradient: gradient || 'from-purple-600 to-blue-600',
      hoverGradient: hoverGradient || 'from-purple-700 to-blue-700',
      popular: popular || false,
      note,
      icon,
      deliveryTime,
      revisions,
      sortOrder: sortOrder || 0,
      image: imageUrl,
      imagePublicId: imagePublicId,
      createdBy: req.admin._id
    });

    await product.save();

    // Populate creator info
    await product.populate('createdBy', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating product'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      subtitle,
      description,
      category,
      price,
      currency,
      billing,
      features: featuresString,
      gradient,
      hoverGradient,
      popular,
      isActive,
      note,
      icon,
      deliveryTime,
      revisions,
      sortOrder
    } = req.body;

    // Parse features from JSON string if provided
    let features;
    if (featuresString) {
      try {
        features = JSON.parse(featuresString);
      } catch (error) {
        features = undefined; // Keep existing features if parsing fails
      }
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Handle image upload
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (product.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(product.imagePublicId);
        } catch (error) {
          console.log('Error deleting old image:', error);
        }
      }
      
      // Set new image
      product.image = req.file.path;
      product.imagePublicId = req.file.filename;
    }

    // Update fields
    if (name !== undefined) product.name = name;
    if (subtitle !== undefined) product.subtitle = subtitle;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (currency !== undefined) product.currency = currency;
    if (billing !== undefined) product.billing = billing;
    if (features !== undefined) product.features = features;
    if (gradient !== undefined) product.gradient = gradient;
    if (hoverGradient !== undefined) product.hoverGradient = hoverGradient;
    if (popular !== undefined) product.popular = popular;
    if (isActive !== undefined) product.isActive = isActive;
    if (note !== undefined) product.note = note;
    if (icon !== undefined) product.icon = icon;
    if (deliveryTime !== undefined) product.deliveryTime = deliveryTime;
    if (revisions !== undefined) product.revisions = revisions;
    if (sortOrder !== undefined) product.sortOrder = sortOrder;
    
    product.updatedBy = req.admin._id;

    await product.save();

    // Populate creator and updater info
    await product.populate([
      { path: 'createdBy', select: 'username firstName lastName' },
      { path: 'updatedBy', select: 'username firstName lastName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error deleting product'
    });
  }
});

// @route   PATCH /api/products/:id/toggle-popular
// @desc    Toggle product popular status
// @access  Private (Admin)
router.patch('/:id/toggle-popular', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.togglePopular();
    product.updatedBy = req.admin._id;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.popular ? 'marked as popular' : 'unmarked as popular'}`,
      data: { product }
    });

  } catch (error) {
    console.error('Toggle popular error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling popular status'
    });
  }
});

// @route   PATCH /api/products/:id/toggle-active
// @desc    Toggle product active status
// @access  Private (Admin)
router.patch('/:id/toggle-active', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.toggleActive();
    product.updatedBy = req.admin._id;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'}`,
      data: { product }
    });

  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling active status'
    });
  }
});

module.exports = router;
