// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddRecipePage from './pages/AddRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import IngredientManagerPage from './pages/IngredientManagerPage';
import NavBar from './components/NavBar';
import './assets/styles/app.scss';

const App = () => {
  return (
    <Router>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-recipe" element={<AddRecipePage />} />
          <Route path="/edit/:id" element={<EditRecipePage />} />
          <Route path="/manage-ingredients" element={<IngredientManagerPage />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
