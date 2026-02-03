import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SetupWizard from './SetupWizard';
import api from '../api';

// Mock the api module
jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn()
  },
  getErrorMessage: jest.fn((error) => error?.message || 'Ein Fehler ist aufgetreten')
}));

describe('SetupWizard', () => {
  const mockOnSetupComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the setup form', () => {
    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    expect(screen.getByRole('heading', { name: /BVMW Bürokratieabbau/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Administrator erstellen/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/E-Mail-Adresse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Passwort \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Passwort bestätigen/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    const submitButton = screen.getByRole('button', { name: /Administrator erstellen/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/E-Mail ist erforderlich/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    const emailInput = screen.getByLabelText(/E-Mail-Adresse/i);
    await user.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Ungültige E-Mail-Adresse/i)).toBeInTheDocument();
    });
  });

  it('shows password validation errors', async () => {
    const user = userEvent.setup();
    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    const passwordInput = screen.getByLabelText(/^Passwort \*/i);
    await user.type(passwordInput, 'short');
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/Mindestens 8 Zeichen/i)).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    const passwordInput = screen.getByLabelText(/^Passwort \*/i);
    const confirmInput = screen.getByLabelText(/Passwort bestätigen/i);

    await user.type(passwordInput, 'SecurePass1');
    await user.type(confirmInput, 'DifferentPass1');
    fireEvent.blur(confirmInput);

    await waitFor(() => {
      expect(screen.getByText(/Passwörter stimmen nicht überein/i)).toBeInTheDocument();
    });
  });

  it('submits form and calls onSetupComplete on success', async () => {
    const user = userEvent.setup();
    const mockToken = 'test-jwt-token';
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { token: mockToken, message: 'Administrator erfolgreich erstellt' }
    });

    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    await user.type(screen.getByLabelText(/Name/i), 'Test Admin');
    await user.type(screen.getByLabelText(/E-Mail-Adresse/i), 'admin@test.de');
    await user.type(screen.getByLabelText(/^Passwort \*/i), 'SecurePass1');
    await user.type(screen.getByLabelText(/Passwort bestätigen/i), 'SecurePass1');

    const submitButton = screen.getByRole('button', { name: /Administrator erstellen/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/setup/admin', {
        email: 'admin@test.de',
        password: 'SecurePass1',
        name: 'Test Admin'
      });
      expect(mockOnSetupComplete).toHaveBeenCalledWith(mockToken);
    });
  });

  it('shows error message on API failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Setup bereits abgeschlossen';
    (api.post as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    // Update the mock to return the error message
    const { getErrorMessage } = jest.requireMock('../api');
    getErrorMessage.mockReturnValueOnce(errorMessage);

    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    await user.type(screen.getByLabelText(/E-Mail-Adresse/i), 'admin@test.de');
    await user.type(screen.getByLabelText(/^Passwort \*/i), 'SecurePass1');
    await user.type(screen.getByLabelText(/Passwort bestätigen/i), 'SecurePass1');

    const submitButton = screen.getByRole('button', { name: /Administrator erstellen/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnSetupComplete).not.toHaveBeenCalled();
  });
});
