import { Section, Grid, Card, CardBody, CardTitle, CardMeta, Badge, EmptyState, SkeletonCards, Alert, Stack, Cluster, Button } from '../components/ui';
import { Icon } from '../components/icons';
import type { Exam } from '../types';

interface StaffReportsContentProps {
  exams: Exam[];
  selectedExam: Exam | null;
  onSelectExam: (exam: Exam) => void;
  reportContent: string;
  onReportContentChange: (value: string) => void;
  onSubmitReport: () => void;
  loading: boolean;
  submitting?: boolean;
  error?: string | null;
}

export default function StaffReportsContent({
  exams,
  selectedExam,
  onSelectExam,
  reportContent,
  onReportContentChange,
  onSubmitReport,
  loading,
  submitting,
  error,
}: StaffReportsContentProps) {
  if (loading) {
    return (
      <Section title="Exam queue" subtitle="Exams awaiting a radiology report">
        <SkeletonCards count={4} />
      </Section>
    );
  }

  const pending = exams.filter((e) => e.status === 'completed');

  return (
    <Section
      eyebrow="Radiology queue"
      title="Exams awaiting a report"
      subtitle="Select a completed exam from the queue, then draft the findings and impression below."
    >
      {error && <Alert tone="danger">{error}</Alert>}
      <Grid size="lg" cols={2}>
        <div className="ds-stack">
          {pending.length === 0 ? (
            <EmptyState
              icon="book"
              title="No exams waiting"
              text="Every completed exam already has a report. New exams will appear here once they are marked completed."
            />
          ) : (
            <Stack gap="sm">
              {pending.map((exam) => {
                const active = selectedExam?.id === exam.id;
                return (
                  <Card
                    key={exam.id}
                    onClick={() => onSelectExam(exam)}
                    className={active ? 'ds-card-active' : undefined}
                  >
                    <CardBody>
                      <Cluster justify="between" align="center">
                        <CardTitle>{exam.bodyPart} X-ray</CardTitle>
                        <Badge tone={active ? 'primary' : 'neutral'}>
                          {exam.status === 'completed' ? 'Ready for report' : exam.status}
                        </Badge>
                      </Cluster>
                      <CardMeta>
                        <Cluster gap="sm" align="center">
                          <Icon name="user" size={14} />
                          <span>{exam.patient?.username ?? `Patient #${exam.patientId}`}</span>
                          <Icon name="calendar" size={14} />
                          <span>{exam.scheduledDate} {exam.scheduledTime}</span>
                        </Cluster>
                      </CardMeta>
                    </CardBody>
                  </Card>
                );
              })}
            </Stack>
          )}
        </div>

        <Card>
          <CardBody>
            {selectedExam ? (
              <Stack gap="md">
                <div>
                  <CardTitle>
                    Report for {selectedExam.bodyPart} exam
                  </CardTitle>
                  <CardMeta>
                    <Cluster gap="sm" align="center">
                      <Icon name="map-pin" size={14} />
                      <span>Room {selectedExam.room?.roomNumber ?? selectedExam.roomId}</span>
                    </Cluster>
                  </CardMeta>
                </div>
                <div className="ds-field">
                  <label className="ds-label" htmlFor="report-content">Findings &amp; impression</label>
                  <textarea
                    id="report-content"
                    className="ds-input"
                    rows={10}
                    value={reportContent}
                    onChange={(e) => onReportContentChange(e.target.value)}
                    placeholder="Describe the radiographic findings, impression, and any recommendations..."
                  />
                </div>
                <Cluster justify="end">
                  <Button
                    variant="primary"
                    onClick={onSubmitReport}
                    disabled={submitting || reportContent.trim().length === 0}
                  >
                    <Icon name="check" size={16} /> {submitting ? 'Saving...' : 'Save report'}
                  </Button>
                </Cluster>
              </Stack>
            ) : (
              <EmptyState
                icon="edit"
                title="Select an exam"
                text="Choose an exam from the queue to write or review its radiology report."
              />
            )}
          </CardBody>
        </Card>
      </Grid>
    </Section>
  );
}