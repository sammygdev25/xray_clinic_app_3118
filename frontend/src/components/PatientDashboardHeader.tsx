import { PageHeader, Button } from '../components/ui';
import { Icon } from '../components/icons';

export interface PatientDashboardHeaderProps {
  patientName: string;
}

export default function PatientDashboardHeader({ patientName }: PatientDashboardHeaderProps) {
  return (
    <PageHeader
      eyebrow="Patient Portal"
      title={`Welcome back, ${patientName}`}
      subtitle="Here is an overview of your X-ray exams, radiology reports and invoices."
      actions={
        <>
          <Button to="/invoices" variant="primary">
            <Icon name="credit-card" size={18} />
            View Invoices
          </Button>
          <Button to="/profile" variant="ghost">
            <Icon name="user" size={18} />
            My Profile
          </Button>
        </>
      }
    />
  );
}