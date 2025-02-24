// src/components/NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/img/logo.png';

const NavBar = () => {
  return (
    <nav className="navbar">
      <img className="logo-site" src={logo} alt="" />
      <ul>
        <li>
          <Link to="/">Accueil</Link>
        </li>
        <li>
          <Link to="/add-recipe">Ajouter une Recette</Link>
        </li>
        <li>
          <Link to="/manage-ingredients">Gérer les Ingrédients</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
