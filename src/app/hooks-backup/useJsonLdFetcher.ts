import { useState, useCallback } from 'react';
import { extractJsonLdFromHtml, willHaveCorsIssue } from '../utils/htmlParser';

interface FetchResult {
  url: string;
  found: number;
  json: string[];
  fetchMethod?: 'client' | 'server' | 'manual';
  error?: string;
  suggestion?: string;
}

export function useJsonLdFetcher() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJsonLd = useCallback(async (targetUrl: string): Promise<FetchResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Check if we're likely to hit CORS issues
      const likelyCorsProblem = willHaveCorsIssue(targetUrl);
      
      if (!likelyCorsProblem) {
        console.log('Attempting client-side fetch...');
        
        try {
          // Try client-side fetch first
          const response = await fetch(targetUrl, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
          });

          if (response.ok) {
            const html = await response.text();
            const jsonBlocks = extractJsonLdFromHtml(html);
            
            console.log('Client-side fetch successful!');
            return {
              url: targetUrl,
              found: jsonBlocks.length,
              json: jsonBlocks,
              fetchMethod: 'client'
            };
          }
        } catch (clientError) {
          console.log('Client-side fetch failed:', clientError);
          // Fall through to server-side fetch
        }
      }

      // Step 2: Fall back to server-side fetch
      console.log('Falling back to server-side fetch...');
      
      const serverResponse = await fetch(`/api/fetch-json-ld?url=${encodeURIComponent(targetUrl)}`);
      const data = await serverResponse.json();

      if (data.error) {
        // Check if it's a 403 error that might be due to Vercel IP blocking
        if (data.status === 403 || data.error.includes('403')) {
          setError('This website blocks automated requests. Please use manual input method below.');
          return {
            url: targetUrl,
            found: 0,
            json: [],
            fetchMethod: 'manual',
            error: data.error,
            suggestion: 'manual_input'
          };
        }
        
        setError(data.error);
        return null;
      }

      return {
        ...data,
        fetchMethod: 'server'
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    fetchJsonLd,
    loading,
    error,
    reset
  };
}
