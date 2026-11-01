import { Card, CardBody, CardTitle, CardMeta, CardFooter, Badge, Grid, SkeletonCards, EmptyState, Button } from '../components/ui';
import { Icon } from '../components/icons';
import type { Exam } from '../types';

interface StaffExamsContentProps {
  exams: Exam[];
  loading: boolean;
  onSelect: (exam: Exam) => void;
  onCreateClick?: () => void;
}

function statusTone(status: string): 'neutral' | 'success' | 'danger' {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'neutral';
}

export default function StaffExamsContent({ exams, loading, onSelect, onCreateClick }: StaffExamsContentProps) {
  if (loading) {
    return <SkeletonCards count={6} />;
  }

  if (exams.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="No exams scheduled yet"
        text="Book the first X-ray exam for a patient to see it appear here."
        action={
          onCreateClick
            ? <Button onClick={onCreateClick}>Schedule an exam</Button>
            : undefined
        }
      />
    );
  }

  return (
    <Grid size="md" cols={3}>
      {exams.map((exam) => (
        <Card key={exam.id} onClick={() => onSelect(exam)}>
          <CardBody>
            <CardTitle>{exam.bodyPart} X-ray</CardTitle>
            <CardMeta>
              <Icon name="user" size={14} /> {exam.patient?.username ?? 'Unknown patient'}
            </CardMeta>
            <CardMeta>
              <Icon name="map-pin" size={14} /> {exam.room?.name ?? 'Unassigned room'}
            </CardMeta>
            <CardMeta>
              <Icon name="calendar" size={14} /> {exam.scheduledDate} at {exam.scheduledTime}
            </CardMeta>
          </CardBody>
          <CardFooter>
            <Badge tone={statusTone(exam.status)}>{exam.status}</Badge>
          </CardFooter>
        </Card>
      ))}
    </Grid>
  );
}
