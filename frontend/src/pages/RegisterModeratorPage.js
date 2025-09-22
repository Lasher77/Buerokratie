import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { API_BASE } from '../api';

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #E30613;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: #E30613;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #b20510;
  }

  &:focus {
    outline: 2px solid #f9d8dc;
    outline-offset: 2px;
  }
`;

const Success = styled.div`
  margin-top: 10px;
  color: green;
`;

const ErrorMsg = styled.div`
  margin-top: 10px;
  color: #E30613;
`;

const RegisterModeratorPage = () => {
  const [form, setForm] = useState({ email: '', password: '', name: '', company: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const token = localStorage.getItem('authToken');
    try {
      await axios.post(`${API_BASE}/api/auth/register-moderator`, form, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setSuccess(true);
      setForm({ email: '', password: '', name: '', company: '' });
    } catch (err) {
      setError('Registrierung fehlgeschlagen');
    }
  };

  return (
    <Container>
      <Title>Moderator registrieren</Title>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">E-Mail</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="password">Passwort</Label>
          <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="company">Unternehmen</Label>
          <Input id="company" name="company" value={form.company} onChange={handleChange} />
        </FormGroup>
        <Button type="submit">Registrieren</Button>
        {success && <Success>Moderator angelegt</Success>}
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </form>
    </Container>
  );
};

export default RegisterModeratorPage;
