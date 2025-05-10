/**
 * Web Worker for Data Processing
 * 
 * This worker handles computationally intensive data processing tasks
 * to keep the main thread responsive, including:
 * - Sorting and filtering large datasets
 * - Complex calculations and aggregations
 * - Text analysis and processing
 * - Data transformation and normalization
 */

// Handle messages from the main thread
self.onmessage = function(e) {
  const { id, action, data } = e.data;
  
  try {
    let result;
    
    switch (action) {
      case 'sort':
        result = sortData(data.items, data.options);
        break;
      case 'filter':
        result = filterData(data.items, data.filters);
        break;
      case 'search':
        result = searchData(data.items, data.query, data.options);
        break;
      case 'aggregate':
        result = aggregateData(data.items, data.options);
        break;
      case 'analyze-text':
        result = analyzeText(data.text, data.options);
        break;
      case 'transform':
        result = transformData(data.items, data.transformations);
        break;
      case 'paginate':
        result = paginateData(data.items, data.options);
        break;
      case 'calculate-statistics':
        result = calculateStatistics(data.items, data.options);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // Send the result back to the main thread
    self.postMessage({
      id,
      success: true,
      result
    });
  } catch (error) {
    // Send error back to the main thread
    self.postMessage({
      id,
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};

/**
 * Sort data based on specified criteria
 */
function sortData(items, options = {}) {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  const { 
    sortBy = 'id', 
    direction = 'asc',
    type = 'string',
    nullsPosition = 'last'
  } = options;
  
  // Create a copy of the array to avoid modifying the original
  const result = [...items];
  
  result.sort((a, b) => {
    let valueA = getNestedProperty(a, sortBy);
    let valueB = getNestedProperty(b, sortBy);
    
    // Handle null/undefined values
    if (valueA === null || valueA === undefined) {
      return nullsPosition === 'first' 
        ? (direction === 'asc' ? -1 : 1) 
        : (direction === 'asc' ? 1 : -1);
    }
    
    if (valueB === null || valueB === undefined) {
      return nullsPosition === 'first' 
        ? (direction === 'asc' ? 1 : -1) 
        : (direction === 'asc' ? -1 : 1);
    }
    
    // Convert values based on type
    switch (type) {
      case 'number':
        valueA = Number(valueA);
        valueB = Number(valueB);
        break;
      case 'date':
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
        break;
      case 'boolean':
        valueA = Boolean(valueA);
        valueB = Boolean(valueB);
        break;
      default:
        valueA = String(valueA);
        valueB = String(valueB);
    }
    
    // Compare values
    if (valueA < valueB) {
      return direction === 'asc' ? -1 : 1;
    }
    
    if (valueA > valueB) {
      return direction === 'asc' ? 1 : -1;
    }
    
    return 0;
  });
  
  return result;
}

/**
 * Filter data based on specified criteria
 */
function filterData(items, filters = []) {
  if (!items || !Array.isArray(items) || !filters || !Array.isArray(filters)) {
    return items || [];
  }
  
  return items.filter(item => {
    // An item passes if it matches all filters
    return filters.every(filter => {
      const { field, operator, value } = filter;
      const itemValue = getNestedProperty(item, field);
      
      switch (operator) {
        case 'eq':
          return itemValue === value;
        case 'neq':
          return itemValue !== value;
        case 'gt':
          return itemValue > value;
        case 'gte':
          return itemValue >= value;
        case 'lt':
          return itemValue < value;
        case 'lte':
          return itemValue <= value;
        case 'contains':
          return String(itemValue).includes(String(value));
        case 'startsWith':
          return String(itemValue).startsWith(String(value));
        case 'endsWith':
          return String(itemValue).endsWith(String(value));
        case 'in':
          return Array.isArray(value) && value.includes(itemValue);
        case 'nin':
          return Array.isArray(value) && !value.includes(itemValue);
        case 'between':
          return Array.isArray(value) && value.length === 2 && 
                 itemValue >= value[0] && itemValue <= value[1];
        case 'exists':
          return value ? (itemValue !== null && itemValue !== undefined) : 
                        (itemValue === null || itemValue === undefined);
        default:
          return true;
      }
    });
  });
}

/**
 * Search data for a query string
 */
function searchData(items, query, options = {}) {
  if (!items || !Array.isArray(items) || !query) {
    return items || [];
  }
  
  const { 
    fields = [], 
    fuzzy = true,
    caseSensitive = false,
    minScore = 0,
    includeScore = false
  } = options;
  
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const searchTerms = searchQuery.split(/\s+/).filter(term => term.length > 0);
  
  // If no search terms, return all items
  if (searchTerms.length === 0) {
    return items;
  }
  
  const results = items.map(item => {
    // If no fields specified, search all string fields
    const searchFields = fields.length > 0 
      ? fields 
      : Object.keys(item).filter(key => typeof item[key] === 'string');
    
    let maxScore = 0;
    let matches = [];
    
    searchFields.forEach(field => {
      const value = getNestedProperty(item, field);
      
      if (value === null || value === undefined) {
        return;
      }
      
      const stringValue = caseSensitive ? String(value) : String(value).toLowerCase();
      
      // Calculate score for this field
      let fieldScore = 0;
      let fieldMatches = [];
      
      searchTerms.forEach(term => {
        if (fuzzy) {
          // Fuzzy search - partial match
          if (stringValue.includes(term)) {
            // Higher score for exact matches
            const score = stringValue === term ? 1 : 0.5;
            fieldScore += score;
            fieldMatches.push({ field, term, score });
          }
        } else {
          // Exact match only
          if (stringValue === term) {
            fieldScore += 1;
            fieldMatches.push({ field, term, score: 1 });
          }
        }
      });
      
      // Update max score and matches
      if (fieldScore > maxScore) {
        maxScore = fieldScore;
      }
      
      matches = [...matches, ...fieldMatches];
    });
    
    // Normalize score based on number of search terms
    const normalizedScore = searchTerms.length > 0 ? maxScore / searchTerms.length : 0;
    
    return {
      item,
      score: normalizedScore,
      matches
    };
  });
  
  // Filter by minimum score and sort by score (descending)
  const filteredResults = results
    .filter(result => result.score >= minScore)
    .sort((a, b) => b.score - a.score);
  
  // Return items with or without scores
  return includeScore 
    ? filteredResults 
    : filteredResults.map(result => result.item);
}

/**
 * Aggregate data based on specified criteria
 */
function aggregateData(items, options = {}) {
  if (!items || !Array.isArray(items)) {
    return {};
  }
  
  const { 
    groupBy, 
    aggregations = {},
    includeItems = false
  } = options;
  
  // If no groupBy, perform aggregations on the entire dataset
  if (!groupBy) {
    return performAggregations(items, aggregations);
  }
  
  // Group items
  const groups = {};
  
  items.forEach(item => {
    const groupValue = getNestedProperty(item, groupBy);
    const groupKey = groupValue !== null && groupValue !== undefined 
      ? String(groupValue) 
      : 'null';
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(item);
  });
  
  // Perform aggregations on each group
  const result = {};
  
  Object.entries(groups).forEach(([key, groupItems]) => {
    result[key] = {
      ...performAggregations(groupItems, aggregations),
      count: groupItems.length
    };
    
    if (includeItems) {
      result[key].items = groupItems;
    }
  });
  
  return result;
}

/**
 * Perform aggregations on a dataset
 */
function performAggregations(items, aggregations) {
  const result = {};
  
  Object.entries(aggregations).forEach(([outputField, config]) => {
    const { field, operation } = config;
    
    switch (operation) {
      case 'sum':
        result[outputField] = items.reduce(
          (sum, item) => sum + (Number(getNestedProperty(item, field)) || 0), 
          0
        );
        break;
      case 'avg':
        result[outputField] = items.length > 0
          ? items.reduce(
              (sum, item) => sum + (Number(getNestedProperty(item, field)) || 0), 
              0
            ) / items.length
          : 0;
        break;
      case 'min':
        result[outputField] = items.length > 0
          ? Math.min(...items.map(item => Number(getNestedProperty(item, field)) || 0))
          : 0;
        break;
      case 'max':
        result[outputField] = items.length > 0
          ? Math.max(...items.map(item => Number(getNestedProperty(item, field)) || 0))
          : 0;
        break;
      case 'count':
        result[outputField] = items.length;
        break;
      case 'countDistinct':
        result[outputField] = new Set(
          items.map(item => getNestedProperty(item, field))
        ).size;
        break;
      default:
        result[outputField] = null;
    }
  });
  
  return result;
}

/**
 * Analyze text for various metrics
 */
function analyzeText(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return {};
  }
  
  const { 
    operations = ['wordCount', 'sentenceCount', 'characterCount'],
    stopWords = []
  } = options;
  
  const result = {};
  
  // Perform requested operations
  operations.forEach(operation => {
    switch (operation) {
      case 'wordCount':
        result.wordCount = countWords(text);
        break;
      case 'sentenceCount':
        result.sentenceCount = countSentences(text);
        break;
      case 'characterCount':
        result.characterCount = text.length;
        break;
      case 'topWords':
        result.topWords = findTopWords(text, options.topWordsCount || 10, stopWords);
        break;
      case 'readability':
        result.readability = calculateReadability(text);
        break;
      case 'sentiment':
        result.sentiment = analyzeSentiment(text);
        break;
      case 'language':
        result.language = detectLanguage(text);
        break;
      default:
        // Ignore unknown operations
        break;
    }
  });
  
  return result;
}

/**
 * Count words in text
 */
function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count sentences in text
 */
function countSentences(text) {
  return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
}

/**
 * Find top words in text
 */
function findTopWords(text, count = 10, stopWords = []) {
  const words = text.toLowerCase()
    .split(/\s+/)
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 0 && !stopWords.includes(word));
  
  const wordCounts = {};
  
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Calculate readability metrics
 */
function calculateReadability(text) {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  if (words.length === 0 || sentences.length === 0) {
    return { score: 0, level: 'unknown' };
  }
  
  // Calculate average words per sentence
  const avgWordsPerSentence = words.length / sentences.length;
  
  // Calculate average word length
  const totalCharacters = words.reduce((sum, word) => sum + word.length, 0);
  const avgWordLength = totalCharacters / words.length;
  
  // Simple readability score (higher is more complex)
  const score = (avgWordsPerSentence * 0.39) + (avgWordLength * 5.8) - 15.59;
  
  // Determine reading level
  let level;
  if (score < 30) {
    level = 'very easy';
  } else if (score < 50) {
    level = 'easy';
  } else if (score < 60) {
    level = 'moderate';
  } else if (score < 70) {
    level = 'difficult';
  } else {
    level = 'very difficult';
  }
  
  return {
    score,
    level,
    avgWordsPerSentence,
    avgWordLength
  };
}

/**
 * Transform data based on specified transformations
 */
function transformData(items, transformations = {}) {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  return items.map(item => {
    const result = { ...item };
    
    Object.entries(transformations).forEach(([field, transformation]) => {
      if (typeof transformation === 'function') {
        // This won't work in a web worker since functions can't be serialized
        // It's here for documentation purposes
        result[field] = transformation(getNestedProperty(item, field), item);
      } else if (typeof transformation === 'string') {
        // Handle string-based transformations
        const value = getNestedProperty(item, field);
        
        switch (transformation) {
          case 'uppercase':
            result[field] = String(value).toUpperCase();
            break;
          case 'lowercase':
            result[field] = String(value).toLowerCase();
            break;
          case 'trim':
            result[field] = String(value).trim();
            break;
          case 'number':
            result[field] = Number(value);
            break;
          case 'boolean':
            result[field] = Boolean(value);
            break;
          case 'string':
            result[field] = String(value);
            break;
          default:
            // Keep original value
            break;
        }
      } else if (typeof transformation === 'object') {
        // Handle object-based transformations
        const { operation, args = [] } = transformation;
        const value = getNestedProperty(item, field);
        
        switch (operation) {
          case 'replace':
            result[field] = String(value).replace(args[0], args[1]);
            break;
          case 'substring':
            result[field] = String(value).substring(args[0], args[1]);
            break;
          case 'round':
            result[field] = Math.round(Number(value) * Math.pow(10, args[0])) / Math.pow(10, args[0]);
            break;
          case 'format':
            // Simple formatting with placeholders
            result[field] = args[0].replace(/\{(\w+)\}/g, (match, key) => 
              getNestedProperty(item, key) || ''
            );
            break;
          default:
            // Keep original value
            break;
        }
      }
    });
    
    return result;
  });
}

/**
 * Paginate data
 */
function paginateData(items, options = {}) {
  if (!items || !Array.isArray(items)) {
    return {
      items: [],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
      }
    };
  }
  
  const { 
    page = 1, 
    pageSize = 10,
    includeAll = false
  } = options;
  
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  const paginatedItems = includeAll 
    ? items 
    : items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    pagination: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages
    }
  };
}

/**
 * Calculate statistics for numeric fields
 */
function calculateStatistics(items, options = {}) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {};
  }
  
  const { fields = [] } = options;
  
  // If no fields specified, use all numeric fields
  const statsFields = fields.length > 0 
    ? fields 
    : Object.keys(items[0]).filter(key => {
        const value = items[0][key];
        return typeof value === 'number' || !isNaN(Number(value));
      });
  
  const result = {};
  
  statsFields.forEach(field => {
    const values = items
      .map(item => Number(getNestedProperty(item, field)))
      .filter(value => !isNaN(value));
    
    if (values.length === 0) {
      result[field] = {
        count: 0,
        sum: 0,
        avg: 0,
        min: null,
        max: null,
        median: null,
        variance: 0,
        stdDev: 0
      };
      return;
    }
    
    // Sort values for median and percentiles
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Calculate statistics
    const count = values.length;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / count;
    const min = sortedValues[0];
    const max = sortedValues[count - 1];
    
    // Median
    const midIndex = Math.floor(count / 2);
    const median = count % 2 === 0
      ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
      : sortedValues[midIndex];
    
    // Variance and standard deviation
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / count;
    const stdDev = Math.sqrt(variance);
    
    result[field] = {
      count,
      sum,
      avg,
      min,
      max,
      median,
      variance,
      stdDev
    };
  });
  
  return result;
}

/**
 * Get a nested property from an object using dot notation
 */
function getNestedProperty(obj, path) {
  if (!obj || !path) {
    return undefined;
  }
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    
    value = value[key];
  }
  
  return value;
}

/**
 * Very basic sentiment analysis
 */
function analyzeSentiment(text) {
  // This is a very basic implementation
  // Real sentiment analysis would use more sophisticated algorithms
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'happy', 'positive', 'beautiful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad', 'negative', 'ugly', 'poor'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (positiveWords.includes(cleanWord)) {
      positiveCount++;
    } else if (negativeWords.includes(cleanWord)) {
      negativeCount++;
    }
  });
  
  const score = (positiveCount - negativeCount) / (positiveCount + negativeCount + 1);
  
  return {
    score,
    positive: positiveCount,
    negative: negativeCount,
    sentiment: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral'
  };
}

/**
 * Very basic language detection
 */
function detectLanguage(text) {
  // This is a very basic implementation
  // Real language detection would use more sophisticated algorithms
  
  // Common words in different languages
  const languageWords = {
    english: ['the', 'and', 'is', 'in', 'it', 'you', 'that', 'was', 'for', 'on'],
    spanish: ['el', 'la', 'que', 'de', 'y', 'a', 'en', 'un', 'ser', 'se'],
    french: ['le', 'la', 'de', 'et', 'est', 'en', 'un', 'une', 'du', 'dans'],
    german: ['der', 'die', 'und', 'ist', 'das', 'in', 'zu', 'den', 'mit', 'nicht']
  };
  
  const words = text.toLowerCase().split(/\s+/);
  const counts = {};
  
  Object.keys(languageWords).forEach(language => {
    counts[language] = 0;
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (languageWords[language].includes(cleanWord)) {
        counts[language]++;
      }
    });
  });
  
  // Find the language with the highest count
  let detectedLanguage = 'unknown';
  let maxCount = 0;
  
  Object.entries(counts).forEach(([language, count]) => {
    if (count > maxCount) {
      maxCount = count;
      detectedLanguage = language;
    }
  });
  
  // If no language has a significant count, return unknown
  if (maxCount < 2) {
    detectedLanguage = 'unknown';
  }
  
  return {
    language: detectedLanguage,
    confidence: maxCount / words.length,
    counts
  };
}
