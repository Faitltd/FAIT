/**
 * Sample text processor for the process-large-file.js script
 * 
 * This processor analyzes text content and returns statistics.
 */

/**
 * Process a chunk of text
 * @param {string} chunk - The chunk of text to process
 * @param {number} index - The index of the chunk
 * @returns {object} - Processing results
 */
export async function processor(chunk, index) {
  // Count words
  const words = chunk.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Count sentences
  const sentences = chunk.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const sentenceCount = sentences.length;
  
  // Count paragraphs
  const paragraphs = chunk.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
  const paragraphCount = paragraphs.length;
  
  // Calculate average word length
  const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
  const averageWordLength = wordCount > 0 ? totalWordLength / wordCount : 0;
  
  // Calculate average sentence length
  const averageSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  // Find most common words (top 10)
  const wordFrequency = {};
  for (const word of words) {
    const normalizedWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (normalizedWord.length > 3) { // Skip short words
      wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
    }
  }
  
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
  
  return {
    chunkIndex: index,
    wordCount,
    sentenceCount,
    paragraphCount,
    averageWordLength,
    averageSentenceLength,
    topWords,
    // Include a sample of the first 100 characters
    sample: chunk.substring(0, 100) + (chunk.length > 100 ? '...' : '')
  };
}

// Default export for ES modules
export default processor;
