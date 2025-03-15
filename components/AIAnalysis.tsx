import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useMarketAnalysis } from '../hooks/useMarketAnalysis';
import { TradingStrategy } from '../services/marketAnalysisService';
import { useTheme } from '../providers/ThemeProvider';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

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
                color={Platform.OS === 'ios' ? '#000000' : COLORS.textPrimary}
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
        <View style={styles(COLORS).card}>
          <Text style={styles(COLORS).title}>AI Market Analysis</Text>
          <View style={styles(COLORS).formContainer}>
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
            <Card variant='dark' style={styles(COLORS).resultsContainer}>
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
            </Card>
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
      padding: 16,
    },
    card: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      padding: 16,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.accent,
      marginBottom: 16,
    },
    formContainer: {
      backgroundColor: COLORS.primaryDark,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    description: {
      color: COLORS.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    selectionsContainer: {
      marginBottom: 12,
    },
    pickerContainer: {
      marginBottom: 12,
    },
    pickerLabel: {
      color: COLORS.textSecondary,
      marginBottom: 8,
      fontSize: 16,
    },
    pickerWrapper: {
      backgroundColor: Platform.OS === 'ios' ? '#FFFFFF' : COLORS.primaryLight,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: COLORS.borderPrimary,
      marginHorizontal: Platform.OS === 'ios' ? 0 : 0,
    },
    picker: {
      color: Platform.OS === 'ios' ? '#000000' : COLORS.textPrimary,
      height: Platform.OS === 'ios' ? 80 : 50,
      width: '100%',
    },
    pickerIOS: {
      backgroundColor: COLORS.accentLight,
    },
    pickerItemStyle: {
      fontSize: 16,
      height: 80,
    },
    errorContainer: {
      backgroundColor: COLORS.bgError,
      borderWidth: 1,
      borderColor: COLORS.borderError,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    errorTitle: {
      color: COLORS.error,
      fontWeight: 'bold',
      marginBottom: 8,
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
      backgroundColor: COLORS.primaryDark,
      borderRadius: 8,
      padding: 16,
    },
    mockDataBanner: {
      backgroundColor: COLORS.bgWarning,
      borderWidth: 1,
      borderColor: COLORS.borderWarning,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    mockDataText: {
      color: COLORS.warning,
      fontWeight: 'bold',
    },
    resultsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.accent,
      marginBottom: 16,
    },
    metaContainer: {
      backgroundColor: COLORS.bgPurple,
      borderWidth: 1,
      borderColor: COLORS.borderPurple,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    metaTitle: {
      color: COLORS.info,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    metaText: {
      color: COLORS.textSecondary,
      fontSize: 14,
      marginBottom: 4,
    },
    currentPriceContainer: {
      backgroundColor: COLORS.bgInfo,
      borderWidth: 1,
      borderColor: COLORS.borderInfo,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    currentPriceLabel: {
      color: COLORS.accentLight,
      fontWeight: 'bold',
    },
    currentPriceValue: {
      color: COLORS.textPrimary,
      fontWeight: 'bold',
      fontSize: 16,
      marginVertical: 4,
    },
    currentPriceNote: {
      color: COLORS.textMuted,
      fontSize: 12,
      marginTop: 4,
    },
    sectionContainer: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.accent,
      marginBottom: 8,
    },
    sectionText: {
      color: COLORS.textSecondary,
      lineHeight: 20,
    },
    driversList: {
      marginTop: 4,
    },
    driverItem: {
      color: COLORS.textSecondary,
      marginBottom: 4,
      lineHeight: 20,
    },
    strategyContainer: {
      backgroundColor: COLORS.primaryDark,
      borderRadius: 8,
      padding: 16,
      marginTop: 16,
    },
    strategyHeader: {
      marginBottom: 8,
    },
    strategyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.accent,
    },
    strategySubtitle: {
      color: COLORS.textMuted,
      fontSize: 12,
    },
    directionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    directionLabel: {
      color: COLORS.textSecondary,
      fontWeight: '500',
    },
    directionValue: {
      fontWeight: 'bold',
    },
    longDirection: {
      color: COLORS.longDirection,
    },
    shortDirection: {
      color: COLORS.shortDirection,
    },
    rationaleText: {
      color: COLORS.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    validationWarningContainer: {
      backgroundColor: COLORS.bgWarning,
      borderWidth: 1,
      borderColor: COLORS.borderWarning,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    validationWarningTitle: {
      color: COLORS.warning,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    validationWarningMessage: {
      color: COLORS.warning,
    },
    pricePointsContainer: {
      marginTop: 8,
    },
    pricePointCard: {
      backgroundColor: COLORS.primary,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    pricePointTitle: {
      color: COLORS.accent,
      fontWeight: '500',
      marginBottom: 4,
    },
    stopLossTitle: {
      color: COLORS.error,
      fontWeight: '500',
      marginBottom: 4,
    },
    takeProfitTitle: {
      color: COLORS.success,
      fontWeight: '500',
      marginBottom: 4,
    },
    pricePointValue: {
      color: COLORS.textPrimary,
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 4,
    },
    pricePointRationale: {
      color: COLORS.textMuted,
      fontSize: 14,
    },
  });
