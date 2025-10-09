const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edtech-blackbumble-db';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected for category migration');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.error('💡 Make sure MongoDB is running or check your MONGO_URI in .env file');
    process.exit(1);
  }
};

// Category mapping from old to new
const categoryMapping = {
  // Keep existing categories that match
  'graphic_design': 'graphic_design',
  'logo_branding': 'logo_branding',
  'virtual_assistant': 'virtual_assistant',
  
  // Map old categories to new ones
  'web_development': 'websites',
  'mobile_app': 'app_development',
  'digital_marketing': 'social_media_plan',
  'seo': 'content_writing', // SEO often involves content
  'ui_ux_design': 'websites', // UI/UX is part of website design
  
  // New categories (no migration needed, will be empty initially)
  'motion_graphic': 'motion_graphic',
  'video_creation': 'video_creation',
  'pitch_deck': 'pitch_deck',
  'sponsorship_deck': 'sponsorship_deck',
  'grant_application': 'grant_application'
};

const migrateCategories = async () => {
  try {
    console.log('🚀 Starting category migration...');
    
    // Get all products
    const allProducts = await Product.find({});
    console.log(`📦 Found ${allProducts.length} products to migrate`);
    
    let migrationCount = 0;
    let skippedCount = 0;
    
    for (const product of allProducts) {
      const oldCategory = product.category;
      const newCategory = categoryMapping[oldCategory];
      
      if (newCategory && newCategory !== oldCategory) {
        // Update the product category
        await Product.findByIdAndUpdate(product._id, {
          category: newCategory
        });
        
        console.log(`✅ Migrated product "${product.name}" from ${oldCategory} to ${newCategory}`);
        migrationCount++;
      } else if (newCategory === oldCategory) {
        console.log(`⏭️  Product "${product.name}" already has correct category: ${oldCategory}`);
        skippedCount++;
      } else {
        console.log(`⚠️  No mapping found for category: ${oldCategory} (product: ${product.name})`);
        skippedCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Migrated: ${migrationCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products`);
    console.log(`📦 Total: ${allProducts.length} products`);
    
    // Show current category distribution
    console.log('\n📈 Current Category Distribution:');
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} products`);
    });
    
    console.log('\n🎉 Category migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
};

const addSampleProductsForNewCategories = async () => {
  try {
    console.log('\n🆕 Adding sample products for new categories...');
    
    // Get the first admin user to use as createdBy
    const Admin = require('../models/Admin');
    const admin = await Admin.findOne({});
    
    if (!admin) {
      console.log('⚠️  No admin user found. Skipping sample product creation.');
      console.log('💡 You can add products manually through the admin panel.');
      return;
    }
    
    const newCategories = [
      'motion_graphic',
      'video_creation', 
      'pitch_deck',
      'sponsorship_deck',
      'grant_application'
    ];
    
    const sampleProducts = [
      {
        name: 'Professional Motion Graphics Package',
        subtitle: 'Animated visuals for your brand',
        description: 'High-quality motion graphics for marketing videos, social media, and presentations',
        category: 'motion_graphic',
        price: 299,
        currency: '$',
        billing: 'One-time',
        features: [
          '3 Custom motion graphic animations',
          '4K resolution output',
          'Source files included',
          '2 rounds of revisions',
          '5-day delivery'
        ],
        gradient: 'from-purple-600 to-pink-600',
        hoverGradient: 'from-purple-700 to-pink-700',
        isActive: true,
        popular: false,
        createdBy: admin._id
      },
      {
        name: 'Complete Video Production',
        subtitle: 'From concept to final cut',
        description: 'Full-service video creation including scripting, filming, editing, and animation',
        category: 'video_creation',
        price: 899,
        currency: '$',
        billing: 'One-time',
        features: [
          'Script writing and storyboard',
          'Professional video editing',
          '2D/3D animation elements',
          'Color grading and audio mixing',
          'Multiple format delivery'
        ],
        gradient: 'from-red-500 to-pink-600',
        hoverGradient: 'from-red-600 to-pink-700',
        isActive: true,
        popular: true,
        createdBy: admin._id
      },
      {
        name: 'Investor Pitch Deck',
        subtitle: 'Compelling presentation design',
        description: 'Professional pitch deck design to secure funding and impress investors',
        category: 'pitch_deck',
        price: 499,
        currency: '$',
        billing: 'One-time',
        features: [
          '15-20 slide professional design',
          'Custom graphics and charts',
          'Investor-focused content structure',
          'PowerPoint and PDF formats',
          '3 rounds of revisions'
        ],
        gradient: 'from-blue-600 to-indigo-600',
        hoverGradient: 'from-blue-700 to-indigo-700',
        isActive: true,
        popular: false,
        createdBy: admin._id
      },
      {
        name: 'Sponsorship Proposal Deck',
        subtitle: 'Win corporate partnerships',
        description: 'Professional sponsorship deck to attract and secure corporate sponsors',
        category: 'sponsorship_deck',
        price: 399,
        currency: '$',
        billing: 'One-time',
        features: [
          'Customized sponsorship packages',
          'ROI projections and metrics',
          'Brand alignment strategies',
          'Professional design layout',
          'Editable source files'
        ],
        gradient: 'from-green-500 to-teal-600',
        hoverGradient: 'from-green-600 to-teal-700',
        isActive: true,
        popular: false,
        createdBy: admin._id
      },
      {
        name: 'Grant Application Package',
        subtitle: 'Secure funding successfully',
        description: 'Complete grant application writing and documentation services',
        category: 'grant_application',
        price: 799,
        currency: '$',
        billing: 'One-time',
        features: [
          'Grant research and identification',
          'Professional application writing',
          'Budget planning and justification',
          'Supporting documentation',
          'Submission guidance'
        ],
        gradient: 'from-yellow-500 to-orange-600',
        hoverGradient: 'from-yellow-600 to-orange-700',
        isActive: true,
        popular: false,
        createdBy: admin._id
      }
    ];
    
    let addedCount = 0;
    
    for (const productData of sampleProducts) {
      // Check if a product already exists in this category
      const existingProduct = await Product.findOne({ category: productData.category });
      
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Added sample product: ${productData.name}`);
        addedCount++;
      } else {
        console.log(`⏭️  Category ${productData.category} already has products, skipping sample`);
      }
    }
    
    console.log(`\n🎉 Added ${addedCount} sample products for new categories!`);
    
  } catch (error) {
    console.error('❌ Error adding sample products:', error);
    throw error;
  }
};

const runMigration = async () => {
  try {
    await connectDB();
    await migrateCategories();
    await addSampleProductsForNewCategories();
    
    console.log('\n✨ All migration tasks completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. Check the frontend to see updated categories');
    console.log('3. Add more products through the admin panel as needed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
if (require.main === module) {
  runMigration();
}

module.exports = { migrateCategories, addSampleProductsForNewCategories };
