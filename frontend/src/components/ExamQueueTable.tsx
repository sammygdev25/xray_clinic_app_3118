import type { Exam } from '../types';
import { Badge, Button, EmptyState } from './ui';
import { Icon } from './icons';

interface ExamQueueTableProps {
  exams: Exam[];
  onSelect: (exam: Exam) => void;
}

function statusTone(status: string): 'neutral' | 'primary' | 'soft' | 'success' | 'danger' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'scheduled':
      return 'primary';
    default:
      return 'neutral';
  }
}

function formatTime(time: string): string {
  const parts = time.split(':');
  if (parts.length < 2) return time;
  return `${parts[0]}:${parts[1]}`;
}

export function ExamQueueTable({ exams, onSelect }: ExamQueueTableProps) {
  if (!exams || exams.length === 0) {
    return (
      <EmptyState
        icon="image"
        title="No exams in the queue"
        text="There are no scheduled exams waiting for a report right now."
      />
    );
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Body part</th>
            <th>Room</th>
            <th>Scheduled</th>
            <th>Status</th>
            <th>Report</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id}>
              <td>{exam.patient?.username ?? `Patient #${exam.patientId}`}</td>
              <td>{exam.bodyPart}</td>
              <td>{exam.room?.name ?? `Room #${exam.roomId}`}</td>
              <td>
                {exam.scheduledDate} &middot; {formatTime(exam.scheduledTime)}
              </td>
              <td>
                <Badge tone={statusTone(exam.status)}>{exam.status}</Badge>
              </td>
              <td>
                {exam.reports ? (
                  <Badge tone="success">Filed</Badge>
                ) : (
                  <Badge tone="neutral">Pending</Badge>
                )}
              </td>
              <td>
                <Button variant="ghost" size="md" onClick={() => onSelect(exam)}>
                  <Icon name="edit" size={16} />
                  {exam.reports ? 'Edit report' : 'Write report'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExamQueueTable;