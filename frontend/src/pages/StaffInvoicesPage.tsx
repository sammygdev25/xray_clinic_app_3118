import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StaffInvoicesHeader from '../components/StaffInvoicesHeader';
import StaffInvoicesContent from '../components/StaffInvoicesContent';
import InvoiceForm from '../components/InvoiceForm';
import { getInvoiceList, getExamList, createInvoice, updateInvoice } from '../api';
import { Alert } from '../components/ui';
import type { Invoice, Exam } from '../types';

export default function StaffInvoicesPage() {
  useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [invoiceData, examData] = await Promise.all([
        getInvoiceList(),
        getExamList(),
      ]);
      setInvoices(invoiceData);
      setExams(examData);
    } catch (err) {
      console.error(err);
      setError('Unable to load invoices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateClick = async () => {
    setShowForm((prev) => !prev);
  };

  const handleCreateInvoice = async (data: { examId: number; amount: number; status: string }) => {
    try {
      const exam = exams.find((e) => e.id === data.examId);
      if (!exam) {
        setError('Select a valid exam.');
        return;
      }
      const now = new Date().toISOString();
      const invoice = await createInvoice({
        examId: data.examId,
        patientId: exam.patient?.id ?? (exam as unknown as { patientId: number }).patientId,
        amount: data.amount,
        status: data.status,
        createdAt: now,
        updatedAt: now,
      });
      setInvoices((prev) => [invoice, ...prev]);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError('Could not create the invoice. Check the details and try again.');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const updated = await updateInvoice(id, { status });
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
    } catch (err) {
      console.error(err);
      setError('Could not update the invoice status.');
    }
  };

  const pendingCount = invoices.filter((inv) => inv.status === 'pending').length;

  return (
    <div className="ds-stack-lg">
      <StaffInvoicesHeader
        totalInvoices={invoices.length}
        pendingCount={pendingCount}
        onCreateClick={handleCreateClick}
      />
      {error && <Alert tone="danger">{error}</Alert>}
      {showForm && (
        <InvoiceForm onSubmit={handleCreateInvoice} exams={exams} />
      )}
      <StaffInvoicesContent
        invoices={invoices}
        loading={loading}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
