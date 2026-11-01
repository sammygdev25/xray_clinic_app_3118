import { PageHeader, Button } from '../components/ui';
import { Icon } from '../components/icons';

interface StaffInvoicesHeaderProps {
  totalInvoices: number;
  pendingCount: number;
  onCreateClick?: () => void;
}

export default function StaffInvoicesHeader({ totalInvoices, pendingCount, onCreateClick }: StaffInvoicesHeaderProps) {
  return (
    <PageHeader
      eyebrow="Billing"
      title="Invoices"
      subtitle={`Create invoices for completed exams and track payment status. ${totalInvoices} invoice${totalInvoices === 1 ? '' : 's'} on file, ${pendingCount} pending.`}
      actions={
        onCreateClick ? (
          <Button variant="primary" onClick={onCreateClick}>
            <Icon name="plus" size={18} />
            New Invoice
          </Button>
        ) : undefined
      }
    />
  );
}