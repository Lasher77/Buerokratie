import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('../CategorySelect', () => () => <div />);

jest.mock('axios', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('../../AuthContext', () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require('../../AuthContext');
let ReportList;

beforeAll(() => {
  process.env.REACT_APP_API_BASE_URL = '';
  ReportList = require('../ReportList').default;
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  useAuth.mockReturnValue({ user: null });
});

test('shows comment indicator when has_comments is true', async () => {
  axios.get.mockResolvedValueOnce({ data: [
    {
      id: 1,
      title: 'Test',
      description: 'Desc',
      created_at: '2023-01-01',
      category_id: 1,
      category_name: 'Cat',
      vote_count: 0,
      has_comments: true,
    },
  ] });

  render(
    <MemoryRouter>
      <ReportList />
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.queryByText('Meldungen werden geladen...')).not.toBeInTheDocument());
  expect(screen.getByTitle('Kommentare vorhanden')).toBeInTheDocument();
  expect(screen.getByText('Test')).toBeInTheDocument();
});

test('fetches moderator endpoint with auth header when user is moderator', async () => {
  const token = 'modtoken';
  localStorage.setItem('authToken', token);
  useAuth.mockReturnValue({ user: { role: 'moderator' } });
  axios.get.mockResolvedValueOnce({ data: [
    {
      id: 1,
      title: 'Pending',
      description: 'Pending Desc',
      created_at: '2023-01-02',
      category_id: 1,
      category_name: 'Cat',
      vote_count: 0,
      has_comments: false,
      status: 'pending',
    },
    {
      id: 2,
      title: 'Approved',
      description: 'Approved Desc',
      created_at: '2023-01-03',
      category_id: 2,
      category_name: 'Another',
      vote_count: 1,
      has_comments: false,
      status: 'approved',
    },
  ] });

  render(
    <MemoryRouter>
      <ReportList />
    </MemoryRouter>
  );

  await waitFor(() => expect(axios.get).toHaveBeenCalled());
  await waitFor(() => expect(screen.queryByText('Meldungen werden geladen...')).not.toBeInTheDocument());
  expect(axios.get).toHaveBeenCalledWith('/api/reports/pending', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(screen.getByText('Pending')).toBeInTheDocument();
  expect(screen.getByText('Approved')).toBeInTheDocument();
  localStorage.removeItem('authToken');
});

test('regular users fall back to public endpoint', async () => {
  axios.get.mockResolvedValueOnce({ data: [
    {
      id: 3,
      title: 'Only Approved',
      description: 'Desc',
      created_at: '2023-01-04',
      category_id: 3,
      category_name: 'Cat',
      vote_count: 0,
      has_comments: false,
      status: 'approved',
    },
  ] });

  render(
    <MemoryRouter>
      <ReportList />
    </MemoryRouter>
  );

  await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/reports', undefined));
  await waitFor(() => expect(screen.queryByText('Meldungen werden geladen...')).not.toBeInTheDocument());
  expect(screen.queryByText('Pending')).not.toBeInTheDocument();
  expect(screen.getByText('Only Approved')).toBeInTheDocument();
});
