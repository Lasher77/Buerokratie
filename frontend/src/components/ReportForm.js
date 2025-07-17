import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import axios from 'axios';
import CategorySelect from './CategorySelect';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  color: #003E7E; /* BVMW Blau */
  margin-bottom: 20px;
  font-size: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #003E7E; /* BVMW Blau */
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    border-color: #E30613; /* BVMW Rot */
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  min-height: 150px;
  
  &:focus {
    border-color: #E30613; /* BVMW Rot */
    outline: none;
  }
`;

const ErrorText = styled.div`
  color: #E30613; /* BVMW Rot */
  font-size: 14px;
  margin-top: 5px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const SubmitButton = styled.button`
  background-color: #E30613; /* BVMW Rot */
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #c00510;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: #4CAF50;
  color: white;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
`;

const ReportForm = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Korrigiertes Validierungsschema
  const validationSchema = Yup.object({
    title: Yup.string().required('Titel ist erforderlich'),
    description: Yup.string().required('Beschreibung ist erforderlich'),
    category_id: Yup.number().required('Kategorie ist erforderlich'),
    time_spent: Yup.number().min(0, 'Muss eine positive Zahl sein').nullable(),
    costs: Yup.number().min(0, 'Muss eine positive Zahl sein').nullable(),
    affected_employees: Yup.number().integer().min(0, 'Muss eine positive ganze Zahl sein').nullable(),
    reporter_name: Yup.string(),
    reporter_company: Yup.string(),
    reporter_email: Yup.string().email('Ungültige E-Mail-Adresse'),
    is_anonymous: Yup.boolean()
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category_id: '',
      time_spent: '',
      costs: '',
      affected_employees: '',
      reporter_name: '',
      reporter_company: '',
      reporter_email: '',
      is_anonymous: false
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Daten für anonyme Meldungen bereinigen
      const formData = {
        title: values.title,
        description: values.description,
        category_id: Number(values.category_id),
        time_spent: values.time_spent === '' ? null : Number(values.time_spent),
        costs: values.costs === '' ? null : Number(values.costs),
        affected_employees: values.affected_employees === '' ? null : Number(values.affected_employees),
        is_anonymous: values.is_anonymous
      };

      // Kontaktdaten nur hinzufügen, wenn nicht anonym
      if (!values.is_anonymous) {
        formData.reporter_name = values.reporter_name || null;
        formData.reporter_company = values.reporter_company || null;
        formData.reporter_email = values.reporter_email || null;
      } else {
        // Bei anonymen Meldungen explizit auf null setzen
        formData.reporter_name = null;
        formData.reporter_company = null;
        formData.reporter_email = null;
      }

      console.log('Gesendete Daten:', formData);
      
      try {
        const response = await axios.post('http://localhost:5000/api/reports', formData);
        console.log('Antwort vom Server:', response.data);
        setSubmitSuccess(true);
        formik.resetForm();
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Fehler beim Absenden des Formulars:', error);
        console.error('Fehlerdetails:', error.response?.data);
        setSubmitError(
          error.response?.data?.message || 
          'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  return (
    <FormContainer>
      {submitSuccess && (
        <SuccessMessage>
          Vielen Dank! Ihre Meldung wurde erfolgreich übermittelt.
        </SuccessMessage>
      )}
      
      <FormTitle>Bürokratisches Hemmnis melden</FormTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Titel des bürokratischen Hemmnisses *</Label>
          <Input
            id="title"
            name="title"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.title}
          />
          {formik.touched.title && formik.errors.title && (
            <ErrorText>{formik.errors.title}</ErrorText>
          )}
        </FormGroup>
        
        <FormGroup>
          <CategorySelect
            value={formik.values.category_id}
            onChange={(value) => formik.setFieldValue('category_id', value)}
            required
          />
          {formik.touched.category_id && formik.errors.category_id && (
            <ErrorText>{formik.errors.category_id}</ErrorText>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="description">Detaillierte Beschreibung *</Label>
          <TextArea
            id="description"
            name="description"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.description}
          />
          {formik.touched.description && formik.errors.description && (
            <ErrorText>{formik.errors.description}</ErrorText>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="time_spent">Geschätzter Zeitaufwand (Stunden pro Monat)</Label>
          <Input
            id="time_spent"
            name="time_spent"
            type="number"
            min="0"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.time_spent}
          />
          {formik.touched.time_spent && formik.errors.time_spent && (
            <ErrorText>{formik.errors.time_spent}</ErrorText>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="costs">Geschätzte Kosten (Euro pro Jahr)</Label>
          <Input
            id="costs"
            name="costs"
            type="number"
            min="0"
            step="0.01"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.costs}
          />
          {formik.touched.costs && formik.errors.costs && (
            <ErrorText>{formik.errors.costs}</ErrorText>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="affected_employees">Anzahl betroffener Mitarbeiter</Label>
          <Input
            id="affected_employees"
            name="affected_employees"
            type="number"
            min="0"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.affected_employees}
          />
          {formik.touched.affected_employees && formik.errors.affected_employees && (
            <ErrorText>{formik.errors.affected_employees}</ErrorText>
          )}
        </FormGroup>
        
        <FormGroup>
          <CheckboxContainer>
            <Checkbox
              id="is_anonymous"
              name="is_anonymous"
              type="checkbox"
              onChange={formik.handleChange}
              checked={formik.values.is_anonymous}
            />
            <Label htmlFor="is_anonymous" style={{ display: 'inline', marginBottom: 0 }}>
              Ich möchte anonym bleiben
            </Label>
          </CheckboxContainer>
        </FormGroup>
        
        {!formik.values.is_anonymous && (
          <>
            <FormGroup>
              <Label htmlFor="reporter_name">Name</Label>
              <Input
                id="reporter_name"
                name="reporter_name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.reporter_name}
              />
              {formik.touched.reporter_name && formik.errors.reporter_name && (
                <ErrorText>{formik.errors.reporter_name}</ErrorText>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="reporter_company">Unternehmen</Label>
              <Input
                id="reporter_company"
                name="reporter_company"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.reporter_company}
              />
              {formik.touched.reporter_company && formik.errors.reporter_company && (
                <ErrorText>{formik.errors.reporter_company}</ErrorText>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="reporter_email">E-Mail</Label>
              <Input
                id="reporter_email"
                name="reporter_email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.reporter_email}
              />
              {formik.touched.reporter_email && formik.errors.reporter_email && (
                <ErrorText>{formik.errors.reporter_email}</ErrorText>
              )}
            </FormGroup>
          </>
        )}
        
        {submitError && <ErrorText>{submitError}</ErrorText>}
        
        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Wird gesendet...' : 'Meldung absenden'}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default ReportForm;

