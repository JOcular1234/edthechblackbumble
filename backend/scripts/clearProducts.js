const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

// Load environment variables
dotenv.config();

const clearProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Connected to MongoDB');

    // Clear all existing products
    const result = await Product.deleteMany({});
    console.log(`Deleted ${result.deletedCount} products from database`);

    console.log('All products cleared successfully!');
    console.log('Now you can add products only through the admin dashboard.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error clearing products:', error);
    process.exit(1);
  }
};

clearProducts();
