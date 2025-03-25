// src/components/DatabaseConnectionModal.tsx
'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

interface DatabaseConnectionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DatabaseConnectionModal({ onClose, onSuccess }: DatabaseConnectionModalProps) {
  const [name, setName] = useState('');
  const [vectorDbUrl, setVectorDbUrl] = useState('');
  const [targetDbUrl, setTargetDbUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !vectorDbUrl || !targetDbUrl) {
      setError('All fields are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Get the token for authentication with your backend
      const token = await getToken();
      
      // Make the request to your FastAPI backend
      const response = await fetch('http://localhost:8000/api/connections/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          vector_db_url: vectorDbUrl,
          target_db_url: targetDbUrl
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create connection');
      }
      
      // Handle success
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl text-green-500 font-mono mb-4">Database Connection Required</h2>
        <p className="text-green-400 mb-4">
          To use THEO, you need to provide database connections:
        </p>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-green-400 mb-1">Connection Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
              placeholder="My Database"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-green-400 mb-1">Vector Database URL</label>
            <input
              type="text"
              value={vectorDbUrl}
              onChange={(e) => setVectorDbUrl(e.target.value)}
              className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
              placeholder="postgresql://username:password@localhost:5432/vector_db"
            />
            <p className="text-gray-500 text-xs mt-1">This database will store the schema embeddings</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-green-400 mb-1">Target Database URL</label>
            <input
              type="text"
              value={targetDbUrl}
              onChange={(e) => setTargetDbUrl(e.target.value)}
              className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
              placeholder="postgresql://username:password@localhost:5432/target_db"
            />
            <p className="text-gray-500 text-xs mt-1">This is the database you want to query</p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-500 text-gray-300 rounded hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}