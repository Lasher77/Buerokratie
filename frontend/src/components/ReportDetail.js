import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';
import styled from 'styled-components';
import CommentSection from './CommentSection';
import { useAuth } from '../AuthContext';


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
      case 'Dokumentationspflicht': return '#58585A'; // Grau
      case 'Rechnungswesen': return '#58585A'; // BVMW Grau
      case 'Statistiken': return '#009FE3'; // Hellblau
      case 'Sozialversicherungen': return '#95C11F'; // Grün
      case 'Datenschutz': return '#FFED00'; // Gelb
      case 'Arbeitsschutz': return '#F39200'; // Orange
      case 'Branchenspezifisches': return '#A1006B'; // Lila
      default: return '#E30613';
    }
  }};
`;

const ReportTitle = styled.h1`
  color: #1A1A1A;
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
  color: #58585A;
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
  background-color: ${props => props.hasVoted ? '#4CAF50' : '#E30613'};
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.hasVoted
      ? '0 4px 12px rgba(76, 175, 80, 0.3)'
      : '0 4px 12px rgba(227, 6, 19, 0.3)'};
  }

  &:focus {
    outline: 2px solid ${props => props.hasVoted ? '#4CAF50' : '#E30613'};
    outline-offset: 2px;
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

const StatusContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: bold;
  font-size: 14px;
  color: ${props => (props.status === 'approved' ? '#1b5e20' : '#9c1a1c')};
  background-color: ${props => (props.status === 'approved' ? '#e8f5e9' : '#fdecea')};
  border: 1px solid ${props => (props.status === 'approved' ? '#81c784' : '#f5c6cb')};
`;

const StatusButton = styled.button`
  background-color: ${props => (props.status === 'approved' ? '#1b5e20' : '#9c1a1c')};
  color: #fff;
  border: none;
  padding: 10px 18px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => (props.status === 'approved' ? '#145015' : '#7d1416')};
  }

  &:disabled {
    background-color: #b0b0b0;
    cursor: not-allowed;
  }
`;

const StatusError = styled.span`
  color: #9c1a1c;
  font-size: 14px;
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
  const { user } = useAuth();
  const isModerator = user && (user.role === 'moderator' || user.role === 'admin');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // Die Session-ID wird vom Backend vergeben und hier lediglich persistiert.
  useEffect(() => {
    const storedSessionId = localStorage.getItem('bvmw-session-id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  // Meldung laden
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        const useConfidentialEndpoint = Boolean(isModerator && token);
        const endpoint = useConfidentialEndpoint
          ? `${API_BASE}/api/reports/${id}/confidential`
          : `${API_BASE}/api/reports/${id}`;
        const config = useConfidentialEndpoint
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined;

        const response = await axios.get(endpoint, config);
        setReport(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Fehler beim Laden der Meldung:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Bitte melden Sie sich an, um vertrauliche Meldungsdetails zu sehen.');
        } else {
          setError('Meldung konnte nicht geladen werden.');
        }
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id, isModerator]);

  // Bewertungsstatus laden
  useEffect(() => {
    const fetchVoteStatus = async () => {
      if (!id) return;

      try {
        const response = await axios.get(
          `${API_BASE}/api/votes/${id}/vote-status`,
          sessionId
            ? { headers: { 'x-session-id': sessionId } }
            : undefined
        );
        setVoteStatus(response.data);
        if (!sessionId && response.data.sessionId) {
          localStorage.setItem('bvmw-session-id', response.data.sessionId);
          setSessionId(response.data.sessionId);
        }
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
        const response = await axios.delete(`${API_BASE}/api/votes/${id}/vote`, {
          headers: { 'x-session-id': sessionId }
        });
        setVoteStatus({
          hasVoted: false,
          voteCount: response.data.voteCount
        });
      } else {
        // Bewertung hinzufügen
        const response = await axios.post(
          `${API_BASE}/api/votes/${id}/vote`,
          {},
          sessionId
            ? { headers: { 'x-session-id': sessionId } }
            : undefined
        );
        setVoteStatus({
          hasVoted: true,
          voteCount: response.data.voteCount
        });
        if (response.data.sessionId) {
          localStorage.setItem('bvmw-session-id', response.data.sessionId);
          setSessionId(response.data.sessionId);
        }
      }
    } catch (err) {
      console.error('Fehler beim Bewerten:', err);
      if (err.response?.status === 400 || err.response?.status === 409) {
        // Bereits bewertet - Status aktualisieren und Session-ID übernehmen
        const existingSessionId = err.response?.data?.sessionId;
        if (existingSessionId) {
          localStorage.setItem('bvmw-session-id', existingSessionId);
          setSessionId(existingSessionId);
        }
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

  const translateStatus = (status) => {
    switch (status) {
      case 'approved':
        return 'Freigegeben';
      case 'pending':
      default:
        return 'Zurückgestellt';
    }
  };

  const handleStatusToggle = async () => {
    if (!report || isUpdatingStatus) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setStatusError('Anmeldung erforderlich, um den Status zu ändern.');
      return;
    }

    setIsUpdatingStatus(true);
    setStatusError(null);

    try {
      const response = await axios.patch(
        `${API_BASE}/api/reports/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(response.data);
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Meldungsstatus:', err);
      const message = err.response?.data?.message || 'Status konnte nicht aktualisiert werden.';
      setStatusError(message);
    } finally {
      setIsUpdatingStatus(false);
    }
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

          <MetaItem>
            <MetaLabel>Kontakthinweis</MetaLabel>
            <MetaValue>
              {report.is_anonymous
                ? 'Diese Meldung wurde anonym eingereicht. Kontaktdaten liegen nicht vor.'
                : 'Kontaktdaten sind nur für Moderationsteams sichtbar.'}
            </MetaValue>
          </MetaItem>
        </MetaSection>

        {isModerator && (
          <StatusContainer>
            <StatusBadge status={report.status}>
              Status: {translateStatus(report.status)}
            </StatusBadge>
            <StatusButton
              status={report.status}
              onClick={handleStatusToggle}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus
                ? 'Status wird aktualisiert...'
                : report.status === 'approved'
                  ? 'Zurückstellen'
                  : 'Freigeben'}
            </StatusButton>
            {statusError && <StatusError>{statusError}</StatusError>}
          </StatusContainer>
        )}

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
        <CommentSection reportId={id} />
      </ReportCard>
    </DetailContainer>
  );
};

export default ReportDetail;

