import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from '../../AuthContext';

let LoginPage;

jest.mock('axios', () => ({
  __esModule: true,
  default: { post: jest.fn() }
}));

const RoleDisplay = () => {
  const { user } = useAuth();
  return <div data-testid="role">{user?.role || 'none'}</div>;
};

beforeEach(() => {
  jest.resetModules();
  process.env.REACT_APP_API_BASE_URL = '';
  LoginPage = require('../../pages/LoginPage').default;
  localStorage.clear();
});

test('logs in and stores token', async () => {
  const token = 'x.' + btoa(JSON.stringify({ role: 'admin' })) + '.y';
  axios.post.mockResolvedValueOnce({ data: { token } });

  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
        <RoleDisplay />
      </MemoryRouter>
    </AuthProvider>
  );

  await userEvent.type(screen.getByLabelText(/E-Mail/), 'a@b.c');
  await userEvent.type(screen.getByLabelText(/Passwort/), 'secret');
  await userEvent.click(screen.getByRole('button', { name: /anmelden/i }));

  await waitFor(() => expect(axios.post).toHaveBeenCalled());
  expect(localStorage.getItem('authToken')).toBe(token);
  expect(screen.getByTestId('role').textContent).toBe('admin');
});
