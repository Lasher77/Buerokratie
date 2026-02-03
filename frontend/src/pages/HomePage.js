import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import bvmwLogo from '../assets/bvmw-logo.png';

const PRIMARY_RED = '#E30613';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#2d2d2d';
const GRAY = '#58585A';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 80px;
`;

const HeroSection = styled.section`
  background: #fff;
  border-radius: 24px;
  padding: 70px 60px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const HeroContent = styled.div`
  flex: 1 1 360px;
  min-width: 280px;
`;

const HeroTagline = styled.span`
  display: inline-block;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${PRIMARY_RED};
  margin-bottom: 12px;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  line-height: 1.15;
  color: ${TEXT_PRIMARY};
  margin: 0 0 20px;
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: ${TEXT_SECONDARY};
  margin-bottom: 32px;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const PrimaryButton = styled(Link)`
  background-color: ${PRIMARY_RED};
  color: #fff;
  padding: 14px 28px;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover,
  &:focus {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(227, 6, 19, 0.3);
  }
`;

const SecondaryButton = styled(Link)`
  border: 2px solid ${PRIMARY_RED};
  color: ${PRIMARY_RED};
  padding: 12px 26px;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  background-color: transparent;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;

  &:hover,
  &:focus {
    background-color: ${PRIMARY_RED};
    color: #fff;
    transform: translateY(-2px);
  }
`;

const HeroVisual = styled.div`
  flex: 1 1 240px;
  display: flex;
  justify-content: center;
`;

const LogoBadge = styled.div`
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08);
  padding: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 280px;
`;

const LogoImage = styled.img`
  width: 120px;
  height: auto;
  margin-bottom: 18px;
`;

const LogoCaption = styled.span`
  font-size: 0.9rem;
  color: ${GRAY};
  text-align: center;
`;

const InfoSection = styled.section`
  display: grid;
  gap: 30px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const InfoCard = styled.article`
  background: #fff;
  border-radius: 20px;
  padding: 26px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  border-top: 6px solid ${PRIMARY_RED};
`;

const InfoTitle = styled.h2`
  font-size: 1.4rem;
  color: ${TEXT_PRIMARY};
  margin-bottom: 14px;
`;

const InfoText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${TEXT_SECONDARY};
`;

const Callout = styled.section`
  background: #fff;
  color: ${TEXT_PRIMARY};
  border-radius: 24px;
  padding: 40px 44px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-left: 6px solid ${PRIMARY_RED};
`;

const CalloutText = styled.div`
  flex: 1 1 260px;
`;

const CalloutTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 1.8rem;
  color: ${TEXT_PRIMARY};
`;

const CalloutDescription = styled.p`
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.6;
  color: ${TEXT_SECONDARY};
`;

const CalloutAction = styled(Link)`
  background: ${PRIMARY_RED};
  color: #fff;
  padding: 12px 28px;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover,
  &:focus {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(227, 6, 19, 0.3);
  }
`;

function HomePage() {
  return (
    <PageWrapper>
      <HeroSection>
        <HeroContent>
          <HeroTagline>Gemeinsam Bürokratie abbauen</HeroTagline>
          <HeroTitle>Ihre Stimme für einen starken Mittelstand</HeroTitle>
          <HeroSubtitle>
            Das Portal des BVMW macht bürokratische Hürden sichtbar. Teilen Sie Ihre
            Erfahrungen, verfolgen Sie gemeldete Hemmnisse und gestalten Sie ein wirtschaftsfreundlicheres Umfeld.
          </HeroSubtitle>
          <HeroActions>
            <PrimaryButton to="/melden">Jetzt Hemmnis melden</PrimaryButton>
            <SecondaryButton to="/meldungen">Meldungen entdecken</SecondaryButton>
          </HeroActions>
        </HeroContent>

        <HeroVisual>
          <LogoBadge>
            <LogoImage src={bvmwLogo} alt="Der Mittelstand. BVMW" />
            <LogoCaption>Der Mittelstand. BVMW</LogoCaption>
          </LogoBadge>
        </HeroVisual>
      </HeroSection>

      <InfoSection>
        <InfoCard>
          <InfoTitle>Warum dieses Portal?</InfoTitle>
          <InfoText>
            Unternehmerinnen und Unternehmer kennen den Verwaltungsalltag am besten. Mit Ihrer Meldung bringen Sie konkrete
            Fälle auf die Agenda der Politik und helfen, Prozesse zu vereinfachen.
          </InfoText>
        </InfoCard>
        <InfoCard>
          <InfoTitle>So profitieren Sie</InfoTitle>
          <InfoText>
            Erhalten Sie Einblick in bestehende Bürokratiehemmnisse, verfolgen Sie deren Bearbeitung und profitieren Sie von den
            Erfolgen unseres Netzwerks in Berlin und den Regionen.
          </InfoText>
        </InfoCard>
        <InfoCard>
          <InfoTitle>Schnell & sicher melden</InfoTitle>
          <InfoText>
            Ein intuitives Formular führt Sie Schritt für Schritt zur Meldung. Ihre Daten sind geschützt und werden nur für die
            Arbeit des BVMW verwendet.
          </InfoText>
        </InfoCard>
      </InfoSection>

      <Callout>
        <CalloutText>
          <CalloutTitle>Gemeinsam für weniger Bürokratie.</CalloutTitle>
          <CalloutDescription>
            Werden Sie Teil unseres Netzwerks und melden Sie noch heute Ihr Bürokratiehemmnis. Jede Meldung stärkt die Stimme des
            Mittelstands.
          </CalloutDescription>
        </CalloutText>
        <CalloutAction to="/melden">Zum Meldeformular</CalloutAction>
      </Callout>
    </PageWrapper>
  );
}

export default HomePage;
