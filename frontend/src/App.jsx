import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/navbar/Navbar';
import Hero from './components/herosection/Hero';

// Pages (we'll create these next)
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminSignin from './pages/AdminSignin';
import AdminDashboard from './pages/AdminDashboard';
import UserSignup from './pages/UserSignup';
import UserSignin from './pages/UserSignin';
import UserDashboard from './pages/UserDashboard';
import Notifications from './pages/Notifications';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Footer from './components/footer/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Context
import { ProductProvider } from './contexts/ProductContext';
import { UserAuthProvider } from './contexts/UserAuthContext';

function App() {
  return (
    <ProductProvider>
      <UserAuthProvider>
        <Router>
          <ScrollToTop />
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/signin" element={<AdminSignin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/user/signup" element={
              <ProtectedRoute requireAuth={false}>
                <UserSignup />
              </ProtectedRoute>
            } />
            <Route path="/user/signin" element={
              <ProtectedRoute requireAuth={false}>
                <UserSignin />
              </ProtectedRoute>
            } />
            <Route path="/user/dashboard" element={
              <ProtectedRoute requireAuth={true}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute requireAuth={true}>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/checkout/:serviceId" element={
              <ProtectedRoute requireAuth={true}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/checkout/success" element={
              <ProtectedRoute requireAuth={true}>
                <CheckoutSuccess />
              </ProtectedRoute>
            } />

          </Routes>
          <Footer />

        </div>
        </Router>
      </UserAuthProvider>
    </ProductProvider>
  );
}

export default App;
