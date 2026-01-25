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

    expect(screen.getByText('BVMW Bürokratieabbau')).toBeInTheDocument();
    expect(screen.getByText('Administrator erstellen')).toBeInTheDocument();
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
    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    const emailInput = screen.getByLabelText(/E-Mail-Adresse/i);
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Ungültige E-Mail-Adresse/i)).toBeInTheDocument();
    });
  });

  it('shows password validation errors', async () => {
    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    const passwordInput = screen.getByLabelText(/^Passwort \*/i);
    await userEvent.type(passwordInput, 'short');
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/Mindestens 8 Zeichen/i)).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    const passwordInput = screen.getByLabelText(/^Passwort \*/i);
    const confirmInput = screen.getByLabelText(/Passwort bestätigen/i);

    await userEvent.type(passwordInput, 'SecurePass1');
    await userEvent.type(confirmInput, 'DifferentPass1');
    fireEvent.blur(confirmInput);

    await waitFor(() => {
      expect(screen.getByText(/Passwörter stimmen nicht überein/i)).toBeInTheDocument();
    });
  });

  it('submits form and calls onSetupComplete on success', async () => {
    const mockToken = 'test-jwt-token';
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { token: mockToken, message: 'Administrator erfolgreich erstellt' }
    });

    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    await userEvent.type(screen.getByLabelText(/Name/i), 'Test Admin');
    await userEvent.type(screen.getByLabelText(/E-Mail-Adresse/i), 'admin@test.de');
    await userEvent.type(screen.getByLabelText(/^Passwort \*/i), 'SecurePass1');
    await userEvent.type(screen.getByLabelText(/Passwort bestätigen/i), 'SecurePass1');

    const submitButton = screen.getByRole('button', { name: /Administrator erstellen/i });
    await userEvent.click(submitButton);

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
    (api.post as jest.Mock).mockRejectedValueOnce({
      message: 'Setup bereits abgeschlossen'
    });

    render(<SetupWizard onSetupComplete={mockOnSetupComplete} />);

    await userEvent.type(screen.getByLabelText(/E-Mail-Adresse/i), 'admin@test.de');
    await userEvent.type(screen.getByLabelText(/^Passwort \*/i), 'SecurePass1');
    await userEvent.type(screen.getByLabelText(/Passwort bestätigen/i), 'SecurePass1');

    const submitButton = screen.getByRole('button', { name: /Administrator erstellen/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Setup bereits abgeschlossen/i)).toBeInTheDocument();
    });

    expect(mockOnSetupComplete).not.toHaveBeenCalled();
  });
});
