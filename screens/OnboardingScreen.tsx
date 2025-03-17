import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../providers/SubscriptionProvider';
import { useTheme } from '../providers/ThemeProvider';

const { width } = Dimensions.get('window');

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
      title: '🚀 Real-Time Market Data Analysis',
      description:
        '• Live Yahoo Finance integration - real-time price data and market updates 📊\n\n' +
        '• TradingView-powered technical indicators - professional charting 📈\n\n' +
        '• Price trend analysis with multiple timeframes 🔍\n\n' +
        '• Key support and resistance levels 🎯\n\n' +
        '• Volume and momentum analysis 💹',
      quote: {
        text: 'We built this system to solve the biggest challenge in trading - separating noise from meaningful market information. Our AI processes news, macro events, indicators, live prices and sentiment faster than any human can.',
        author: 'XTradeAI Lead Developer',
      },
    },
    {
      title: '🎯 Advanced Technical Analysis',
      description:
        '• TradingView integration for key technical indicators 📊\n\n' +
        '• Pattern recognition for major chart formations 🎯\n\n' +
        '• Multi-timeframe trend analysis 🛠️\n\n' +
        '• Moving averages and momentum indicators 🔭\n\n' +
        '• Breakout and reversal detection 🚀',
      quote: {
        text: 'Like having a pro trader guide you',
        author: 'Sarah T.',
      },
    },
    {
      title: '📰 Intelligent News Processing',
      description:
        '• Real-time financial news monitoring 📊\n\n' +
        '• Market-moving news detection 🧠\n\n' +
        '• Sentiment analysis of news impact 📈\n\n' +
        '• Major financial sites coverage 📚\n\n' +
        '• Breaking market news alerts 🛡️',
      quote: {
        text: 'Perfect for validating my trading ideas quickly',
        author: 'Lisa R.',
      },
    },
    {
      title: '🌍 Macroeconomic Integration',
      description:
        '• Economic calendar monitoring 📊\n\n' +
        '• Central bank announcement tracking 🏦\n\n' +
        '• Market correlation analysis 🔄\n\n' +
        '• Trend impact assessment 📈\n\n' +
        '• Key economic data alerts 📅',
      quote: {
        text: 'The macro perspective is crucial. We designed this to catch how big economic shifts affect individual assets - something retail traders often miss.',
        author: 'Quantitative Analyst',
      },
    },
    {
      title: '🎭 Social Sentiment Analysis',
      description:
        '• X/Twitter sentiment tracking from verified sources 📱\n\n' +
        '• Financial influencer monitoring 🏢\n\n' +
        '• Market sentiment indicators 🎯\n\n' +
        '• Crowd sentiment analysis 🐂🐻\n\n' +
        '• Social signal filtering 🔄',
      quote: {
        text: 'Finally, the perfect app that gives me an accurate live analysis without the complexity.',
        author: 'Tom S., Part-time Trader',
      },
    },
    {
      title: '📊 Your AI Analysis Report',
      description:
        'Every analysis includes these essential insights:\n\n' +
        '• 📈 Market Summary\n' +
        'Clear market analysis in plain English\n\n' +
        '• 🔑 Key Market Drivers\n' +
        'Current market moving factors\n\n' +
        '• 📐 Technical Analysis\n' +
        'Important price levels and patterns\n\n' +
        '• ⚠️ Risk Assessment\n' +
        'Key risk factors to consider\n\n' +
        '• 🎯 Trading Strategy\n' +
        'Actionable trading insights',
      quote: {
        text: 'The app that I wished I had when I started trading.',
        author: 'Tim M., User',
      },
    },
    {
      title: '🧠 Comprehensive Market Intelligence',
      description:
        'Our AI combines these tools to provide:\n\n' +
        '• Data-driven market analysis 🎯\n\n' +
        '• Risk management insights 🛡️\n\n' +
        '• Trend detection and analysis 🔄\n\n' +
        '• Trading opportunities identification 📈',
      quote: {
        text: 'This app gives you a comprehensive market analysis by leveraging the best AI and data sources in the industry in an accessible way.',
        author: 'Mario K. XTradeAI Adviser',
      },
    },
    {
      title: '🌟 Ready to Transform Your Trading?',
      description:
        '🚀 Join thousands of traders who are elevating their trading with institutional-grade analysis!\n\n',
      isSubscription: true,
      disclaimer:
        'RISK DISCLOSURE: Trading in financial instruments involves high risks including the risk of losing some, or all, of your investment amount, and may not be suitable for all investors. The information provided by this application is for informational purposes only and should not be construed as financial advice or an inducement to trade. Past performance does not guarantee future results.',
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
          <Text style={styles(COLORS).savingsText}>Save 40%</Text>
        </View>
        <Text style={styles(COLORS).subscriptionTitle}>Annual Access</Text>
        <Text style={styles(COLORS).subscriptionPrice}>$49.99/year</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSlideContent = (slide: any, index: number) => (
    <View key={index} style={styles(COLORS).slide}>
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
          <Text style={styles(COLORS).quoteAuthor}>{slide.quote.author}</Text>
        </View>
      )}

      {slide.isSubscription && renderSubscriptionOptions()}

      {slide.disclaimer && (
        <Text style={styles(COLORS).disclaimer}>{slide.disclaimer}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles(COLORS).container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {slides.map((slide, index) => renderSlideContent(slide, index))}
      </ScrollView>

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
  );
};

export default OnboardingScreen;

const styles = (COLORS: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    slide: {
      width,
      padding: 20,
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
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
      paddingHorizontal: 20,
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
      bottom: 80,
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
    },
    nextButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
