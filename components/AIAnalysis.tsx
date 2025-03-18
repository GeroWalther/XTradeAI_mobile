import React, { useState } from 'react';
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
import { TradingStrategy } from '../services/marketAnalysisService';
import { useTheme } from '../providers/ThemeProvider';
import { Button } from './ui/Button';
import TradingViewChart from './TradingViewChart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription } from '@/providers/SubscriptionProvider';

export const AIAnalysis = () => {
  const COLORS = useTheme();

  // Available options for dropdowns
  const assetOptions = [
    { value: 'Nasdaq', label: 'Nasdaq (NAS100/USD)' },
    { value: 'S&P500', label: 'S&P 500 (SPX500/USD)' },
    { value: 'Gold', label: 'Gold (XAU/USD)' },
    { value: 'EUR/USD', label: 'EUR/USD' },
    { value: 'USD/JPY', label: 'USD/JPY' },
    { value: 'BTCUSD', label: 'Bitcoin (BTC/USD)' },
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
            itemStyle={styles(COLORS).pickerItemStyle}
            style={[
              styles(COLORS).picker,
              Platform.OS === 'ios' && styles(COLORS).pickerIOS,
            ]}>
            {items.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
                color={
                  Platform.OS === 'ios'
                    ? COLORS.textPrimary
                    : COLORS.textPrimary
                }
              />
            ))}
          </Picker>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles(COLORS).container}>
      <ScrollView contentContainerStyle={styles(COLORS).scrollContent}>
        <View style={styles(COLORS).mainContainer}>
          <Text style={styles(COLORS).title}>AI Market Analysis</Text>
          <Pressable
            onPress={() => {
              AsyncStorage.clear();
              setActivePaidUser(false);
            }}>
            <Text style={{ fontSize: 40, color: COLORS.error }}>X</Text>
          </Pressable>
          <Text style={styles(COLORS).description}>
            Get advanced market insights powered by our AI algorithms. Analyze
            trends, patterns, and potential trading opportunities.
          </Text>

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
          <Button
            title={
              isLoading
                ? 'Analyzing...'
                : cooldownActive
                ? `Cooldown: ${cooldownTime}s`
                : 'Run AI Analysis'
            }
            onPress={handleAnalyzeMarket}
            disabled={isLoading || cooldownActive}
            isLoading={isLoading}
            variant='primary'
            fullWidth
          />

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
                  {analysis.key_drivers.map((driver, index) => (
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
      backgroundColor: COLORS.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    mainContainer: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.accent,
      marginBottom: 12,
    },
    description: {
      color: COLORS.textSecondary,
      marginBottom: 24,
      lineHeight: 22,
      fontSize: 16,
    },
    selectionsContainer: {
      marginBottom: 24,
    },
    pickerContainer: {
      marginBottom: 20,
    },
    pickerLabel: {
      color: COLORS.accent,
      marginBottom: 8,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    pickerWrapper: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: COLORS.accent,
      shadowColor: COLORS.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    picker: {
      color: COLORS.textPrimary,
      width: '100%',
    },
    pickerIOS: {
      backgroundColor: 'rgba(97, 218, 251, 0.05)', // COLORS.accent with opacity
    },
    pickerItemStyle: {
      fontSize: 18,
      height: 110,
      color: COLORS.textPrimary,
      fontWeight: '500',
    },
    errorContainer: {
      backgroundColor: COLORS.bgError,
      borderRadius: 12,
      padding: 16,
      marginTop: 24,
    },
    errorTitle: {
      color: COLORS.error,
      fontWeight: 'bold',
      marginBottom: 8,
      fontSize: 16,
    },
    errorDetails: {
      marginTop: 8,
    },
    errorText: {
      color: COLORS.error,
      marginBottom: 8,
    },
    errorList: {
      marginVertical: 8,
      paddingLeft: 8,
    },
    errorListItem: {
      color: COLORS.error,
      marginBottom: 4,
    },
    resultsContainer: {
      marginTop: 32,
    },
    mockDataBanner: {
      backgroundColor: COLORS.bgWarning,
      borderRadius: 12,
      padding: 12,
      marginBottom: 24,
    },
    mockDataText: {
      color: COLORS.warning,
      fontWeight: 'bold',
    },
    resultsTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.accent,
      marginBottom: 24,
    },
    metaContainer: {
      backgroundColor: COLORS.bgPurple,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    metaTitle: {
      color: COLORS.info,
      fontWeight: 'bold',
      marginBottom: 12,
      fontSize: 16,
    },
    metaText: {
      color: COLORS.textSecondary,
      fontSize: 14,
      marginBottom: 6,
    },
    currentPriceContainer: {
      backgroundColor: COLORS.bgInfo,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    currentPriceLabel: {
      color: COLORS.accentLight,
      fontWeight: 'bold',
      fontSize: 16,
    },
    currentPriceValue: {
      color: COLORS.textPrimary,
      fontWeight: 'bold',
      fontSize: 24,
      marginVertical: 8,
    },
    currentPriceNote: {
      color: COLORS.textMuted,
      fontSize: 12,
      marginTop: 4,
    },
    sectionContainer: {
      marginBottom: 8,
      backgroundColor: COLORS.primaryDark,
      borderRadius: 12,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.accent,
      marginBottom: 12,
    },
    sectionText: {
      color: COLORS.textSecondary,
      lineHeight: 22,
      fontSize: 16,
    },
    driversList: {
      marginTop: 8,
    },
    driverItem: {
      color: COLORS.textSecondary,
      marginBottom: 8,
      lineHeight: 22,
      fontSize: 16,
    },
    strategyContainer: {
      backgroundColor: COLORS.primaryDark,
      borderRadius: 12,
      padding: 16,
      marginTop: 24,
    },
    strategyHeader: {
      marginBottom: 12,
    },
    strategyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.accent,
    },
    strategySubtitle: {
      color: COLORS.textMuted,
      fontSize: 14,
      marginTop: 4,
    },
    directionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    directionLabel: {
      color: COLORS.textSecondary,
      fontWeight: '500',
      fontSize: 16,
    },
    directionValue: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    longDirection: {
      color: COLORS.longDirection,
    },
    shortDirection: {
      color: COLORS.shortDirection,
    },
    rationaleText: {
      color: COLORS.textSecondary,
      marginBottom: 16,
      lineHeight: 22,
      fontSize: 16,
    },
    validationWarningContainer: {
      backgroundColor: COLORS.bgWarning,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    validationWarningTitle: {
      color: COLORS.warning,
      fontWeight: 'bold',
      marginBottom: 8,
      fontSize: 16,
    },
    validationWarningMessage: {
      color: COLORS.warning,
      fontSize: 14,
    },
    pricePointsContainer: {
      marginTop: 16,
    },
    pricePointCard: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    pricePointTitle: {
      color: COLORS.accent,
      fontWeight: '600',
      marginBottom: 8,
      fontSize: 16,
    },
    stopLossTitle: {
      color: COLORS.error,
      fontWeight: '600',
      marginBottom: 8,
      fontSize: 16,
    },
    takeProfitTitle: {
      color: COLORS.success,
      fontWeight: '600',
      marginBottom: 8,
      fontSize: 16,
    },
    pricePointValue: {
      color: COLORS.textPrimary,
      fontWeight: 'bold',
      fontSize: 20,
      marginBottom: 8,
    },
    pricePointRationale: {
      color: COLORS.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    chartContainer: {
      marginVertical: 20,
      height: 500,
      width: '100%',
      backgroundColor: COLORS.background,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: COLORS.primaryLight,
    },
  });
