'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceData {
  date: string;
  price: number;
  timestamp: string;
}

export default function PriceChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('7');

  const fetchChartData = async (days: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/btc/history?days=${days}`);

      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const data: { prices: PriceData[] } = await response.json();

      if (data.prices.length === 0) {
        throw new Error('No price data available');
      }

      const labels = data.prices.map((p) => p.date);
      const prices = data.prices.map((p) => p.price);

      setChartData({
        labels,
        datasets: [
          {
            label: 'BTC Price (USD)',
            data: prices,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
          },
        ],
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData(timeframe);
  }, [timeframe]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Price History
        </h3>
        <div className="flex gap-2">
          {['7', '30', '90'].map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>
      {chartData && (
        <div className="h-96">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  labels: {
                    color: document.documentElement.classList.contains('dark')
                      ? '#d1d5db'
                      : '#374151',
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context: any) {
                      return `$${context.parsed.y.toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                      })}`;
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  ticks: {
                    callback: function (value: any) {
                      return `$${value.toLocaleString()}`;
                    },
                    color: document.documentElement.classList.contains('dark')
                      ? '#9ca3af'
                      : '#6b7280',
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark')
                      ? 'rgba(55, 65, 81, 0.5)'
                      : 'rgba(0, 0, 0, 0.05)',
                  },
                },
                x: {
                  ticks: {
                    color: document.documentElement.classList.contains('dark')
                      ? '#9ca3af'
                      : '#6b7280',
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark')
                      ? 'rgba(55, 65, 81, 0.5)'
                      : 'rgba(0, 0, 0, 0.05)',
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
