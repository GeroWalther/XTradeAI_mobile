import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../providers/ThemeProvider';
import { Card } from '../components/ui/Card';
import AssetComparisonService from '../services/AssetComparisonService';

interface ComparisonData {
  market_overview: string;
  top_recommendations: Array<{
    rank: number;
    asset: string;
    recommendation: string;
    confidence_score: number;
    risk_reward_ratio: string;
    success_probability: string;
    reasoning: string;
    entry_strategy: string;
    risk_factors: string;
    time_horizon: string;
  }>;
  asset_analysis: Record<
    string,
    {
      score: number;
      technical_outlook: string;
      fundamental_outlook: string;
      volatility_assessment: string;
      liquidity_rating: string;
      overnight_cost_impact: string;
      correlation_warnings: string;
    }
  >;
  risk_management: {
    portfolio_diversification: string;
    position_sizing: string;
    correlation_matrix: string;
    market_timing: string;
  };
  summary: string;
  disclaimer: string;
}

export default function AssetComparisonScreen() {
  const COLORS = useTheme();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([
    's&p500',
    'gold',
    'crude oil',
    'bitcoin',
    'dax',
    'eur/usd',
    'cad/jpy',
    'aud/usd',
  ]);
  const [tradingTimeframe, setTradingTimeframe] = useState('short-term');
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(
    null
  );
  const [availableAssets, setAvailableAssets] = useState<
    Record<string, string[]>
  >({});
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Forex');

  useEffect(() => {
    const assets = AssetComparisonService.getAvailableAssets();
    setAvailableAssets(assets);
  }, []);

  const performComparison = async () => {
    if (selectedAssets.length < 2) {
      Alert.alert('Error', 'Please select at least 2 assets to compare');
      return;
    }

    setLoading(true);
    setComparisonData(null);

    try {
      const result = await AssetComparisonService.compareAssets(
        selectedAssets,
        tradingTimeframe,
        riskTolerance
      );

      if (result.status === 'success' && result.data) {
        setComparisonData(result.data);
      } else {
        Alert.alert(
          'Comparison Failed',
          result.message || 'Unable to perform asset comparison'
        );
      }
    } catch (error) {
      console.error('Asset comparison error:', error);
      Alert.alert('Error', 'An unexpected error occurred during comparison');
    } finally {
      setLoading(false);
    }
  };

  const toggleAssetSelection = (asset: string) => {
    setSelectedAssets((prev) => {
      if (prev.includes(asset)) {
        return prev.filter((a) => a !== asset);
      } else if (prev.length < 12) {
        return [...prev, asset];
      } else {
        Alert.alert(
          'Limit Reached',
          'You can compare maximum 12 assets at once'
        );
        return prev;
      }
    });
  };

  const renderAssetSelector = () => (
    <Card style={styles(COLORS).selectorCard}>
      <Text style={styles(COLORS).selectorLabel}>
        Select Assets to Compare ({selectedAssets.length}/8)
      </Text>

      <View style={styles(COLORS).selectedAssetsContainer}>
        {selectedAssets.map((asset, index) => (
          <TouchableOpacity
            key={asset}
            style={styles(COLORS).selectedAssetChip}
            onPress={() => toggleAssetSelection(asset)}>
            <Text style={styles(COLORS).selectedAssetText}>{asset}</Text>
            <Text style={styles(COLORS).removeAssetText}>×</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles(COLORS).assetSelectorButton}
        onPress={() => setShowAssetPicker(!showAssetPicker)}>
        <Text style={styles(COLORS).assetSelectorText}>
          {showAssetPicker ? 'Hide Asset Selector' : 'Add Assets'}
        </Text>
      </TouchableOpacity>

      {showAssetPicker && (
        <View style={styles(COLORS).assetPickerContainer}>
          <View style={styles(COLORS).categoryTabs}>
            {Object.keys(availableAssets).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles(COLORS).categoryTab,
                  activeCategory === category &&
                    styles(COLORS).activeCategoryTab,
                ]}
                onPress={() => setActiveCategory(category)}>
                <Text
                  style={[
                    styles(COLORS).categoryTabText,
                    activeCategory === category &&
                      styles(COLORS).activeCategoryTabText,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles(COLORS).assetGrid}>
            {availableAssets[activeCategory]?.map((asset) => (
              <TouchableOpacity
                key={asset}
                style={[
                  styles(COLORS).assetOption,
                  selectedAssets.includes(asset) &&
                    styles(COLORS).selectedAssetOption,
                ]}
                onPress={() => toggleAssetSelection(asset)}>
                <Text
                  style={[
                    styles(COLORS).assetOptionText,
                    selectedAssets.includes(asset) &&
                      styles(COLORS).selectedAssetOptionText,
                  ]}>
                  {asset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </Card>
  );

  const renderSettings = () => (
    <Card style={styles(COLORS).settingsCard}>
      <Text style={styles(COLORS).settingsTitle}>Trading Parameters</Text>

      <View style={styles(COLORS).settingRow}>
        <Text style={styles(COLORS).settingLabel}>Timeframe:</Text>
        <Picker
          selectedValue={tradingTimeframe}
          onValueChange={setTradingTimeframe}
          style={styles(COLORS).picker}>
          <Picker.Item label='Short-term (1-7 days)' value='short-term' />
          <Picker.Item label='Medium-term (1-4 weeks)' value='medium-term' />
          <Picker.Item label='Long-term (1-3 months)' value='long-term' />
        </Picker>
      </View>

      <View style={styles(COLORS).settingRow}>
        <Text style={styles(COLORS).settingLabel}>Risk Tolerance:</Text>
        <Picker
          selectedValue={riskTolerance}
          onValueChange={setRiskTolerance}
          style={styles(COLORS).picker}>
          <Picker.Item label='Conservative' value='conservative' />
          <Picker.Item label='Moderate' value='moderate' />
          <Picker.Item label='Aggressive' value='aggressive' />
        </Picker>
      </View>

      <TouchableOpacity
        style={[
          styles(COLORS).compareButton,
          loading && styles(COLORS).buttonDisabled,
        ]}
        onPress={performComparison}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={COLORS.white} size='small' />
        ) : (
          <Text style={styles(COLORS).compareButtonText}>Compare Assets</Text>
        )}
      </TouchableOpacity>
    </Card>
  );

  const renderTopRecommendations = () => {
    if (!comparisonData?.top_recommendations) return null;

    return (
      <Card style={styles(COLORS).recommendationsCard}>
        <Text style={styles(COLORS).sectionTitle}>
          Top Trading Opportunities
        </Text>
        {comparisonData.top_recommendations.slice(0, 3).map((rec, index) => (
          <View key={index} style={styles(COLORS).recommendationItem}>
            <View style={styles(COLORS).recommendationHeader}>
              <Text style={styles(COLORS).rankText}>#{rec.rank}</Text>
              <Text style={styles(COLORS).assetName}>
                {rec.asset.toUpperCase()}
              </Text>
              <Text
                style={[
                  styles(COLORS).recommendationBadge,
                  {
                    backgroundColor:
                      rec.recommendation === 'LONG'
                        ? COLORS.success
                        : rec.recommendation === 'SHORT'
                        ? COLORS.error
                        : COLORS.warning,
                  },
                ]}>
                {rec.recommendation}
              </Text>
            </View>

            <View style={styles(COLORS).recommendationStats}>
              <View style={styles(COLORS).statItem}>
                <Text style={styles(COLORS).statLabel}>Confidence</Text>
                <Text style={styles(COLORS).statValue}>
                  {rec.confidence_score}%
                </Text>
              </View>
              <View style={styles(COLORS).statItem}>
                <Text style={styles(COLORS).statLabel}>R:R Ratio</Text>
                <Text style={styles(COLORS).statValue}>
                  {rec.risk_reward_ratio}
                </Text>
              </View>
              <View style={styles(COLORS).statItem}>
                <Text style={styles(COLORS).statLabel}>Success Rate</Text>
                <Text style={styles(COLORS).statValue}>
                  {rec.success_probability}
                </Text>
              </View>
            </View>

            <Text style={styles(COLORS).recommendationReasoning}>
              {rec.reasoning}
            </Text>

            <View style={styles(COLORS).tradingDetails}>
              <Text style={styles(COLORS).detailTitle}>Entry Strategy:</Text>
              <Text style={styles(COLORS).detailText}>
                {rec.entry_strategy}
              </Text>

              <Text style={styles(COLORS).detailTitle}>Risk Factors:</Text>
              <Text style={styles(COLORS).detailText}>{rec.risk_factors}</Text>
            </View>
          </View>
        ))}
      </Card>
    );
  };

  const renderMarketOverview = () => {
    if (!comparisonData?.market_overview) return null;

    return (
      <Card style={styles(COLORS).overviewCard}>
        <Text style={styles(COLORS).sectionTitle}>Market Overview</Text>
        <Text style={styles(COLORS).overviewText}>
          {comparisonData.market_overview}
        </Text>
      </Card>
    );
  };

  const renderRiskManagement = () => {
    if (!comparisonData?.risk_management) return null;

    const { risk_management } = comparisonData;

    return (
      <Card style={styles(COLORS).riskCard}>
        <Text style={styles(COLORS).sectionTitle}>Risk Management</Text>

        <View style={styles(COLORS).riskSection}>
          <Text style={styles(COLORS).riskSectionTitle}>
            Portfolio Diversification:
          </Text>
          <Text style={styles(COLORS).riskSectionText}>
            {risk_management.portfolio_diversification}
          </Text>
        </View>

        <View style={styles(COLORS).riskSection}>
          <Text style={styles(COLORS).riskSectionTitle}>Position Sizing:</Text>
          <Text style={styles(COLORS).riskSectionText}>
            {risk_management.position_sizing}
          </Text>
        </View>

        <View style={styles(COLORS).riskSection}>
          <Text style={styles(COLORS).riskSectionTitle}>Market Timing:</Text>
          <Text style={styles(COLORS).riskSectionText}>
            {risk_management.market_timing}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles(COLORS).container}>
      <ScrollView contentContainerStyle={styles(COLORS).scrollContent}>
        <View style={styles(COLORS).header}>
          <Text style={styles(COLORS).title}>Asset Comparison</Text>
          <Text style={styles(COLORS).subtitle}>
            AI-powered analysis for CFD trading opportunities
          </Text>
        </View>

        {renderAssetSelector()}
        {renderSettings()}

        {comparisonData && (
          <>
            {renderMarketOverview()}
            {renderTopRecommendations()}
            {renderRiskManagement()}

            <Card style={styles(COLORS).summaryCard}>
              <Text style={styles(COLORS).sectionTitle}>Summary</Text>
              <Text style={styles(COLORS).summaryText}>
                {comparisonData.summary}
              </Text>
            </Card>

            <Card style={styles(COLORS).disclaimerCard}>
              <Text style={styles(COLORS).disclaimerText}>
                {comparisonData.disclaimer}
              </Text>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (COLORS: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 16,
    },
    header: {
      marginBottom: 24,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.white,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.textSecondary,
      textAlign: 'center',
    },
    selectorCard: {
      marginBottom: 16,
    },
    selectorLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.white,
      marginBottom: 12,
    },
    selectedAssetsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    selectedAssetChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      margin: 4,
    },
    selectedAssetText: {
      color: COLORS.white,
      fontSize: 14,
      marginRight: 8,
    },
    removeAssetText: {
      color: COLORS.white,
      fontSize: 18,
      fontWeight: 'bold',
    },
    assetSelectorButton: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    assetSelectorText: {
      color: COLORS.white,
      fontSize: 16,
    },
    assetPickerContainer: {
      marginTop: 16,
    },
    categoryTabs: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    categoryTab: {
      flex: 1,
      padding: 8,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeCategoryTab: {
      borderBottomColor: COLORS.accent,
    },
    categoryTabText: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    activeCategoryTabText: {
      color: COLORS.accent,
      fontWeight: '600',
    },
    assetGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    assetOption: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 6,
      padding: 8,
      margin: 4,
      minWidth: 80,
      alignItems: 'center',
    },
    selectedAssetOption: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    assetOptionText: {
      fontSize: 12,
      color: COLORS.white,
    },
    selectedAssetOptionText: {
      color: COLORS.white,
    },
    settingsCard: {
      marginBottom: 16,
    },
    settingsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.white,
      marginBottom: 16,
    },
    settingRow: {
      marginBottom: 16,
    },
    settingLabel: {
      fontSize: 16,
      color: COLORS.white,
      marginBottom: 8,
    },
    picker: {
      color: COLORS.white,
      backgroundColor: COLORS.surface,
    },
    compareButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    compareButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '600',
    },
    overviewCard: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.white,
      marginBottom: 12,
    },
    overviewText: {
      fontSize: 14,
      color: COLORS.white,
      lineHeight: 20,
    },
    recommendationsCard: {
      marginBottom: 16,
    },
    recommendationItem: {
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      paddingBottom: 16,
      marginBottom: 16,
    },
    recommendationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    rankText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.accent,
      marginRight: 12,
    },
    assetName: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.white,
      flex: 1,
    },
    recommendationBadge: {
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    recommendationStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      backgroundColor: COLORS.surface,
      borderRadius: 8,
      padding: 12,
    },
    statItem: {
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: COLORS.textSecondary,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.white,
    },
    recommendationReasoning: {
      fontSize: 14,
      color: COLORS.white,
      lineHeight: 18,
      marginBottom: 12,
    },
    tradingDetails: {
      backgroundColor: COLORS.surface,
      borderRadius: 8,
      padding: 12,
    },
    detailTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.white,
      marginBottom: 4,
    },
    detailText: {
      fontSize: 13,
      color: COLORS.textSecondary,
      lineHeight: 16,
      marginBottom: 8,
    },
    riskCard: {
      marginBottom: 16,
    },
    riskSection: {
      marginBottom: 16,
    },
    riskSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.white,
      marginBottom: 6,
    },
    riskSectionText: {
      fontSize: 14,
      color: COLORS.textSecondary,
      lineHeight: 18,
    },
    summaryCard: {
      marginBottom: 16,
    },
    summaryText: {
      fontSize: 14,
      color: COLORS.white,
      lineHeight: 20,
    },
    disclaimerCard: {
      backgroundColor: COLORS.surface,
    },
    disclaimerText: {
      fontSize: 12,
      color: COLORS.textSecondary,
      fontStyle: 'italic',
    },
  });
