import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';
import { useAuth } from '../AuthContext';

const Container = styled.div`
  max-width: 400px;
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

const ErrorMsg = styled.div`
  color: #E30613;
  margin-top: 10px;
`;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      login(response.data.token);
      navigate('/');
    } catch (err) {
      setError('Login fehlgeschlagen');
    }
  };

  return (
    <Container>
      <Title>Login</Title>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">E-Mail</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="password">Passwort</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </FormGroup>
        <Button type="submit">Anmelden</Button>
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </form>
    </Container>
  );
};

export default LoginPage;
