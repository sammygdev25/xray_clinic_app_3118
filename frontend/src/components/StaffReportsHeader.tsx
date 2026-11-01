import { PageHeader } from '../components/ui';
import { Icon } from '../components/icons';

interface StaffReportsHeaderProps {
  pendingCount?: number;
}

export default function StaffReportsHeader({ pendingCount }: StaffReportsHeaderProps) {
  return (
    <PageHeader
      eyebrow="Radiology"
      title="Exam Queue &amp; Reporting"
      subtitle={
        pendingCount !== undefined
          ? `${pendingCount} exam${pendingCount === 1 ? '' : 's'} awaiting a radiologist report`
          : 'Review completed exams and author diagnostic reports for your patients'
      }
      actions={<Icon name="list" title="Reporting" />}
    />
  );
}
