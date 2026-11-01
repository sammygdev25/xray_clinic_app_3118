import { Card, CardBody, CardTitle, CardMeta, CardFooter, Price, Badge, Grid, EmptyState, SkeletonCards } from '../components/ui';
import { Icon } from '../components/icons';
import type { Invoice } from '../types';

interface InvoicesContentProps {
  invoices: Invoice[];
  loading?: boolean;
}

function statusTone(status: string): 'success' | 'neutral' | 'danger' {
  if (status === 'paid') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'neutral';
}

export default function InvoicesContent({ invoices, loading }: InvoicesContentProps) {
  if (loading) {
    return <SkeletonCards count={4} />;
  }

  if (!invoices || invoices.length === 0) {
    return (
      <EmptyState
        icon="credit-card"
        title="No invoices yet"
        text="Once an exam has been scheduled and billed, your invoices will show up here."
      />
    );
  }

  return (
    <Grid size="md" cols={3}>
      {invoices.map((invoice) => (
        <Card key={invoice.id}>
          <CardBody>
            <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
            <CardTitle>
              {invoice.exam?.bodyPart ? `${invoice.exam.bodyPart} X-ray` : `Invoice #${invoice.id}`}
            </CardTitle>
            <CardMeta>
              <Icon name="calendar" size={14} />{' '}
              {invoice.exam?.scheduledDate
                ? new Date(invoice.exam.scheduledDate).toLocaleDateString()
                : new Date(invoice.createdAt).toLocaleDateString()}
            </CardMeta>
            <CardFooter>
              <Price value={Number(invoice.amount)} />
            </CardFooter>
          </CardBody>
        </Card>
      ))}
    </Grid>
  );
}