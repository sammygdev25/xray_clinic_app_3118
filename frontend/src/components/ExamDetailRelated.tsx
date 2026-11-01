import { Section, Grid, Card, CardBody, CardTitle, CardMeta, Badge, EmptyState } from '../components/ui';
import { Icon } from '../components/icons';
import type { Room } from '../types';

interface ExamDetailRelatedProps {
  rooms: Room[];
  currentRoomId?: number;
}

export default function ExamDetailRelated({ rooms, currentRoomId }: ExamDetailRelatedProps) {
  const related = rooms
    .filter((room) => room.id !== currentRoomId && room.isActive)
    .slice(0, 6);

  if (related.length === 0) {
    return null;
  }

  return (
    <Section
      eyebrow="Imaging rooms"
      title="Other rooms at the clinic"
      subtitle="Exams may be scheduled in any of these active imaging rooms depending on availability."
      tight
    >
      <Grid size="sm">
        {related.map((room) => (
          <Card key={room.id}>
            <CardBody>
              <CardTitle>
                <Icon name="map-pin" size={16} /> {room.name}
              </CardTitle>
              <CardMeta>Room {room.roomNumber}</CardMeta>
              <Badge tone={room.isActive ? 'success' : 'neutral'}>
                {room.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}