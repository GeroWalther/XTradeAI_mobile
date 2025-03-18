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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../providers/SubscriptionProvider';
import { useTheme } from '../providers/ThemeProvider';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const COLORS = useTheme();
  const { activePaidUser, setActivePaidUser } = useSubscription();
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (activePaidUser) {
      navigation.replace('Home');
    }
  }, [activePaidUser, navigation]);

  const slides = [
    {
      title: 'Your AI Analysis Report',
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
        '• Professional TradingView charts integration\n\n' +
        '• Moving averages and RSI momentum indicators\n\n' +
        '• MACD signal identification and trend analysis\n\n' +
        '• Key support and resistance level detection\n\n' +
        '• Bullish and bearish pattern recognition',
      quote: {
        text: 'Like having a pro trader guide you through every market decision.',
        author: 'Sarah T.',
      },
      image: require('../assets/images/onboarding/blueChart.jpg'),
    },
    {
      title: 'Intelligent News Processing',
      description:
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
        'Our AI combines these tools to provide:\n\n' +
        '• Professional TradingView charts with MACD and RSI\n\n' +
        '• Clear LONG/SHORT direction recommendation\n\n' +
        '• Precise entry, stop-loss and take-profit levels\n\n' +
        '• Risk/reward assessment based on current price',
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

  const handleSubscribe = (plan: 'weekly' | 'yearly') => {
    console.log(`Selected ${plan} plan`);
    setActivePaidUser(true);
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

  const renderSubscriptionOptions = () => (
    <View style={styles(COLORS).subscriptionContainer}>
      <Text style={styles(COLORS).subscriptionHeading}>
        Join the XTradeAI trading community to elevate your trading and market
        analysis!
      </Text>
      <TouchableOpacity
        style={styles(COLORS).subscriptionButton}
        onPress={() => handleSubscribe('weekly')}>
        <Text style={styles(COLORS).subscriptionTitle}>Weekly Access</Text>
        <Text style={styles(COLORS).subscriptionPrice}>$8.99/week</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles(COLORS).subscriptionButton, styles(COLORS).yearlyButton]}
        onPress={() => handleSubscribe('yearly')}>
        <View style={styles(COLORS).savingsBadge}>
          <Text style={styles(COLORS).savingsText}>Save 82%</Text>
        </View>
        <Text style={styles(COLORS).subscriptionTitle}>Annual Access</Text>
        <Text style={styles(COLORS).subscriptionPrice}>$74.00/year</Text>
      </TouchableOpacity>
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
      marginTop: -80,
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
      lineHeight: 24,
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
      marginTop: 10,
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
    },
    paginationDotActive: {
      backgroundColor: COLORS.accent,
      width: 16,
    },
    subscriptionContainer: {
      width: '90%',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
      paddingHorizontal: 20,
      marginTop: 15,
      marginBottom: 20,
      backgroundColor: 'rgba(20, 30, 48, 0.8)',
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
      padding: 20,
      width: '100%',
      alignItems: 'center',
      shadowColor: COLORS.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    yearlyButton: {
      backgroundColor: COLORS.primaryDark,
      borderWidth: 1,
      borderColor: COLORS.accent,
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
      marginTop: 20,
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
    subscriptionHeading: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.textPrimary,
      textAlign: 'center',
      lineHeight: 28,
      marginBottom: 25,
    },
  });
