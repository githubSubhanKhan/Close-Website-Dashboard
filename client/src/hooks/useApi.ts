// src/hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api.service';
import type {
  Book,
  RecommendationResponse,
  SimilarBookRequest
} from '../services/api.types';

export function useBookDetail(bookId: string | null) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookId) return;

    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getBookById(bookId);
        setBook(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        navigate("/error");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId, navigate]);

  return { book, loading, error };
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const fetchRecommendations = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRecommendations(query);
      setRecommendations(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      navigate("/error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations
  };
}

export function useSimilarBooks() {
  const [similarBooks, setSimilarBooks] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const fetchSimilarBooks = useCallback(async (request: SimilarBookRequest) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSimilarBooks(request);
      setSimilarBooks(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      navigate("/error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return {
    similarBooks,
    loading,
    error,
    fetchSimilarBooks
  };
}
