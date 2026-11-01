import { useEffect, useState } from 'react';
import InvoicesHeader from '../components/InvoicesHeader';
import InvoicesContent from '../components/InvoicesContent';
import { getInvoiceList } from '../api';
import type { Invoice } from '../types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getInvoiceList()
      .then((data) => {
        if (active) setInvoices(data);
      })
      .catch((err) => {
        console.error('Failed to load invoices', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="ds-stack-lg">
      <InvoicesHeader invoiceCount={invoices.length} />
      <InvoicesContent invoices={invoices} loading={loading} />
    </div>
  );
}