import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    // Extract days parameter from query string (default to 7 days)
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '7';

    // Fetch historical BTC prices from CoinGecko API
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );

    const prices = response.data.prices.map((price: number[]) => ({
      timestamp: new Date(price[0]).toISOString(),
      date: new Date(price[0]).toLocaleDateString(),
      price: price[1],
    }));

    return NextResponse.json({
      prices,
      count: prices.length,
    });
  } catch (error) {
    console.error('Error fetching BTC history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BTC history' },
      { status: 500 }
    );
  }
}
