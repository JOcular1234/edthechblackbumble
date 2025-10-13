
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FileText, Users, Mail, BarChart3, Settings, LogOut, Bell, User, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import ProductManagement from '../components/admin/ProductManagement';
import OrderManagement from '../components/admin/OrderManagement';
import UserManagement from '../components/admin/UserManagement';
import ContactManagement from '../components/admin/ContactManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({
    products: { total: 0, change: 0, changeType: 'increase' },
    orders: { total: 0, change: 0, changeType: 'increase' },
    users: { total: 0, change: 0, changeType: 'increase' },
    revenue: { total: 0, change: 0, changeType: 'increase' }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Fetching stats with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch stats: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      if (data.success) {
        setStats(data.data.overview);
        console.log('Stats updated successfully');
      } else {
        console.error('API returned success: false', data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default values if fetch fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    const storedAdminData = localStorage.getItem('adminData');
    
    if (!token || !storedAdminData) {
      navigate('/admin/signin');
      return;
    }

    try {
      setAdminData(JSON.parse(storedAdminData));
      fetchStats(); // Fetch real stats from backend
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/admin/signin');
    }
  }, [navigate]);


  if (!adminData || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'products', name: 'Products', icon: Package },
    { id: 'orders', name: 'Orders', icon: FileText },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'contacts', name: 'Contacts', icon: Mail },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const statIcons = [
    { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-100' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={fetchStats}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh Stats"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{adminData.fullName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  adminData.role === 'super_admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {adminData.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
               
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Products', 
              value: stats.products.total, 
              change: `${stats.products.change >= 0 ? '+' : ''}${stats.products.change}%`, 
              changeType: stats.products.changeType,
              icon: statIcons[0] 
            },
            { 
              label: 'Total Orders', 
              value: stats.orders.total, 
              change: `${stats.orders.change >= 0 ? '+' : ''}${stats.orders.change}%`, 
              changeType: stats.orders.changeType,
              icon: statIcons[1] 
            },
            { 
              label: 'Total Users', 
              value: stats.users.total, 
              change: `${stats.users.change >= 0 ? '+' : ''}${stats.users.change}%`, 
              changeType: stats.users.changeType,
              icon: statIcons[2] 
            },
            { 
              label: 'Total Revenue', 
              value: `$${stats.revenue.total.toLocaleString()}`, 
              change: `${stats.revenue.change >= 0 ? '+' : ''}${stats.revenue.change}%`, 
              changeType: stats.revenue.changeType,
              icon: statIcons[3] 
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'} mt-1`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.icon.bg}`}>
                  <stat.icon.icon className={`w-6 h-6 ${stat.icon.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-xl shadow-sm border border-gray-200 h-fit sticky top-24 self-start">
            <nav className="p-6">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200'
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 mr-3 transition-colors ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 ml-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {activeTab === 'products' && <ProductManagement />}
              {activeTab === 'orders' && <OrderManagement />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'contacts' && <ContactManagement />}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Analytics Overview</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Sales Over Time</h4>
                      {/* Placeholder for chart - Install react-chartjs-2 and chart.js for real implementation */}
                      <div className="h-64 bg-white rounded-lg flex items-center justify-center border">
                        <p className="text-gray-500">Chart placeholder (e.g., Line Chart for Sales)</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">User Growth</h4>
                      <div className="h-64 bg-white rounded-lg flex items-center justify-center border">
                        <p className="text-gray-500">Chart placeholder (e.g., Bar Chart for Users)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Settings</h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-600">General settings and configurations will be available here soon.</p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;