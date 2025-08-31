// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddRecipePage from './pages/AddRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import IngredientManagerPage from './pages/IngredientManagerPage';
import MenuPlanningPage from './pages/MenuPlanningPage';
import ShoppingListPage from './pages/ShoppingListPage';
import NavBar from './components/NavBar';
import { ToastProvider } from './components/ToastContainer';
import './assets/styles/app.scss';

const App = () => {
  // Déterminer la base URL selon l'environnement
  const basename = process.env.NODE_ENV === 'production' ? '/recette-cuisine' : '';
  
  return (
    <ToastProvider>
      <Router basename={basename}>
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add-recipe" element={<AddRecipePage />} />
            <Route path="/edit/:id" element={<EditRecipePage />} />
            <Route path="/manage-ingredients" element={<IngredientManagerPage />} />
            <Route path="/menu-planning" element={<MenuPlanningPage />} />
            <Route path="/shopping-list" element={<ShoppingListPage />} />
          </Routes>
        </main>
      </Router>
    </ToastProvider>
  );
};

export default App;
