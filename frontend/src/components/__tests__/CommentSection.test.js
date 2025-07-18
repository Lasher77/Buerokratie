import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import CommentSection from '../CommentSection';
import { AuthProvider } from '../../AuthContext';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

beforeEach(() => {
  process.env.REACT_APP_API_BASE_URL = '';
});

test('renders comments from api', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ id: 1, text: 'Hallo', law_reference: '§1' }] });
  render(
    <AuthProvider initialUser={{ role: 'user' }}>
      <CommentSection reportId={1} />
    </AuthProvider>
  );
  await waitFor(() => screen.getByText('Hallo'));
  expect(screen.getByText('§1')).toBeInTheDocument();
});

test('shows form for moderators', async () => {
  axios.get.mockResolvedValueOnce({ data: [] });
  render(
    <AuthProvider initialUser={{ role: 'moderator' }}>
      <CommentSection reportId={1} />
    </AuthProvider>
  );
  await waitFor(() => screen.getByText('Noch keine Kommentare'));
  expect(screen.getByPlaceholderText('Kommentar eingeben')).toBeInTheDocument();
});

test('hides form for regular users', async () => {
  axios.get.mockResolvedValueOnce({ data: [] });
  render(
    <AuthProvider initialUser={{ role: 'user' }}>
      <CommentSection reportId={1} />
    </AuthProvider>
  );
  await waitFor(() => screen.getByText('Noch keine Kommentare'));
  expect(screen.queryByPlaceholderText('Kommentar eingeben')).toBeNull();
});
