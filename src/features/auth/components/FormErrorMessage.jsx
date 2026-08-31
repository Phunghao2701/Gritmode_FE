/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\FormErrorMessage.jsx
 */
import { Alert } from 'react-bootstrap';
import Icon from '../../../shared/components/Icon';

export default function FormErrorMessage({ message }) {
  if (!message) return null;

  return (
    <Alert 
      variant="danger" 
      className="d-flex align-items-center gap-3 py-2.5 px-3 border-0 rounded-3 mb-4 animate-fade-in"
      style={{
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#fca5a5',
        fontSize: '13px',
        fontWeight: 500
      }}
    >
      <Icon icon="lucide:alert-triangle" width="18" className="text-danger flex-shrink-0" />
      <div>{message}</div>
    </Alert>
  );
}
