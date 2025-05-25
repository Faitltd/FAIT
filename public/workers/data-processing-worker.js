/**
 * Web Worker for Data Processing
 * 
 * This worker handles computationally intensive data processing tasks to keep
 * the main thread responsive, including:
 * - Data filtering and sorting
 * - Statistical calculations
 * - Data transformation
 * - Search operations
 */

// Handle messages from the main thread
self.onmessage = function(e) {
  const { id, action, data } = e.data;
  
  try {
    let result;
    
    switch (action) {
      case 'filter':
        result = filterData(data.items, data.filters);
        break;
      case 'sort':
        result = sortData(data.items, data.sortBy, data.sortDirection);
        break;
      case 'search':
        result = searchData(data.items, data.query, data.fields);
        break;
      case 'transform':
        result = transformData(data.items, data.transformations);
        break;
      case 'calculate-statistics':
        result = calculateStatistics(data.items, data.fields);
        break;
      case 'group-by':
        result = groupBy(data.items, data.field);
        break;
      case 'paginate':
        result = paginateData(data.items, data.page, data.pageSize);
        break;
      case 'process-large-dataset':
        result = processLargeDataset(data.chunks, data.operation);
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
 * Filter data based on filters
 * @param {Array} items - The data to filter
 * @param {Object} filters - The filters to apply
 * @returns {Array} - The filtered data
 */
function filterData(items, filters) {
  if (!items || !filters) {
    return items;
  }
  
  return items.filter(item => {
    return Object.entries(filters).every(([field, value]) => {
      // Handle array values (OR condition)
      if (Array.isArray(value)) {
        return value.some(val => matchesFilter(item[field], val));
      }
      
      // Handle object values (complex filters)
      if (value && typeof value === 'object') {
        return matchesComplexFilter(item[field], value);
      }
      
      // Handle simple values
      return matchesFilter(item[field], value);
    });
  });
}

/**
 * Check if a value matches a filter
 * @param {any} itemValue - The value to check
 * @param {any} filterValue - The filter value
 * @returns {boolean} - Whether the value matches the filter
 */
function matchesFilter(itemValue, filterValue) {
  // Handle null/undefined
  if (filterValue === null || filterValue === undefined) {
    return itemValue === filterValue;
  }
  
  // Handle regex
  if (filterValue instanceof RegExp) {
    return filterValue.test(String(itemValue));
  }
  
  // Handle strings (case-insensitive contains)
  if (typeof filterValue === 'string' && typeof itemValue === 'string') {
    return itemValue.toLowerCase().includes(filterValue.toLowerCase());
  }
  
  // Handle other values (exact match)
  return itemValue === filterValue;
}

/**
 * Check if a value matches a complex filter
 * @param {any} itemValue - The value to check
 * @param {Object} filter - The complex filter
 * @returns {boolean} - Whether the value matches the filter
 */
function matchesComplexFilter(itemValue, filter) {
  // Handle comparison operators
  if (filter.$eq !== undefined) return itemValue === filter.$eq;
  if (filter.$ne !== undefined) return itemValue !== filter.$ne;
  if (filter.$gt !== undefined) return itemValue > filter.$gt;
  if (filter.$gte !== undefined) return itemValue >= filter.$gte;
  if (filter.$lt !== undefined) return itemValue < filter.$lt;
  if (filter.$lte !== undefined) return itemValue <= filter.$lte;
  if (filter.$in !== undefined) return filter.$in.includes(itemValue);
  if (filter.$nin !== undefined) return !filter.$nin.includes(itemValue);
  if (filter.$contains !== undefined) return String(itemValue).includes(String(filter.$contains));
  if (filter.$startsWith !== undefined) return String(itemValue).startsWith(String(filter.$startsWith));
  if (filter.$endsWith !== undefined) return String(itemValue).endsWith(String(filter.$endsWith));
  
  // Default to true if no operators are found
  return true;
}

/**
 * Sort data based on sort criteria
 * @param {Array} items - The data to sort
 * @param {string|Array} sortBy - The field(s) to sort by
 * @param {string} sortDirection - The sort direction ('asc' or 'desc')
 * @returns {Array} - The sorted data
 */
function sortData(items, sortBy, sortDirection = 'asc') {
  if (!items || !sortBy) {
    return items;
  }
  
  const sortFields = Array.isArray(sortBy) ? sortBy : [sortBy];
  const sortDirections = Array.isArray(sortDirection) 
    ? sortDirection 
    : Array(sortFields.length).fill(sortDirection);
  
  return [...items].sort((a, b) => {
    for (let i = 0; i < sortFields.length; i++) {
      const field = sortFields[i];
      const direction = sortDirections[i] === 'desc' ? -1 : 1;
      
      if (a[field] < b[field]) return -1 * direction;
      if (a[field] > b[field]) return 1 * direction;
    }
    
    return 0;
  });
}

/**
 * Search data based on a query
 * @param {Array} items - The data to search
 * @param {string} query - The search query
 * @param {Array} fields - The fields to search in
 * @returns {Array} - The search results
 */
function searchData(items, query, fields) {
  if (!items || !query || !fields) {
    return items;
  }
  
  const searchQuery = query.toLowerCase();
  
  return items.filter(item => {
    return fields.some(field => {
      const value = item[field];
      
      if (value === null || value === undefined) {
        return false;
      }
      
      return String(value).toLowerCase().includes(searchQuery);
    });
  });
}

/**
 * Transform data based on transformations
 * @param {Array} items - The data to transform
 * @param {Object} transformations - The transformations to apply
 * @returns {Array} - The transformed data
 */
function transformData(items, transformations) {
  if (!items || !transformations) {
    return items;
  }
  
  return items.map(item => {
    const result = { ...item };
    
    Object.entries(transformations).forEach(([field, transformation]) => {
      if (typeof transformation === 'function') {
        result[field] = transformation(item);
      } else if (typeof transformation === 'string') {
        // Handle string transformations (e.g., 'uppercase', 'lowercase')
        switch (transformation) {
          case 'uppercase':
            result[field] = String(item[field]).toUpperCase();
            break;
          case 'lowercase':
            result[field] = String(item[field]).toLowerCase();
            break;
          case 'trim':
            result[field] = String(item[field]).trim();
            break;
          default:
            result[field] = item[field];
        }
      }
    });
    
    return result;
  });
}
