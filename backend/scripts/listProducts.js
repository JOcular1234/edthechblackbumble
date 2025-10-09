const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Admin = require('../models/Admin');

// Load environment variables
dotenv.config();

const listProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({}).populate('createdBy', 'username firstName lastName');
    
    console.log(`\n📦 Found ${products.length} products in database:\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.category})`);
      console.log(`   Price: ${product.currency}${product.price} - ${product.billing}`);
      console.log(`   Popular: ${product.popular ? 'Yes' : 'No'}`);
      console.log(`   Active: ${product.isActive ? 'Yes' : 'No'}`);
      console.log(`   Created by: ${product.createdBy?.username || 'Unknown'}`);
      console.log(`   Created: ${product.createdAt}`);
      console.log('');
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error listing products:', error);
    process.exit(1);
  }
};

listProducts();
