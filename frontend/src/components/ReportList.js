import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../api';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import CategorySelect from './CategorySelect';
import { useAuth } from '../AuthContext';

const isDev = process.env.NODE_ENV === 'development';


const ListContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const ListTitle = styled.h2`
  color: #E30613;
  margin-bottom: 20px;
  font-size: 24px;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 243, 255, 0.95));
  border-radius: 28px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  align-items: stretch;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  flex: 2;
  min-width: 300px;
  gap: 12px;
  align-items: center;
  padding: 16px 18px;
  background-color: #fff;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 16px 35px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;

  &:focus-within {
    box-shadow: 0 20px 45px rgba(227, 6, 19, 0.18);
    border-color: rgba(227, 6, 19, 0.2);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    flex: 1 1 100%;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 12px 20px;
  border: none;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  color: #2d2d2d;
  background: linear-gradient(135deg, #f7f7fb, #ffffff);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease, background-color 0.2s ease;

  &::placeholder {
    color: #9b9b9b;
    font-weight: 500;
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(227, 6, 19, 0.25);
    outline: none;
    background-color: #fff;
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const buttonBaseStyles = `
  border: none;
  padding: 12px 26px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 999px;
  cursor: pointer;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const SearchButton = styled.button`
  ${buttonBaseStyles}
  background: linear-gradient(135deg, #E30613, #b20510);
  color: #fff;
  box-shadow: 0 14px 30px rgba(227, 6, 19, 0.25);

  &:hover {
    background: linear-gradient(135deg, #f11824, #c10511);
    transform: translateY(-1px);
    box-shadow: 0 18px 38px rgba(227, 6, 19, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 8px 20px rgba(227, 6, 19, 0.22);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(227, 6, 19, 0.4);
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const ResetButton = styled.button`
  ${buttonBaseStyles}
  background: linear-gradient(135deg, #f2f3f7, #ffffff);
  color: #58585A;
  border: 1px solid rgba(88, 88, 90, 0.15);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.1);
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: linear-gradient(135deg, #ffffff, #f6f7fa);
    color: #2d2d2d;
    transform: translateY(-1px);
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 159, 227, 0.35);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CategoryFilterContainer = styled.div`
  flex: 1;
  min-width: 220px;
  background-color: #fff;
  padding: 16px 18px;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 16px 35px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;

  &:focus-within {
    box-shadow: 0 20px 45px rgba(0, 159, 227, 0.18);
    border-color: rgba(0, 159, 227, 0.2);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ReportCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  border-left: 5px solid ${props => {
    switch (props.category) {
      case 'Steuer': return '#E30613'; // BVMW Rot
      case 'Dokumentationspflicht': return '#b20510'; // Dunkles Rot
      case 'Rechnungswesen': return '#58585A'; // BVMW Grau
      case 'Statistiken': return '#009FE3'; // Hellblau
      case 'Sozialversicherungen': return '#95C11F'; // Grün
      case 'Datenschutz': return '#FFED00'; // Gelb
      case 'Arbeitsschutz': return '#F39200'; // Orange
      case 'Branchenspezifisches': return '#A1006B'; // Lila
      default: return '#E30613';
    }
  }};
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
`;

const ReportTitle = styled.h3`
  color: #E30613;
  margin-bottom: 10px;
  font-size: 20px;
`;

const ReportTitleLink = styled(Link)`
  color: #E30613;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid #f9d8dc;
    outline-offset: 2px;
  }
`;

const ReportCategory = styled.div`
  display: inline-block;
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 15px;
  color: #333;
`;

const ReportDescription = styled.p`
  margin-bottom: 15px;
  color: #333;
  line-height: 1.5;
`;

const ContactNotice = styled.p`
  margin: -5px 0 20px 0;
  color: #666;
  font-size: 13px;
  font-style: italic;
`;

const ReportMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  color: #777;
  font-size: 14px;
  border-top: 1px solid #eee;
  padding-top: 10px;
`;

const ReportDate = styled.span``;

const ReportStats = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const StatItem = styled.span``;

const VoteCount = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #E30613; /* BVMW Rot */
  font-weight: bold;
`;

const CommentIndicator = styled.span`
  margin-left: 5px;
`;

const ReportMetaInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  background-color: ${(props) => props.$background || '#e0e0e0'};
  color: ${(props) => props.$color || '#333'};
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => props.$dotColor || 'currentColor'};
`;

const NoResults = styled.div`
  text-align: center;
  padding: 40px;
  color: #777;
  font-size: 18px;
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

const STATUS_CONFIG = {
  approved: {
    label: 'Freigegeben',
    background: '#2E7D32',
    color: '#fff',
    dotColor: '#A5D6A7',
  },
  pending: {
    label: 'In Prüfung',
    background: '#FFB400',
    color: '#3A2A00',
    dotColor: '#FFE082',
  },
  rejected: {
    label: 'Abgelehnt',
    background: '#C62828',
    color: '#fff',
    dotColor: '#FFCDD2',
  },
  default: {
    label: 'Unbekannt',
    background: '#9E9E9E',
    color: '#fff',
    dotColor: '#E0E0E0',
  },
};

const getStatusConfig = (status) => {
  if (!status) {
    return STATUS_CONFIG.default;
  }

  const normalizedStatus = status.toString().toLowerCase();
  if (STATUS_CONFIG[normalizedStatus]) {
    return STATUS_CONFIG[normalizedStatus];
  }

  return {
    label: status,
    background: STATUS_CONFIG.default.background,
    color: STATUS_CONFIG.default.color,
    dotColor: STATUS_CONFIG.default.dotColor,
  };
};

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const { user } = useAuth();
  const isModerator = user && (user.role === 'moderator' || user.role === 'admin');

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        const useModeratorEndpoint = Boolean(isModerator && token);
        const endpoint = useModeratorEndpoint
          ? `${API_BASE}/api/reports/pending`
          : `${API_BASE}/api/reports`;
        const config = useModeratorEndpoint
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined;

        const response = await axios.get(endpoint, config);
        if (!isMounted) {
          return;
        }
        setReports(response.data);
        setFilteredReports(response.data);
        setLoading(false);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        console.error('Fehler beim Laden der Meldungen:', err.message || err.response);
        const devMessage = err.message || err.response?.data?.message;
        const genericMessage = 'Meldungen konnten nicht geladen werden.';
        setError(isDev && devMessage ? `${genericMessage} (${devMessage})` : genericMessage);
        setLoading(false);
      }
    };

    fetchReports();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    // Filter reports based on search term and selected category
    let filtered = reports;
    
    if (selectedCategory) {
      filtered = filtered.filter(report => report.category_id === parseInt(selectedCategory));
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(term) || 
        report.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredReports(filtered);
  }, [searchTerm, selectedCategory, reports]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The filtering is already handled by the useEffect
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };

  if (loading) return <LoadingMessage>Meldungen werden geladen...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <ListContainer>
      <ListTitle>Übersicht bürokratischer Hemmnisse</ListTitle>
      
      <FilterContainer>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="Suche nach Stichworten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchButton type="submit">Suchen</SearchButton>
        </SearchForm>
        
        <CategoryFilterContainer>
          <CategorySelect
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
          />
        </CategoryFilterContainer>
        
        <ResetButton onClick={resetFilters}>Filter zurücksetzen</ResetButton>
      </FilterContainer>
      
      {filteredReports.length === 0 ? (
        <NoResults>Keine Meldungen gefunden.</NoResults>
      ) : (
        filteredReports.map(report => {
          const statusConfig = getStatusConfig(report.status);

          return (
            <ReportCard key={report.id} category={report.category_name}>
              <ReportTitle>
                <ReportTitleLink to={`/meldung/${report.id}`}>
                  {report.title}
                </ReportTitleLink>
              </ReportTitle>
              <ReportCategory>{report.category_name}</ReportCategory>
              <ReportDescription>
                {report.description.length > 300
                  ? `${report.description.substring(0, 300)}...`
                  : report.description}
              </ReportDescription>
              <ContactNotice>Kontaktdaten sind nur für Moderationsteams sichtbar.</ContactNotice>
              <ReportMeta>
                <ReportMetaInfo>
                  <ReportDate>Gemeldet am {formatDate(report.created_at)}</ReportDate>
                  {isModerator && (
                    <StatusBadge
                      $background={statusConfig.background}
                      $color={statusConfig.color}
                      $dotColor={statusConfig.dotColor}
                      title={`Freigabestatus: ${statusConfig.label}`}
                      aria-label={`Freigabestatus: ${statusConfig.label}`}
                    >
                      <StatusDot $dotColor={statusConfig.dotColor} aria-hidden="true" />
                      {statusConfig.label}
                    </StatusBadge>
                  )}
                </ReportMetaInfo>
                <ReportStats>
                  {report.time_spent && <StatItem>{report.time_spent} Std./Monat</StatItem>}
                  {report.costs && <StatItem>{report.costs} €/Jahr</StatItem>}
                  {report.affected_employees && <StatItem>{report.affected_employees} Mitarbeiter</StatItem>}
                  <VoteCount>
                    👍 {report.vote_count || 0}
                  </VoteCount>
                  {report.has_comments && (
                    <CommentIndicator title="Kommentare vorhanden">💬</CommentIndicator>
                  )}
                </ReportStats>
              </ReportMeta>
            </ReportCard>
          );
        })
      )}
    </ListContainer>
  );
};

export default ReportList;

