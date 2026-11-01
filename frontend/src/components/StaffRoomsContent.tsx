import type { Room } from '../types';
import { Card, CardBody, SkeletonCards, EmptyState, Button, Section, Badge } from '../components/ui';
import { Icon } from '../components/icons';

interface StaffRoomsContentProps {
  rooms: Room[];
  loading: boolean;
  onEdit: (room: Room) => void;
  onDelete: (id: number) => void;
}

export default function StaffRoomsContent({ rooms, loading, onEdit, onDelete }: StaffRoomsContentProps) {
  if (loading) {
    return (
      <Section title="Imaging rooms" tight>
        <SkeletonCards count={4} />
      </Section>
    );
  }

  if (rooms.length === 0) {
    return (
      <Section title="Imaging rooms" tight>
        <EmptyState
          icon="home"
          title="No rooms yet"
          text="Add an X-ray room to start scheduling exams for patients."
        />
      </Section>
    );
  }

  return (
    <Section title="Imaging rooms" subtitle="Rooms available for scheduling exams" tight>
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Room number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.name}</td>
                <td>{room.roomNumber}</td>
                <td>
                  <Badge tone={room.isActive ? 'success' : 'neutral'}>
                    {room.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <div className="ds-cluster">
                    <Button variant="ghost" size="md" onClick={() => onEdit(room)}>
                      <Icon name="edit" size={16} />
                      Edit
                    </Button>
                    <Button variant="danger" size="md" onClick={() => onDelete(room.id)}>
                      <Icon name="trash" size={16} />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}