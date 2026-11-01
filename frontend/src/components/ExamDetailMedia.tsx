import { Section, Split, Media, CardMeta, Badge, Button } from '../components/ui';
import { Icon } from '../components/icons';
import type { Exam } from '../types';

interface ExamDetailMediaProps {
  exam: Exam;
  onViewReport?: () => void;
}

const STATUS_TONE: Record<string, 'neutral' | 'primary' | 'success' | 'danger'> = {
  scheduled: 'primary',
  completed: 'success',
  cancelled: 'danger',
};

export default function ExamDetailMedia({ exam, onViewReport }: ExamDetailMediaProps) {
  const statusTone = STATUS_TONE[exam.status] ?? 'neutral';

  return (
    <Section tight>
      <Split>
        <Media
          src=""
          alt={`X-ray exam: ${exam.bodyPart}`}
          ratio="wide"
          badge={exam.status === 'completed' ? 'Report ready' : undefined}
        />
        <div className="ds-stack">
          <span className="ds-eyebrow">Exam record</span>
          <h1 className="ds-card-title">{exam.bodyPart} X-ray</h1>
          <CardMeta>
            Scheduled {exam.scheduledDate} at {exam.scheduledTime}
            {exam.room ? ` in ${exam.room.name}` : ''}
          </CardMeta>
          <Badge tone={statusTone}>
            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
          </Badge>
          <Button variant="primary" size="lg" onClick={onViewReport}>
            <Icon name="eye" size={18} />
            View radiology report
          </Button>
        </div>
      </Split>
    </Section>
  );
}