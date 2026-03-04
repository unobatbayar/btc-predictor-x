import PricePrediction from './components/PricePrediction';
import PriceChart from './components/PriceChart';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            ₿ Bitcoin Price Predictor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Real-time BTC analysis with 15-minute price predictions powered by machine learning
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Price Prediction Cards */}
          <PricePrediction />

          {/* Price Chart */}
          <PriceChart />

          {/* Footer Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              ℹ️ About This Prediction
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              This tool uses linear regression analysis on historical BTC price data to predict potential price movements
              in the next 15 minutes. The prediction confidence score indicates how reliable the prediction is based on
              recent price volatility. Please note: cryptocurrency prices are highly volatile. This tool is for educational
              purposes and should not be used as financial advice. Always do your own research before making investment decisions.
            </p>
          </div>
        </div>

        {/* Deployment Info */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-8">
          <p>Ready to deploy? Deploy this app to Vercel with one click.</p>
          <p className="mt-2">Built with Next.js • Data from CoinGecko API</p>
        </div>
      </main>
    </div>
  );
}
