import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffExamsHeader from '../components/StaffExamsHeader';
import StaffExamsContent from '../components/StaffExamsContent';
import ExamForm from '../components/ExamForm';
import { Alert } from '../components/ui';
import { getExamList, getRoomList, getUserList, createExam } from '../api';
import type { Exam, Room, User } from '../types';

export default function StaffExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitLabel, setSubmitLabel] = useState('Schedule exam');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [examList, roomList, patientList] = await Promise.all([
        getExamList(),
        getRoomList(),
        getUserList({ role: 'patient' }),
      ]);
      setExams(examList);
      setRooms(roomList);
      setPatients(patientList);
    } catch (err) {
      console.error(err);
      setError('Failed to load exam schedule.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelect = async (exam: Exam) => {
    navigate(`/exams/${exam.id}`);
  };

  const handleToggleForm = async () => {
    setError('');
    setShowForm((prev) => !prev);
  };

  const handleSubmit = async (data: {
    patientId: number;
    bodyPart: string;
    roomId: number;
    scheduledDate: string;
    scheduledTime: string;
    status: string;
  }) => {
    setSubmitLabel('Scheduling...');
    setError('');
    try {
      const now = new Date().toISOString();
      const created = await createExam({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      setExams((prev) => [created, ...prev]);
      setSubmitLabel('Exam scheduled');
      setTimeout(() => setSubmitLabel('Schedule exam'), 2000);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError('Could not schedule the exam. Please check the details and try again.');
      setSubmitLabel('Schedule exam');
    }
  };

  return (
    <div className="ds-stack-lg">
      <StaffExamsHeader onNewExam={handleToggleForm} />
      {error && <Alert tone="danger">{error}</Alert>}
      {showForm && (
        <ExamForm
          onSubmit={handleSubmit}
          patients={patients}
          rooms={rooms}
        />
      )}
      <StaffExamsContent
        exams={exams}
        loading={loading}
        onSelect={handleSelect}
        onCreateClick={handleToggleForm}
      />
    </div>
  );
}
