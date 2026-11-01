import { Section, Grid, Card, CardBody, CardTitle, CardMeta, Media, Badge, EmptyState, SkeletonCards } from '../components/ui';
import { Icon } from '../components/icons';
import type { Room } from '../types';

interface HomeFeaturedProps {
  rooms: Room[];
  loading?: boolean;
}

export default function HomeFeatured({ rooms, loading }: HomeFeaturedProps) {
  return (
    <Section
      eyebrow="Our facilities"
      title="Featured X-ray rooms"
      subtitle="Each room is equipped and staffed for precise, comfortable imaging exams."
    >
      {loading ? (
        <SkeletonCards count={6} />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon="image"
          title="No rooms available yet"
          text="Our scheduling team is setting up imaging rooms. Please check back soon."
        />
      ) : (
        <Grid size="md" cols={3}>
          {rooms.slice(0, 8).map((room) => (
            <Card key={room.id}>
              <Media ratio="wide" alt={room.name} badge={room.roomNumber ? `Room ${room.roomNumber}` : undefined} />
              <CardBody>
                <CardTitle>{room.name}</CardTitle>
                <CardMeta>
                  <Icon name="map-pin" size={14} /> Room {room.roomNumber}
                </CardMeta>
                <Badge tone={room.isActive ? 'success' : 'neutral'}>
                  {room.isActive ? 'In service' : 'Offline'}
                </Badge>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}
    </Section>
  );
}