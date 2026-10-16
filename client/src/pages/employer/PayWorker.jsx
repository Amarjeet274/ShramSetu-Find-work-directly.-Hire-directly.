import { useState } from 'react';
import api from '../../services/api';
import Button from '../../components/ui/Button';

function loadRzp() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(window.Razorpay);
    document.body.appendChild(s);
  });
}

export default function PayWorker({ assignment, onPaid }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pay = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/payments/initiate', { assignmentId: assignment._id });

      if (data.order.dev) {
        // Dev mode - simulate
        alert(`DEV: would pay ₹${data.payment.amount} via Razorpay order ${data.order.id}`);
        onPaid?.();
        return;
      }

      const Rzp = await loadRzp();
      const rzp = new Rzp({
        key: data.order.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'ShramSetu',
        description: 'Worker payment',
        order_id: data.order.id,
        handler: () => { onPaid?.(); },
        prefill: {},
        theme: { color: '#F97316' },
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      {error && <div role="alert" className="card bg-red-50 border-red-200 text-red-800">{error}</div>}
      <Button onClick={pay} disabled={loading} className="w-full !min-h-[64px] text-lg">
        {loading ? 'Opening...' : `💳 Pay ₹${assignment.job?.payRate}`}
      </Button>
    </div>
  );
}