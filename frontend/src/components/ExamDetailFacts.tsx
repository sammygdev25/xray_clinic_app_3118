import { Section, Grid, Card, CardBody, Badge } from '../components/ui';
import { Icon } from '../components/icons';
import type { Exam } from '../types';

interface ExamDetailFactsProps {
  exam: Exam;
}

function statusTone(status: string): 'neutral' | 'primary' | 'success' | 'danger' {
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

export default function ExamDetailFacts({ exam }: ExamDetailFactsProps) {
  const facts: { icon: Parameters<typeof Icon>[0]['name']; label: string; value: React.ReactNode }[] = [
    { icon: 'tag', label: 'Body part', value: exam.bodyPart },
    {
      icon: 'info',
      label: 'Status',
      value: <Badge tone={statusTone(exam.status)}>{exam.status}</Badge>,
    },
    { icon: 'calendar', label: 'Scheduled date', value: exam.scheduledDate },
    { icon: 'clock', label: 'Scheduled time', value: exam.scheduledTime },
    { icon: 'map-pin', label: 'Room', value: exam.room?.name ?? `Room #${exam.roomId}` },
    { icon: 'package', label: 'Room number', value: exam.room?.roomNumber ?? '—' },
  ];

  return (
    <Section eyebrow="X-ray exam" title="Exam details">
      <Grid size="sm" cols={2}>
        {facts.map((fact) => (
          <Card key={fact.label}>
            <CardBody>
              <div className="ds-cluster">
                <Icon name={fact.icon} size={18} />
                <span className="ds-muted ds-small">{fact.label}</span>
              </div>
              <div className="ds-card-title">{fact.value}</div>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}