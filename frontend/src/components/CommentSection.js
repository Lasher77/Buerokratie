import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../api';
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
  background-color: #E30613;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(227, 6, 19, 0.3);
  }

  &:focus {
    outline: 2px solid #E30613;
    outline-offset: 2px;
  }
`;

const CommentSection = ({ reportId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [lawRef, setLawRef] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editLawRef, setEditLawRef] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/reports/${reportId}/comments`
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
        `${API_BASE}/api/reports/${reportId}/comments`,
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

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditText(c.text);
    setEditLawRef(c.law_reference || '');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `${API_BASE}/api/reports/${reportId}/comments/${editingId}`,
        { text: editText, law_reference: editLawRef || null },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      setComments(
        comments.map((c) =>
          c.id === editingId
            ? { ...c, text: editText, law_reference: editLawRef || null }
            : c
        )
      );
      setEditingId(null);
      setEditText('');
      setEditLawRef('');
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Kommentars:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `${API_BASE}/api/reports/${reportId}/comments/${id}`,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      setComments(comments.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Fehler beim Löschen des Kommentars:', err);
    }
  };

  if (loading) return <div>Kommentare werden geladen...</div>;

  return (
    <Section>
      <h3>Kommentare</h3>
      {comments.length === 0 ? (
        <div>Noch keine Kommentare</div>
      ) : (

        comments.map((c) => {
          const editing = editingId === c.id;
          return (
            <CommentBox key={c.id}>
              {editing ? (
                <Form onSubmit={handleEdit}>
                  <TextArea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    required
                  />
                  <Input
                    value={editLawRef}
                    placeholder="Gesetzesbezug (optional)"
                    onChange={(e) => setEditLawRef(e.target.value)}
                  />
                  <Button type="submit">Speichern</Button>
                  <Button type="button" onClick={() => setEditingId(null)}>
                    Abbrechen
                  </Button>
                </Form>
              ) : (
                <>
                  <div>{c.text}</div>
                  {c.law_reference && (
                    <LawReference>{c.law_reference}</LawReference>
                  )}
                  {(user?.role === 'moderator' || user?.role === 'admin') && (
                    <div>
                      <Button type="button" onClick={() => startEdit(c)}>
                        Bearbeiten
                      </Button>
                      <Button type="button" onClick={() => handleDelete(c.id)}>
                        Löschen
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CommentBox>
          );
        })
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
