import { useState, FormEvent } from 'react';
import type { Exam } from '../types';
import { Button } from './ui';

interface InvoiceFormProps {
  onSubmit: (data: { examId: number; amount: number; status: string }) => void | Promise<void>;
  exams: Exam[];
}

function InvoiceForm({ onSubmit, exams }: InvoiceFormProps) {
  const [examId, setExamId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('pending');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!examId) {
      setError('Select an exam to bill.');
      return;
    }
    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount < 0) {
      setError('Enter a valid amount.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ examId: Number(examId), amount: parsedAmount, status });
      setExamId('');
      setAmount('');
      setStatus('pending');
    } catch (err) {
      console.error(err);
      setError('Could not create the invoice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ds-form" onSubmit={handleSubmit}>
      {error && <div className="ds-alert ds-alert-danger">{error}</div>}

      <div className="ds-field">
        <label className="ds-label" htmlFor="invoice-exam">Exam</label>
        <select
          id="invoice-exam"
          className="input"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
        >
          <option value="">Select an exam...</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.bodyPart} — {exam.patient?.username ?? `Patient #${exam.patientId}`} ({exam.scheduledDate})
            </option>
          ))}
        </select>
        <p className="ds-help">Only exams without an invoice need to be billed.</p>
      </div>

      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="invoice-amount">Amount ($)</label>
          <input
            id="invoice-amount"
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="150.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="invoice-status">Status</label>
          <select
            id="invoice-status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="ds-form-actions">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create invoice'}
        </Button>
      </div>
    </form>
  );
}

export default InvoiceForm;
export { InvoiceForm };