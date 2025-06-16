import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useMarketAnalysis } from '../hooks/useMarketAnalysis';
import { TradingStrategy } from '../types/marketAnalysis';
import { useTheme } from '../providers/ThemeProvider';
import { Button } from './ui/Button';
import TradingViewChart from './TradingViewChart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription } from '@/providers/SubscriptionProvider';

export const AIAnalysis = () => {
  const COLORS = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  // Available options for dropdowns
  const assetOptions = [
    // Indices
    { value: 's&p500', label: 'S&P 500 index (SPX)' },
    { value: 'dow', label: 'Dow Jones (^DJI)' },
    { value: 'nasdaq', label: 'NASDAQ Composite (^IXIC)' },
    { value: 'nasdaq100', label: 'NASDAQ-100 (^NDX)' },
    { value: 'dax', label: 'DAX (^GDAXI)' },
    { value: 'nikkei', label: 'Nikkei 225 (^N225)' },
    { value: 'ftse100', label: 'FTSE 100 (^FTSE)' },

    // Forex Pairs
    { value: 'usd/jpy', label: 'USD/JPY' },
    { value: 'eur/usd', label: 'EUR/USD' },
    { value: 'gbp/usd', label: 'GBP/USD' },
    { value: 'usd/cad', label: 'USD/CAD' },
    { value: 'aud/usd', label: 'AUD/USD' },
    { value: 'nzd/usd', label: 'NZD/USD' },
    { value: 'usd/chf', label: 'USD/CHF' },
    { value: 'eur/jpy', label: 'EUR/JPY' },
    { value: 'gbp/jpy', label: 'GBP/JPY' },
    { value: 'eur/gbp', label: 'EUR/GBP' },
    { value: 'eur/chf', label: 'EUR/CHF' },

    // Commodities
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'crude oil', label: 'Crude Oil WTI' },
    { value: 'brent oil', label: 'Brent Oil ' },
    { value: 'palladium', label: 'Palladium ' },
    { value: 'platinum', label: 'Platinum ' },
    { value: 'copper', label: 'Copper' },

    // Cryptocurrencies
    { value: 'bitcoin', label: 'Bitcoin (BTC-USD)' },
    { value: 'ethereum', label: 'Ethereum (ETH-USD)' },
    { value: 'solana', label: 'Solana (SOL-USD)' },
    { value: 'cardano', label: 'Cardano (ADA-USD)' },
    { value: 'polkadot', label: 'Polkadot (DOT-USD)' },
    { value: 'ripple', label: 'Ripple (XRP-USD)' },

    // Major Stocks
    { value: 'apple', label: 'Apple (AAPL)' },
    { value: 'microsoft', label: 'Microsoft (MSFT)' },
    { value: 'amazon', label: 'Amazon (AMZN)' },
    { value: 'tesla', label: 'Tesla (TSLA)' },
    { value: 'meta', label: 'Meta (META)' },
    { value: 'google', label: 'Google (GOOGL)' },
    { value: 'nvidia', label: 'NVIDIA (NVDA)' },
    { value: 'netflix', label: 'Netflix (NFLX)' },
    { value: 'disney', label: 'Disney (DIS)' },
    { value: 'mcdonalds', label: "McDonald's (MCD)" },
    { value: 'coca cola', label: 'Coca-Cola (KO)' },
    { value: 'pepsi', label: 'Pepsi (PEP)' },
    { value: 'visa', label: 'Visa (V)' },
    { value: 'mastercard', label: 'Mastercard (MA)' },
    { value: 'jpmorgan', label: 'JPMorgan (JPM)' },
    { value: 'bank of america', label: 'Bank of America (BAC)' },
    { value: 'walmart', label: 'Walmart (WMT)' },
    { value: 'home depot', label: 'Home Depot (HD)' },
    { value: 'procter & gamble', label: 'Procter & Gamble (PG)' },
  ];

  const termOptions = [
    { value: 'Day trade', label: 'Day Trade (1-2 days)' },
    { value: 'Swing trade', label: 'Swing Trade (1-2 weeks)' },
    { value: 'Position trade', label: 'Position Trade (1-3 months)' },
  ];

  const riskLevelOptions = [
    { value: 'conservative', label: 'Conservative' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'aggressive', label: 'Aggressive' },
  ];

  // Add state for user selections
  const [selectedAsset, setSelectedAsset] = useState(assetOptions[0].value);
  const [selectedTerm, setSelectedTerm] = useState(termOptions[0].value);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState(
    riskLevelOptions[0].value
  );

  // Use our custom hook
  const {
    analyzeMarket,
    isLoading,
    isError,
    error,
    data: analysis,
    isMockData,
    currentPrice,
    priceValidation,
    cooldownActive,
    cooldownTime,
  } = useMarketAnalysis();

  // Add useEffect to handle scrolling when analysis is available
  useEffect(() => {
    if (analysis && !isLoading && !isError) {
      // Add a small delay to ensure the results are rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 1200, // Increased scroll position to better reach the results
          animated: true,
        });
      }, 800); // Increased delay to ensure content is fully rendered
    }
  }, [analysis, isLoading, isError]);

  // Handle analyze market
  const handleAnalyzeMarket = () => {
    analyzeMarket({
      asset: selectedAsset,
      term: selectedTerm,
      riskLevel: selectedRiskLevel,
    });
  };
  const { setActivePaidUser } = useSubscription();

  // Helper function to render trading strategy details
  const renderTradingStrategy = (strategy: TradingStrategy) => {
    if (!strategy) return null;

    return (
      <View style={styles(COLORS).strategyContainer}>
        <View style={styles(COLORS).strategyHeader}>
          <Text style={styles(COLORS).strategyTitle}>Trading Strategy</Text>
          <Text style={styles(COLORS).strategySubtitle}>
            Generated on {new Date().toLocaleString()}
          </Text>
        </View>

        <View style={styles(COLORS).directionContainer}>
          <Text style={styles(COLORS).directionLabel}>Direction: </Text>
          <Text
            style={[
              styles(COLORS).directionValue,
              strategy.direction === 'LONG'
                ? styles(COLORS).longDirection
                : styles(COLORS).shortDirection,
            ]}>
            {strategy.direction}
          </Text>
        </View>

        <Text style={styles(COLORS).rationaleText}>{strategy.rationale}</Text>

        {currentPrice !== null && (
          <View style={styles(COLORS).currentPriceContainer}>
            <Text style={styles(COLORS).currentPriceLabel}>
              Current Market Price:{' '}
            </Text>
            <Text style={styles(COLORS).currentPriceValue}>
              {typeof currentPrice === 'number'
                ? currentPrice.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                : currentPrice}
            </Text>
            <Text style={styles(COLORS).currentPriceNote}>
              All price targets are relative to this current market price.
            </Text>
          </View>
        )}

        {priceValidation && !priceValidation.isValid && (
          <View style={styles(COLORS).validationWarningContainer}>
            <Text style={styles(COLORS).validationWarningTitle}>
              Price Validation Warning:
            </Text>
            <Text style={styles(COLORS).validationWarningMessage}>
              {priceValidation.message}
            </Text>
          </View>
        )}

        <View style={styles(COLORS).pricePointsContainer}>
          <View style={styles(COLORS).pricePointCard}>
            <Text style={styles(COLORS).pricePointTitle}>Entry</Text>
            <Text style={styles(COLORS).pricePointValue}>
              {strategy.entry.price}
            </Text>
            <Text style={styles(COLORS).pricePointRationale}>
              {strategy.entry.rationale}
            </Text>
          </View>

          <View style={styles(COLORS).pricePointCard}>
            <Text style={styles(COLORS).stopLossTitle}>Stop Loss</Text>
            <Text style={styles(COLORS).pricePointValue}>
              {strategy.stop_loss.price}
            </Text>
            <Text style={styles(COLORS).pricePointRationale}>
              {strategy.stop_loss.rationale}
            </Text>
          </View>

          <View style={styles(COLORS).pricePointCard}>
            <Text style={styles(COLORS).takeProfitTitle}>Take Profit 1</Text>
            <Text style={styles(COLORS).pricePointValue}>
              {strategy.take_profit_1.price}
            </Text>
            <Text style={styles(COLORS).pricePointRationale}>
              {strategy.take_profit_1.rationale}
            </Text>
          </View>

          <View style={styles(COLORS).pricePointCard}>
            <Text style={styles(COLORS).takeProfitTitle}>Take Profit 2</Text>
            <Text style={styles(COLORS).pricePointValue}>
              {strategy.take_profit_2.price}
            </Text>
            <Text style={styles(COLORS).pricePointRationale}>
              {strategy.take_profit_2.rationale}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render picker component based on platform
  const renderPicker = (
    selectedValue: string,
    onValueChange: (value: string) => void,
    items: { value: string; label: string }[],
    label: string
  ) => {
    return (
      <View style={styles(COLORS).pickerContainer}>
        <Text style={styles(COLORS).pickerLabel}>{label}</Text>
        <View style={styles(COLORS).pickerWrapper}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            enabled={!isLoading && !cooldownActive}
            itemStyle={
              Platform.OS === 'ios' ? styles(COLORS).pickerItemStyle : undefined
            }
            style={styles(COLORS).picker}
            mode='dropdown'>
            {items.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
                color={'#000000'}
              />
            ))}
          </Picker>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles(COLORS).container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles(COLORS).scrollContent}>
        <View style={styles(COLORS).mainContainer}>
          <View style={styles(COLORS).headerSection}>
            <Text style={styles(COLORS).title}>Market Analysis</Text>
            <Text style={styles(COLORS).description}>
              Get comprehensive market insights powered by AI. Select your
              asset, trading timeframe, and risk level for personalized
              analysis.
            </Text>
          </View>

          {/* Selection dropdowns */}
          <View style={styles(COLORS).selectionsContainer}>
            {renderPicker(
              selectedAsset,
              setSelectedAsset,
              assetOptions,
              'Asset'
            )}
            {renderPicker(
              selectedTerm,
              setSelectedTerm,
              termOptions,
              'Trading Term'
            )}
            {renderPicker(
              selectedRiskLevel,
              setSelectedRiskLevel,
              riskLevelOptions,
              'Risk Level'
            )}
          </View>

          {/* TradingView Chart */}
          <View style={styles(COLORS).chartContainer}>
            <TradingViewChart symbol={selectedAsset} theme={COLORS} />
          </View>

          {/* Analyze button */}
          <View style={styles(COLORS).buttonContainer}>
            <Button
              title={
                isLoading
                  ? 'Analyzing...'
                  : cooldownActive
                  ? `Cooldown: ${cooldownTime}s`
                  : 'Run AI Analysis'
              }
              style={[
                styles(COLORS).buttonStyle,
                analysis
                  ? { marginTop: 15, marginBottom: 10 }
                  : { marginBottom: 400 },
              ]}
              onPress={handleAnalyzeMarket}
              disabled={isLoading || cooldownActive}
              isLoading={isLoading}
              variant='primary'
              fullWidth
            />
          </View>

          {/* Error message */}
          {isError && error instanceof Error && (
            <View style={styles(COLORS).errorContainer}>
              <Text style={styles(COLORS).errorTitle}>
                Error: {error.message}
              </Text>
              {error.message.includes('Rate limit exceeded') && (
                <View style={styles(COLORS).errorDetails}>
                  <Text style={styles(COLORS).errorText}>
                    Yahoo Finance limits the number of requests we can make to
                    their API. This helps us:
                  </Text>
                  <View style={styles(COLORS).errorList}>
                    <Text style={styles(COLORS).errorListItem}>
                      • Avoid being blocked by their servers
                    </Text>
                    <Text style={styles(COLORS).errorListItem}>
                      • Ensure fair usage of their free data service
                    </Text>
                    <Text style={styles(COLORS).errorListItem}>
                      • Maintain reliable access for all users
                    </Text>
                  </View>
                  <Text style={styles(COLORS).errorText}>
                    The cooldown timer will let you know when it's safe to try
                    again.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Analysis results */}
          {analysis && !isError && (
            <View style={styles(COLORS).resultsContainer}>
              {isMockData && (
                <View style={styles(COLORS).mockDataBanner}>
                  <Text style={styles(COLORS).mockDataText}>
                    Note: This is simulated data for demonstration purposes.
                  </Text>
                </View>
              )}

              <Text style={styles(COLORS).resultsTitle}>
                Market Analysis Results
              </Text>

              {/* Display metadata about the analysis sources */}
              {analysis.meta && (
                <View style={styles(COLORS).metaContainer}>
                  <Text style={styles(COLORS).metaTitle}>
                    Analysis Information
                  </Text>
                  <Text style={styles(COLORS).metaText}>
                    Generated on:{' '}
                    {analysis.meta.generated_at || new Date().toLocaleString()}
                  </Text>
                  <Text style={styles(COLORS).metaText}>
                    Model: {analysis.meta.model || 'AI Analysis'}
                  </Text>
                  {analysis.meta.note && (
                    <Text style={styles(COLORS).metaText}>
                      {analysis.meta.note}
                    </Text>
                  )}
                </View>
              )}

              {currentPrice !== null && (
                <View style={styles(COLORS).currentPriceContainer}>
                  <Text style={styles(COLORS).currentPriceLabel}>
                    Analysis based on current{' '}
                    {analysis.meta?.asset || selectedAsset} price:{' '}
                  </Text>
                  <Text style={styles(COLORS).currentPriceValue}>
                    {typeof currentPrice === 'number'
                      ? currentPrice.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : currentPrice}
                  </Text>
                  <Text style={styles(COLORS).currentPriceNote}>
                    Analysis generated on {new Date().toLocaleString()}
                  </Text>
                </View>
              )}

              <View style={styles(COLORS).sectionContainer}>
                <Text style={styles(COLORS).sectionTitle}>Market Summary</Text>
                <Text style={styles(COLORS).sectionText}>
                  {analysis.market_summary}
                </Text>
              </View>

              <View style={styles(COLORS).sectionContainer}>
                <Text style={styles(COLORS).sectionTitle}>Key Drivers</Text>
                <View style={styles(COLORS).driversList}>
                  {analysis.key_drivers.map((driver: string, index: number) => (
                    <Text key={index} style={styles(COLORS).driverItem}>
                      • {driver}
                    </Text>
                  ))}
                </View>
              </View>

              <View style={styles(COLORS).sectionContainer}>
                <Text style={styles(COLORS).sectionTitle}>
                  Technical Analysis
                </Text>
                <Text style={styles(COLORS).sectionText}>
                  {analysis.technical_analysis}
                </Text>
              </View>

              <View style={styles(COLORS).sectionContainer}>
                <Text style={styles(COLORS).sectionTitle}>Risk Assessment</Text>
                <Text style={styles(COLORS).sectionText}>
                  {analysis.risk_assessment}
                </Text>
              </View>

              {renderTradingStrategy(analysis.trading_strategy)}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = (COLORS: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FAFAFA',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 40,
    },
    mainContainer: {
      flex: 1,
      padding: 0,
    },
    headerSection: {
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 16,
      backgroundColor: '#FFFFFF',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: '#0A0A0A',
      marginBottom: 8,
      letterSpacing: -0.3,
    },
    description: {
      color: '#6B7280',
      marginBottom: 0,
      lineHeight: 22,
      fontSize: 15,
      fontWeight: '400',
    },
    selectionsContainer: {
      backgroundColor: '#FFFFFF',
      paddingVertical: 24,
      paddingHorizontal: 24,
      marginTop: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    pickerContainer: {
      marginBottom: 20,
    },
    pickerLabel: {
      color: '#0A0A0A',
      marginBottom: 8,
      fontSize: 14,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    pickerWrapper: {
      backgroundColor: '#F9FAFB',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      minHeight: Platform.OS === 'ios' ? 44 : 50,
      overflow: 'hidden',
    },
    picker: {
      width: '100%',
      backgroundColor: 'transparent',
      color: '#0A0A0A',
    },
    pickerIOS: {
      backgroundColor: 'transparent',
    },
    pickerItemStyle: {
      fontSize: 16,
      height: 44,
      color: '#0A0A0A',
      fontWeight: '500',
    },
    buttonContainer: {
      paddingHorizontal: 24,
      paddingVertical: 24,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 8,
      borderBottomColor: '#F3F4F6',
    },
    buttonStyle: {
      backgroundColor: '#0A0A0A',
    },
    errorContainer: {
      backgroundColor: '#FEF2F2',
      marginHorizontal: 24,
      marginTop: 16,
      borderRadius: 12,
      padding: 20,
      borderLeftWidth: 4,
      borderLeftColor: '#DC2626',
    },
    errorTitle: {
      color: '#B91C1C',
      fontWeight: '600',
      marginBottom: 8,
      fontSize: 15,
    },
    errorDetails: {
      marginTop: 8,
    },
    errorText: {
      color: '#B91C1C',
      marginBottom: 8,
      fontSize: 14,
      lineHeight: 20,
    },
    errorList: {
      marginVertical: 8,
      paddingLeft: 8,
    },
    errorListItem: {
      color: '#B91C1C',
      marginBottom: 4,
      fontSize: 14,
    },
    resultsContainer: {
      paddingTop: 24,
      paddingHorizontal: 24,
    },
    mockDataBanner: {
      backgroundColor: '#FFFBEB',
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: '#F59E0B',
    },
    mockDataText: {
      color: '#B45309',
      fontWeight: '500',
      fontSize: 14,
    },
    resultsTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#0A0A0A',
      marginBottom: 24,
      letterSpacing: -0.2,
    },
    metaContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#F3F4F6',
    },
    metaTitle: {
      color: '#0A0A0A',
      fontWeight: '600',
      marginBottom: 12,
      fontSize: 16,
    },
    metaText: {
      color: '#6B7280',
      fontSize: 14,
      marginBottom: 4,
      fontWeight: '400',
    },
    currentPriceContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 24,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#F3F4F6',
      alignItems: 'center',
    },
    currentPriceLabel: {
      color: '#6B7280',
      fontWeight: '500',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 8,
    },
    currentPriceValue: {
      color: '#0A0A0A',
      fontWeight: '700',
      fontSize: 32,
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    currentPriceNote: {
      color: '#9CA3AF',
      fontSize: 12,
      textAlign: 'center',
      fontWeight: '400',
    },
    sectionContainer: {
      marginBottom: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: '#F3F4F6',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#0A0A0A',
      marginBottom: 12,
      letterSpacing: -0.1,
    },
    sectionText: {
      color: '#374151',
      lineHeight: 24,
      fontSize: 15,
      fontWeight: '400',
    },
    driversList: {
      marginTop: 4,
    },
    driverItem: {
      color: '#374151',
      marginBottom: 8,
      lineHeight: 22,
      fontSize: 15,
      fontWeight: '400',
      paddingLeft: 8,
    },
    strategyContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 24,
      marginTop: 16,
      borderWidth: 1,
      borderColor: '#F3F4F6',
    },
    strategyHeader: {
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    strategyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#0A0A0A',
      letterSpacing: -0.1,
    },
    strategySubtitle: {
      color: '#6B7280',
      fontSize: 13,
      marginTop: 4,
      fontWeight: '400',
    },
    directionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      backgroundColor: '#F9FAFB',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    directionLabel: {
      color: '#6B7280',
      fontWeight: '500',
      fontSize: 15,
    },
    directionValue: {
      fontWeight: '700',
      fontSize: 18,
      letterSpacing: 0.5,
    },
    longDirection: {
      color: '#059669',
    },
    shortDirection: {
      color: '#DC2626',
    },
    rationaleText: {
      color: '#374151',
      marginBottom: 24,
      lineHeight: 24,
      fontSize: 15,
      fontWeight: '400',
      textAlign: 'center',
      paddingHorizontal: 8,
    },
    validationWarningContainer: {
      backgroundColor: '#FFFBEB',
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: '#F59E0B',
    },
    validationWarningTitle: {
      color: '#B45309',
      fontWeight: '600',
      marginBottom: 8,
      fontSize: 15,
    },
    validationWarningMessage: {
      color: '#B45309',
      fontSize: 14,
      lineHeight: 20,
    },
    pricePointsContainer: {
      marginTop: 20,
    },
    pricePointCard: {
      backgroundColor: '#FAFAFA',
      borderRadius: 8,
      padding: 18,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#F3F4F6',
    },
    pricePointTitle: {
      color: '#6B7280',
      fontWeight: '500',
      marginBottom: 8,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    stopLossTitle: {
      color: '#DC2626',
      fontWeight: '500',
      marginBottom: 8,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    takeProfitTitle: {
      color: '#059669',
      fontWeight: '500',
      marginBottom: 8,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    pricePointValue: {
      color: '#0A0A0A',
      fontWeight: '700',
      fontSize: 24,
      marginBottom: 8,
      letterSpacing: -0.3,
    },
    pricePointRationale: {
      color: '#6B7280',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    },
    chartContainer: {
      marginVertical: 8,
      marginHorizontal: 24,
      height: 400,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#F3F4F6',
    },
  });
