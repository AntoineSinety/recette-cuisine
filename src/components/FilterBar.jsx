// src/components/FilterBar.jsx
import React from 'react';

const FilterBar = ({ onFilterChange }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onFilterChange(name, value);
  };

  return (
    <div className="filter">
      <input type="text" name="ingredient" placeholder="Filtrer par ingrédient" onChange={handleChange} />
      <input type="text" name="type" placeholder="Filtrer par type" onChange={handleChange} />
      <input type="number" name="time" placeholder="Filtrer par temps (min)" onChange={handleChange} />
    </div>
  );
};

export default FilterBar;
