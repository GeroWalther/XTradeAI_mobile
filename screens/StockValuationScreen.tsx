import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { Card } from '../components/ui/Card';
import StockValuationService from '../services/StockValuationService';

interface AnalysisData {
  stockInfo: {
    companyName: string;
    symbol: string;
    currentPrice: number;
    previousClose: number;
    dayChange?: number;
    dayHigh?: number;
    dayLow?: number;
    volume?: number;
    currency: string;
  };
  valuation: {
    peAnalysis: ValuationAnalysis;
    pegAnalysis: ValuationAnalysis;
    psAnalysis: ValuationAnalysis;
    overallValuation: string;
    riskLevel: string;
    explanation: string;
  };
  disclaimer: string;
}

interface ValuationAnalysis {
  value: number;
  interpretation: string;
  signal: string | null;
  explanation: string;
}

export default function StockValuationScreen() {
  const COLORS = useTheme();
  const [selectedStock, setSelectedStock] = useState('apple');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // All available stocks from the service
  const stocks = [
    // 🇺🇸 US Tech Giants
    { label: 'Apple Inc.', value: 'apple' },
    { label: 'Microsoft Corp.', value: 'microsoft' },
    { label: 'Amazon.com Inc.', value: 'amazon' },
    { label: 'Tesla Inc.', value: 'tesla' },
    { label: 'Meta Platforms (Facebook)', value: 'meta' },
    { label: 'Google (Alphabet)', value: 'google' },
    { label: 'NVIDIA Corp.', value: 'nvidia' },
    { label: 'Netflix Inc.', value: 'netflix' },
    { label: 'Adobe Inc.', value: 'adobe' },
    { label: 'Salesforce Inc.', value: 'salesforce' },
    { label: 'Oracle Corp.', value: 'oracle' },
    { label: 'Intel Corp.', value: 'intel' },
    { label: 'Cisco Systems', value: 'cisco' },
    { label: 'Broadcom Inc.', value: 'broadcom' },
    { label: 'Qualcomm Inc.', value: 'qualcomm' },
    { label: 'AMD Inc.', value: 'amd' },
    { label: 'PayPal Holdings', value: 'paypal' },
    { label: 'Block Inc. (Square)', value: 'square' },
    { label: 'Zoom Video', value: 'zoom' },
    { label: 'Uber Technologies', value: 'uber' },
    { label: 'Lyft Inc.', value: 'lyft' },
    { label: 'Airbnb Inc.', value: 'airbnb' },
    { label: 'Palantir Technologies', value: 'palantir' },
    { label: 'Snowflake Inc.', value: 'snowflake' },
    { label: 'Databricks Inc.', value: 'databricks' },
    { label: 'CrowdStrike Holdings', value: 'crowdstrike' },
    { label: 'Okta Inc.', value: 'okta' },
    { label: 'ServiceNow Inc.', value: 'servicenow' },
    { label: 'Workday Inc.', value: 'workday' },
    { label: 'Zscaler Inc.', value: 'zscaler' },
    { label: 'Shopify Inc.', value: 'shopify' },
    { label: 'Spotify Technology', value: 'spotify' },
    { label: 'Twilio Inc.', value: 'twilio' },
    { label: 'DocuSign Inc.', value: 'docusign' },
    { label: 'Slack Technologies', value: 'slack' },
    { label: 'Dropbox Inc.', value: 'dropbox' },
    { label: 'Twitter Inc.', value: 'twitter' },

    // 🏦 US Financial Services
    { label: 'JPMorgan Chase', value: 'jpmorgan' },
    { label: 'Bank of America', value: 'bank of america' },
    { label: 'Wells Fargo', value: 'wells fargo' },
    { label: 'Citigroup Inc.', value: 'citigroup' },
    { label: 'Goldman Sachs', value: 'goldman sachs' },
    { label: 'Morgan Stanley', value: 'morgan stanley' },
    { label: 'American Express', value: 'american express' },
    { label: 'Visa Inc.', value: 'visa' },
    { label: 'Mastercard Inc.', value: 'mastercard' },
    { label: 'Berkshire Hathaway', value: 'berkshire hathaway' },
    { label: 'BlackRock Inc.', value: 'blackrock' },
    { label: 'Charles Schwab', value: 'charles schwab' },

    // 🛒 US Consumer & Retail
    { label: 'Walmart Inc.', value: 'walmart' },
    { label: 'Target Corp.', value: 'target' },
    { label: 'Costco Wholesale', value: 'costco' },
    { label: 'Home Depot', value: 'home depot' },
    { label: "Lowe's Companies", value: 'lowes' },
    { label: "McDonald's Corp.", value: 'mcdonalds' },
    { label: 'Starbucks Corp.', value: 'starbucks' },
    { label: 'Nike Inc.', value: 'nike' },
    { label: 'Coca-Cola Co.', value: 'coca cola' },
    { label: 'PepsiCo Inc.', value: 'pepsi' },
    { label: 'Procter & Gamble', value: 'procter & gamble' },
    { label: 'Unilever PLC', value: 'unilever' },
    { label: 'Walt Disney Co.', value: 'disney' },
    { label: 'Comcast Corp.', value: 'comcast' },
    { label: 'AT&T Inc.', value: 'at&t' },
    { label: 'Verizon Communications', value: 'verizon' },
    { label: 'T-Mobile US', value: 't-mobile' },

    // 💊 US Healthcare & Pharma
    { label: 'Johnson & Johnson', value: 'johnson & johnson' },
    { label: 'Pfizer Inc.', value: 'pfizer' },
    { label: 'Merck & Co.', value: 'merck' },
    { label: 'AbbVie Inc.', value: 'abbvie' },
    { label: 'Bristol Myers Squibb', value: 'bristol myers' },
    { label: 'Eli Lilly', value: 'eli lilly' },
    { label: 'Roche Holding AG', value: 'roche' },
    { label: 'Novartis AG', value: 'novartis' },
    { label: 'Sanofi SA', value: 'sanofi' },
    { label: 'GlaxoSmithKline', value: 'glaxosmithkline' },
    { label: 'UnitedHealth Group', value: 'unitedhealth' },
    { label: 'Anthem Inc.', value: 'anthem' },
    { label: 'Cigna Corp.', value: 'cigna' },
    { label: 'Humana Inc.', value: 'humana' },
    { label: 'CVS Health', value: 'cvs' },
    { label: 'Walgreens Boots Alliance', value: 'walgreens' },

    // 🏭 US Energy & Industrials
    { label: 'Exxon Mobil', value: 'exxon mobil' },
    { label: 'Chevron Corp.', value: 'chevron' },
    { label: 'ConocoPhillips', value: 'conocophillips' },
    { label: 'General Electric', value: 'general electric' },
    { label: 'Boeing Co.', value: 'boeing' },
    { label: 'Lockheed Martin', value: 'lockheed martin' },
    { label: 'Raytheon Technologies', value: 'raytheon' },
    { label: 'Caterpillar Inc.', value: 'caterpillar' },
    { label: 'Deere & Company', value: 'deere' },
    { label: '3M Company', value: '3m' },
    { label: 'Honeywell International', value: 'honeywell' },
    { label: 'Ford Motor Co.', value: 'ford' },
    { label: 'General Motors', value: 'general motors' },
    { label: 'Stellantis N.V.', value: 'stellantis' },

    // 📈 Growth & Meme Stocks
    { label: 'GameStop Corp.', value: 'gamestop' },
    { label: 'AMC Entertainment', value: 'amc' },
    { label: 'BlackBerry Ltd.', value: 'blackberry' },
    { label: 'Nokia Corp.', value: 'nokia' },
    { label: 'Bed Bath & Beyond', value: 'bed bath beyond' },
    { label: 'Peloton Interactive', value: 'peloton' },
    { label: 'Robinhood Markets', value: 'robinhood' },
    { label: 'Coinbase Global', value: 'coinbase' },
    { label: 'DraftKings Inc.', value: 'draftkings' },
    { label: 'Penn Entertainment', value: 'penn' },
    { label: 'FanDuel Group', value: 'fanduel' },
    { label: 'Virgin Galactic', value: 'virgin galactic' },

    // 🚗 Electric & Luxury Vehicles
    { label: '🏎️ Ferrari N.V.', value: 'ferrari' },
    { label: 'Lucid Group (Motors)', value: 'lucid motors' },
    { label: 'Rivian Automotive', value: 'rivian' },
    { label: 'NIO Inc.', value: 'nio' },
    { label: 'XPeng Inc.', value: 'xpeng' },
    { label: 'Li Auto Inc.', value: 'li auto' },
    { label: 'Polestar Automotive', value: 'polestar' },

    // 🇬🇧 UK Stocks (London - .L)
    { label: '🇬🇧 Shell PLC', value: 'shell' },
    { label: '🇬🇧 BP PLC', value: 'bp' },
    { label: '🇬🇧 Vodafone Group', value: 'vodafone' },
    { label: '🇬🇧 BT Group', value: 'british telecom' },
    { label: '🇬🇧 Rolls-Royce Holdings', value: 'rolls royce' },
    { label: '🇬🇧 International Airlines Group', value: 'british airways' },
    { label: '🇬🇧 British American Tobacco', value: 'british american tobacco' },
    { label: '🇬🇧 Unilever PLC', value: 'unilever' },
    { label: '🇬🇧 Diageo PLC', value: 'diageo' },
    { label: '🇬🇧 AstraZeneca PLC', value: 'astrazeneca' },
    { label: '🇬🇧 GSK PLC', value: 'gsk' },
    { label: '🇬🇧 Reckitt Benckiser', value: 'reckitt benckiser' },
    { label: '🇬🇧 Tesco PLC', value: 'tesco' },
    { label: '🇬🇧 J Sainsbury', value: 'sainsbury' },
    { label: '🇬🇧 Marks & Spencer', value: 'marks spencer' },
    { label: '🇬🇧 Next PLC', value: 'next' },
    { label: '🇬🇧 Burberry Group', value: 'burberry' },
    { label: '🇬🇧 Aston Martin Lagonda', value: 'aston martin' },
    { label: '🇬🇧 London Stock Exchange Group', value: 'london stock exchange' },
    { label: '🇬🇧 Barclays PLC', value: 'barclays' },
    { label: '🇬🇧 Lloyds Banking Group', value: 'lloyds' },
    { label: '🇬🇧 HSBC Holdings', value: 'hsbc' },
    { label: '🇬🇧 Standard Chartered', value: 'standard chartered' },
    { label: '🇬🇧 Prudential PLC', value: 'prudential' },
    { label: '🇬🇧 Aviva PLC', value: 'aviva' },
    { label: '🇬🇧 Legal & General Group', value: 'legal general' },

    // 🇩🇪 German Stocks (Frankfurt - .DE)
    { label: '🇩🇪 SAP SE', value: 'sap' },
    { label: '🇩🇪 Siemens AG', value: 'siemens' },
    { label: '🇩🇪 Adidas AG', value: 'adidas' },
    { label: '🇩🇪 Puma SE', value: 'puma' },
    { label: '🇩🇪 BMW AG', value: 'bmw' },
    { label: '🇩🇪 Volkswagen AG', value: 'volkswagen' },
    { label: '🇩🇪 Mercedes-Benz Group', value: 'mercedes benz' },
    { label: '🇩🇪 Porsche AG', value: 'porsche' },
    { label: '🇩🇪 Bayer AG', value: 'bayer' },
    { label: '🇩🇪 BASF SE', value: 'basf' },
    { label: '🇩🇪 Deutsche Bank AG', value: 'deutsche bank' },
    { label: '🇩🇪 Commerzbank AG', value: 'commerzbank' },
    { label: '🇩🇪 Allianz SE', value: 'allianz' },
    { label: '🇩🇪 Munich Re', value: 'munich re' },
    { label: '🇩🇪 Deutsche Telekom AG', value: 'deutsche telekom' },
    { label: '🇩🇪 E.ON SE', value: 'e.on' },
    { label: '🇩🇪 RWE AG', value: 'rwe' },
    { label: '🇩🇪 Infineon Technologies', value: 'infineon' },
    { label: '🇩🇪 Henkel AG', value: 'henkel' },
    { label: '🇩🇪 Beiersdorf AG', value: 'beiersdorf' },

    // 🇫🇷 French Stocks (Paris - .PA)
    { label: '🇫🇷 LVMH', value: 'lvmh' },
    { label: "🇫🇷 L'Oréal SA", value: 'loreal' },
    { label: '🇫🇷 Hermès International', value: 'hermes' },
    { label: '🇫🇷 Kering SA', value: 'kering' },
    { label: '🇫🇷 Louis Vuitton (LVMH)', value: 'louis vuitton' },
    { label: '🇫🇷 Moët Hennessy (LVMH)', value: 'moet hennessy' },
    { label: '🇫🇷 Sanofi SA', value: 'sanofi' },
    { label: '🇫🇷 TotalEnergies SE', value: 'totalenergies' },
    { label: '🇫🇷 Airbus SE', value: 'airbus' },
    { label: '🇫🇷 Schneider Electric', value: 'schneider electric' },
    { label: '🇫🇷 BNP Paribas', value: 'bnp paribas' },
    { label: '🇫🇷 AXA SA', value: 'axa' },
    { label: '🇫🇷 Danone SA', value: 'danone' },
    { label: '🇫🇷 Carrefour SA', value: 'carrefour' },
    { label: '🇫🇷 Orange SA', value: 'orange' },
    { label: '🇫🇷 Vivendi SE', value: 'vivendi' },
    { label: '🇫🇷 Publicis Groupe', value: 'publicis' },
    { label: '🇫🇷 Michelin', value: 'michelin' },
    { label: '🇫🇷 Pernod Ricard', value: 'pernod ricard' },

    // 🇯🇵 Japanese Stocks (Tokyo - .T)
    { label: '🇯🇵 Toyota Motor Corp.', value: 'toyota' },
    { label: '🇯🇵 Honda Motor Co.', value: 'honda' },
    { label: '🇯🇵 Nissan Motor Co.', value: 'nissan' },
    { label: '🇯🇵 Sony Group Corp.', value: 'sony' },
    { label: '🇯🇵 Nintendo Co.', value: 'nintendo' },
    { label: '🇯🇵 Panasonic Holdings', value: 'panasonic' },
    { label: '🇯🇵 Canon Inc.', value: 'canon' },
    { label: '🇯🇵 Nikon Corp.', value: 'nikon' },
    { label: '🇯🇵 Olympus Corp.', value: 'olympus' },
    { label: '🇯🇵 Fujifilm Holdings', value: 'fujifilm' },
    { label: '🇯🇵 SoftBank Group', value: 'softbank' },
    { label: '🇯🇵 KDDI Corp.', value: 'kddi' },
    { label: '🇯🇵 NTT (Nippon Telegraph)', value: 'nippon telegraph' },
    { label: '🇯🇵 Mitsubishi Corp.', value: 'mitsubishi' },
    { label: '🇯🇵 Mitsui & Co.', value: 'mitsui' },
    { label: '🇯🇵 Sumitomo Corp.', value: 'sumitomo' },
    { label: '🇯🇵 Hitachi Ltd.', value: 'hitachi' },
    { label: '🇯🇵 Toshiba Corp.', value: 'toshiba' },
    { label: '🇯🇵 Sharp Corp.', value: 'sharp' },
    { label: '🇯🇵 Mazda Motor Corp.', value: 'mazda' },
    { label: '🇯🇵 Subaru Corp.', value: 'subaru' },
    { label: '🇯🇵 Suzuki Motor Corp.', value: 'suzuki' },
    { label: '🇯🇵 Yamaha Motor Co.', value: 'yamaha' },
    { label: '🇯🇵 Kawasaki Heavy Industries', value: 'kawasaki' },
    { label: '🇯🇵 Bridgestone Corp.', value: 'bridgestone' },
    { label: '🇯🇵 ASICS Corp.', value: 'asics' },
    { label: '🇯🇵 Fast Retailing (Uniqlo)', value: 'fast retailing' },
    { label: '🇯🇵 Seven & i Holdings', value: 'seven eleven' },
    { label: '🇯🇵 Lawson Inc.', value: 'lawson' },
    { label: '🇯🇵 FamilyMart', value: 'family mart' },

    // 🇨🇳 Chinese Stocks (Hong Kong - .HK)
    { label: '🇨🇳 Tencent Holdings', value: 'tencent' },
    { label: '🇨🇳 Alibaba Group', value: 'alibaba' },
    { label: '🇨🇳 Baidu Inc.', value: 'baidu' },
    { label: '🇨🇳 JD.com Inc.', value: 'jd.com' },
    { label: '🇨🇳 China Mobile Ltd.', value: 'china mobile' },
    { label: '🇨🇳 China Telecom Corp.', value: 'china telecom' },
    { label: '🇨🇳 China Unicom', value: 'china unicom' },
    { label: '🇨🇳 Ping An Insurance', value: 'ping an' },
    { label: '🇨🇳 China Construction Bank', value: 'china construction' },
    {
      label: '🇨🇳 Industrial & Commercial Bank',
      value: 'industrial commercial',
    },
    { label: '🇨🇳 Bank of China', value: 'bank of china' },
    { label: '🇨🇳 China Merchants Bank', value: 'china merchants' },
    { label: '🇨🇳 China Life Insurance', value: 'china life' },
    { label: '🇨🇳 PetroChina Co.', value: 'petrochina' },
    { label: '🇨🇳 China Petroleum & Chemical', value: 'sinopec' },

    // 🇰🇷 Korean Stocks (Seoul - .KS)
    { label: '🇰🇷 Samsung Electronics', value: 'samsung electronics' },
    { label: '🇰🇷 SK Hynix Inc.', value: 'sk hynix' },
    { label: '🇰🇷 LG Electronics', value: 'lg electronics' },
    { label: '🇰🇷 Hyundai Motor', value: 'hyundai motor' },
    { label: '🇰🇷 Kia Corp.', value: 'kia' },
    { label: '🇰🇷 POSCO Holdings', value: 'posco' },
    { label: '🇰🇷 Korean Air Lines', value: 'korean air' },
    { label: '🇰🇷 Naver Corp.', value: 'naver' },
    { label: '🇰🇷 Kakao Corp.', value: 'kakao' },
    { label: '🇰🇷 KB Financial Group', value: 'kb financial' },
    { label: '🇰🇷 Shinhan Financial Group', value: 'shinhan financial' },

    // 🇨🇦 Canadian Stocks (Toronto - .TO)
    { label: '🇨🇦 Shopify Inc.', value: 'shopify' },
    { label: '🇨🇦 Canadian National Railway', value: 'canadian national' },
    { label: '🇨🇦 Canadian Pacific Railway', value: 'canadian pacific' },
    { label: '🇨🇦 Royal Bank of Canada', value: 'royal bank' },
    { label: '🇨🇦 Toronto-Dominion Bank', value: 'toronto dominion' },
    { label: '🇨🇦 Bank of Nova Scotia', value: 'bank nova scotia' },
    { label: '🇨🇦 Bank of Montreal', value: 'bank montreal' },
    { label: '🇨🇦 Canadian Imperial Bank', value: 'canadian imperial' },
    { label: '🇨🇦 Suncor Energy', value: 'suncor' },
    { label: '🇨🇦 Canadian Natural Resources', value: 'canadian natural' },
    { label: '🇨🇦 Enbridge Inc.', value: 'enbridge' },
    { label: '🇨🇦 TC Energy Corp.', value: 'tc energy' },
    { label: '🇨🇦 BlackBerry Ltd.', value: 'blackberry' },
    { label: '🇨🇦 Barrick Gold Corp.', value: 'barrick gold' },
    { label: '🇨🇦 Goldcorp Inc.', value: 'goldcorp' },
    { label: '🇨🇦 First Quantum Minerals', value: 'first quantum' },
    { label: '🇨🇦 Magna International', value: 'magna international' },

    // 🇦🇺 Australian Stocks (Sydney - .AX)
    { label: '🇦🇺 BHP Group Ltd.', value: 'bhp' },
    { label: '🇦🇺 Rio Tinto Ltd.', value: 'rio tinto' },
    { label: '🇦🇺 Fortescue Metals Group', value: 'fortescue' },
    { label: '🇦🇺 Commonwealth Bank', value: 'commonwealth bank' },
    { label: '🇦🇺 Westpac Banking Corp.', value: 'westpac' },
    { label: '🇦🇺 Australia and New Zealand Banking', value: 'anz' },
    { label: '🇦🇺 National Australia Bank', value: 'national australia' },
    { label: '🇦🇺 Macquarie Group', value: 'macquarie' },
    { label: '🇦🇺 Telstra Corp.', value: 'telstra' },
    { label: '🇦🇺 Optus (Singtel)', value: 'optus' },
    { label: '🇦🇺 Woolworths Group', value: 'woolworths' },
    { label: '🇦🇺 Coles Group', value: 'coles' },
    { label: '🇦🇺 Wesfarmers Ltd.', value: 'wesfarmers' },
    { label: '🇦🇺 Qantas Airways', value: 'qantas' },
    { label: '🇦🇺 Virgin Australia', value: 'virgin australia' },
    { label: '🇦🇺 Brambles Ltd.', value: 'brambles limited' },
    { label: '🇦🇺 Cochlear Ltd.', value: 'cochlear limited' },
    { label: '🇦🇺 CSL Ltd.', value: 'csl limited' },

    // 🏢 REITs (Note: Different analysis metrics apply)
    { label: '🏢 Simon Property Group', value: 'simon property' },
    { label: '🏢 Realty Income Corp.', value: 'realty income' },
    { label: '🏢 American Tower Corp.', value: 'american tower' },
    { label: '🏢 Crown Castle Inc.', value: 'crown castle' },
    { label: '🏢 Prologis Inc.', value: 'prologis' },
    { label: '🏢 Equity Residential', value: 'equity residential' },
    { label: '🏢 AvalonBay Communities', value: 'avalonbay' },
    { label: '🏢 Boston Properties', value: 'boston properties' },
    { label: '🏢 Ventas Inc.', value: 'ventas' },
    { label: '🏢 Welltower Inc.', value: 'welltower' },
    { label: '🏢 Digital Realty Trust', value: 'digital realty' },
    { label: '🏢 Iron Mountain Inc.', value: 'iron mountain' },

    // ₿ Crypto-Related Stocks
    { label: '₿ Coinbase Global', value: 'coinbase' },
    { label: '₿ Marathon Digital Holdings', value: 'marathon digital' },
    { label: '₿ Riot Blockchain', value: 'riot blockchain' },
    { label: '₿ CleanSpark Inc.', value: 'cleanspark' },
    { label: '₿ Hut 8 Mining', value: 'hut 8' },
    { label: '₿ Bitfarms Ltd.', value: 'bitfarms' },
    { label: '₿ MicroStrategy Inc.', value: 'microstrategy' },
    { label: '₿ Block Inc. (Square)', value: 'square' },
    { label: '₿ PayPal Holdings', value: 'paypal' },
    { label: '₿ Robinhood Markets', value: 'robinhood' },

    // 🧬 Biotech & Emerging
    { label: '🧬 Moderna Inc.', value: 'moderna' },
    { label: '🧬 BioNTech SE', value: 'biontech' },
    { label: '🧬 Novavax Inc.', value: 'novavax' },
    { label: '🧬 Gilead Sciences', value: 'gilead' },
    { label: '🧬 Biogen Inc.', value: 'biogen' },
    { label: '🧬 Amgen Inc.', value: 'amgen' },
    { label: '🧬 Illumina Inc.', value: 'illumina' },
    { label: '🧬 Vertex Pharmaceuticals', value: 'vertex pharma' },
    { label: '🧬 Regeneron Pharmaceuticals', value: 'regeneron pharma' },
    { label: '🧬 Seattle Genetics', value: 'seattle genetics' },
    { label: '🧬 Alexion Pharmaceuticals', value: 'alexion pharma' },
    { label: '🧬 BioMarin Pharmaceutical', value: 'biomarin pharma' },
    { label: '🧬 Incyte Corp.', value: 'incyte corp' },

    // ☀️ Renewable Energy
    { label: '☀️ First Solar Inc.', value: 'first solar' },
    { label: '☀️ SunPower Corp.', value: 'sunpower corp' },
    { label: '☀️ Canadian Solar Inc.', value: 'canadian solar' },
    { label: '☀️ JinkoSolar Holding', value: 'jinko solar' },
    { label: '☀️ Enphase Energy', value: 'enphase energy' },
    { label: '☀️ SolarEdge Technologies', value: 'solaredge tech' },
    { label: '☀️ Tesla Energy (Tesla)', value: 'tesla energy' },
    {
      label: '☀️ General Electric Renewable',
      value: 'general electric renewable',
    },
    { label: '☀️ Vestas Wind Systems', value: 'vestas wind' },
    { label: '☀️ Ørsted A/S', value: 'orsted' },
    { label: '☀️ NextEra Energy', value: 'nexterra energy' },
    { label: '☀️ Brookfield Renewable', value: 'brookfield renewable' },

    // 🍔 Food & Beverage
    { label: '🍔 Nestlé SA', value: 'nestle' },
    { label: '🍔 The Kraft Heinz Co.', value: 'kraft heinz' },
    { label: '🍔 General Mills Inc.', value: 'general mills' },
    { label: '🍔 Kellogg Co.', value: 'kellogg' },
    { label: '🍔 Campbell Soup Co.', value: 'campbell soup' },
    { label: '🍔 Conagra Brands', value: 'conagra brands' },
    { label: '🍔 Tyson Foods', value: 'tyson foods' },
    { label: '🍔 Hormel Foods', value: 'hormel foods' },
    { label: '🍔 The J.M. Smucker Co.', value: 'jm smucker' },
    { label: '🍔 The Hershey Co.', value: 'hershey company' },
    { label: '🍔 Mondelez International', value: 'mondelez' },
    { label: '🍔 The Boston Beer Co.', value: 'boston beer' },
    { label: '🍔 Constellation Brands', value: 'constellation brands' },
    { label: '🍔 Brown-Forman Corp.', value: 'brown forman' },
    { label: '🍔 Diageo PLC', value: 'diageo plc' },
    { label: '🍔 Anheuser-Busch InBev', value: 'anheuser busch' },
    { label: '🍔 Molson Coors Beverage', value: 'molson coors' },
    { label: '🍺 Heineken N.V.', value: 'heineken nv' },

    // ⚠️ ETFs (Note: PE/PEG/PS ratios don't apply - different metrics needed)
    // { label: '⚠️ SPDR S&P 500 ETF (SPY)', value: 'sp500 etf' },
    // { label: '⚠️ Invesco QQQ Trust (QQQ)', value: 'nasdaq etf' },
    // { label: '⚠️ SPDR Dow Jones ETF (DIA)', value: 'dow etf' },
    // { label: '⚠️ iShares Russell 2000 ETF', value: 'russell etf' },
    // { label: '⚠️ Vanguard Total Stock Market', value: 'vti etf' },
    // { label: '⚠️ Vanguard S&P 500 ETF', value: 'voo etf' },
    // { label: '⚠️ iShares MSCI Emerging Markets', value: 'eem etf' },
    // { label: '⚠️ Vanguard FTSE Europe ETF', value: 'vea etf' },
    // { label: '⚠️ Vanguard FTSE Emerging Markets', value: 'vwo etf' },
    // { label: '⚠️ SPDR Gold Shares', value: 'gld etf' },
    // { label: '⚠️ iShares Silver Trust', value: 'slv etf' },
    // { label: '⚠️ United States Oil Fund', value: 'uso etf' },
    // { label: '⚠️ iShares 20+ Year Treasury Bond', value: 'tlt etf' },
    // { label: '⚠️ iShares iBoxx High Yield Corporate', value: 'hyg etf' },
    // { label: '⚠️ iShares iBoxx Investment Grade', value: 'lqd etf' },
    // { label: '⚠️ ARK Innovation ETF', value: 'arkk etf' },
    // { label: '⚠️ ARK Genomics Revolution ETF', value: 'arkg etf' },
    // { label: '⚠️ ARK Autonomous & Robotics ETF', value: 'arkq etf' },
    // { label: '⚠️ ARK Next Generation Internet', value: 'arkw etf' },
    // { label: '⚠️ FTSE 100 ETF', value: 'ftse100 etf' },
    // { label: '⚠️ DAX ETF', value: 'dax etf' },
    // { label: '⚠️ Nikkei 225 ETF', value: 'nikkei etf' },
    //     { label: '⚠️ Hang Seng ETF', value: 'hang seng etf' },
  ];

  // Filter stocks based on search query
  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    return stocks.filter(
      (stock) =>
        stock.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Get selected stock display name
  const selectedStockLabel =
    stocks.find((stock) => stock.value === selectedStock)?.label ||
    selectedStock;

  const performAnalysis = async () => {
    if (!selectedStock) {
      Alert.alert('Error', 'Please select a stock to analyze');
      return;
    }

    setLoading(true);
    setAnalysisData(null);

    try {
      const result = await StockValuationService.performStockValuation(
        selectedStock
      );

      if (result.status === 'success' && result.data) {
        setAnalysisData(result.data);
      } else {
        Alert.alert(
          'Analysis Failed',
          result.message || 'Unable to perform stock analysis'
        );
      }
    } catch (error) {
      console.error('Stock analysis error:', error);
      Alert.alert('Error', 'An unexpected error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const renderMetricCard = (
    title: string,
    analysis: ValuationAnalysis | null,
    color: string
  ) => {
    if (!analysis) return null;

    return (
      <Card style={styles(COLORS).metricCard}>
        <Text style={styles(COLORS).metricTitle}>{title}</Text>
        <View style={styles(COLORS).metricRow}>
          <Text style={styles(COLORS).metricValue}>
            {analysis.value ? analysis.value.toFixed(2) : 'N/A'}
          </Text>
          <Text style={[styles(COLORS).metricInterpretation, { color }]}>
            {analysis.interpretation}
          </Text>
        </View>
        <Text style={styles(COLORS).metricExplanation}>
          {analysis.explanation}
        </Text>
      </Card>
    );
  };

  const renderStockInfo = () => {
    if (!analysisData?.stockInfo) return null;

    const { stockInfo } = analysisData;
    const changeColor =
      stockInfo.dayChange && stockInfo.dayChange >= 0
        ? COLORS.success
        : COLORS.error;

    return (
      <Card style={styles(COLORS).stockInfoCard}>
        <View style={styles(COLORS).stockHeader}>
          <View>
            <Text style={styles(COLORS).companyName}>
              {stockInfo.companyName}
            </Text>
            <Text style={styles(COLORS).stockSymbol}>{stockInfo.symbol}</Text>
          </View>
          <View style={styles(COLORS).priceContainer}>
            <Text style={styles(COLORS).currentPrice}>
              {stockInfo.currentPrice?.toFixed(2)} {stockInfo.currency}
            </Text>
            <Text style={[styles(COLORS).priceChange, { color: changeColor }]}>
              {stockInfo.dayChange && stockInfo.dayChange >= 0 ? '+' : ''}
              {(
                ((stockInfo.currentPrice - stockInfo.previousClose) /
                  stockInfo.previousClose) *
                100
              ).toFixed(2)}
              %
            </Text>
          </View>
        </View>

        <View style={styles(COLORS).statsRow}>
          <View style={styles(COLORS).statItem}>
            <Text style={styles(COLORS).statLabel}>Day High</Text>
            <Text style={styles(COLORS).statValue}>
              {stockInfo.dayHigh?.toFixed(2) || 'N/A'}
            </Text>
          </View>
          <View style={styles(COLORS).statItem}>
            <Text style={styles(COLORS).statLabel}>Day Low</Text>
            <Text style={styles(COLORS).statValue}>
              {stockInfo.dayLow?.toFixed(2) || 'N/A'}
            </Text>
          </View>
          <View style={styles(COLORS).statItem}>
            <Text style={styles(COLORS).statLabel}>Volume</Text>
            <Text style={styles(COLORS).statValue}>
              {stockInfo.volume?.toLocaleString() || 'N/A'}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderValuationSummary = () => {
    if (!analysisData?.valuation) return null;

    const { valuation } = analysisData;
    const valuationColor =
      valuation.overallValuation === 'undervalued'
        ? COLORS.success
        : valuation.overallValuation === 'overvalued'
        ? COLORS.error
        : COLORS.warning;

    return (
      <Card style={styles(COLORS).summaryCard}>
        <Text style={styles(COLORS).summaryTitle}>
          Overall Valuation Assessment
        </Text>
        <View style={styles(COLORS).valuationRow}>
          <Text
            style={[styles(COLORS).valuationStatus, { color: valuationColor }]}>
            {valuation.overallValuation.toUpperCase()}
          </Text>
          <Text style={styles(COLORS).riskLevel}>
            Risk: {valuation.riskLevel.toUpperCase()}
          </Text>
        </View>
        <Text style={styles(COLORS).explanationText}>
          {valuation.explanation}
        </Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles(COLORS).container}>
      <ScrollView contentContainerStyle={styles(COLORS).scrollContent}>
        <View style={styles(COLORS).header}>
          <Text style={styles(COLORS).title}>Stock Valuation</Text>
          <Text style={styles(COLORS).subtitle}>
            Analyze PE Ratio, PEG Ratio, and Price-to-Sales metrics
          </Text>
        </View>

        <Card style={styles(COLORS).selectorCard}>
          <Text style={styles(COLORS).selectorLabel}>
            Search & Select Stock
          </Text>

          {/* Selected Stock Display */}
          {selectedStock && (
            <View style={styles(COLORS).selectedStockContainer}>
              <Text style={styles(COLORS).selectedStockLabel}>Selected:</Text>
              <Text style={styles(COLORS).selectedStockText}>
                {selectedStockLabel}
              </Text>
            </View>
          )}

          {/* Search Input */}
          <TextInput
            style={styles(COLORS).searchInput}
            placeholder='Search stocks (e.g., Apple, Ferrari, Tesla)...'
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowSearchResults(text.length > 0);
            }}
            onFocus={() => setShowSearchResults(searchQuery.length > 0)}
          />

          {/* Search Results */}
          {showSearchResults && searchQuery.length > 0 && (
            <View style={styles(COLORS).searchResultsContainer}>
              {filteredStocks.length > 0 ? (
                <FlatList
                  data={filteredStocks.slice(0, 10)} // Show max 10 results
                  keyExtractor={(item) => item.value}
                  style={styles(COLORS).searchResultsList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles(COLORS).searchResultItem}
                      onPress={() => {
                        setSelectedStock(item.value);
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}>
                      <Text style={styles(COLORS).searchResultText}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles(COLORS).noResultsContainer}>
                  <Text style={styles(COLORS).noResultsText}>
                    No stocks found matching "{searchQuery}"
                  </Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles(COLORS).analyzeButton,
              loading && styles(COLORS).buttonDisabled,
            ]}
            onPress={performAnalysis}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} size='small' />
            ) : (
              <Text style={styles(COLORS).analyzeButtonText}>
                Analyze Stock
              </Text>
            )}
          </TouchableOpacity>
        </Card>

        {analysisData && (
          <>
            {renderStockInfo()}
            {renderValuationSummary()}

            <Text style={styles(COLORS).metricsHeader}>Valuation Metrics</Text>

            {renderMetricCard(
              'P/E Ratio (Price-to-Earnings)',
              analysisData.valuation.peAnalysis,
              COLORS.primary
            )}

            {renderMetricCard(
              'PEG Ratio (Price/Earnings to Growth)',
              analysisData.valuation.pegAnalysis,
              COLORS.accent
            )}

            {renderMetricCard(
              'P/S Ratio (Price-to-Sales)',
              analysisData.valuation.psAnalysis,
              COLORS.accent
            )}

            <Card style={styles(COLORS).disclaimerCard}>
              <Text style={styles(COLORS).disclaimerText}>
                {analysisData.disclaimer}
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
    selectedStockText: {
      fontSize: 16,
      color: COLORS.white,
      flex: 1,
    },
    analyzeButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    analyzeButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '600',
    },
    stockInfoCard: {
      marginBottom: 16,
    },
    stockHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    companyName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.white,
    },
    stockSymbol: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginTop: 2,
    },
    priceContainer: {
      alignItems: 'flex-end',
    },
    currentPrice: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.white,
    },
    priceChange: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 2,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
    summaryCard: {
      marginBottom: 24,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.white,
      marginBottom: 12,
    },
    valuationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    valuationStatus: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    riskLevel: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    explanationText: {
      fontSize: 14,
      color: COLORS.white,
      lineHeight: 20,
    },
    metricsHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.white,
      marginBottom: 16,
    },
    metricCard: {
      marginBottom: 16,
      borderLeftWidth: 4,
    },
    metricTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.white,
      marginBottom: 8,
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.white,
    },
    metricInterpretation: {
      fontSize: 14,
      fontWeight: '600',
    },
    metricExplanation: {
      fontSize: 14,
      color: COLORS.textSecondary,
      lineHeight: 18,
    },
    disclaimerCard: {
      marginTop: 16,
      backgroundColor: COLORS.surface,
      borderWidth: 2,
      borderColor: COLORS.warning,
      borderRadius: 8,
      padding: 16,
    },
    disclaimerText: {
      fontSize: 13,
      color: COLORS.white,
      lineHeight: 20,
      fontFamily: 'monospace', // Better for structured text with bullets
    },
    selectedStockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      padding: 8,
      backgroundColor: COLORS.surfaceLight,
      borderRadius: 6,
    },
    selectedStockLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textMuted,
      marginRight: 8,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: COLORS.white,
      backgroundColor: COLORS.surfaceLight,
      marginBottom: 8,
    },
    searchResultsContainer: {
      maxHeight: 300,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      backgroundColor: COLORS.surface,
      marginTop: 4,
    },
    searchResultsList: {
      maxHeight: 280,
    },
    searchResultItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    searchResultText: {
      fontSize: 14,
      color: COLORS.white,
    },
    noResultsContainer: {
      padding: 20,
      alignItems: 'center',
    },
    noResultsText: {
      fontSize: 14,
      color: COLORS.textMuted,
      fontStyle: 'italic',
    },
  });
