import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/navbar/Navbar';
import Hero from './components/herosection/Hero';

// Pages (we'll create these next)
import Home from './pages/Home';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminSignin from './pages/AdminSignin';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './components/footer/Footer';

// Context
import { ProductProvider } from './contexts/ProductContext';

function App() {
  return (
    <ProductProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/signin" element={<AdminSignin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

          </Routes>
          <Footer />

        </div>
      </Router>
    </ProductProvider>
  );
}

export default App;
