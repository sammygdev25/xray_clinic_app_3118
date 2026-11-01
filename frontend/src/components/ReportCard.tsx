import { Card, CardBody, CardTitle, CardMeta } from './ui';
import { Icon } from './icons';
import type { Report } from '../types';

interface ReportCardProps {
  report: Report;
}

function ReportCard({ report }: ReportCardProps) {
  const createdAt = new Date(report.createdAt);

  return (
    <Card>
      <CardBody>
        <div className="ds-cluster" style={{ justifyContent: 'space-between' }}>
          <CardTitle>Radiology Report</CardTitle>
          <Icon name="quote" size={20} title="Report" />
        </div>
        <CardMeta>
          Dictated by Dr. {report.radiologist?.username ?? 'our radiologist'} on{' '}
          {createdAt.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </CardMeta>
        <p className="ds-lead" style={{ whiteSpace: 'pre-wrap', marginTop: 'var(--space-md, 1rem)' }}>
          {report.content}
        </p>
      </CardBody>
    </Card>
  );
}

export default ReportCard;
export { ReportCard };