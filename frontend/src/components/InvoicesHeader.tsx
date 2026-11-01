import { PageHeader } from '../components/ui';

interface InvoicesHeaderProps {
  invoiceCount?: number;
}

export default function InvoicesHeader({ invoiceCount }: InvoicesHeaderProps) {
  return (
    <PageHeader
      eyebrow="Billing"
      title="Your invoices"
      subtitle={
        invoiceCount !== undefined
          ? `${invoiceCount} invoice${invoiceCount === 1 ? '' : 's'} for your X-ray exams and reports.`
          : 'Track the charges for your X-ray exams, from pending balances to paid receipts.'
      }
    />
  );
}