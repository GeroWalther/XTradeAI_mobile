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
    switch (symbol) {
      case 'Nasdaq':
        return 'NASDAQ:NDX';
      case 'S&P500':
        return 'SPX';
      case 'Gold':
        return 'OANDA:XAUUSD';
      case 'EUR/USD':
        return 'OANDA:EURUSD';
      case 'USD/JPY':
        return 'OANDA:USDJPY';
      case 'BTCUSD':
        return 'BINANCE:BTCUSDT';
      default:
        return 'BINANCE:BTCUSDT';
    }
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
              )}&interval=D&hidesidetoolbar=${!fullScreen}&hidetoptoolbar=${!fullScreen}&symboledit=${fullScreen}&saveimage=${fullScreen}&toolbarbg=F1F3F6&studies=%5B%22MACD%40tv-basicstudies%22%2C%22RSI%40tv-basicstudies%22%5D&theme=dark&style=1&timezone=exchange&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart"
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
