import { PageHeader, Button } from '../components/ui';
import { Icon } from '../components/icons';

interface StaffRoomsHeaderProps {
  roomCount?: number;
  onAddRoom?: () => void;
}

export default function StaffRoomsHeader({ roomCount, onAddRoom }: StaffRoomsHeaderProps) {
  return (
    <PageHeader
      eyebrow="Receptionist tools"
      title="X-ray rooms"
      subtitle={
        typeof roomCount === 'number'
          ? `Manage the ${roomCount} room${roomCount === 1 ? '' : 's'} available for scheduling exams.`
          : 'Add, edit and retire the rooms used to schedule X-ray exams.'
      }
      actions={
        onAddRoom ? (
          <Button variant="primary" onClick={onAddRoom}>
            <Icon name="plus" size={18} />
            New room
          </Button>
        ) : undefined
      }
    />
  );
}