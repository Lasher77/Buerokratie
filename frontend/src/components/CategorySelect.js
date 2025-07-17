import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const SelectContainer = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #003E7E; /* BVMW Blau */
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    border-color: #E30613; /* BVMW Rot */
    outline: none;
  }
`;

const ErrorMessage = styled.div`
  color: #E30613; /* BVMW Rot */
  font-size: 14px;
  margin-top: 5px;
`;

const CategorySelect = ({ value, onChange, required = false }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Fehler beim Laden der Kategorien:', err);
        setError('Kategorien konnten nicht geladen werden.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div>Kategorien werden geladen...</div>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <SelectContainer>
      <Label htmlFor="category">Kategorie {required && '*'}</Label>
      <Select
        id="category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">-- Bitte wählen --</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
    </SelectContainer>
  );
};

export default CategorySelect;

