import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { API_BASE } from '../api';

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const Label = styled.label`
  font-weight: 700;
  color: #E30613;
  letter-spacing: 0.01em;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 20px;
  padding-right: 3.5rem;
  border: 2px solid #E30613;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  background: #fff;
  color: #2d2d2d;
  box-shadow: 0 8px 18px rgba(227, 6, 19, 0.08);
  transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
  appearance: none;
  cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, #E30613 50%),
    linear-gradient(135deg, #E30613 50%, transparent 50%),
    linear-gradient(to right, transparent, transparent);
  background-position: calc(100% - 28px) calc(50% - 2px),
    calc(100% - 22px) calc(50% - 2px),
    calc(100% - 3.2rem) 50%;
  background-size: 7px 7px, 7px 7px, 1px 50%;
  background-repeat: no-repeat;

  &:hover {
    box-shadow: 0 10px 22px rgba(227, 6, 19, 0.12);
  }

  &:focus {
    outline: none;
    border-color: #b20510;
    box-shadow: 0 0 0 3px rgba(227, 6, 19, 0.18);
    background-color: #fff5f6;
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
