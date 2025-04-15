
import { useState, useCallback } from 'react';
import WorldAPIClient from './worldApiClient';

const client = new WorldAPIClient({
  clientId: import.meta.env.VITE_WORLDAPI_CLIENT_ID,
  clientSecret: import.meta.env.VITE_WORLDAPI_CLIENT_SECRET,
  username: import.meta.env.VITE_WORLDAPI_USERNAME,
  password: import.meta.env.VITE_WORLDAPI_PASSWORD,
  baseUrl: import.meta.env.VITE_WORLDAPI_BASE_URL,
});

export function useCreateQuote() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const createQuote = useCallback(async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.createQuote(payload);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createQuote, data, loading, error };
}

export function useCreateTransaction() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const createTransaction = useCallback(async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.createTransaction(payload);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createTransaction, data, loading, error };
}

export function useConfirmTransaction() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const confirmTransaction = useCallback(async (transactionRef: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.confirmTransaction(transactionRef);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { confirmTransaction, data, loading, error };
}

export function useEnquireTransaction() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const enquireTransaction = useCallback(async (transactionRef: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.enquireTransaction(transactionRef);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { enquireTransaction, data, loading, error };
}
