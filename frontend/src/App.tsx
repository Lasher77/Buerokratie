import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import ReportDetail from './components/ReportDetail';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterModeratorPage from './pages/RegisterModeratorPage';
import HomePage from './pages/HomePage';
import SetupWizard from './components/SetupWizard';
import { colors, shadows, borderRadius, typography } from './theme';
import bvmwLogo from './assets/bvmw-logo.png';

// =============================================================================
// Styled Components mit zentralem Theme
// =============================================================================

const AppContainer = styled.div`
  font-family: ${typography.fontFamily};
  color: ${colors.textSecondary};
`;

const Header = styled.header`
  background-color: ${colors.background};
  box-shadow: ${shadows.small};
  padding: 15px 0;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 50px;
  margin-right: 15px;
`;

const LogoText = styled.div`
  font-size: ${typography.fontSizeLarge};
  font-weight: ${typography.fontWeightBold};
  color: ${colors.primary};
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: ${colors.primary};
  text-decoration: none;
  font-weight: ${typography.fontWeightBold};
  padding: 10px;
  border-radius: ${borderRadius.small};
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${colors.primaryLight};
  }

  &:focus {
    outline: 2px solid ${colors.primaryLight};
    outline-offset: 2px;
  }

  &.active {
    background-color: ${colors.primary};
    color: ${colors.background};
  }

  &.active:hover {
    background-color: ${colors.primaryDark};
    color: ${colors.background};
  }
`;

const LogoutButton = styled.button`
  color: ${colors.background};
  background-color: ${colors.primary};
  border: none;
  font-weight: ${typography.fontWeightBold};
  padding: 10px 16px;
  border-radius: ${borderRadius.small};
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${colors.primaryDark};
  }

  &:focus {
    outline: 2px solid ${colors.primaryLight};
    outline-offset: 2px;
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Footer = styled.footer`
  background-color: ${colors.primaryDark};
  color: ${colors.background};
  padding: 30px 0;
  margin-top: 60px;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const FooterSection = styled.div`
  margin-bottom: 20px;
  min-width: 200px;
`;

const FooterTitle = styled.h3`
  margin-bottom: 15px;
  font-size: ${typography.fontSizeMedium};
  color: ${colors.primaryLight};
`;

const FooterLink = styled.a`
  color: ${colors.background};
  text-decoration: none;
  display: block;
  margin-bottom: 8px;

  &:hover {
    color: ${colors.primaryLight};
  }

  &:focus {
    outline: 2px solid ${colors.primaryLight};
    outline-offset: 2px;
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  margin-top: 20px;
`;

const LoadingScreen = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.backgroundAlt};
  color: ${colors.textMuted};
  font-size: ${typography.fontSizeMedium};
`;

// =============================================================================
// Navigation Component
// =============================================================================

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Nav>
      <NavLink to="/">Startseite</NavLink>
      <NavLink to="/meldungen">Meldungsübersicht</NavLink>
      <NavLink to="/melden">Hemmnis melden</NavLink>
      {!user && <NavLink to="/login">Login</NavLink>}
      {user?.role === 'admin' && (
        <NavLink to="/register-moderator">Moderator registrieren</NavLink>
      )}
      {user && (
        <LogoutButton type="button" onClick={logout}>
          Logout
        </LogoutButton>
      )}
    </Nav>
  );
};

// =============================================================================
// Main App Content
// =============================================================================

const AppContent: React.FC = () => {
  const { loading, needsSetup, completeSetup } = useAuth();

  // Loading-Zustand
  if (loading) {
    return <LoadingScreen>Anwendung wird geladen...</LoadingScreen>;
  }

  // Setup-Wizard anzeigen wenn nötig
  if (needsSetup) {
    return <SetupWizard onSetupComplete={completeSetup} />;
  }

  // Normale Anwendung
  return (
    <Router>
      <AppContainer>
        <Header>
          <HeaderContent>
            <Logo>
              <LogoImage src={bvmwLogo} alt="Der Mittelstand. BVMW" />
              <LogoText>BVMW Bürokratieabbau</LogoText>
            </Logo>
            <Navigation />
          </HeaderContent>
        </Header>

        <Main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/meldungen" element={<ReportList />} />
            <Route path="/melden" element={<ReportForm />} />
            <Route path="/meldung/:id" element={<ReportDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-moderator" element={<RegisterModeratorPage />} />
          </Routes>
        </Main>

        <Footer>
          <FooterContent>
            <FooterSection>
              <FooterTitle>Über uns</FooterTitle>
              <FooterLink href="https://www.bvmw.de/ueber-uns/" target="_blank" rel="noopener noreferrer">
                Der BVMW
              </FooterLink>
              <FooterLink href="https://www.bvmw.de/themen-und-positionen/" target="_blank" rel="noopener noreferrer">
                Themen & Positionen
              </FooterLink>
              <FooterLink href="https://www.bvmw.de/mitgliedschaft/" target="_blank" rel="noopener noreferrer">
                Mitgliedschaft
              </FooterLink>
            </FooterSection>

            <FooterSection>
              <FooterTitle>Kontakt</FooterTitle>
              <FooterLink href="https://www.bvmw.de/kontakt/" target="_blank" rel="noopener noreferrer">
                Kontaktformular
              </FooterLink>
              <FooterLink href="tel:+4930533206100">+49 30 533 206 100</FooterLink>
              <FooterLink href="mailto:info@bvmw.de">info@bvmw.de</FooterLink>
            </FooterSection>

            <FooterSection>
              <FooterTitle>Rechtliches</FooterTitle>
              <FooterLink href="https://www.bvmw.de/impressum/" target="_blank" rel="noopener noreferrer">
                Impressum
              </FooterLink>
              <FooterLink href="https://www.bvmw.de/datenschutz/" target="_blank" rel="noopener noreferrer">
                Datenschutz
              </FooterLink>
              <FooterLink href="https://www.bvmw.de/agb/" target="_blank" rel="noopener noreferrer">
                AGB
              </FooterLink>
            </FooterSection>

            <Copyright>
              © {new Date().getFullYear()} BVMW - Der Mittelstand. Bundesverband mittelständische Wirtschaft
            </Copyright>
          </FooterContent>
        </Footer>
      </AppContainer>
    </Router>
  );
};

// =============================================================================
// App Wrapper with AuthProvider
// =============================================================================

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
