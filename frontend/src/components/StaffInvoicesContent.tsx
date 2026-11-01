import type { Invoice } from '../types';
import { Card, CardBody, EmptyState, SkeletonCards, Badge, Button, Price } from '../components/ui';
import { Icon } from '../components/icons';

interface StaffInvoicesContentProps {
  invoices: Invoice[];
  loading: boolean;
  onUpdateStatus: (id: number, status: string) => void;
}

function statusTone(status: string): 'neutral' | 'success' | 'danger' {
  if (status === 'paid') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'neutral';
}

export default function StaffInvoicesContent({ invoices, loading, onUpdateStatus }: StaffInvoicesContentProps) {
  if (loading) {
    return <SkeletonCards count={4} />;
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon="credit-card"
        title="No invoices yet"
        text="Invoices created for patient exams will appear here once a receptionist issues one."
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
            <th>Issued</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.patient?.username ?? `Patient #${invoice.patientId}`}</td>
              <td>{invoice.exam?.bodyPart ?? `Exam #${invoice.examId}`}</td>
              <td><Price value={Number(invoice.amount)} /></td>
              <td>
                <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
              </td>
              <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="ds-cluster">
                  {invoice.status !== 'paid' && (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => onUpdateStatus(invoice.id, 'paid')}
                    >
                      <Icon name="check" size={16} /> Mark paid
                    </Button>
                  )}
                  {invoice.status !== 'cancelled' && (
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => onUpdateStatus(invoice.id, 'cancelled')}
                    >
                      <Icon name="close" size={16} /> Cancel
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}