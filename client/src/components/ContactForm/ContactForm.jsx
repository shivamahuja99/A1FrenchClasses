import React, { useState } from 'react';
import { useCreateLeadMutation } from '../../store/api/apiSlice';
import styles from './ContactForm.module.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [createLead, { isLoading, error }] = useCreateLeadMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLead(formData).unwrap();
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.successMessage}>
        <h2>Thank You!</h2>
        <p>Your message has been received. Our team will contact you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className={styles.formSection}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.input}
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            className={styles.input}
            placeholder="john.doe@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number (Optional)</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className={styles.input}
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            className={styles.input}
            placeholder="How can we help?"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            className={styles.textarea}
            placeholder="Tell us about your French learning goals..."
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? (
            'Sending...'
          ) : (
            <>
              Send Message
              <span>→</span>
            </>
          )}
        </button>

        {error && (
          <p className={styles.errorMessage}>
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </div>
  );
};

export default ContactForm;
