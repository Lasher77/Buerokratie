import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import ReportDetail from './components/ReportDetail';
import { AuthProvider } from './AuthContext';

const AppContainer = styled.div`
  font-family: Arial, sans-serif;
  color: #333;
`;

const Header = styled.header`
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  font-size: 20px;
  font-weight: bold;
  color: #003E7E; /* BVMW Blau */
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: #003E7E; /* BVMW Blau */
  text-decoration: none;
  font-weight: bold;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #f0f0f0;
  }
  
  &.active {
    background-color: #003E7E; /* BVMW Blau */
    color: white;
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Footer = styled.footer`
  background-color: #003E7E; /* BVMW Blau */
  color: white;
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
  font-size: 18px;
`;

const FooterLink = styled.a`
  color: white;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  margin-top: 20px;
`;

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
        <Header>
          <HeaderContent>
            <Logo>
              <LogoText>BVMW Bürokratieabbau</LogoText>
            </Logo>
            <Nav>
              <NavLink to="/">Übersicht</NavLink>
              <NavLink to="/melden">Hemmnis melden</NavLink>
            </Nav>
          </HeaderContent>
        </Header>
        
        <Main>
          <Routes>
            <Route path="/" element={<ReportList />} />
            <Route path="/melden" element={<ReportForm />} />
            <Route path="/meldung/:id" element={<ReportDetail />} />
          </Routes>
        </Main>
        
        <Footer>
          <FooterContent>
            <FooterSection>
              <FooterTitle>Über uns</FooterTitle>
              <FooterLink href="https://www.bvmw.de/ueber-uns/" target="_blank">Der BVMW</FooterLink>
              <FooterLink href="https://www.bvmw.de/themen-und-positionen/" target="_blank">Themen & Positionen</FooterLink>
              <FooterLink href="https://www.bvmw.de/mitgliedschaft/" target="_blank">Mitgliedschaft</FooterLink>
            </FooterSection>
            
            <FooterSection>
              <FooterTitle>Kontakt</FooterTitle>
              <FooterLink href="https://www.bvmw.de/kontakt/" target="_blank">Kontaktformular</FooterLink>
              <FooterLink href="tel:+4930533206100">+49 30 533 206 100</FooterLink>
              <FooterLink href="mailto:info@bvmw.de">info@bvmw.de</FooterLink>
            </FooterSection>
            
            <FooterSection>
              <FooterTitle>Rechtliches</FooterTitle>
              <FooterLink href="https://www.bvmw.de/impressum/" target="_blank">Impressum</FooterLink>
              <FooterLink href="https://www.bvmw.de/datenschutz/" target="_blank">Datenschutz</FooterLink>
              <FooterLink href="https://www.bvmw.de/agb/" target="_blank">AGB</FooterLink>
            </FooterSection>
            
            <Copyright>
              © {new Date().getFullYear()} BVMW - Der Mittelstand. Bundesverband mittelständische Wirtschaft
            </Copyright>
          </FooterContent>
        </Footer>
      </AppContainer>
    </Router>
  </AuthProvider>
  );
}

export default App;

