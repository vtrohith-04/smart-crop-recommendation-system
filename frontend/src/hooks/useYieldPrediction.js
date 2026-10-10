import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export function useYieldPrediction() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const intervalRef = useRef(null);

  const predictYield = async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSuccess(false);

    const messages = ["Analyzing Parameters...", "Running ML Model...", "Calculating Yield...", "Almost Done..."];
    let msgIndex = 0;
    setLoadingMessage(messages[0]);
    toast.loading(messages[0], { id: 'yield_toast' });

    // Rotate messages every 800ms
    intervalRef.current = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setLoadingMessage(messages[msgIndex]);
        toast.loading(messages[msgIndex], { id: 'yield_toast' });
      } else {
        clearInterval(intervalRef.current);
      }
    }, 800);

    try {
      const data = await apiService.predictYield(payload);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setResult(data);
      setSuccess(true);
      toast.success('✓ Prediction Completed Successfully', { id: 'yield_toast' });
      return data;
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const errMsg = err.message || 'Prediction Failed';
      setError(errMsg);
      toast.error(errMsg, { id: 'yield_toast' });
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
    predictYield,
    setError,
    setResult,
  };
}
