import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

let ReportList;
jest.mock('../CategorySelect', () => () => <div />);

jest.mock('axios', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

beforeEach(() => {
  process.env.REACT_APP_API_BASE_URL = '';
  jest.resetModules();
  ReportList = require('../ReportList').default;
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
