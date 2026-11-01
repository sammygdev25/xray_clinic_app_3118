import { Section, Cluster, Button } from '../components/ui';
import { Icon } from '../components/icons';

interface PatientDashboardActionsProps {
  onViewInvoices?: () => void;
}

export default function PatientDashboardActions({ onViewInvoices }: PatientDashboardActionsProps) {
  return (
    <Section tight title="Quick actions">
      <Cluster gap="sm">
        <Button to="/dashboard" variant="primary">
          <Icon name="calendar" size={16} /> View upcoming exams
        </Button>
        <Button to="/invoices" variant="secondary" onClick={onViewInvoices}>
          <Icon name="credit-card" size={16} /> View my invoices
        </Button>
        <Button to="/profile" variant="ghost">
          <Icon name="user" size={16} /> My profile
        </Button>
        <Button to="/dashboard" variant="ghost">
          <Icon name="refresh" size={16} /> Refresh status
        </Button>
      </Cluster>
    </Section>
  );
}