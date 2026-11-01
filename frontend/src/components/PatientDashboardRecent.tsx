import { Link } from 'react-router-dom';
import { Section, EmptyState, Badge } from '../components/ui';
import { Icon } from '../components/icons';
import type { Exam, Invoice } from '../types';

interface PatientDashboardRecentProps {
  exams: Exam[];
  invoices: Invoice[];
}

function examStatusTone(status: string) {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'primary';
}

function invoiceStatusTone(status: string) {
  if (status === 'paid') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'soft';
}

export default function PatientDashboardRecent({ exams, invoices }: PatientDashboardRecentProps) {
  const recentExams = [...exams]
    .sort((a, b) => (a.scheduledDate < b.scheduledDate ? 1 : -1))
    .slice(0, 5);
  const recentInvoices = [...invoices]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  return (
    <Section eyebrow="Activity" title="Recent activity">
      {recentExams.length === 0 && recentInvoices.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="No activity yet"
          text="Your scheduled X-ray exams and invoices will show up here once the clinic books them."
        />
      ) : (
        <div className="ds-stack">
          {recentExams.length > 0 && (
            <div className="ds-table-wrap">
              <table className="ds-table">
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentExams.map((exam) => (
                    <tr key={exam.id}>
                      <td>{exam.bodyPart}</td>
                      <td>
                        {exam.scheduledDate} <span className="ds-muted">{exam.scheduledTime}</span>
                      </td>
                      <td>
                        <Badge tone={examStatusTone(exam.status)}>{exam.status}</Badge>
                      </td>
                      <td>
                        <Link to={`/exams/${exam.id}`} className="ds-cluster">
                          View <Icon name="arrow-right" size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {recentInvoices.length > 0 && (
            <div className="ds-table-wrap">
              <table className="ds-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>Invoice #{invoice.id}</td>
                      <td>${Number(invoice.amount).toFixed(2)}</td>
                      <td>
                        <Badge tone={invoiceStatusTone(invoice.status)}>{invoice.status}</Badge>
                      </td>
                      <td>
                        <Link to="/invoices" className="ds-cluster">
                          View <Icon name="arrow-right" size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}