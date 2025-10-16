import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { resolveShortLink } from '../services/shortLinkService';

export const ShortLinkResolver: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolve = async () => {
      if (!shortCode) {
        setError('No short code provided');
        setLoading(false);
        return;
      }

      try {
        const result = await resolveShortLink(shortCode);
        
        if (!result) {
          setError('Short link not found');
          setLoading(false);
          return;
        }

        // Redirect to the appropriate calculation page
        if (result.calculationType === 'basic') {
          setRedirectTo(`/${result.calculationId}/insert`);
        } else {
          setRedirectTo(`/expert/${result.calculationId}/edit`);
        }
      } catch (err) {
        setError('Failed to resolve short link');
        setLoading(false);
      }
    };

    resolve();
  }, [shortCode]);

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Resolving short link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Link Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return null;
};