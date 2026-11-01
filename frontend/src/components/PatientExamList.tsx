import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle, CardMeta, CardFooter, Badge, EmptyState, Icon } from './ui';
import type { Exam } from '../types';

interface PatientExamListProps {
  exams: Exam[];
}

function statusTone(status: string): 'neutral' | 'primary' | 'success' | 'danger' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'scheduled':
    default:
      return 'primary';
  }
}

function PatientExamList({ exams }: PatientExamListProps) {
  if (!exams || exams.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="No exams scheduled"
        text="Once the front desk schedules an X-ray for you, it will show up here."
      />
    );
  }

  return (
    <div className="ds-grid ds-grid-sm">
      {exams.map((exam) => (
        <Card key={exam.id} to={`/exams/${exam.id}`}>
          <CardBody>
            <CardTitle>{exam.bodyPart}</CardTitle>
            <CardMeta>
              <Icon name="calendar" size={14} /> {exam.scheduledDate} <Icon name="clock" size={14} /> {exam.scheduledTime}
            </CardMeta>
            {exam.room && (
              <CardMeta>
                <Icon name="map-pin" size={14} /> {exam.room.name} (Room {exam.room.roomNumber})
              </CardMeta>
            )}
            <CardFooter>
              <Badge tone={statusTone(exam.status)}>{exam.status}</Badge>
              <Link to={`/exams/${exam.id}`} className="ds-btn-ghost">
                View details <Icon name="arrow-right" size={14} />
              </Link>
            </CardFooter>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default PatientExamList;
export { PatientExamList };