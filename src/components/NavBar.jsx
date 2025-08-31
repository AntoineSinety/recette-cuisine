// src/components/NavBar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/img/logo.png';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <Link to="/" onClick={closeMenu}>
          <img className="navbar__logo" src={logo} alt="Logo Recettes" />
        </Link>
      </div>
      
      <button 
        className={`navbar__hamburger ${isMenuOpen ? 'navbar__hamburger--active' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu de navigation"
        aria-expanded={isMenuOpen}
      >
        <span className="navbar__hamburger-line"></span>
        <span className="navbar__hamburger-line"></span>
        <span className="navbar__hamburger-line"></span>
      </button>

      <div className={`navbar__menu ${isMenuOpen ? 'navbar__menu--active' : ''}`}>
        <ul className="navbar__list">
          <li className="navbar__item">
            <Link 
              to="/" 
              className={`navbar__link ${isActiveLink('/') ? 'navbar__link--active' : ''}`}
              onClick={closeMenu}
            >
              <span className="navbar__link-icon">🏠</span>
              Accueil
            </Link>
          </li>
          <li className="navbar__item">
            <Link 
              to="/add-recipe" 
              className={`navbar__link ${isActiveLink('/add-recipe') ? 'navbar__link--active' : ''}`}
              onClick={closeMenu}
            >
              <span className="navbar__link-icon">➕</span>
              Ajouter une Recette
            </Link>
          </li>
          <li className="navbar__item">
            <Link 
              to="/manage-ingredients" 
              className={`navbar__link ${isActiveLink('/manage-ingredients') ? 'navbar__link--active' : ''}`}
              onClick={closeMenu}
            >
              <span className="navbar__link-icon">🥄</span>
              Gérer les Ingrédients
            </Link>
          </li>
          <li className="navbar__item">
            <Link 
              to="/menu-planning" 
              className={`navbar__link ${isActiveLink('/menu-planning') ? 'navbar__link--active' : ''}`}
              onClick={closeMenu}
            >
              <span className="navbar__link-icon">📅</span>
              Menu de la semaine
            </Link>
          </li>
          <li className="navbar__item">
            <Link 
              to="/shopping-list" 
              className={`navbar__link ${isActiveLink('/shopping-list') ? 'navbar__link--active' : ''}`}
              onClick={closeMenu}
            >
              <span className="navbar__link-icon">🛒</span>
              Liste de courses
            </Link>
          </li>
        </ul>
        
        <div className="navbar__overlay" onClick={closeMenu}></div>
      </div>
    </nav>
  );
};

export default NavBar;
