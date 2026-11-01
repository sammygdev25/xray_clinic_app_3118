import { PageHeader, Button } from '../components/ui';
import { Icon } from '../components/icons';

interface StaffExamsHeaderProps {
  onNewExam?: () => void;
}

export default function StaffExamsHeader({ onNewExam }: StaffExamsHeaderProps) {
  return (
    <PageHeader
      eyebrow="Reception"
      title="Exam Scheduling"
      subtitle="Book X-ray exams for patients, assign rooms and time slots, and track exam status from scheduled to completed."
      actions={
        onNewExam ? (
          <Button variant="primary" onClick={onNewExam}>
            <Icon name="plus" size={18} />
            New Exam
          </Button>
        ) : undefined
      }
    />
  );
}