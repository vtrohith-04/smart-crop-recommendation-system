import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export function usePrediction() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const intervalRef = useRef(null);

  const recommendCrop = async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSuccess(false);

    const messages = ["Analyzing Soil...", "Running ML Model...", "Almost Done..."];
    let msgIndex = 0;
    setLoadingMessage(messages[0]);
    toast.loading(messages[0], { id: 'rec_toast' });

    // Rotate messages every 800ms
    intervalRef.current = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setLoadingMessage(messages[msgIndex]);
        toast.loading(messages[msgIndex], { id: 'rec_toast' });
      } else {
        clearInterval(intervalRef.current);
      }
    }, 800);

    try {
      const data = await apiService.recommendCrop(payload);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setResult(data);
      setSuccess(true);
      toast.success('✓ Prediction Completed Successfully', { id: 'rec_toast' });
      return data;
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const errMsg = err.message || 'Prediction Failed';
      setError(errMsg);
      toast.error(errMsg, { id: 'rec_toast' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    loading,
    result,
    error,
    success,
    loadingMessage,
    recommendCrop,
    setError,
    setResult,
  };
}
