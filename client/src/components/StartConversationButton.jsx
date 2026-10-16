import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from './ui/Button';

export default function StartConversationButton({ otherUserId, jobId, label = 'Message' }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const start = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/messages/conversations', { otherUserId, jobId });
      navigate('/worker/messages', { state: { conversationId: data.conversation._id } });
    } catch {} finally { setLoading(false); }
  };

  return <Button onClick={start} disabled={loading} variant="secondary" className="w-full">{loading ? '…' : `💬 ${label}`}</Button>;
}