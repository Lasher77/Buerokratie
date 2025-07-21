import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

let ReportForm;

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('../CategorySelect', () => ({ value, onChange }) => (
  <select data-testid="category-select" value={value} onChange={e => onChange(e.target.value)}>
    <option value="">-- Bitte wählen --</option>
    <option value="1">Category 1</option>
  </select>
));

 beforeEach(() => {
  jest.resetModules();
  process.env.REACT_APP_API_BASE_URL = '/base';
  ReportForm = require('../ReportForm').default;
});

test('sends data to correct base url', async () => {
  axios.post.mockResolvedValueOnce({ data: {} });
  render(<ReportForm />);

  await userEvent.type(screen.getByLabelText(/Titel/), 'Test');
  await userEvent.type(screen.getByLabelText(/Beschreibung/), 'Desc');
  await userEvent.selectOptions(screen.getByTestId('category-select'), '1');
  await userEvent.click(screen.getByRole('button', { name: /absenden/i }));

  await waitFor(() => expect(axios.post).toHaveBeenCalled());
  expect(axios.post).toHaveBeenCalledWith('/base/api/reports', expect.any(Object));
});
