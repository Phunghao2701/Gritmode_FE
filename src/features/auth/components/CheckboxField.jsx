/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\CheckboxField.jsx
 */
import { Form } from 'react-bootstrap';
import Icon from '../../../shared/components/Icon';

export default function CheckboxField({
  name,
  checked,
  onChange,
  error,
  disabled = false,
  labelMarkup
}) {
  return (
    <Form.Group className="mb-4">
      <div className="d-flex align-items-start gap-2">
        <Form.Check
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          id={`checkbox-${name}`}
          className="mt-0.5"
          style={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            borderColor: error ? '#ef4444' : 'var(--border)',
          }}
        />
        <Form.Label
          htmlFor={`checkbox-${name}`}
          className="text-muted-custom text-xs font-normal mb-0 select-none"
          style={{ cursor: disabled ? 'not-allowed' : 'pointer', lineHeight: '1.4' }}
        >
          {labelMarkup}
        </Form.Label>
      </div>

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
