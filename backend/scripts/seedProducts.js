const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Admin = require('../models/Admin');

// Load environment variables
dotenv.config();

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Find or create admin for product creation
    let admin = await Admin.findOne({ role: 'super_admin' });
    if (!admin) {
      console.log('No admin found, creating default admin first...');
      await Admin.createDefaultAdmin();
      admin = await Admin.findOne({ role: 'super_admin' });
    }

    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Graphic Design Products
    const graphicDesignProducts = [
      {
        name: "Bootstrap",
        subtitle: "Small Business | Startup Package",
        description: "Perfect starter package for small businesses and startups looking to establish their digital presence.",
        category: "graphic_design",
        price: 70,
        currency: "$",
        billing: "Monthly",
        features: [
          "4 Graphics Assets",
          "1 Brand Logo Design",
          "3 Revisions",
          "WordPress site (2 pages)"
        ],
        gradient: "from-purple-600 to-blue-600",
        hoverGradient: "from-purple-700 to-blue-700",
        popular: false,
        note: "N.B: ask for hosting and domain pricing",
        deliveryTime: "5-7 Days",
        revisions: "3 Revisions",
        sortOrder: 1,
        createdBy: admin._id
      },
      {
        name: "Rise",
        subtitle: "Small Business | Startup Package",
        description: "Enhanced package with more assets and features for growing businesses.",
        category: "graphic_design",
        price: 80,
        currency: "$",
        billing: "Monthly",
        features: [
          "6 Graphics Assets",
          "2 Brand Logo Designs",
          "4 Revisions",
          "WordPress site (4 pages)"
        ],
        gradient: "from-pink-500 to-purple-600",
        hoverGradient: "from-pink-600 to-purple-700",
        popular: true,
        note: "N.B: ask for hosting and domain pricing",
        deliveryTime: "3-5 Days",
        revisions: "4 Revisions",
        sortOrder: 2,
        createdBy: admin._id
      },
      {
        name: "Premium",
        subtitle: "Small Business | Startup Package",
        description: "Complete package with maximum assets and comprehensive website solution.",
        category: "graphic_design",
        price: 85,
        currency: "$",
        billing: "Monthly",
        features: [
          "10 Graphics Assets",
          "3 Brand Logo Designs",
          "8 Revisions",
          "WordPress site (6 pages)"
        ],
        gradient: "from-blue-600 to-purple-600",
        hoverGradient: "from-blue-700 to-purple-700",
        popular: false,
        note: "N.B: ask for hosting and domain pricing",
        deliveryTime: "2-3 Days",
        revisions: "8 Revisions",
        sortOrder: 3,
        createdBy: admin._id
      }
    ];

    // Logo Branding Products
    const logoBrandingProducts = [
      {
        name: "Basic",
        subtitle: "Logo Design Package",
        description: "Essential logo design package for new businesses and startups.",
        category: "logo_branding",
        price: 150,
        currency: "$",
        billing: "One-time",
        features: [
          "Basic Contemporary Design",
          "2 Revisions",
          "High-res Files (PNG, JPG)",
          "5-7 Days Delivery"
        ],
        gradient: "from-purple-600 to-blue-600",
        hoverGradient: "from-purple-700 to-blue-700",
        popular: false,
        deliveryTime: "5-7 Days",
        revisions: "2 Revisions",
        sortOrder: 1,
        createdBy: admin._id
      },
      {
        name: "Modern & Detail",
        subtitle: "Logo Design Package",
        description: "Professional logo design with modern aesthetics and detailed craftsmanship.",
        category: "logo_branding",
        price: 220,
        currency: "$",
        billing: "One-time",
        features: [
          "Modern & Detail Design",
          "4 Revisions",
          "Vector Files (AI, EPS, SVG)",
          "3-5 Days Delivery"
        ],
        gradient: "from-pink-500 to-purple-600",
        hoverGradient: "from-pink-600 to-purple-700",
        popular: true,
        deliveryTime: "3-5 Days",
        revisions: "4 Revisions",
        sortOrder: 2,
        createdBy: admin._id
      },
      {
        name: "Premium",
        subtitle: "Logo Design Package",
        description: "Complete branding solution with premium design and comprehensive brand package.",
        category: "logo_branding",
        price: 350,
        currency: "$",
        billing: "One-time",
        features: [
          "Premium Custom Design",
          "Unlimited Revisions",
          "Complete Brand Package",
          "1-2 Days Delivery"
        ],
        gradient: "from-blue-600 to-purple-600",
        hoverGradient: "from-blue-700 to-purple-700",
        popular: false,
        deliveryTime: "1-2 Days",
        revisions: "Unlimited Revisions",
        sortOrder: 3,
        createdBy: admin._id
      }
    ];

    // Insert products
    const allProducts = [...graphicDesignProducts, ...logoBrandingProducts];
    
    for (const productData of allProducts) {
      const product = new Product(productData);
      await product.save();
      console.log(`Created product: ${product.name} (${product.category})`);
    }

    console.log(`Successfully seeded ${allProducts.length} products`);
    console.log('Product seeding completed');
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
