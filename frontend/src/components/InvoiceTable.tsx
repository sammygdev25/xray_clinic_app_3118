import type { Invoice } from '../types';
import { Badge, Price, EmptyState } from './ui';

interface InvoiceTableProps {
  invoices: Invoice[];
}

function statusTone(status: string): 'neutral' | 'primary' | 'soft' | 'success' | 'danger' {
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

function InvoiceTable({ invoices }: InvoiceTableProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <EmptyState
        icon="credit-card"
        title="No invoices yet"
        text="Invoices created for patient exams will appear here."
      />
    );
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Exam</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.patient?.username ?? `Patient #${invoice.patientId}`}</td>
              <td>{invoice.exam?.bodyPart ?? `Exam #${invoice.examId}`}</td>
              <td>
                <Price value={Number(invoice.amount)} />
              </td>
              <td>
                <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
              </td>
              <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InvoiceTable;
export { InvoiceTable };