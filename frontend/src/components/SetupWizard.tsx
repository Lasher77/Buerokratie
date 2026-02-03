import React, { useState } from 'react';
import styled from 'styled-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api, { getErrorMessage } from '../api';
import { colors, shadows, borderRadius, typography } from '../theme';
import type { AdminSetupData } from '../types';

const SetupContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.backgroundAlt} 0%, ${colors.background} 100%);
  padding: 20px;
`;

const SetupCard = styled.div`
  background: ${colors.background};
  border-radius: ${borderRadius.large};
  box-shadow: ${shadows.large};
  padding: 48px;
  max-width: 480px;
  width: 100%;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const LogoText = styled.h1`
  color: ${colors.primary};
  font-size: 28px;
  font-weight: ${typography.fontWeightBold};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: ${colors.textMuted};
  font-size: ${typography.fontSizeBase};
  margin: 0;
`;

const Title = styled.h2`
  color: ${colors.textPrimary};
  font-size: ${typography.fontSizeLarge};
  margin: 0 0 8px 0;
  text-align: center;
`;

const Description = styled.p`
  color: ${colors.textMuted};
  font-size: ${typography.fontSizeSmall};
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  color: ${colors.textSecondary};
  font-size: ${typography.fontSizeSmall};
  font-weight: ${typography.fontWeightMedium};
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid ${colors.grayLight};
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSizeBase};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: ${shadows.primaryFocus};
  }

  &::placeholder {
    color: ${colors.grayMedium};
  }
`;

const ErrorText = styled.span`
  color: ${colors.primary};
  font-size: 12px;
`;

const SubmitButton = styled.button`
  background: ${colors.primary};
  color: ${colors.background};
  border: none;
  padding: 14px 24px;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSizeBase};
  font-weight: ${typography.fontWeightBold};
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  margin-top: 8px;

  &:hover:not(:disabled) {
    background: ${colors.primaryDark};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background: ${colors.grayLight};
    cursor: not-allowed;
  }
`;

const Alert = styled.div<{ $type: 'error' | 'success' }>`
  padding: 12px 16px;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSizeSmall};
  background: ${props => props.$type === 'error' ? colors.primaryLight : '#e8f5e9'};
  color: ${props => props.$type === 'error' ? colors.primary : colors.success};
  margin-bottom: 16px;
`;

const PasswordHint = styled.p`
  color: ${colors.textMuted};
  font-size: 11px;
  margin: 4px 0 0 0;
`;

interface SetupWizardProps {
  onSetupComplete: (token: string) => void;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Ungültige E-Mail-Adresse')
    .required('E-Mail ist erforderlich'),
  password: Yup.string()
    .min(8, 'Mindestens 8 Zeichen')
    .matches(/[A-Z]/, 'Mindestens ein Großbuchstabe')
    .matches(/[0-9]/, 'Mindestens eine Zahl')
    .required('Passwort ist erforderlich'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwörter stimmen nicht überein')
    .required('Passwort-Bestätigung ist erforderlich'),
  name: Yup.string()
});

const SetupWizard: React.FC<SetupWizardProps> = ({ onSetupComplete }) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);

      const setupData: AdminSetupData = {
        email: values.email,
        password: values.password,
        name: values.name || undefined
      };

      try {
        const response = await api.post('/api/setup/admin', setupData);
        onSetupComplete(response.data.token);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  return (
    <SetupContainer>
      <SetupCard>
        <Logo>
          <LogoText>BVMW Bürokratieabbau</LogoText>
          <Subtitle>Plattform-Einrichtung</Subtitle>
        </Logo>

        <Title>Administrator erstellen</Title>
        <Description>
          Willkommen! Bitte erstellen Sie den ersten Administrator-Account,
          um die Plattform zu nutzen.
        </Description>

        {error && <Alert $type="error">{error}</Alert>}

        <Form onSubmit={formik.handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ihr Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">E-Mail-Adresse *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@beispiel.de"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {(formik.touched.email || formik.submitCount > 0) && formik.errors.email && (
              <ErrorText>{formik.errors.email}</ErrorText>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Passwort *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Sicheres Passwort"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <PasswordHint>
              Mind. 8 Zeichen, ein Großbuchstabe und eine Zahl
            </PasswordHint>
            {(formik.touched.password || formik.submitCount > 0) && formik.errors.password && (
              <ErrorText>{formik.errors.password}</ErrorText>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">Passwort bestätigen *</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Passwort wiederholen"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {(formik.touched.confirmPassword || formik.submitCount > 0) && formik.errors.confirmPassword && (
              <ErrorText>{formik.errors.confirmPassword}</ErrorText>
            )}
          </FormGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Wird erstellt...' : 'Administrator erstellen'}
          </SubmitButton>
        </Form>
      </SetupCard>
    </SetupContainer>
  );
};

export default SetupWizard;
