import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create the context
const ProductContext = createContext();

// Custom hook to use the ProductContext
// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState({
    graphic_design: [],
    logo_branding: [],
    motion_graphic: [],
    websites: [],
    video_creation: [],
    social_media_plan: [],
    content_writing: [],
    app_development: [],
    pitch_deck: [],
    sponsorship_deck: [],
    grant_application: [],
    virtual_assistant: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProductsByCategory = async (category, activeOnly = true) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/products?category=${category}&active=${activeOnly}`
      );
      
      if (response.data.success) {
        return response.data.data.products;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching ${category} products:`, error);
      return [];
    }
  };
  const fetchAllProducts = async (activeOnly = true) => {
    try {
      setLoading(true);
      setError('');

      const categories = [
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
      ];

      const productPromises = categories.map(category => 
        fetchProductsByCategory(category, activeOnly)
      );
      
      const results = await Promise.all(productPromises);
      
      const newProducts = {};
      categories.forEach((category, index) => {
        newProducts[category] = results[index];
      });

      setProducts(newProducts);
    } catch (error) {
      console.error('Error fetching all products:', error);
      setError('Failed to fetch products. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => {
    fetchAllProducts(true);
  };

  const refreshAllProducts = () => {
    fetchAllProducts(false);
  };

  useEffect(() => {
    fetchAllProducts(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    products,
    loading,
    error,
    refreshProducts,
    refreshAllProducts,
    fetchProductsByCategory
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
