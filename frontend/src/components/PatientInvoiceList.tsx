import { Link } from 'react-router-dom';
import { Badge, Price, EmptyState } from '../components/ui';
import type { Invoice } from '../types';

interface PatientInvoiceListProps {
  invoices: Invoice[];
}

function statusTone(status: string): 'neutral' | 'success' | 'danger' | 'soft' {
  switch (status) {
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'pending':
    default:
      return 'soft';
  }
}

function formatDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function PatientInvoiceList({ invoices }: PatientInvoiceListProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <EmptyState
        icon="credit-card"
        title="No invoices yet"
        text="Invoices for your X-ray exams will appear here once billing is issued."
      />
    );
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>Exam</th>
            <th>Issued</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                {invoice.exam ? (
                  <Link to={`/exams/${invoice.examId}`}>{invoice.exam.bodyPart} X-ray</Link>
                ) : (
                  <Link to={`/exams/${invoice.examId}`}>Exam #{invoice.examId}</Link>
                )}
              </td>
              <td>{formatDate(invoice.createdAt)}</td>
              <td>
                <Price value={invoice.amount} />
              </td>
              <td>
                <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PatientInvoiceList;
export { PatientInvoiceList };