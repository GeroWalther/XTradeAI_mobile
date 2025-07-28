import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../providers/SubscriptionProvider';
import { useTheme } from '../providers/ThemeProvider';

import useRevenueCat from '../hooks/useRevCat';
import { DEV_CONFIG } from '../constants/dev';
import MockPurchases from '../services/mockPurchases';

// Helper function to configure RevenueCat for purchases/restores
async function configureRevenueCatForPurchases() {
  const Purchases = require('react-native-purchases').default;

  if (Platform.OS === 'android') {
    await Purchases.configure({
      apiKey: process.env.EXPO_PUBLIC_ANDROID_REVCAT_KEY || '',
    });
  } else {
    await Purchases.configure({
      apiKey: 'appl_ICdHUkDsuyvsNNWDwBOMSNddvyt',
    });
  }
}

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const COLORS = useTheme();
  const { activePaidUser, setActivePaidUser, setSubscriptionType } =
    useSubscription();
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const {
    currentOffering,
    isOfferingLoading,
    isCustomerInfoLoading,
    changeSubStatus,
  } = useRevenueCat();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  useEffect(() => {
    if (activePaidUser) {
      navigation.replace('Home');
    }
  }, [activePaidUser, navigation]);

  useEffect(() => {
    if (
      currentOffering?.availablePackages &&
      currentOffering.availablePackages.length > 0
    ) {
      // Look for the annual package
      const annualPackage = currentOffering.availablePackages.find(
        (pkg: any) =>
          pkg.identifier.includes('$rc_annual') ||
          pkg.identifier.includes('yearly')
      );

      // Set it as selected if found, otherwise select the first package
      if (annualPackage) {
        setSelectedPackage(annualPackage);
      } else {
        setSelectedPackage(currentOffering.availablePackages[0]);
      }
    }
  }, [currentOffering]);

  const slides = [
    {
      title: 'Welcome to XTradeAI',
      description:
        'Every analysis includes these actionable insights:\n\n' +
        '• Market Summary\n' +
        'Current price and recent trend analysis\n\n' +
        '• Key Market Drivers\n' +
        'Economic, earnings, and geopolitical factors\n\n' +
        '• Technical Analysis\n' +
        'RSI, MACD, and support/resistance levels\n\n' +
        '• Risk Assessment\n' +
        'Volatility analysis and external risk factors\n\n' +
        '• Trading Strategy\n' +
        'Direction, entry, stop-loss and take-profit targets',
      quote: {
        text: 'We built this system to solve the biggest challenge in trading - separating noise from meaningful market information. Our AI processes news, macro events, indicators, live prices and sentiment faster than any human can.',
        author: 'XTradeAI Lead Developer',
      },
      image: require('../assets/images/onboarding/stockboard.jpg'),
    },
    {
      title: 'Advanced Technical Analysis',
      description:
        'Our AI Algorithm reads through major technical indicators on every analysis to calculate the most accurate trading signals.\n\n' +
        '• Moving averages and RSI momentum indicators\n\n' +
        '• MACD signal identification and trend analysis\n\n' +
        '• Key support and resistance level detection\n\n' +
        '• Bullish and bearish pattern recognition ' +
        'are respected in the analysis.\n\n' +
        'Professional TradingView charts integration',
      quote: {
        text: 'Like having a pro trader guide you through every market decision.',
        author: 'Sarah T.',
      },
      image: require('../assets/images/onboarding/blueChart.jpg'),
    },
    {
      title: 'Intelligent News Processing',
      description:
        'Our AI Algorithm reads through all relevant, recent News articles from financial news sites online that could impact the asset price.\n\n' +
        '• Real-time financial news monitoring and analysis\n\n' +
        '• Fed policy and interest rate impact assessment\n\n' +
        '• Corporate earnings report tracking\n\n' +
        '• Geopolitical event analysis and impact prediction\n\n' +
        '• Market-moving news alerts',
      quote: {
        text: 'Perfect for validating my trading ideas quickly with real market data.',
        author: 'Lisa R.',
      },
      image: require('../assets/images/onboarding/tradersGroup.jpg'),
    },
    {
      title: 'Macroeconomic Integration',
      description:
        'Our AI Algorithm reads through all relevant, recent economic data releases - Researches Fed announcements, inflation data, employment reports, CPI, M2, GDP, dept etc. \n\n' +
        '• Central bank policy monitoring and analysis\n\n' +
        '• Interest rate decision impact assessment\n\n' +
        '• Global market correlation tracking\n\n' +
        '• Economic data release analysis\n\n' +
        '• Key economic event alerts',
      quote: {
        text: 'The macro perspective is crucial. We designed this to catch how big economic shifts affect individual assets - something retail traders often miss.',
        author: 'Quantitative Analyst',
      },
      image: require('../assets/images/onboarding/traders2.jpg'),
    },
    {
      title: 'Social Sentiment Analysis',
      description:
        'Our AI Algorithm reads through all relevant, recent social media sentiment from verified sources. \n\n' +
        '• X/Twitter sentiment tracking from verified sources\n\n' +
        '• Financial influencer monitoring\n\n' +
        '• Market sentiment indicators and analysis\n\n' +
        '• Crowd psychology assessment (bullish/bearish)\n\n' +
        '• Contrarian signal detection',
      quote: {
        text: 'Finally, the perfect app that gives me an accurate live analysis without the complexity.',
        author: 'Tom S., Part-time Trader',
      },
      image: require('../assets/images/onboarding/bull-bear-fight.webp'),
    },
    {
      title: 'Real-Time Market Data Analysis',
      description:
        'Our AI Algorithm reads through all relevant, recent market data from Yahoo Finance and TradingView to provide the most accurate analysis.\n\n' +
        '• Live Yahoo Finance integration - real-time price data and market updates\n\n' +
        '• TradingView professional charts with interactive features\n\n' +
        '• Price trend analysis with multiple timeframes\n\n' +
        '• Key support and resistance levels\n\n' +
        '• MACD and RSI technical indicators',
      quote: {
        text: 'The app that I wished I had when I started trading.',
        author: 'Tim M., User',
      },
      image: require('../assets/images/onboarding/goldPrice.png'),
    },
    {
      title: 'Comprehensive Market Intelligence',
      description:
        'Our AI combines all of these tools to provide:\n\n' +
        '• Summary and in-depth Real-time market analysis for given asset, term and risk level\n\n' +
        '• Professional TradingView charts for live price data and market updates\n\n' +
        '• Clear LONG/SHORT direction trading recommendation\n\n' +
        '• Precise entry, stop-loss and take-profit levels\n\n' +
        '• Risk/reward assessment based on algorithmically calculated current price, risk level and term.',
      quote: {
        text: 'This app gives you a comprehensive market analysis by leveraging the best AI and data sources in the industry in an accessible way.',
        author: 'Mario K. XTradeAI Adviser',
      },
      image: require('../assets/images/onboarding/blueChart2.jpg'),
    },
    {
      title: 'Ready to Transform Your Trading?',
      description:
        'Join the XTradeAI trading community to elevate your trading and market analysis!\n\n',
      isSubscription: true,
      disclaimer:
        'RISK DISCLOSURE: Trading in financial instruments involves high risks including the risk of losing some, or all, of your investment amount, and may not be suitable for all investors. The information provided by this application is for informational purposes only and should not be construed as financial advice or an inducement to trade. Past performance does not guarantee future results.',
      image: require('../assets/images/onboarding/gold.webp'),
    },
  ];

  const handleSubscribe = async () => {
    if (!selectedPackage) {
      Alert.alert('Please select a subscription plan');
      return;
    }

    try {
      setIsLoading(true);
      let purchaserInfo;

      if (DEV_CONFIG.USE_MOCK_PURCHASES) {
        // Use mock purchases service
        if (DEV_CONFIG.ENABLE_DEBUG_LOGS) {
          console.log('🧪 Using Mock RevenueCat for purchase package');
        }
        purchaserInfo = await MockPurchases.purchasePackage(selectedPackage);

        if (purchaserInfo.entitlements.active.pro) {
          // Get subscription type from package identifier
          const subType = selectedPackage.identifier.includes('yearly')
            ? 'yearly'
            : 'weekly';
          setSubscriptionType(subType);
          setActivePaidUser(true);
          navigation.replace('Home');
        }
      } else {
        // Real RevenueCat code for production - dynamic import to avoid native module dependency
        await configureRevenueCatForPurchases();
        const Purchases = require('react-native-purchases').default;
        const purchaseResult = await Purchases.purchasePackage(selectedPackage);

        if (purchaseResult.customerInfo.entitlements.active.pro) {
          // Get subscription type from package identifier
          const subType = selectedPackage.identifier.includes('yearly')
            ? 'yearly'
            : 'weekly';
          setSubscriptionType(subType);
          setActivePaidUser(true);
          navigation.replace('Home');
        }
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        console.log(e);
        Alert.alert(
          'Error',
          'There was an error processing your purchase. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
      changeSubStatus();
    }
  };

  const restorePurchases = async () => {
    setIsLoading(true);
    try {
      let purchaserInfo;

      if (DEV_CONFIG.USE_MOCK_PURCHASES) {
        // Use mock purchases service
        if (DEV_CONFIG.ENABLE_DEBUG_LOGS) {
          console.log('🧪 Using Mock RevenueCat for restore purchases');
        }
        // Set restore behavior based on dev config
        const hasRestoredPurchases = DEV_CONFIG.MOCK_HAS_RESTORED_PURCHASES;
        if (hasRestoredPurchases) {
          MockPurchases.setMockProAccess(true);
        }
        purchaserInfo = await MockPurchases.restorePurchases();
      } else {
        // Real RevenueCat code for production - dynamic import to avoid native module dependency
        await configureRevenueCatForPurchases();
        const Purchases = require('react-native-purchases').default;
        purchaserInfo = await Purchases.restorePurchases();
      }

      // Check for active subscriptions (consistent with purchase flow)
      const hasActiveSubscription = DEV_CONFIG.USE_MOCK_PURCHASES
        ? purchaserInfo.activeSubscriptions.length > 0
        : purchaserInfo.entitlements.active.pro;

      if (hasActiveSubscription) {
        Alert.alert('Success', 'Your subscription has been restored!', [
          {
            text: 'OK',
            onPress: () => {
              setActivePaidUser(true);
              navigation.replace('Home');
            },
          },
        ]);
      } else {
        Alert.alert(
          'No Subscriptions Found',
          "We couldn't find any active subscriptions to restore."
        );
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert(
        'Error',
        'There was an error restoring your purchases. Please try again.'
      );
    } finally {
      setIsLoading(false);
      changeSubStatus();
    }
  };

  const openTermsOfUse = () => {
    Linking.openURL(
      'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL(
      'https://www.privacypolicies.com/live/bc37d64b-1024-4aec-9ede-2e5039536fcc'
    );
  };

  const handleScroll = (event: any) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(xOffset / width);
    setCurrentPage(pageIndex);
  };

  const handleNext = () => {
    if (currentPage < slides.length - 1) {
      scrollRef.current?.scrollTo({
        x: width * (currentPage + 1),
        animated: true,
      });
    }
  };

  const SubscriptionCard = ({
    pkg,
    isSelected,
  }: {
    pkg: any;
    isSelected: boolean;
  }) => {
    // Check if this is a yearly package
    const isYearly = pkg.identifier.includes('$rc_annual');

    return (
      <TouchableOpacity
        style={[
          styles(COLORS).subscriptionButton,
          isSelected && styles(COLORS).selectedButton,
        ]}
        onPress={() => setSelectedPackage(pkg)}>
        {isYearly && (
          <View style={styles(COLORS).savingsBadge}>
            <Text style={styles(COLORS).savingsText}>Save 82%</Text>
          </View>
        )}
        <Text style={styles(COLORS).subscriptionTitle}>
          {pkg.product.title}
        </Text>
        <Text style={styles(COLORS).subscriptionPrice}>
          {pkg.product.priceString} {isYearly ? '/year' : '/week'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSubscriptionOptions = () => (
    <View style={styles(COLORS).subscriptionContainer}>
      <Text style={styles(COLORS).subscriptionHeading}>
        Join thousands of traders who are elevating their trading with
        institutional-grade analysis!
      </Text>

      {isOfferingLoading || isCustomerInfoLoading || isLoading ? (
        <ActivityIndicator
          size='large'
          color={COLORS.accent}
          style={styles(COLORS).loader}
        />
      ) : (
        <>
          <View style={styles(COLORS).plansContainer}>
            {currentOffering?.availablePackages
              ?.sort((a: any, b: any) => {
                // Sort to make weekly package appear first
                if (a.identifier.includes('$rc_weekly')) return -1;
                if (b.identifier.includes('$rc_weekly')) return 1;
                return 0;
              })
              .map((pkg: any) => (
                <SubscriptionCard
                  key={pkg.identifier}
                  pkg={pkg}
                  isSelected={selectedPackage?.identifier === pkg.identifier}
                />
              ))}

            {/* Fallback if no packages are available from RevenueCat */}
            {(!currentOffering?.availablePackages ||
              currentOffering.availablePackages.length === 0) && (
              <>
                <SubscriptionCard
                  pkg={{
                    identifier: 'pro_sub_we899',
                    product: {
                      title: 'Weekly Access',
                      priceString: '$8.99/week',
                    },
                  }}
                  isSelected={selectedPackage?.identifier === 'pro_sub_we899'}
                />
                <SubscriptionCard
                  pkg={{
                    identifier: 'pro_sub_yearly74',
                    product: {
                      title: 'Annual Access',
                      priceString: '$74.00/year',
                    },
                  }}
                  isSelected={
                    selectedPackage?.identifier === 'pro_sub_yearly74'
                  }
                />
              </>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles(COLORS).purchaseButton,
              !selectedPackage && styles(COLORS).disabledButton,
            ]}
            disabled={isLoading || !selectedPackage}
            onPress={handleSubscribe}>
            {isLoading ? (
              <ActivityIndicator size='small' color={COLORS.white} />
            ) : (
              <Text style={styles(COLORS).purchaseButtonText}>
                Subscribe Now
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles(COLORS).restoreButton}
            onPress={restorePurchases}
            disabled={isLoading}>
            <Text style={styles(COLORS).restoreButtonText}>
              Restore Purchases
            </Text>
          </TouchableOpacity>

          <View style={styles(COLORS).links}>
            <TouchableOpacity onPress={openTermsOfUse}>
              <Text style={styles(COLORS).linkText}>Terms of Use</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openPrivacyPolicy}>
              <Text style={styles(COLORS).linkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const renderSlideContent = (slide: any, index: number) => (
    <View key={index} style={styles(COLORS).slide}>
      {slide.image ? (
        <ImageBackground
          source={slide.image}
          style={styles(COLORS).backgroundImage}
          resizeMode='cover'>
          <View style={styles(COLORS).gradientOverlay}>
            <View style={styles(COLORS).slideContent}>
              <Text style={styles(COLORS).title}>{slide.title}</Text>
              {!slide.isSubscription && (
                <Text
                  style={[
                    styles(COLORS).description,
                    slide.isSubscription &&
                      styles(COLORS).subscriptionDescription,
                  ]}>
                  {slide.description}
                </Text>
              )}

              {slide.quote && (
                <View style={styles(COLORS).quoteContainer}>
                  <Text
                    style={[
                      {
                        position: 'absolute',
                        left: 20,
                        top: -5,
                        fontSize: 60,
                        color: COLORS.accent,
                        fontFamily: 'Georgia',
                        opacity: 0.8,
                      },
                    ]}>
                    "
                  </Text>
                  <Text style={styles(COLORS).quoteText}>
                    {slide.quote.text}
                  </Text>
                  <Text style={styles(COLORS).quoteAuthor}>
                    {slide.quote.author}
                  </Text>
                </View>
              )}

              {slide.isSubscription && renderSubscriptionOptions()}

              {slide.disclaimer && (
                <Text style={styles(COLORS).disclaimer}>
                  {slide.disclaimer}
                </Text>
              )}
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={styles(COLORS).slideWithoutImage}>
          <Text style={styles(COLORS).title}>{slide.title}</Text>
          <Text style={styles(COLORS).description}>{slide.description}</Text>

          {slide.quote && (
            <View style={styles(COLORS).quoteContainer}>
              <Text
                style={[
                  {
                    position: 'absolute',
                    left: 20,
                    top: -5,
                    fontSize: 60,
                    color: COLORS.accent,
                    fontFamily: 'Georgia',
                    opacity: 0.8,
                  },
                ]}>
                "
              </Text>
              <Text style={styles(COLORS).quoteText}>{slide.quote.text}</Text>
              <Text style={styles(COLORS).quoteAuthor}>
                {slide.quote.author}
              </Text>
            </View>
          )}

          {slide.isSubscription && renderSubscriptionOptions()}

          {slide.disclaimer && (
            <Text style={styles(COLORS).disclaimer}>{slide.disclaimer}</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles(COLORS).container}>
      <StatusBar
        barStyle='light-content'
        translucent
        backgroundColor='transparent'
      />
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {slides.map((slide, index) => renderSlideContent(slide, index))}
      </ScrollView>

      <SafeAreaView style={styles(COLORS).controlsContainer}>
        <View style={styles(COLORS).pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles(COLORS).paginationDot,
                currentPage === index && styles(COLORS).paginationDotActive,
              ]}
            />
          ))}
        </View>

        {currentPage < slides.length - 1 && (
          <TouchableOpacity
            style={styles(COLORS).nextButton}
            onPress={handleNext}>
            <Text style={styles(COLORS).nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

export default OnboardingScreen;

const styles = (COLORS: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    controlsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    slide: {
      width,
      height: height,
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
    },
    gradientOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: StatusBar.currentHeight || 44,
      backgroundColor: 'rgba(16, 24, 46, 0.8)', // Dark blue with opacity
    },
    slideContent: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -30,
    },
    slideWithoutImage: {
      width,
      height: height,
      padding: 20,
      paddingTop: StatusBar.currentHeight || 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.accent,
      marginBottom: 20,
      textAlign: 'center',
      paddingHorizontal: 15,
    },
    description: {
      fontSize: 16,
      color: COLORS.textSecondary,
      textAlign: 'left',
      lineHeight: 20,
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    subscriptionDescription: {
      fontSize: 18,
      fontWeight: '500',
      color: COLORS.textPrimary,
      textAlign: 'center',
      lineHeight: 28,
      backgroundColor: 'rgba(16, 24, 46, 0.75)',
      padding: 15,
      borderRadius: 10,
      marginBottom: 5,
    },
    quoteContainer: {
      width: '100%',
      paddingHorizontal: 25,
      marginTop: 0,
      position: 'relative',
    },
    quoteText: {
      fontSize: 16,
      color: COLORS.textPrimary,
      fontStyle: 'italic',
      lineHeight: 24,
      fontFamily: 'Georgia',
      marginBottom: 8,
      letterSpacing: 0.3,
      textAlign: 'left',
      paddingLeft: 35,
      position: 'relative',
    },
    quoteAuthor: {
      fontSize: 13,
      color: COLORS.accent,
      fontWeight: '600',
      textAlign: 'right',
      fontFamily: 'Helvetica Neue',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginTop: 4,
      paddingRight: 20,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: COLORS.primaryLight,
      marginHorizontal: 4,
      marginBottom: -50,
    },
    paginationDotActive: {
      backgroundColor: COLORS.accent,
      width: 16,
    },
    subscriptionContainer: {
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 15,

      marginBottom: 10,
      backgroundColor: 'rgba(20, 30, 48, 0.85)',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    subscriptionButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      padding: 10,
      width: '100%',
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: COLORS.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    subscriptionHeading: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.textPrimary,
      textAlign: 'center',
      lineHeight: 28,
      marginBottom: 20,
    },
    plansContainer: {
      width: '100%',
      marginBottom: 15,
    },
    selectedButton: {
      borderColor: COLORS.accent,
      backgroundColor: COLORS.primaryDark,
    },
    purchaseButton: {
      backgroundColor: COLORS.accent,
      borderRadius: 25,
      paddingVertical: 15,
      paddingHorizontal: 30,
      width: '100%',
      alignItems: 'center',
      marginBottom: 5,
    },
    disabledButton: {
      backgroundColor: COLORS.primaryLight,
      opacity: 0.7,
    },
    purchaseButtonText: {
      color: COLORS.white,
      fontSize: 18,
      fontWeight: 'bold',
    },
    restoreButton: {
      paddingVertical: 10,
    },
    restoreButtonText: {
      color: COLORS.accent,
      fontSize: 16,
      textDecorationLine: 'underline',
    },
    loader: {
      marginVertical: 30,
    },
    links: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
      gap: 20,
    },
    linkText: {
      color: COLORS.textMuted,
      fontSize: 14,
      textDecorationLine: 'underline',
    },
    subscriptionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.accent,
      marginBottom: 10,
    },
    subscriptionPrice: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
      marginBottom: 15,
    },
    savingsBadge: {
      position: 'absolute',
      top: -12,
      right: -12,
      backgroundColor: COLORS.success,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    savingsText: {
      color: COLORS.white,
      fontSize: 12,
      fontWeight: 'bold',
    },
    disclaimer: {
      fontSize: 10,
      color: COLORS.textMuted,
      textAlign: 'center',
      marginTop: 0,
      paddingHorizontal: 20,
      lineHeight: 14,
    },
    nextButton: {
      position: 'absolute',
      bottom: 60,
      right: 30,
      backgroundColor: COLORS.accent,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
      shadowColor: COLORS.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      zIndex: 10,
    },
    nextButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
