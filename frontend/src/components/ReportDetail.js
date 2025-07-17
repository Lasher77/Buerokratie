import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const DetailContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
`;

const BackButton = styled.button`
  background-color: #58585A; /* BVMW Grau */
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    background-color: #444;
  }
`;

const ReportCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  border-left: 5px solid ${props => {
    switch (props.category) {
      case 'Steuer': return '#E30613'; // BVMW Rot
      case 'Dokumentationspflicht': return '#003E7E'; // BVMW Blau
      case 'Rechnungswesen': return '#58585A'; // BVMW Grau
      case 'Statistiken': return '#009FE3'; // Hellblau
      case 'Sozialversicherungen': return '#95C11F'; // Grün
      case 'Datenschutz': return '#FFED00'; // Gelb
      case 'Arbeitsschutz': return '#F39200'; // Orange
      case 'Branchenspezifisches': return '#A1006B'; // Lila
      default: return '#003E7E'; // BVMW Blau als Standard
    }
  }};
`;

const ReportTitle = styled.h1`
  color: #003E7E; /* BVMW Blau */
  margin-bottom: 20px;
  font-size: 28px;
  line-height: 1.3;
`;

const CategoryBadge = styled.div`
  display: inline-block;
  background-color: #f0f0f0;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 20px;
  color: #333;
  font-weight: bold;
`;

const ReportDescription = styled.div`
  margin-bottom: 30px;
  color: #333;
  line-height: 1.6;
  font-size: 16px;
  white-space: pre-wrap;
`;

const MetaSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetaLabel = styled.span`
  font-weight: bold;
  color: #003E7E; /* BVMW Blau */
  margin-bottom: 5px;
  font-size: 14px;
`;

const MetaValue = styled.span`
  color: #333;
  font-size: 16px;
`;

const VotingSection = styled.div`
  border-top: 1px solid #eee;
  padding-top: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const VoteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${props => props.hasVoted ? '#4CAF50' : '#E30613'}; /* BVMW Rot oder Grün */
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${props => props.hasVoted ? '#45a049' : '#c00510'};
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const VoteCount = styled.span`
  color: #333;
  font-size: 16px;
  font-weight: bold;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #777;
  font-size: 18px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #E30613; /* BVMW Rot */
  font-size: 18px;
  background-color: #ffeeee;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voteStatus, setVoteStatus] = useState({ hasVoted: false, voteCount: 0 });
  const [isVoting, setIsVoting] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Session-ID aus localStorage oder generieren
  useEffect(() => {
    let storedSessionId = localStorage.getItem('bvmw-session-id');
    if (!storedSessionId) {
      storedSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('bvmw-session-id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Meldung laden
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/reports/${id}`);
        setReport(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Fehler beim Laden der Meldung:', err);
        setError('Meldung konnte nicht geladen werden.');
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  // Bewertungsstatus laden
  useEffect(() => {
    const fetchVoteStatus = async () => {
      if (!sessionId || !id) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/votes/${id}/vote-status`, {
          headers: { 'x-session-id': sessionId }
        });
        setVoteStatus(response.data);
      } catch (err) {
        console.error('Fehler beim Laden des Bewertungsstatus:', err);
      }
    };

    fetchVoteStatus();
  }, [id, sessionId]);

  const handleVote = async () => {
    if (!sessionId || isVoting) return;

    setIsVoting(true);
    try {
      if (voteStatus.hasVoted) {
        // Bewertung entfernen
        const response = await axios.delete(`http://localhost:5000/api/votes/${id}/vote`, {
          headers: { 'x-session-id': sessionId }
        });
        setVoteStatus({
          hasVoted: false,
          voteCount: response.data.voteCount
        });
      } else {
        // Bewertung hinzufügen
        const response = await axios.post(`http://localhost:5000/api/votes/${id}/vote`, {}, {
          headers: { 'x-session-id': sessionId }
        });
        setVoteStatus({
          hasVoted: true,
          voteCount: response.data.voteCount
        });
      }
    } catch (err) {
      console.error('Fehler beim Bewerten:', err);
      if (err.response?.status === 400) {
        // Bereits bewertet - Status aktualisieren
        setVoteStatus(prev => ({ ...prev, hasVoted: true }));
      }
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };

  if (loading) return <LoadingMessage>Meldung wird geladen...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!report) return <ErrorMessage>Meldung nicht gefunden.</ErrorMessage>;

  return (
    <DetailContainer>
      <BackButton onClick={() => navigate('/')}>
        ← Zurück zur Übersicht
      </BackButton>
      
      <ReportCard category={report.category_name}>
        <ReportTitle>{report.title}</ReportTitle>
        
        <CategoryBadge>{report.category_name}</CategoryBadge>
        
        <ReportDescription>{report.description}</ReportDescription>
        
        <MetaSection>
          <MetaItem>
            <MetaLabel>Gemeldet am</MetaLabel>
            <MetaValue>{formatDate(report.created_at)}</MetaValue>
          </MetaItem>
          
          {report.time_spent && (
            <MetaItem>
              <MetaLabel>Zeitaufwand</MetaLabel>
              <MetaValue>{report.time_spent} Stunden/Monat</MetaValue>
            </MetaItem>
          )}
          
          {report.costs && (
            <MetaItem>
              <MetaLabel>Geschätzte Kosten</MetaLabel>
              <MetaValue>{report.costs} €/Jahr</MetaValue>
            </MetaItem>
          )}
          
          {report.affected_employees && (
            <MetaItem>
              <MetaLabel>Betroffene Mitarbeiter</MetaLabel>
              <MetaValue>{report.affected_employees}</MetaValue>
            </MetaItem>
          )}
          
          {!report.is_anonymous && report.reporter_name && (
            <MetaItem>
              <MetaLabel>Gemeldet von</MetaLabel>
              <MetaValue>{report.reporter_name}</MetaValue>
            </MetaItem>
          )}
          
          {!report.is_anonymous && report.reporter_company && (
            <MetaItem>
              <MetaLabel>Unternehmen</MetaLabel>
              <MetaValue>{report.reporter_company}</MetaValue>
            </MetaItem>
          )}
        </MetaSection>
        
        <VotingSection>
          <VoteButton 
            hasVoted={voteStatus.hasVoted}
            onClick={handleVote}
            disabled={isVoting}
          >
            👍 {voteStatus.hasVoted ? 'Betrifft mich auch' : 'Das betrifft mich auch'}
          </VoteButton>
          
          <VoteCount>
            {voteStatus.voteCount} {voteStatus.voteCount === 1 ? 'Person ist' : 'Personen sind'} auch betroffen
          </VoteCount>
        </VotingSection>
      </ReportCard>
    </DetailContainer>
  );
};

export default ReportDetail;

