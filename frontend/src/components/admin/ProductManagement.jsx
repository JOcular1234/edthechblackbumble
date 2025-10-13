import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useProducts } from '../../contexts/ProductContext';
import { API_BASE_URL } from '../../config/api';
import { Plus, Edit, Star, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';

const ProductManagement = () => {
  const { refreshProducts } = useProducts();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    category: 'graphic_design',
    price: '',
    currency: '$',
    billing: 'One-time',
    features: [''],
    gradient: 'from-purple-600 to-blue-600',
    hoverGradient: 'from-purple-700 to-blue-700',
    popular: false,
    note: '',
    icon: '',
    deliveryTime: '',
    revisions: '',
    image: null,
    imageFile: null
  });

  const categories = [
    { value: 'graphic_design', label: 'Graphic Design' },
    { value: 'logo_branding', label: 'Logo | Branding' },
    { value: 'motion_graphic', label: 'Motion Graphic' },
    { value: 'websites', label: 'Websites' },
    { value: 'video_creation', label: 'Video Creation | Video Editing | Animation' },
    { value: 'social_media_plan', label: 'Social Media Plan' },
    { value: 'content_writing', label: 'Newsletter | Content Writing' },
    { value: 'app_development', label: 'App Development | Software' },
    { value: 'pitch_deck', label: 'Pitch Deck | Business Plan Deck' },
    { value: 'sponsorship_deck', label: 'Sponsorship Deck' },
    { value: 'grant_application', label: 'Grant Application' },
    { value: 'virtual_assistant', label: 'Virtual Assistant' }
  ];

  const billingOptions = ['One-time', 'Monthly', 'Yearly', 'Weekly'];

  const gradientOptions = [
    { value: 'from-purple-600 to-blue-600', label: 'Purple to Blue', hover: 'from-purple-700 to-blue-700' },
    { value: 'from-pink-500 to-purple-600', label: 'Pink to Purple', hover: 'from-pink-600 to-purple-700' },
    { value: 'from-blue-600 to-purple-600', label: 'Blue to Purple', hover: 'from-blue-700 to-purple-700' },
    { value: 'from-green-500 to-blue-600', label: 'Green to Blue', hover: 'from-green-600 to-blue-700' },
    { value: 'from-yellow-500 to-orange-600', label: 'Yellow to Orange', hover: 'from-yellow-600 to-orange-700' },
    { value: 'from-red-500 to-pink-600', label: 'Red to Pink', hover: 'from-red-600 to-pink-700' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/products?active=false`);
      
      if (response.data.success) {
        setProducts(response.data.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        image: imageUrl
      }));
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, features: newFeatures }));
    }
  };

  const handleGradientChange = (gradientValue) => {
    const selectedGradient = gradientOptions.find(g => g.value === gradientValue);
    setFormData(prev => ({
      ...prev,
      gradient: gradientValue,
      hoverGradient: selectedGradient ? selectedGradient.hover : gradientValue
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subtitle: '',
      description: '',
      category: 'graphic_design',
      price: '',
      currency: '$',
      billing: 'One-time',
      features: [''],
      gradient: 'from-purple-600 to-blue-600',
      hoverGradient: 'from-purple-700 to-blue-700',
      popular: false,
      note: '',
      icon: '',
      deliveryTime: '',
      revisions: ''
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('adminToken');

      const filteredFeatures = formData.features.filter(feature => feature.trim() !== '');
      
      if (filteredFeatures.length === 0) {
        setError('At least one feature is required');
        return;
      }

      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'imageFile' && key !== 'image') {
          if (key === 'features') {
            formDataToSend.append(key, JSON.stringify(filteredFeatures));
          } else if (key === 'price') {
            formDataToSend.append(key, parseFloat(formData.price));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      let response;
      if (editingProduct) {
        response = await axios.put(
          `${API_BASE_URL}/api/products/${editingProduct._id}`,
          formDataToSend,
          config
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/api/products`,
          formDataToSend,
          config
        );
      }

      if (response.data.success) {
        await fetchProducts();
        refreshProducts();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      subtitle: product.subtitle,
      description: product.description || '',
      category: product.category,
      price: product.price.toString(),
      currency: product.currency,
      billing: product.billing,
      features: product.features,
      gradient: product.gradient,
      hoverGradient: product.hoverGradient,
      popular: product.popular,
      note: product.note || '',
      icon: product.icon || '',
      deliveryTime: product.deliveryTime || '',
      revisions: product.revisions || '',
      image: product.image || null,
      imageFile: null
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.delete(
        `${API_BASE_URL}/api/products/${productId}`,
        config
      );

      if (response.data.success) {
        await fetchProducts();
        refreshProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const togglePopular = async (productId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.patch(
        `${API_BASE_URL}/api/products/${productId}/toggle-popular`,
        {},
        config
      );

      if (response.data.success) {
        await fetchProducts();
        refreshProducts();
      }
    } catch (error) {
      console.error('Error toggling popular:', error);
      setError(error.response?.data?.message || 'Failed to update product');
    }
  };

  const toggleActive = async (productId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.patch(
        `${API_BASE_URL}/api/products/${productId}/toggle-active`,
        {},
        config
      );

      if (response.data.success) {
        await fetchProducts();
        refreshProducts();
      }
    } catch (error) {
      console.error('Error toggling active:', error);
      setError(error.response?.data?.message || 'Failed to update product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage your services and offerings</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(95vh-8rem)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                {/* Basic Info Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle *
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter subtitle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    {formData.image && (
                      <div className="mt-3">
                        <img 
                          src={formData.image} 
                          alt="Product preview" 
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & Styling Column */}
                <div className="space-y-6">
                  <div className="flex space-x-3">
                    <div className="w-16">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <input
                        type="text"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="$"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Type
                    </label>
                    <select
                      name="billing"
                      value={formData.billing}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {billingOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gradient Style
                    </label>
                    <select
                      name="gradient"
                      value={formData.gradient}
                      onChange={(e) => handleGradientChange(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {gradientOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      placeholder="📦"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter product description..."
                />
              </div>

              {/* Features */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features *
                </label>
                <div className="space-y-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Time
                  </label>
                  <input
                    type="text"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    placeholder="3-5 Days"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revisions
                  </label>
                  <input
                    type="text"
                    name="revisions"
                    value={formData.revisions}
                    onChange={handleInputChange}
                    placeholder="3 Revisions"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="popular"
                    checked={formData.popular}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Mark as Popular
                  </label>
                </div>
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Additional information or disclaimers"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-400 text-6xl mb-6">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first service offering</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Product</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 overflow-hidden">
              {product.image && (
                <div className="mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-600 mb-2">{product.subtitle}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="capitalize">{product.category.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    <span className="font-medium text-indigo-600">
                      {product.currency}{product.price} / {product.billing}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-3">
                  {product.popular && (
                    <div className="mb-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                <ul className="space-y-1">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                  {product.features.length > 3 && (
                    <li className="text-sm text-gray-500">+{product.features.length - 3} more</li>
                  )}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => togglePopular(product._id)}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    product.popular 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className="w-3 h-3" />
                  <span>{product.popular ? 'Unpopular' : 'Popular'}</span>
                </button>
                <button
                  onClick={() => toggleActive(product._id)}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    product.isActive 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {product.isActive ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                  <span>{product.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;