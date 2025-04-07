import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import WebView from 'react-native-webview';

interface TradingViewChartProps {
  symbol: string;
  theme: any;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  theme,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Convert symbol to TradingView format
  const getFormattedSymbol = (symbol: string) => {
    // Convert to lowercase for consistent comparison
    symbol = symbol.toLowerCase();

    // Indices
    if (symbol === 'nasdaq') return 'NASDAQ:IXIC';
    if (symbol === 'nasdaq100') return 'NASDAQ:NDX';
    if (symbol === 's&p500') return 'FOREXCOM:SPX500';
    if (symbol === 'dow') return 'DJI';
    if (symbol === 'dax') return 'INDEX:DAX';
    if (symbol === 'nikkei') return 'OANDA:JP225USD';
    if (symbol === 'ftse100') return 'OANDA:UK100GBP';

    // Forex Pairs
    if (symbol === 'usd/jpy') return 'OANDA:USDJPY';
    if (symbol === 'eur/usd') return 'OANDA:EURUSD';
    if (symbol === 'gbp/usd') return 'OANDA:GBPUSD';
    if (symbol === 'usd/cad') return 'OANDA:USDCAD';
    if (symbol === 'aud/usd') return 'OANDA:AUDUSD';
    if (symbol === 'nzd/usd') return 'OANDA:NZDUSD';
    if (symbol === 'usd/chf') return 'OANDA:USDCHF';
    if (symbol === 'eur/jpy') return 'OANDA:EURJPY';
    if (symbol === 'gbp/jpy') return 'OANDA:GBPJPY';
    if (symbol === 'eur/gbp') return 'OANDA:EURGBP';
    if (symbol === 'eur/chf') return 'OANDA:EURCHF';

    // Commodities
    if (symbol === 'gold') return 'OANDA:XAUUSD';
    if (symbol === 'silver') return 'OANDA:XAGUSD';
    if (symbol === 'crude oil') return 'WTI3!';
    if (symbol === 'brent oil') return 'BRENT';
    if (symbol === 'palladium') return 'OANDA:XPDUSD';
    if (symbol === 'platinum') return 'OANDA:XPTUSD';
    if (symbol === 'copper') return 'OANDA:XCUUSD';

    // Cryptocurrencies
    if (symbol === 'bitcoin') return 'BINANCE:BTCUSDT';
    if (symbol === 'ethereum') return 'BINANCE:ETHUSDT';
    if (symbol === 'solana') return 'BINANCE:SOLUSDT';
    if (symbol === 'cardano') return 'BINANCE:ADAUSDT';
    if (symbol === 'polkadot') return 'BINANCE:DOTUSDT';
    if (symbol === 'ripple') return 'BINANCE:XRPUSDT';

    // Stocks
    if (symbol === 'apple') return 'NASDAQ:AAPL';
    if (symbol === 'microsoft') return 'NASDAQ:MSFT';
    if (symbol === 'amazon') return 'NASDAQ:AMZN';
    if (symbol === 'tesla') return 'NASDAQ:TSLA';
    if (symbol === 'meta') return 'NASDAQ:META';
    if (symbol === 'google') return 'NASDAQ:GOOGL';
    if (symbol === 'nvidia') return 'NASDAQ:NVDA';
    if (symbol === 'netflix') return 'NASDAQ:NFLX';
    if (symbol === 'disney') return 'NYSE:DIS';
    if (symbol === 'mcdonalds') return 'NYSE:MCD';
    if (symbol === 'coca cola') return 'NYSE:KO';
    if (symbol === 'pepsi') return 'NASDAQ:PEP';
    if (symbol === 'visa') return 'NYSE:V';
    if (symbol === 'mastercard') return 'NYSE:MA';
    if (symbol === 'jpmorgan') return 'NYSE:JPM';
    if (symbol === 'bank of america') return 'NYSE:BAC';
    if (symbol === 'walmart') return 'NYSE:WMT';
    if (symbol === 'home depot') return 'NYSE:HD';
    if (symbol === 'procter & gamble') return 'NYSE:PG';

    // Default fallback
    return 'BINANCE:BTCUSDT';
  };

  const renderChart = (fullScreen: boolean) => {
    // Using direct TradingView iframe since it's more reliable in WebView
    const chartHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: #1E2230;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
            }
          </style>
        </head>
        <body>
          <!-- TradingView Widget BEGIN -->
          <div class="tradingview-widget-container" style="height:100%;width:100%">
            <iframe 
              id="tradingview_chart"
              src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${getFormattedSymbol(
                symbol
              )}&interval=D&hidesidetoolbar=${!fullScreen}&hidetoptoolbar=${!fullScreen}&symboledit=${fullScreen}&saveimage=${fullScreen}&toolbarbg=F1F3F6&theme=dark&style=1&timezone=exchange&withdateranges=1&studies=%5B%22MAExp%40tv-basicstudies%22%2C%22RSI%40tv-basicstudies%22%5D&studies_overrides=%7B%22macd.macd.color%22%3A%22%232962FF%22%2C%22macd.signal.color%22%3A%22%23FF6B6B%22%2C%22macd.hist.color%22%3A%22%234CAF50%22%2C%22volume.volume.color.0%22%3A%22%23ef535090%22%2C%22volume.volume.color.1%22%3A%22%2326a69a90%22%7D&overrides=%7B%22paneProperties.background%22%3A%22%231E2230%22%2C%22scalesProperties.textColor%22%3A%22%23fff%22%7D&no_volume=1&locale=en"
              style="width: 100%; height: 100%;" 
              frameborder="0" 
              allowtransparency="true"
              scrolling="no"
              allowfullscreen
            ></iframe>
          </div>
          <!-- TradingView Widget END -->
        </body>
      </html>
    `;

    return (
      <View style={[styles.chartContainer, !fullScreen && styles.chartBorder]}>
        <WebView
          source={{ html: chartHtml }}
          style={styles.webview}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      </View>
    );
  };

  return (
    <>
      <View style={styles.compact}>
        {renderChart(false)}
        <TouchableOpacity
          style={[styles.fullScreenButton, { backgroundColor: theme.primary }]}
          onPress={() => setIsFullScreen(true)}>
          <Text style={styles.fullScreenButtonText}>Full Screen</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isFullScreen}
        animationType='fade'
        presentationStyle='fullScreen'
        onRequestClose={() => setIsFullScreen(false)}>
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.background },
          ]}>
          <StatusBar barStyle='light-content' />
          {renderChart(true)}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.primary }]}
            onPress={() => setIsFullScreen(false)}>
            <Text style={styles.fullScreenButtonText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  compact: {
    width: '100%',
    height: 500,
    backgroundColor: '#1E2230',
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#1E2230',
  },
  chartBorder: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2E39',
  },
  modalContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1E2230',
  },
  fullScreenButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1001,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1001,
  },
  fullScreenButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TradingViewChart;
