import { OPENAI_API_KEY } from '../constants/env';

class StockValuationService {
  constructor() {
    this.openaiApiKey = OPENAI_API_KEY;
    this.cache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes cache for stock data
  }

  // Extended stock symbol mapping for international markets
  getStockSymbol(stockName) {
    const stockMap = {
      // Major US Tech Stocks
      apple: 'AAPL',
      microsoft: 'MSFT',
      amazon: 'AMZN',
      tesla: 'TSLA',
      meta: 'META',
      facebook: 'META',
      google: 'GOOGL',
      alphabet: 'GOOGL',
      nvidia: 'NVDA',
      netflix: 'NFLX',
      adobe: 'ADBE',
      salesforce: 'CRM',
      oracle: 'ORCL',
      intc: 'INTC',
      intel: 'INTC',
      cisco: 'CSCO',
      broadcom: 'AVGO',
      qualcomm: 'QCOM',
      advanced: 'AMD',
      amd: 'AMD',
      paypal: 'PYPL',
      square: 'SQ',
      block: 'SQ',
      zoom: 'ZM',
      uber: 'UBER',
      lyft: 'LYFT',
      airbnb: 'ABNB',
      palantir: 'PLTR',
      snowflake: 'SNOW',
      databricks: 'DBRX',
      crowdstrike: 'CRWD',
      okta: 'OKTA',
      servicenow: 'NOW',
      workday: 'WDAY',
      zscaler: 'ZS',
      shopify: 'SHOP',
      spotify: 'SPOT',
      twilio: 'TWLO',
      docusign: 'DOCU',
      slack: 'SLAC',
      dropbox: 'DBX',
      twitter: 'TWTR',

      // US Financial Services
      jpmorgan: 'JPM',
      'jp morgan': 'JPM',
      'bank of america': 'BAC',
      wells: 'WFC',
      'wells fargo': 'WFC',
      citigroup: 'C',
      'goldman sachs': 'GS',
      'morgan stanley': 'MS',
      'american express': 'AXP',
      visa: 'V',
      mastercard: 'MA',
      berkshire: 'BRK-B',
      'berkshire hathaway': 'BRK-B',
      blackrock: 'BLK',
      schwab: 'SCHW',
      'charles schwab': 'SCHW',

      // US Consumer & Retail
      walmart: 'WMT',
      amazon: 'AMZN',
      target: 'TGT',
      costco: 'COST',
      'home depot': 'HD',
      lowes: 'LOW',
      mcdonalds: 'MCD',
      starbucks: 'SBUX',
      nike: 'NKE',
      'coca cola': 'KO',
      pepsi: 'PEP',
      'procter gamble': 'PG',
      'procter & gamble': 'PG',
      unilever: 'UL',
      disney: 'DIS',
      comcast: 'CMCSA',
      'at&t': 'T',
      verizon: 'VZ',
      tmobile: 'TMUS',
      't-mobile': 'TMUS',

      // US Healthcare & Pharma
      'johnson & johnson': 'JNJ',
      pfizer: 'PFE',
      merck: 'MRK',
      abbvie: 'ABBV',
      bristol: 'BMY',
      'bristol myers': 'BMY',
      lilly: 'LLY',
      'eli lilly': 'LLY',
      roche: 'RHHBY',
      novartis: 'NVS',
      sanofi: 'SNY',
      gsk: 'GSK',
      glaxosmithkline: 'GSK',
      unitedhealth: 'UNH',
      'united health': 'UNH',
      anthem: 'ANTM',
      cigna: 'CI',
      humana: 'HUM',
      cvs: 'CVS',
      walgreens: 'WBA',

      // US Energy & Industrials
      'exxon mobil': 'XOM',
      exxon: 'XOM',
      chevron: 'CVX',
      conocophillips: 'COP',
      'general electric': 'GE',
      ge: 'GE',
      boeing: 'BA',
      lockheed: 'LMT',
      'lockheed martin': 'LMT',
      raytheon: 'RTX',
      caterpillar: 'CAT',
      deere: 'DE',
      '3m': 'MMM',
      honeywell: 'HON',
      ford: 'F',
      'general motors': 'GM',
      gm: 'GM',
      stellantis: 'STLA',
      'fiat chrysler': 'STLA',

      // Growth & Meme Stocks
      gamestop: 'GME',
      amc: 'AMC',
      blackberry: 'BB',
      nokia: 'NOK',
      bed: 'BBBY',
      'bed bath beyond': 'BBBY',
      peloton: 'PTON',
      robinhood: 'HOOD',
      coinbase: 'COIN',
      draftkings: 'DKNG',
      penn: 'PENN',
      fanduel: 'FLTR',
      'virgin galactic': 'SPCE',
      spce: 'SPCE',

      // Electric & Luxury Vehicles
      lucid: 'LCID',
      'lucid motors': 'LCID',
      rivian: 'RIVN',
      nio: 'NIO',
      xpeng: 'XPEV',
      li: 'LI',
      'li auto': 'LI',
      polestar: 'PSNY',

      // European Stocks (London - .L)
      shell: 'SHEL.L',
      bp: 'BP.L',
      'british petroleum': 'BP.L',
      vodafone: 'VOD.L',
      'british telecom': 'BT-A.L',
      bt: 'BT-A.L',
      'rolls royce': 'RR.L',
      'british airways': 'IAG.L',
      iag: 'IAG.L',
      'british american tobacco': 'BATS.L',
      bats: 'BATS.L',
      unilever: 'ULVR.L',
      diageo: 'DGE.L',
      astrazeneca: 'AZN.L',
      gsk: 'GSK.L',
      glaxosmithkline: 'GSK.L',
      reckitt: 'RKT.L',
      'reckitt benckiser': 'RKT.L',
      tesco: 'TSCO.L',
      sainsbury: 'SBRY.L',
      marks: 'MKS.L',
      'marks spencer': 'MKS.L',
      next: 'NXT.L',
      burberry: 'BRBY.L',
      'aston martin': 'AML.L',
      'london stock exchange': 'LSEG.L',
      lseg: 'LSEG.L',
      barclays: 'BARC.L',
      lloyds: 'LLOY.L',
      hsbc: 'HSBA.L',
      'standard chartered': 'STAN.L',
      prudential: 'PRU.L',
      aviva: 'AV.L',
      'legal general': 'LGEN.L',

      // German Stocks (Frankfurt - .DE)
      sap: 'SAP.DE',
      siemens: 'SIE.DE',
      adidas: 'ADS.DE',
      puma: 'PUM.DE',
      bmw: 'BMW.DE',
      volkswagen: 'VOW3.DE',
      vw: 'VOW3.DE',
      mercedes: 'MBG.DE',
      'mercedes benz': 'MBG.DE',
      daimler: 'MBG.DE',
      porsche: 'P911.DE',
      ferrari: 'RACE',
      'ferrari nv': 'RACE',
      bayer: 'BAYN.DE',
      basf: 'BAS.DE',
      'deutsche bank': 'DBK.DE',
      commerzbank: 'CBK.DE',
      allianz: 'ALV.DE',
      munich: 'MUV2.DE',
      'munich re': 'MUV2.DE',
      'deutsche telekom': 'DTE.DE',
      'e.on': 'EOAN.DE',
      eon: 'EOAN.DE',
      rwe: 'RWE.DE',
      infineon: 'IFX.DE',
      henkel: 'HEN3.DE',
      beiersdorf: 'BEI.DE',

      // French Stocks (Paris - .PA)
      lvmh: 'MC.PA',
      loreal: 'OR.PA',
      "l'oreal": 'OR.PA',
      hermes: 'RMS.PA',
      kering: 'KER.PA',
      'louis vuitton': 'MC.PA',
      'moet hennessy': 'MC.PA',
      sanofi: 'SAN.PA',
      totalenergies: 'TTE.PA',
      total: 'TTE.PA',
      airbus: 'AIR.PA',
      schneider: 'SU.PA',
      'schneider electric': 'SU.PA',
      bnp: 'BNP.PA',
      'bnp paribas': 'BNP.PA',
      axa: 'CS.PA',
      danone: 'BN.PA',
      carrefour: 'CA.PA',
      orange: 'ORA.PA',
      vivendi: 'VIV.PA',
      publicis: 'PUB.PA',
      michelin: 'ML.PA',
      pernod: 'RI.PA',
      'pernod ricard': 'RI.PA',

      // Japanese Stocks (Tokyo - .T)
      toyota: '7203.T',
      honda: '7267.T',
      nissan: '7201.T',
      sony: '6758.T',
      nintendo: '7974.T',
      panasonic: '6752.T',
      canon: '7751.T',
      nikon: '7731.T',
      olympus: '7733.T',
      fujifilm: '4901.T',
      softbank: '9984.T',
      kddi: '9433.T',
      ntt: '9432.T',
      'nippon telegraph': '9432.T',
      mitsubishi: '8058.T',
      mitsui: '8031.T',
      sumitomo: '8053.T',
      hitachi: '6501.T',
      toshiba: '6502.T',
      sharp: '6753.T',
      mazda: '7261.T',
      subaru: '7270.T',
      suzuki: '7269.T',
      yamaha: '7272.T',
      kawasaki: '7012.T',
      bridgestone: '5108.T',
      asics: '7936.T',
      uniqlo: '9983.T',
      'fast retailing': '9983.T',
      seven: '3382.T',
      'seven eleven': '3382.T',
      lawson: '2651.T',
      'family mart': '8028.T',

      // Chinese Stocks (Hong Kong - .HK)
      tencent: '0700.HK',
      alibaba: '9988.HK',
      baidu: '9888.HK',
      jd: '9618.HK',
      'jd.com': '9618.HK',
      'china mobile': '0941.HK',
      'china telecom': '0728.HK',
      'china unicom': '0762.HK',
      'ping an': '2318.HK',
      'china construction': '0939.HK',
      'industrial commercial': '1398.HK',
      icbc: '1398.HK',
      'bank of china': '3988.HK',
      'china merchants': '3968.HK',
      'china life': '2628.HK',
      petrochina: '0857.HK',
      sinopec: '0386.HK',
      'china petroleum': '0857.HK',

      // Korean Stocks (Seoul - .KS)
      samsung: '005930.KS',
      'samsung electronics': '005930.KS',
      'sk hynix': '000660.KS',
      lg: '066570.KS',
      'lg electronics': '066570.KS',
      hyundai: '005380.KS',
      'hyundai motor': '005380.KS',
      kia: '000270.KS',
      posco: '005490.KS',
      'korean air': '003490.KS',
      'naver corp': '035420.KS',
      naver: '035420.KS',
      kakao: '035720.KS',
      'kb financial': '105560.KS',
      'shinhan financial': '055550.KS',

      // Canadian Stocks (Toronto - .TO)
      shopify: 'SHOP.TO',
      'canadian national': 'CNR.TO',
      'canadian pacific': 'CP.TO',
      'royal bank': 'RY.TO',
      'toronto dominion': 'TD.TO',
      'bank nova scotia': 'BNS.TO',
      'bank montreal': 'BMO.TO',
      'canadian imperial': 'CM.TO',
      suncor: 'SU.TO',
      'canadian natural': 'CNQ.TO',
      enbridge: 'ENB.TO',
      'tc energy': 'TRP.TO',
      transcanada: 'TRP.TO',
      blackberry: 'BB.TO',
      'northern telecom': 'NT.TO',
      nortel: 'NT.TO',
      barrick: 'ABX.TO',
      'barrick gold': 'ABX.TO',
      goldcorp: 'G.TO',
      'first quantum': 'FM.TO',
      'magna international': 'MG.TO',

      // Australian Stocks (Sydney - .AX)
      bhp: 'BHP.AX',
      'bhp billiton': 'BHP.AX',
      'rio tinto': 'RIO.AX',
      fortescue: 'FMG.AX',
      'commonwealth bank': 'CBA.AX',
      westpac: 'WBC.AX',
      anz: 'ANZ.AX',
      nab: 'NAB.AX',
      'national australia': 'NAB.AX',
      macquarie: 'MQG.AX',
      telstra: 'TLS.AX',
      optus: 'OPT.AX',
      woolworths: 'WOW.AX',
      coles: 'COL.AX',
      wesfarmers: 'WES.AX',
      qantas: 'QAN.AX',
      'virgin australia': 'VAH.AX',
      'brambles limited': 'BXB.AX',
      'cochlear limited': 'COH.AX',
      'csl limited': 'CSL.AX',

      // ETFs and Index Funds
      'nasdaq etf': 'QQQ',
      'sp500 etf': 'SPY',
      'dow etf': 'DIA',
      'russell etf': 'IWM',
      'vti etf': 'VTI',
      'voo etf': 'VOO',
      'qqq etf': 'QQQ',
      'spy etf': 'SPY',
      'eem etf': 'EEM',
      'vea etf': 'VEA',
      'vwo etf': 'VWO',
      'gld etf': 'GLD',
      'slv etf': 'SLV',
      'uso etf': 'USO',
      'tlt etf': 'TLT',
      'hyg etf': 'HYG',
      'lqd etf': 'LQD',
      'arkk etf': 'ARKK',
      'arkg etf': 'ARKG',
      'arkq etf': 'ARKQ',
      'arkw etf': 'ARKW',
      'ftse100 etf': 'ISF.L',
      'dax etf': 'EXS1.DE',
      'nikkei etf': '1321.T',
      'hang seng etf': '2800.HK',

      // REITs
      'simon property': 'SPG',
      'realty income': 'O',
      'american tower': 'AMT',
      'crown castle': 'CCI',
      prologis: 'PLD',
      'equity residential': 'EQR',
      avalonbay: 'AVB',
      'boston properties': 'BXP',
      ventas: 'VTR',
      welltower: 'WELL',
      'digital realty': 'DLR',
      'iron mountain': 'IRM',

      // Crypto-Related Stocks
      coinbase: 'COIN',
      'marathon digital': 'MARA',
      'riot blockchain': 'RIOT',
      cleanspark: 'CLSK',
      'hut 8': 'HUT',
      bitfarms: 'BITF',
      microstrategy: 'MSTR',
      square: 'SQ',
      paypal: 'PYPL',
      robinhood: 'HOOD',

      // Biotech & Emerging
      moderna: 'MRNA',
      biontech: 'BNTX',
      novavax: 'NVAX',
      gilead: 'GILD',
      biogen: 'BIIB',
      amgen: 'AMGN',
      illumina: 'ILMN',
      'vertex pharma': 'VRTX',
      'regeneron pharma': 'REGN',
      'seattle genetics': 'SGEN',
      'alexion pharma': 'ALXN',
      'biomarin pharma': 'BMRN',
      'incyte corp': 'INCY',

      // Renewable Energy
      'first solar': 'FSLR',
      'sunpower corp': 'SPWR',
      'canadian solar': 'CSIQ',
      'jinko solar': 'JKS',
      'enphase energy': 'ENPH',
      'solaredge tech': 'SEDG',
      'tesla energy': 'TSLA',
      'general electric renewable': 'GE',
      'vestas wind': 'VWS.CO',
      orsted: 'ORSTED.CO',
      'nexterra energy': 'NEE',
      'brookfield renewable': 'BEP',

      // Food & Beverage
      nestle: 'NSRGY',
      'kraft heinz': 'KHC',
      'general mills': 'GIS',
      kellogg: 'K',
      'campbell soup': 'CPB',
      'conagra brands': 'CAG',
      tyson: 'TSN',
      'tyson foods': 'TSN',
      'hormel foods': 'HRL',
      'jm smucker': 'SJM',
      'hershey company': 'HSY',
      mondelez: 'MDLZ',
      'boston beer': 'SAM',
      'constellation brands': 'STZ',
      'brown forman': 'BF-B',
      'diageo plc': 'DEO',
      'anheuser busch': 'BUD',
      'molson coors': 'TAP',
      'heineken nv': 'HEINY',
    };

    return stockMap[stockName.toLowerCase()] || stockName.toUpperCase();
  }

  // Use AI to fetch financial ratios when Yahoo Finance fails
  async fetchFinancialRatiosWithAI(symbol, companyName) {
    try {
      if (!this.openaiApiKey) {
        return {};
      }

      const systemMessage = `You are a financial data assistant. Your task is to find and return current financial ratios for stocks.

IMPORTANT: You must search for and provide the most recent financial ratios. Look up current data from reliable financial sources.

Return ONLY a JSON object with this exact structure (use null for unavailable data):

{
  "peRatio": 25.4,
  "pegRatio": 1.2,
  "priceToSales": 7.8,
  "priceToBook": 8.9,
  "marketCap": 3400000000000,
  "beta": 1.1,
  "earningsGrowth": 0.15,
  "revenueGrowth": 0.08
}

All numbers should be actual numeric values, not strings. Use null if data is not available.`;

      const userMessage = `Find the current financial ratios for ${companyName} (${symbol}):

Please search for and provide:
- P/E Ratio (Price-to-Earnings, trailing 12 months)
- PEG Ratio (5-Year Forward PEG - Price/Earnings to Growth ratio based on 5-year forward earnings growth estimates)
- P/S Ratio (Price-to-Sales, trailing 12 months)
- P/B Ratio (Price-to-Book, most recent)
- Market Cap (current market capitalization)
- Beta (5-year monthly beta vs S&P 500)
- Earnings Growth Rate (expected annual earnings growth rate)
- Revenue Growth Rate (trailing 12-month revenue growth rate)

Search current financial websites like Yahoo Finance, Morningstar, or FactSet and provide the most recent data available.`;

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemMessage },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.1,
            max_tokens: 500,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const financialData = JSON.parse(data.choices[0].message.content);

        console.log(`AI Financial data for ${symbol}:`, financialData);
        return financialData;
      } else {
        console.error('AI financial data fetch failed:', response.status);
        return {};
      }
    } catch (error) {
      console.error('Error fetching AI financial data:', error);
      return {};
    }
  }

  // Fetch comprehensive stock data including financial metrics
  async fetchStockData(stock) {
    try {
      const cacheKey = `stock_${stock}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      const symbol = this.getStockSymbol(stock);

      // Fetch basic quote data
      const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      const quoteResponse = await fetch(quoteUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        },
      });

      if (!quoteResponse.ok) {
        throw new Error(`Quote API returned status ${quoteResponse.status}`);
      }

      const quoteData = await quoteResponse.json();

      if (!quoteData.chart?.result?.[0]) {
        throw new Error(`No quote data available for ${stock}`);
      }

      const result = quoteData.chart.result[0];
      const meta = result.meta;
      const companyName = meta.longName || meta.shortName || stock;

      // Try Yahoo Finance financial data first
      let financialData = {};
      const statsUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=defaultKeyStatistics,financialData,summaryDetail`;

      try {
        const statsResponse = await fetch(statsUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          const quoteSummary = statsData.quoteSummary?.result?.[0];

          if (quoteSummary) {
            const keyStats = quoteSummary.defaultKeyStatistics || {};
            const finData = quoteSummary.financialData || {};
            const summaryDetail = quoteSummary.summaryDetail || {};

            financialData = {
              peRatio:
                keyStats.trailingPE?.raw || summaryDetail.trailingPE?.raw,
              pegRatio: keyStats.pegRatio?.raw,
              priceToSales: keyStats.priceToSalesTrailing12Months?.raw,
              priceToBook: keyStats.priceToBook?.raw,
              enterpriseToRevenue: keyStats.enterpriseToRevenue?.raw,
              enterpriseToEbitda: keyStats.enterpriseToEbitda?.raw,
              profitMargins: keyStats.profitMargins?.raw,
              operatingMargins: keyStats.operatingMargins?.raw,
              returnOnAssets: keyStats.returnOnAssets?.raw,
              returnOnEquity: keyStats.returnOnEquity?.raw,
              revenueGrowth: finData.revenueGrowth?.raw,
              earningsGrowth: finData.earningsGrowth?.raw,
              targetMeanPrice: finData.targetMeanPrice?.raw,
              recommendationMean: finData.recommendationMean?.raw,
              marketCap: summaryDetail.marketCap?.raw,
              beta: keyStats.beta?.raw,
            };
          }
        }
      } catch (yahooError) {
        console.log(
          `Yahoo Finance financial data failed for ${symbol}, trying AI...`
        );
      }

      // If key financial ratios are missing, use AI to fetch them
      const hasKeyRatios =
        financialData.peRatio &&
        financialData.pegRatio &&
        financialData.priceToSales;

      if (!hasKeyRatios) {
        console.log(`Missing key ratios for ${symbol}, fetching with AI...`);
        const aiFinancialData = await this.fetchFinancialRatiosWithAI(
          symbol,
          companyName
        );

        // Merge AI data with existing data, prioritizing AI for missing values
        financialData = {
          ...financialData,
          peRatio: financialData.peRatio || aiFinancialData.peRatio,
          pegRatio: financialData.pegRatio || aiFinancialData.pegRatio,
          priceToSales:
            financialData.priceToSales || aiFinancialData.priceToSales,
          priceToBook: financialData.priceToBook || aiFinancialData.priceToBook,
          marketCap: financialData.marketCap || aiFinancialData.marketCap,
          beta: financialData.beta || aiFinancialData.beta,
          earningsGrowth:
            financialData.earningsGrowth || aiFinancialData.earningsGrowth,
          revenueGrowth:
            financialData.revenueGrowth || aiFinancialData.revenueGrowth,
        };
      }

      const stockData = {
        symbol: meta.symbol,
        companyName: companyName,
        currentPrice: meta.regularMarketPrice || meta.previousClose,
        previousClose: meta.previousClose,
        dayHigh: meta.regularMarketDayHigh,
        dayLow: meta.regularMarketDayLow,
        volume: meta.regularMarketVolume,
        marketCap: financialData.marketCap,
        currency: meta.currency,
        exchange: meta.exchangeName,
        ...financialData,
        error: false,
        dataSource: hasKeyRatios ? 'yahoo' : 'ai+yahoo', // Track data source
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: stockData,
        timestamp: Date.now(),
      });

      return stockData;
    } catch (error) {
      console.error(`Error fetching stock data for ${stock}:`, error);
      return {
        error: true,
        message: `Error fetching stock data: ${error.message}`,
        symbol: stock,
      };
    }
  }

  // Calculate and explain valuation metrics
  analyzeValuation(stockData) {
    const analysis = {
      peAnalysis: this.analyzePERatio(stockData.peRatio),
      pegAnalysis: this.analyzePEGRatio(stockData.pegRatio),
      psAnalysis: this.analyzePriceToSales(stockData.priceToSales),
      overallValuation: 'neutral',
      riskLevel: 'moderate',
      explanation: '',
    };

    // Determine overall valuation
    const signals = [];
    if (analysis.peAnalysis.signal) signals.push(analysis.peAnalysis.signal);
    if (analysis.pegAnalysis.signal) signals.push(analysis.pegAnalysis.signal);
    if (analysis.psAnalysis.signal) signals.push(analysis.psAnalysis.signal);

    const overvaluedCount = signals.filter((s) => s === 'overvalued').length;
    const undervaluedCount = signals.filter((s) => s === 'undervalued').length;

    if (overvaluedCount > undervaluedCount) {
      analysis.overallValuation = 'overvalued';
      analysis.riskLevel = 'high';
    } else if (undervaluedCount > overvaluedCount) {
      analysis.overallValuation = 'undervalued';
      analysis.riskLevel = 'low';
    }

    analysis.explanation = this.generateValuationExplanation(
      analysis,
      stockData
    );

    return analysis;
  }

  analyzePERatio(peRatio) {
    if (!peRatio || peRatio <= 0) {
      return {
        value: peRatio,
        interpretation: 'N/A',
        signal: null,
        explanation:
          'P/E ratio not available. This could indicate the company has no earnings or negative earnings.',
      };
    }

    let interpretation, signal, explanation;

    if (peRatio < 10) {
      interpretation = 'Very Low';
      signal = 'undervalued';
      explanation =
        'Very low P/E suggests the stock may be undervalued, but could also indicate underlying problems or low growth expectations.';
    } else if (peRatio < 15) {
      interpretation = 'Low';
      signal = 'undervalued';
      explanation =
        'Low P/E ratio suggests good value, especially for established companies with stable earnings.';
    } else if (peRatio < 25) {
      interpretation = 'Moderate';
      signal = 'fairly_valued';
      explanation =
        'Moderate P/E ratio indicates fair valuation. Compare with industry average for better context.';
    } else if (peRatio < 40) {
      interpretation = 'High';
      signal = 'overvalued';
      explanation =
        "High P/E ratio suggests investors expect strong growth, but the stock may be overvalued if growth doesn't materialize.";
    } else {
      interpretation = 'Very High';
      signal = 'overvalued';
      explanation =
        'Very high P/E ratio indicates either exceptional growth expectations or significant overvaluation. High risk.';
    }

    return {
      value: peRatio,
      interpretation,
      signal,
      explanation: `P/E Ratio: ${peRatio.toFixed(
        2
      )}. ${explanation} The P/E ratio shows how much investors are willing to pay per dollar of earnings.`,
    };
  }

  analyzePEGRatio(pegRatio) {
    if (!pegRatio || pegRatio <= 0) {
      return {
        value: pegRatio,
        interpretation: 'N/A',
        signal: null,
        explanation:
          '5-Year Forward PEG ratio not available. This metric requires both P/E ratio and 5-year forward earnings growth estimates.',
      };
    }

    let interpretation, signal, explanation;

    if (pegRatio < 0.5) {
      interpretation = 'Very Low';
      signal = 'undervalued';
      explanation =
        'Very low 5-year forward PEG suggests the stock is significantly undervalued relative to its expected growth potential over the next 5 years.';
    } else if (pegRatio < 1.0) {
      interpretation = 'Low';
      signal = 'undervalued';
      explanation =
        '5-year forward PEG below 1.0 suggests the stock is undervalued considering its expected growth rate over the next 5 years.';
    } else if (pegRatio < 1.5) {
      interpretation = 'Fair';
      signal = 'fairly_valued';
      explanation =
        '5-year forward PEG around 1.0 indicates fair valuation relative to 5-year growth expectations.';
    } else if (pegRatio < 2.0) {
      interpretation = 'High';
      signal = 'overvalued';
      explanation =
        '5-year forward PEG above 1.5 suggests the stock may be overvalued relative to its 5-year growth prospects.';
    } else {
      interpretation = 'Very High';
      signal = 'overvalued';
      explanation =
        'Very high 5-year forward PEG indicates significant overvaluation or overly optimistic 5-year growth expectations.';
    }

    return {
      value: pegRatio,
      interpretation,
      signal,
      explanation: `5-Year Forward PEG Ratio: ${pegRatio.toFixed(
        2
      )}. ${explanation} The 5-year forward PEG adjusts P/E for expected growth over the next 5 years, with values under 1.0 generally considered attractive.`,
    };
  }

  analyzePriceToSales(psRatio) {
    if (!psRatio || psRatio <= 0) {
      return {
        value: psRatio,
        interpretation: 'N/A',
        signal: null,
        explanation: 'Price-to-Sales ratio not available.',
      };
    }

    let interpretation, signal, explanation;

    if (psRatio < 1.0) {
      interpretation = 'Very Low';
      signal = 'undervalued';
      explanation =
        'Very low P/S ratio suggests the stock may be undervalued, trading below its revenue multiple.';
    } else if (psRatio < 2.0) {
      interpretation = 'Low';
      signal = 'undervalued';
      explanation =
        'Low P/S ratio indicates good value, especially for profitable companies.';
    } else if (psRatio < 5.0) {
      interpretation = 'Moderate';
      signal = 'fairly_valued';
      explanation =
        'Moderate P/S ratio. Compare with industry peers to assess relative valuation.';
    } else if (psRatio < 10.0) {
      interpretation = 'High';
      signal = 'overvalued';
      explanation =
        'High P/S ratio suggests investors are paying a premium, justified only by strong growth or margins.';
    } else {
      interpretation = 'Very High';
      signal = 'overvalued';
      explanation =
        'Very high P/S ratio indicates significant premium pricing. High risk unless extraordinary growth is expected.';
    }

    return {
      value: psRatio,
      interpretation,
      signal,
      explanation: `Price-to-Sales Ratio: ${psRatio.toFixed(
        2
      )}. ${explanation} P/S ratio shows valuation relative to revenue, useful for companies with volatile earnings.`,
    };
  }

  generateValuationExplanation(analysis, stockData) {
    const { companyName, currentPrice, currency } = stockData;

    return `Based on the analysis of ${companyName} at ${currentPrice} ${currency}:

Overall Valuation: ${analysis.overallValuation.toUpperCase()}
Risk Level: ${analysis.riskLevel.toUpperCase()}

Key Metrics Summary:
• ${analysis.peAnalysis.explanation}
• ${analysis.pegAnalysis.explanation}  
• ${analysis.psAnalysis.explanation}

These ratios help determine if a stock is trading at a reasonable price relative to its fundamentals. Always compare these metrics with industry peers and consider the company's growth prospects, competitive position, and market conditions before making investment decisions.`;
  }

  // Get available international stock markets
  getAvailableMarkets() {
    return {
      'US Markets': ['NASDAQ', 'NYSE', 'S&P 500'],
      'European Markets': [
        'London Stock Exchange',
        'Frankfurt (DAX)',
        'Euronext',
      ],
      'Asian Markets': ['Tokyo (Nikkei)', 'Hong Kong', 'Shanghai'],
      'Popular Stocks': [
        'Apple',
        'Microsoft',
        'Tesla',
        'Amazon',
        'Google',
        'Meta',
        'NVIDIA',
      ],
    };
  }

  // Main stock valuation function
  async performStockValuation(stockName) {
    try {
      console.log(`Performing stock valuation for ${stockName}...`);

      const stockData = await this.fetchStockData(stockName);

      if (stockData.error) {
        return {
          status: 'error',
          message: stockData.message,
        };
      }

      const valuationAnalysis = this.analyzeValuation(stockData);

      const dataSourceNote =
        stockData.dataSource === 'ai+yahoo'
          ? ' Financial ratios sourced using AI when not available from traditional data providers.'
          : '';

      // Add ETF-specific disclaimer
      const etfNote =
        stockName.toLowerCase().includes('etf') ||
        stockName.toLowerCase().includes('trust') ||
        stockName.toLowerCase().includes('fund')
          ? ' ⚠️ ETF Analysis Note: This appears to be an ETF/Fund. Traditional stock ratios (PE, PEG, P/S) may not be meaningful for ETFs since they track baskets of securities. Consider expense ratio, dividend yield, and tracking error instead.'
          : '';

      // Comprehensive disclaimer covering all limitations
      const comprehensiveDisclaimer = `⚠️ IMPORTANT LIMITATIONS & WARNINGS

🚨 This analysis is for educational purposes only and should NOT be considered as financial advice. Do NOT rely on it alone to make big investment decisions like buying/selling NVIDIA, Amazon, Tesla, etc.

📊 WHAT THIS ANALYSIS LACKS:
• No macro or sector context - It doesn't know if rates are falling or if the AI sector is booming
• No moat or qualitative analysis - It doesn't evaluate brand power, patents, or management quality  
• PEG assumes consistent growth - In reality, growth can slow or surprise (PEG is not perfect)
• Not a forecasting tool - It doesn't give future price targets or simulate earnings scenarios

💡 KEY INSIGHT: "Overvalued" ≠ Bad Investment
Great companies like Amazon, Tesla, and Netflix were often "expensive" for years but still delivered massive returns. High ratios might reflect justified premium valuations for exceptional companies.

📈 COMBINE THIS WITH:
• Chart technicals (support/resistance levels)
• Business trends (AI adoption, healthcare pipeline, etc.)
• Long-term macro outlook (interest rates, inflation, economic cycles)
• Qualitative factors (competitive moats, management quality, industry dynamics)
• Professional financial advice from qualified advisors

Remember: The best investments often look "expensive" by traditional metrics.${dataSourceNote}${etfNote}`;

      return {
        status: 'success',
        data: {
          stockInfo: stockData,
          valuation: valuationAnalysis,
          generatedAt: new Date().toISOString(),
          disclaimer: comprehensiveDisclaimer,
        },
      };
    } catch (error) {
      console.error('Stock valuation error:', error);
      return {
        status: 'error',
        message: error.message || 'Stock valuation failed',
      };
    }
  }
}

export default new StockValuationService();
