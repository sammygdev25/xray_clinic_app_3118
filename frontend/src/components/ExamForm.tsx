import { useState, FormEvent } from 'react';
import { Button } from './ui';
import type { User, Room } from '../types';

interface ExamFormProps {
  onSubmit: (data: {
    patientId: number;
    bodyPart: string;
    roomId: number;
    scheduledDate: string;
    scheduledTime: string;
    status: string;
  }) => void;
  patients: User[];
  rooms: Room[];
}

const BODY_PARTS = [
  'Chest',
  'Abdomen',
  'Skull',
  'Spine - Cervical',
  'Spine - Lumbar',
  'Pelvis',
  'Knee',
  'Hand',
  'Foot',
  'Shoulder',
];

function ExamForm({ onSubmit, patients, rooms }: ExamFormProps) {
  const [patientId, setPatientId] = useState('');
  const [bodyPart, setBodyPart] = useState(BODY_PARTS[0]);
  const [roomId, setRoomId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [status, setStatus] = useState('scheduled');

  const activeRooms = rooms.filter((r) => r.isActive);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!patientId || !roomId || !scheduledDate || !scheduledTime) return;
    onSubmit({
      patientId: Number(patientId),
      bodyPart,
      roomId: Number(roomId),
      scheduledDate,
      scheduledTime,
      status,
    });
    setPatientId('');
    setBodyPart(BODY_PARTS[0]);
    setRoomId('');
    setScheduledDate('');
    setScheduledTime('');
    setStatus('scheduled');
  };

  return (
    <form className="ds-form" onSubmit={handleSubmit}>
      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="exam-patient">Patient</label>
          <select
            id="exam-patient"
            className="input"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          >
            <option value="">Select a patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.username}
              </option>
            ))}
          </select>
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="exam-room">Room</label>
          <select
            id="exam-room"
            className="input"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          >
            <option value="">Select a room</option>
            {activeRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.roomNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="exam-body-part">Body part</label>
          <select
            id="exam-body-part"
            className="input"
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
            required
          >
            {BODY_PARTS.map((part) => (
              <option key={part} value={part}>
                {part}
              </option>
            ))}
          </select>
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="exam-status">Status</label>
          <select
            id="exam-status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="exam-date">Date</label>
          <input
            id="exam-date"
            type="date"
            className="input"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            required
          />
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="exam-time">Time</label>
          <input
            id="exam-time"
            type="time"
            className="input"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="ds-form-actions">
        <Button type="submit" variant="primary">
          Schedule exam
        </Button>
      </div>
    </form>
  );
}

export default ExamForm;