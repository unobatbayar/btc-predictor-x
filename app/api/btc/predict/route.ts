import { NextResponse } from 'next/server';
import axios from 'axios';

interface PricePoint {
  timestamp: number;
  price: number;
}

function linearRegression(data: PricePoint[]): { slope: number; intercept: number } {
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  data.forEach((point, index) => {
    sumX += index;
    sumY += point.price;
    sumXY += index * point.price;
    sumXX += index * index;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function predictPrice(
  currentPrice: number,
  recentPrices: number[],
  minutesAhead: number = 15
): { predictedPrice: number; confidence: number } {
  if (recentPrices.length < 2) {
    return { predictedPrice: currentPrice, confidence: 0 };
  }

  // Create price points for regression
  const pricePoints: PricePoint[] = recentPrices.map((price, index) => ({
    timestamp: index,
    price,
  }));

  const { slope } = linearRegression(pricePoints);

  // Project forward based on minutesAhead
  // Scale slope based on minutes (assuming data points are hourly or daily)
  const timeScale = minutesAhead / 60; // Convert to hours if daily data
  const predictedPrice = currentPrice + slope * timeScale;

  // Calculate confidence based on how stable prices have been
  const prices = recentPrices;
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance =
    prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) /
    prices.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = standardDeviation / avg;

  // Higher CV = less stable = lower confidence
  let confidence = Math.max(0, 1 - coefficientOfVariation);
  confidence = Math.min(1, confidence); // Cap at 1.0

  return {
    predictedPrice: parseFloat(predictedPrice.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(3)),
  };
}

export async function GET() {
  try {
    // Fetch current price
    const currentResponse = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );
    const currentPrice = currentResponse.data.bitcoin.usd;

    // Fetch last 30 days of price data for better prediction
    const historyResponse = await axios.get(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily'
    );

    const prices = historyResponse.data.prices.map((p: number[]) => p[1]);
    const lastPrices = prices.slice(-10); // Use last 10 data points

    // Make 15-minute prediction
    const prediction = predictPrice(currentPrice, lastPrices, 15);

    // Calculate price change
    const previousPrice = prices[prices.length - 2] || currentPrice;
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(2);

    return NextResponse.json({
      currentPrice,
      predictedPrice: prediction.predictedPrice,
      change15m: {
        amount: parseFloat(prediction.predictedPrice - currentPrice).toFixed(2),
        percent: parseFloat(
          (((prediction.predictedPrice - currentPrice) / currentPrice) * 100).toFixed(2)
        ),
      },
      predictedChange: prediction.predictedPrice - currentPrice,
      confidence: prediction.confidence,
      previous24hPrice: prices[0],
      priceChange: parseFloat(priceChange.toFixed(2)),
      priceChangePercent: parseFloat(priceChangePercent),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error predicting BTC price:', error);
    return NextResponse.json(
      { error: 'Failed to predict BTC price' },
      { status: 500 }
    );
  }
}
