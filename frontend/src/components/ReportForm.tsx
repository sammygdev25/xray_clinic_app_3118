import { useState, FormEvent } from 'react';
import { Button } from './ui';

interface ReportFormProps {
  examId: number;
  initialContent?: string;
  onSubmit: (examId: number, content: string) => void | Promise<void>;
}

function ReportForm({ examId, initialContent = '', onSubmit }: ReportFormProps) {
  const [content, setContent] = useState(initialContent);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter the findings before submitting the report.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(examId, content.trim());
    } catch (err) {
      console.error(err);
      setError('Failed to save the report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ds-form" onSubmit={handleSubmit}>
      {error && <div className="ds-alert ds-alert-danger">{error}</div>}
      <div className="ds-field">
        <label className="ds-label" htmlFor={`report-content-${examId}`}>
          Radiology findings
        </label>
        <textarea
          id={`report-content-${examId}`}
          className="input"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe the imaging findings, impression and any recommendations for follow-up..."
        />
        <p className="ds-help">
          This report will be visible to the patient and the care team once saved.
        </p>
      </div>
      <div className="ds-form-actions">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving report...' : initialContent ? 'Update report' : 'Submit report'}
        </Button>
      </div>
    </form>
  );
}

export default ReportForm;
export { ReportForm };