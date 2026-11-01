import type { Room } from '../types';
import { Button, EmptyState, Badge } from '../components/ui';
import { Icon } from '../components/icons';

interface RoomTableProps {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
}

function RoomTable({ rooms, onEdit, onDelete }: RoomTableProps) {
  if (rooms.length === 0) {
    return (
      <EmptyState
        icon="home"
        title="No rooms yet"
        text="Add an X-ray room to start scheduling exams."
      />
    );
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Room number</th>
            <th>Status</th>
            <th aria-label="Actions" />
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
                  <Button variant="danger" size="md" onClick={() => onDelete(room)}>
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
  );
}

export default RoomTable;
export { RoomTable };