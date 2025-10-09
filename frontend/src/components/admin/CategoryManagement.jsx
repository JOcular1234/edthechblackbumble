import React, { useState, useEffect } from 'react';
import { categoryConfig } from '../../config/categoryConfig';

const CategoryManagement = () => {
  const [categories, setCategories] = useState(categoryConfig);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    key: '',
    title: '',
    description: '',
    bgColor: 'bg-gray-50'
  });

  const bgColorOptions = [
    { value: 'bg-gray-50', label: 'Light Gray' },
    { value: 'bg-white', label: 'White' },
    { value: 'bg-blue-50', label: 'Light Blue' },
    { value: 'bg-green-50', label: 'Light Green' },
    { value: 'bg-purple-50', label: 'Light Purple' },
    { value: 'bg-yellow-50', label: 'Light Yellow' },
    { value: 'bg-pink-50', label: 'Light Pink' },
    { value: 'bg-indigo-50', label: 'Light Indigo' }
  ];

  const handleEdit = (categoryKey) => {
    setEditingCategory({
      key: categoryKey,
      ...categories[categoryKey]
    });
  };

  const handleSave = () => {
    if (editingCategory) {
      const updatedCategories = {
        ...categories,
        [editingCategory.key]: {
          title: editingCategory.title,
          description: editingCategory.description,
          bgColor: editingCategory.bgColor
        }
      };
      setCategories(updatedCategories);
      
      // In a real app, you'd save this to a database or API
      localStorage.setItem('categoryConfig', JSON.stringify(updatedCategories));
      
      setEditingCategory(null);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.key && newCategory.title) {
      const updatedCategories = {
        ...categories,
        [newCategory.key]: {
          title: newCategory.title,
          description: newCategory.description,
          bgColor: newCategory.bgColor
        }
      };
      setCategories(updatedCategories);
      
      // Save to localStorage (in real app, save to database)
      localStorage.setItem('categoryConfig', JSON.stringify(updatedCategories));
      
      setNewCategory({
        key: '',
        title: '',
        description: '',
        bgColor: 'bg-gray-50'
      });
      setShowAddForm(false);
    }
  };

  const handleDelete = (categoryKey) => {
    if (window.confirm(`Are you sure you want to delete the ${categories[categoryKey].title} category?`)) {
      const updatedCategories = { ...categories };
      delete updatedCategories[categoryKey];
      setCategories(updatedCategories);
      
      // Save to localStorage (in real app, save to database)
      localStorage.setItem('categoryConfig', JSON.stringify(updatedCategories));
    }
  };

  // Load saved configuration on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('categoryConfig');
    if (savedConfig) {
      try {
        setCategories(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading saved category config:', error);
      }
    }
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
          <p className="text-gray-600">Manage service category titles, descriptions, and appearance</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add New Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(categories).map(([key, category]) => (
          <div key={key} className={`${category.bgColor} rounded-lg p-6 border border-gray-200`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{category.title}</h3>
                <p className="text-xs text-gray-500">Key: {key}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(key)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(key)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{category.description}</p>
            <div className="mt-3 text-xs text-gray-500">
              Background: {category.bgColor}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Edit Category: {editingCategory.key}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingCategory.title}
                  onChange={(e) => setEditingCategory({...editingCategory, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <select
                  value={editingCategory.bgColor}
                  onChange={(e) => setEditingCategory({...editingCategory, bgColor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {bgColorOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Category Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add New Category</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Key</label>
                <input
                  type="text"
                  value={newCategory.key}
                  onChange={(e) => setNewCategory({...newCategory, key: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., data_analytics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newCategory.title}
                  onChange={(e) => setNewCategory({...newCategory, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Data Analytics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief description of the services in this category"
                />
              </div>
              
              <div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <select
                  value={newCategory.bgColor}
                  onChange={(e) => setNewCategory({...newCategory, bgColor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {bgColorOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
