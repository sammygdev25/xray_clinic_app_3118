import { useState, useEffect, FormEvent } from 'react';
import type { Room } from '../types';
import { Button } from './ui';

interface RoomFormProps {
  onSubmit: (data: { name: string; roomNumber: string; isActive: boolean }) => void;
  initialData?: Partial<Room>;
}

function RoomForm({ onSubmit, initialData }: RoomFormProps) {
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '');
      setRoomNumber(initialData.roomNumber ?? '');
      setIsActive(initialData.isActive ?? true);
    }
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomNumber.trim()) return;
    onSubmit({ name: name.trim(), roomNumber: roomNumber.trim(), isActive });
    if (!initialData) {
      setName('');
      setRoomNumber('');
      setIsActive(true);
    }
  };

  return (
    <form className="ds-form" onSubmit={handleSubmit}>
      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="room-name">
            Room name
          </label>
          <input
            id="room-name"
            className="input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. X-Ray Suite A"
            required
          />
        </div>
        <div className="ds-field">
          <label className="ds-label" htmlFor="room-number">
            Room number
          </label>
          <input
            id="room-number"
            className="input"
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g. 101"
            required
          />
        </div>
      </div>
      <div className="ds-field">
        <label className="ds-label" htmlFor="room-active">
          <input
            id="room-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Room is active
        </label>
        <span className="ds-help">Inactive rooms cannot be scheduled for new exams.</span>
      </div>
      <div className="ds-form-actions">
        <Button type="submit" variant="primary">
          {initialData?.id ? 'Save room' : 'Add room'}
        </Button>
      </div>
    </form>
  );
}

export default RoomForm;
export { RoomForm };