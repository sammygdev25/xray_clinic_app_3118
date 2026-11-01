import { Card, CardBody, CardTitle, CardMeta, Badge } from './ui';
import { Icon } from './icons';
import type { Exam } from '../types';

interface ExamInfoCardProps {
  exam: Exam;
}

const STATUS_TONE: Record<string, 'primary' | 'success' | 'danger' | 'neutral'> = {
  scheduled: 'primary',
  completed: 'success',
  cancelled: 'danger',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(timeStr: string) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  if (h === undefined) return timeStr;
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m ?? '00'} ${suffix}`;
}

function ExamInfoCard({ exam }: ExamInfoCardProps) {
  const tone = STATUS_TONE[exam.status] ?? 'neutral';

  return (
    <Card>
      <CardBody>
        <div className="ds-between">
          <CardTitle>{exam.bodyPart} X-ray</CardTitle>
          <Badge tone={tone}>{exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}</Badge>
        </div>
        <CardMeta>
          <span className="ds-cluster" style={{ gap: '0.4rem' }}>
            <Icon name="calendar" size={16} />
            {formatDate(exam.scheduledDate)}
          </span>
        </CardMeta>
        <CardMeta>
          <span className="ds-cluster" style={{ gap: '0.4rem' }}>
            <Icon name="clock" size={16} />
            {formatTime(exam.scheduledTime)}
          </span>
        </CardMeta>
        {exam.room && (
          <CardMeta>
            <span className="ds-cluster" style={{ gap: '0.4rem' }}>
              <Icon name="map-pin" size={16} />
              {exam.room.name} (Room {exam.room.roomNumber})
            </span>
          </CardMeta>
        )}
      </CardBody>
    </Card>
  );
}

export { ExamInfoCard };
export default ExamInfoCard;