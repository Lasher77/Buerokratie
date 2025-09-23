import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../api';
import styled from 'styled-components';


const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const Label = styled.label`
  font-weight: 700;
  color: #2d2d2d;
  letter-spacing: 0.01em;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 20px;
  padding-right: 3.5rem;
  border: none;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #f7f7fb, #ffffff);
  color: #2d2d2d;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
  appearance: none;
  cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, #58585A 50%),
    linear-gradient(135deg, #58585A 50%, transparent 50%),
    linear-gradient(to right, transparent, transparent);
  background-position: calc(100% - 28px) calc(50% - 2px),
    calc(100% - 22px) calc(50% - 2px),
    calc(100% - 3.2rem) 50%;
  background-size: 7px 7px, 7px 7px, 1px 50%;
  background-repeat: no-repeat;

  &:hover {
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 159, 227, 0.25);
    background-color: #fff;
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
        const response = await axios.get(`${API_BASE}/api/categories`);
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

