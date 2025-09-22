import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { API_BASE } from '../api';

const SelectContainer = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #E30613;
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

const WZCategorySelect = ({ value, onChange, required = false }) => {
  const [wzCategories, setWzCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWzCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/wz-categories`);
        setWzCategories(response.data);
      } catch (err) {
        console.error('Fehler beim Laden der WZ-Kategorien:', err);
        setError('WZ-Kategorien konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchWzCategories();
  }, []);

  if (loading) return <div>WZ-Kategorien werden geladen...</div>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <SelectContainer>
      <Label htmlFor="wz_category">WZ-Oberkategorie {required && '*'}</Label>
      <Select
        id="wz_category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">-- Bitte wählen --</option>
        {wzCategories.map((category) => (
          <option key={category.key} value={category.key}>
            {category.key} – {category.name}
          </option>
        ))}
      </Select>
    </SelectContainer>
  );
};

export default WZCategorySelect;
