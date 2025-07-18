import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useAuth } from '../AuthContext';

const Section = styled.div`
  margin-top: 40px;
`;

const CommentBox = styled.div`
  border-bottom: 1px solid #eee;
  padding: 10px 0;
`;

const LawReference = styled.span`
  display: block;
  color: #777;
  font-size: 14px;
`;

const Form = styled.form`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 80px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: #003E7E;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
`;

const CommentSection = ({ reportId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [lawRef, setLawRef] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/reports/${reportId}/comments`
        );
        setComments(response.data);
      } catch (err) {
        console.error('Fehler beim Laden der Kommentare:', err);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchComments();
    }
  }, [reportId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/reports/${reportId}/comments`,
        { text, law_reference: lawRef || null },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      setComments([response.data, ...comments]);
      setText('');
      setLawRef('');
    } catch (err) {
      console.error('Fehler beim Erstellen des Kommentars:', err);
    }
  };

  if (loading) return <div>Kommentare werden geladen...</div>;

  return (
    <Section>
      <h3>Kommentare</h3>
      {comments.length === 0 ? (
        <div>Noch keine Kommentare</div>
      ) : (
        comments.map((c) => (
          <CommentBox key={c.id}>
            <div>{c.text}</div>
            {c.law_reference && (
              <LawReference>{c.law_reference}</LawReference>
            )}
          </CommentBox>
        ))
      )}

      {(user?.role === 'moderator' || user?.role === 'admin') && (
        <Form onSubmit={handleSubmit}>
          <TextArea
            placeholder="Kommentar eingeben"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <Input
            placeholder="Gesetzesbezug (optional)"
            value={lawRef}
            onChange={(e) => setLawRef(e.target.value)}
          />
          <Button type="submit">Absenden</Button>
        </Form>
      )}
    </Section>
  );
};

export default CommentSection;
