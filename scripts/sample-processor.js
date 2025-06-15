/**
 * Sample processor function for the process-large-input.js script
 * 
 * This processor counts words, sentences, and paragraphs in the input text.
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
  
  return {
    chunkIndex: index,
    wordCount,
    sentenceCount,
    paragraphCount,
    averageWordLength,
    averageSentenceLength,
    // Include a sample of the first 100 characters
    sample: chunk.substring(0, 100) + (chunk.length > 100 ? '...' : '')
  };
}

// Default export for ES modules
export default processor;
