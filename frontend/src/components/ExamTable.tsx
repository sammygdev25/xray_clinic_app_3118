import type { Exam } from '../types';
import { Badge } from './ui';
import { Icon } from './icons';

interface ExamTableProps {
  exams: Exam[];
  onSelect: (exam: Exam) => void;
}

function statusTone(status: string): 'primary' | 'success' | 'danger' | 'neutral' {
  switch (status) {
    case 'scheduled':
      return 'primary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
}

function ExamTable({ exams, onSelect }: ExamTableProps) {
  if (exams.length === 0) {
    return (
      <div className="ds-empty">
        <Icon name="calendar" size={28} />
        <p>No exams scheduled yet.</p>
      </div>
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
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id} onClick={() => onSelect(exam)} style={{ cursor: 'pointer' }}>
              <td>{exam.patient?.username ?? `Patient #${exam.patientId}`}</td>
              <td>{exam.bodyPart}</td>
              <td>{exam.room?.name ?? `Room #${exam.roomId}`}</td>
              <td>{exam.scheduledDate}</td>
              <td>{exam.scheduledTime}</td>
              <td>
                <Badge tone={statusTone(exam.status)}>{exam.status}</Badge>
              </td>
              <td>
                <button
                  type="button"
                  className="ds-btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(exam);
                  }}
                >
                  View
                  <Icon name="chevron-right" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExamTable;
export { ExamTable };