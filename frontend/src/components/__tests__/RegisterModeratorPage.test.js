import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

let RegisterModeratorPage;

jest.mock('axios', () => ({
  __esModule: true,
  default: { post: jest.fn() }
}));

beforeEach(() => {
  jest.resetModules();
  process.env.REACT_APP_API_BASE_URL = '';
  RegisterModeratorPage = require('../../pages/RegisterModeratorPage').default;
  localStorage.clear();
});

test('sends data with admin token', async () => {
  localStorage.setItem('authToken', 'admintoken');
  axios.post.mockResolvedValueOnce({ data: {} });

  render(
    <MemoryRouter>
      <RegisterModeratorPage />
    </MemoryRouter>
  );

  await userEvent.type(screen.getByLabelText(/E-Mail/), 'mod@b.c');
  await userEvent.type(screen.getByLabelText(/Passwort/), 'secret');
  await userEvent.type(screen.getByLabelText(/Name/), 'Mod');
  await userEvent.type(screen.getByLabelText(/Unternehmen/), 'BVMW');
  await userEvent.click(screen.getByRole('button', { name: /registrieren/i }));

  await waitFor(() => expect(axios.post).toHaveBeenCalled());
  expect(axios.post.mock.calls[0][0]).toBe('/api/auth/register-moderator');
  expect(axios.post.mock.calls[0][2].headers.Authorization).toBe('Bearer admintoken');
});
