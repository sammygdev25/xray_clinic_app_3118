import { useState, useEffect, useCallback } from 'react';
import { api, getExamList } from '../api';
import type { Exam } from '../types';
import StaffReportsHeader from '../components/StaffReportsHeader';
import StaffReportsContent from '../components/StaffReportsContent';

export default function StaffReportsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExamList();
      setExams(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load exam queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const handleSelectExam = async (exam: Exam) => {
    setSelectedExam(exam);
    setReportContent('');
    setError(null);
  };

  const handleSubmitReport = async () => {
    if (!selectedExam) return;
    if (!reportContent.trim()) {
      setError('Report content cannot be empty.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/reports/', {
        examId: selectedExam.id,
        content: reportContent,
      });
      setSelectedExam(null);
      setReportContent('');
      await loadExams();
    } catch (err) {
      console.error(err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = exams.filter(
    (exam) => exam.status === 'completed' && !exam.reports
  ).length;

  return (
    <div className="ds-stack-lg">
      <StaffReportsHeader pendingCount={pendingCount} />
      <StaffReportsContent
        exams={exams}
        selectedExam={selectedExam}
        onSelectExam={handleSelectExam}
        reportContent={reportContent}
        onReportContentChange={setReportContent}
        onSubmitReport={handleSubmitReport}
        loading={loading}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}