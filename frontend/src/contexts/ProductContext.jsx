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

  // Search products function
  const searchProducts = async (searchQuery, category = null, page = 1, limit = 20) => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/products/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${limit}`;
      
      if (category) {
        url += `&category=${category}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        return response.data.data;
      }
      return { products: [], pagination: null, searchTerm: searchQuery };
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Failed to search products');
      return { products: [], pagination: null, searchTerm: searchQuery };
    } finally {
      setLoading(false);
    }
  };

  // Get all products with optional search
  const getAllProducts = async (searchQuery = null, category = null) => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/products?active=true`;
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (category) {
        url += `&category=${category}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        return response.data.data.products;
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Optimized: Single API call instead of 12 separate calls
  const fetchAllProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Single API call to get all products
      const response = await axios.get(`${API_BASE_URL}/api/products?active=true`);
      
      if (response.data.success) {
        const allProducts = response.data.data.products;
        
        // Group products by category
        const productsByCategory = {
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
        };

        allProducts.forEach(product => {
          if (productsByCategory[product.category]) {
            productsByCategory[product.category].push(product);
          }
        });

        setProducts(productsByCategory);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => {
    fetchAllProducts();
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const value = {
    products,
    loading,
    error,
    refreshProducts,
    fetchProductsByCategory,
    searchProducts,
    getAllProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
