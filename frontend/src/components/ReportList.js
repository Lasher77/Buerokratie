import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../api';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import CategorySelect from './CategorySelect';


const ListContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const ListTitle = styled.h2`
  color: #003E7E; /* BVMW Blau */
  margin-bottom: 20px;
  font-size: 24px;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
`;

const SearchInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  flex: 1;
  min-width: 200px;
  
  &:focus {
    border-color: #E30613; /* BVMW Rot */
    outline: none;
  }
`;

const SearchButton = styled.button`
  background-color: #003E7E; /* BVMW Blau */
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #002a57;
  }
`;

const ResetButton = styled.button`
  background-color: #58585A; /* BVMW Grau */
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #444;
  }
`;

const CategoryFilterContainer = styled.div`
  flex: 1;
  min-width: 200px;
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
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
`;

const ReportTitle = styled.h3`
  color: #003E7E; /* BVMW Blau */
  margin-bottom: 10px;
  font-size: 20px;
`;

const ReportTitleLink = styled(Link)`
  color: #003E7E; /* BVMW Blau */
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
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

const ReportMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/reports`);
        setReports(response.data);
        setFilteredReports(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Fehler beim Laden der Meldungen:', err);
        setError('Meldungen konnten nicht geladen werden.');
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

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
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: '2', minWidth: '300px' }}>
          <SearchInput
            type="text"
            placeholder="Suche nach Stichworten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchButton type="submit">Suchen</SearchButton>
        </form>
        
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
        filteredReports.map(report => (
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
            <ReportMeta>
              <ReportDate>Gemeldet am {formatDate(report.created_at)}</ReportDate>
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
        ))
      )}
    </ListContainer>
  );
};

export default ReportList;

