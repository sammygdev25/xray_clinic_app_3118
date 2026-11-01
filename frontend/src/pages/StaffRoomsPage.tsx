import { useState, useEffect, useCallback } from 'react';
import StaffRoomsHeader from '../components/StaffRoomsHeader';
import StaffRoomsContent from '../components/StaffRoomsContent';
import RoomForm from '../components/RoomForm';
import { Alert } from '../components/ui';
import { getRoomList, createRoom, updateRoom, deleteRoom } from '../api';
import type { Room } from '../types';

export default function StaffRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRoomList();
      setRooms(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleAddRoom = () => {
    setEditingRoom(null);
    setShowForm(true);
  };

  const handleEdit = async (room: Room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this room? This cannot be undone.')) return;
    try {
      await deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete room.');
    }
  };

  const handleSubmit = async (data: { name: string; roomNumber: string; isActive: boolean }) => {
    try {
      if (editingRoom) {
        const updated = await updateRoom(editingRoom.id, {
          ...data,
          createdAt: editingRoom.createdAt,
          updatedAt: new Date().toISOString(),
        });
        setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        const now = new Date().toISOString();
        const created = await createRoom({
          ...data,
          createdAt: now,
          updatedAt: now,
        });
        setRooms((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditingRoom(null);
    } catch (err) {
      console.error(err);
      setError('Failed to save room.');
      throw err;
    }
  };

  return (
    <div className="ds-stack-lg">
      <StaffRoomsHeader roomCount={rooms.length} onAddRoom={handleAddRoom} />
      {error && <Alert tone="danger">{error}</Alert>}
      {showForm && (
        <RoomForm
          initialData={editingRoom ?? undefined}
          onSubmit={handleSubmit}
        />
      )}
      <StaffRoomsContent
        rooms={rooms}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
