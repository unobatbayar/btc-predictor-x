import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // Fetch current BTC price from CoinGecko API (free, no auth required)
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'
    );

    const btcData = response.data.bitcoin;

    return NextResponse.json({
      price: btcData.usd,
      marketCap: btcData.usd_market_cap,
      volume24h: btcData.usd_24h_vol,
      change24h: btcData.usd_24h_change,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BTC price' },
      { status: 500 }
    );
  }
}
