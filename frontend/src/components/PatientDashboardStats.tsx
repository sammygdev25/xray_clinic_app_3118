import { Grid, Stat } from '../components/ui';
import type { Exam, Invoice } from '../types';

interface PatientDashboardStatsProps {
  exams: Exam[];
  invoices: Invoice[];
}

export default function PatientDashboardStats({ exams, invoices }: PatientDashboardStatsProps) {
  const totalExams = exams.length;
  const upcomingExams = exams.filter((e) => e.status === 'scheduled').length;
  const completedExams = exams.filter((e) => e.status === 'completed').length;
  const pendingInvoices = invoices.filter((i) => i.status === 'pending');
  const pendingTotal = pendingInvoices.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <Grid size="sm">
      <Stat
        value={String(totalExams)}
        label="Total X-ray exams"
        icon="package"
      />
      <Stat
        value={String(upcomingExams)}
        label="Upcoming exams"
        icon="calendar"
      />
      <Stat
        value={String(completedExams)}
        label="Completed exams"
        icon="check"
      />
      <Stat
        value={`$${Number(pendingTotal || 0).toFixed(2)}`}
        label={`Pending invoices (${pendingInvoices.length})`}
        icon="dollar"
      />
    </Grid>
  );
}