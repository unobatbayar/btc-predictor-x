'use client';

import { useState, useEffect } from 'react';

interface PredictionData {
  currentPrice: number;
  predictedPrice: number;
  change15m: {
    amount: number;
    percent: number;
  };
  confidence: number;
  priceChange: number;
  priceChangePercent: number;
  timestamp: string;
}

export default function PricePrediction() {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/btc/predict');

      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }

      const data = await response.json();
      setPrediction(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
    // Refresh prediction every 5 minutes (300000 ms)
    const interval = setInterval(fetchPrediction, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button
          onClick={fetchPrediction}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!prediction) {
    return <div>No prediction data available</div>;
  }

  const isPositive = prediction.change15m.amount >= 0;
  const confidencePercent = (prediction.confidence * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Current Price Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Current Price
        </h3>
        <div className="mt-4">
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            ${prediction.currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </p>
          <div className={`mt-2 flex items-center gap-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span className="text-lg font-semibold">
              {isPositive ? '+' : ''}{prediction.priceChange.toFixed(2)} USD
            </span>
            <span className="text-sm font-medium">
              ({isPositive ? '+' : ''}{prediction.priceChangePercent.toFixed(2)}%)
            </span>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* 15-Minute Prediction Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          15-Minute Prediction
        </h3>
        <div className="mt-4">
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            ${prediction.predictedPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </p>
          <div className={`mt-2 flex items-center gap-2 ${prediction.change15m.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <span className="text-lg font-semibold">
              {prediction.change15m.amount >= 0 ? '+' : ''}{prediction.change15m.amount} USD
            </span>
            <span className="text-sm font-medium">
              ({prediction.change15m.percent >= 0 ? '+' : ''}{prediction.change15m.percent}%)
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Prediction Confidence
            </p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${prediction.confidence * 100}%` }}
              ></div>
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {confidencePercent}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
