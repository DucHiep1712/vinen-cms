import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import EventsTable from './features/events/EventsTable';
import EventForm from './features/events/EventForm';
import './App.css'
import Navbar from './components/ui/Navbar';
import React from 'react';
import NewsIndexPage from './pages/news/index';
import EventEditPage from './pages/events/[id]/edit';
import NewsCreatePage from './pages/news/new';
import NewsEditPage from './pages/news/[id]/edit';
import ProductsIndexPage from './pages/products/index';
import ProductsCreatePage from './pages/products/new';
import ProductsEditPage from './pages/products/[id]/edit';

function AppRoutes() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/auth');
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/auth" element={<Auth />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/events" element={<EventsTable />} />
        <Route path="/events/new" element={<EventForm />} />
        <Route path="/events/:id/edit" element={<EventEditPage />} />
        <Route path="/news" element={<NewsIndexPage />} />
        <Route path="/news/new" element={<NewsCreatePage />} />
        <Route path="/news/:id/edit" element={<NewsEditPage />} />
        <Route path="/products" element={<ProductsIndexPage />} />
        <Route path="/products/new" element={<ProductsCreatePage />} />
        <Route path="/products/:id/edit" element={<ProductsEditPage />} />
        <Route path="/" element={<Navigate to="/events" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
