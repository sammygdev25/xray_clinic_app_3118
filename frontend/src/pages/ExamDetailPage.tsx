import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExam, getRoomList } from '../api';
import type { Exam, Room } from '../types';
import ExamDetailMedia from '../components/ExamDetailMedia';
import ExamDetailFacts from '../components/ExamDetailFacts';
import ExamDetailRelated from '../components/ExamDetailRelated';
import ExamInfoCard from '../components/ExamInfoCard';
import ReportCard from '../components/ReportCard';
import { LoadingBlock, Alert, EmptyState, Section, Button } from '../components/ui';

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReport, setShowReport] = useState(false);

  const load = useCallback(async () => {
    const examId = Number(id);
    if (!examId || Number.isNaN(examId)) {
      setError('Invalid exam id');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [examData, roomList] = await Promise.all([
        getExam(examId),
        getRoomList(),
      ]);
      setExam(examData);
      setRooms(roomList);
    } catch (err) {
      console.error(err);
      setError('Unable to load this exam. It may not exist or you may not have access to it.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Section>
        <LoadingBlock label="Loading exam..." />
      </Section>
    );
  }

  if (error || !exam) {
    return (
      <Section>
        <Alert tone="danger">{error || 'Exam not found.'}</Alert>
      </Section>
    );
  }

  const relatedRooms = rooms.filter((r) => r.id !== exam.roomId && r.isActive);
  const report = exam.reports && exam.reports.length > 0 ? exam.reports[0] : null;

  return (
    <div className="ds-stack-lg">
      <ExamDetailMedia exam={exam} onViewReport={() => setShowReport((v) => !v)} />

      {showReport && (
        <Section title="Radiology Report" eyebrow="Findings">
          {report ? (
            <ReportCard report={report} />
          ) : (
            <EmptyState
              icon="clock"
              title="Report not yet available"
              text="The radiologist has not completed this report yet. Check back once your exam status is Completed."
              action={
                <Button variant="primary" onClick={() => navigate('/dashboard')}>
                  Back to dashboard
                </Button>
              }
            />
          )}
        </Section>
      )}

      <Section title="Exam Summary" eyebrow="Overview" tight>
        <ExamInfoCard exam={exam} />
      </Section>

      <ExamDetailFacts exam={exam} />

      {relatedRooms.length > 0 && (
        <ExamDetailRelated rooms={relatedRooms} currentRoomId={exam.roomId} />
      )}
    </div>
  );
}
