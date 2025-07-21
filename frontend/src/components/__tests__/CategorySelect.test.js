import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

let CategorySelect;

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn()
  }
}));

beforeEach(() => {
  process.env.REACT_APP_API_BASE_URL = '';
  jest.resetModules();
  CategorySelect = require('../CategorySelect').default;
});

test('renders options from api', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Kategorie A' }] });
  render(<CategorySelect value="" onChange={() => {}} />);
  await waitFor(() => expect(screen.getByText('Kategorie A')).toBeInTheDocument());
});
