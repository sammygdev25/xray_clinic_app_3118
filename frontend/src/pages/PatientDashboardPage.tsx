import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getExamList, getInvoiceList } from '../api';
import type { Exam, Invoice } from '../types';
import PatientDashboardHeader from '../components/PatientDashboardHeader';
import PatientDashboardStats from '../components/PatientDashboardStats';
import PatientDashboardRecent from '../components/PatientDashboardRecent';
import PatientDashboardActions from '../components/PatientDashboardActions';
import { LoadingBlock } from '../components/ui';

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [examData, invoiceData] = await Promise.all([
        getExamList(),
        getInvoiceList(),
      ]);
      setExams(examData);
      setInvoices(invoiceData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingBlock label="Loading your dashboard..." />;
  }

  return (
    <div className="ds-stack-lg">
      <PatientDashboardHeader patientName={user?.username ?? 'Patient'} />
      <PatientDashboardStats exams={exams} invoices={invoices} />
      <PatientDashboardRecent exams={exams} invoices={invoices} />
      <PatientDashboardActions onViewInvoices={() => navigate('/invoices')} />
    </div>
  );
}