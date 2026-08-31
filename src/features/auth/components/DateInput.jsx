/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\DateInput.jsx
 */
import { Form, InputGroup } from 'react-bootstrap';
import { useState } from 'react';
import Icon from '../../../shared/components/Icon';


export default function DateInput({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  ...props
}) {
  const today = new Date().toISOString().split('T')[0];
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Form.Group className="mb-3">
      {label && (
        <Form.Label 
          className="text-xs font-bold mb-1.5 d-flex align-items-center gap-1"
          style={{ 
            letterSpacing: '0.05em', 
            color: 'var(--text-main)',
            textTransform: 'uppercase'
          }}
        >
          {label}
          {required && <span className="text-danger">*</span>}
        </Form.Label>
      )}
      
      <InputGroup 
        className="rounded-3 overflow-hidden border"
        style={{
          borderColor: error ? '#ef4444' : (isFocused ? 'var(--primary)' : 'var(--border)'),
          background: '#ffffff',
          transition: 'all 0.2s ease-in-out',
          boxShadow: error 
            ? '0 0 0 3px rgba(239, 68, 68, 0.12)' 
            : (isFocused ? '0 0 0 3px rgba(255, 122, 51, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.02)')
        }}
      >
        <InputGroup.Text 
          className="bg-transparent border-0 pe-1 text-muted-custom d-flex align-items-center justify-content-center"
          style={{ width: '40px' }}
        >
          <Icon icon="lucide:calendar" width="18" className="text-muted-custom opacity-70" />
        </InputGroup.Text>
        
        <Form.Control
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          max={today}
          disabled={disabled}
          className="bg-transparent border-0 text-main text-sm py-2.5 ps-2"
          style={{
            boxShadow: 'none',
            outline: 'none',
            color: 'var(--text-main)'
          }}
          {...props}
        />
      </InputGroup>
      
      {error && (
        <div 
          className="text-danger text-xs mt-1.5 d-flex align-items-center gap-1 animate-fade-in"
          style={{ fontWeight: 500 }}
        >
          <Icon icon="lucide:alert-circle" width="12" />
          <span>{error}</span>
        </div>
      )}
    </Form.Group>
  );
}

