/**
 * Parser Service
 * 
 * Handles normalizing and parsing various API responses into standardized formats
 * that the frontend components can work with consistently.
 */
class ParserService {
  /**
   * Normalizes candidate data from various API response formats
   * 
   * @param {Object|Array} data - Raw data from the API
   * @param {string} jobId - The current job ID for context
   * @returns {Array} - Normalized array of candidate objects
   */
  normalizeCandidates(data, jobId = null) {
    // Handle null or undefined data
    if (!data) return [];
    
    console.log('ParserService: Normalizing candidate data', data);
    
    // If there's an error in the response, return an empty array
    if (data.error) {
      console.warn('ParserService: Error in response data:', data.error);
      return [];
    }
    
    // If data is a string, try to parse it as JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('ParserService: Failed to parse string data', e);
        return [];
      }
    }
    
    // Handle API Gateway wrapped responses
    if (data && data.body && typeof data.body === 'string') {
      try {
        const parsedBody = JSON.parse(data.body);
        // Check for errors in parsed body
        if (parsedBody.error) {
          console.warn('ParserService: Error in parsed body:', parsedBody.error);
          return [];
        }
        data = parsedBody;
      } catch (e) {
        console.error('ParserService: Failed to parse body', e);
      }
    }
    
    // If data has a results property that's an array, use that
    if (data && data.results && Array.isArray(data.results)) {
      data = data.results;
    } else if (data && data.query !== undefined && data.results === undefined) {
      // Special case: Query response with no results
      return [];
    }
    
    // If data is already an array, normalize each item
    if (Array.isArray(data)) {
      return data.map(candidate => this.normalizeCandidate(candidate, jobId));
    }
    
    // If data is an object but not an array, convert to array with one item
    if (typeof data === 'object') {
      return [this.normalizeCandidate(data, jobId)];
    }
    
    return [];
  }
  
  /**
   * Normalizes a single candidate object to a standard format
   * 
   * @param {Object} candidate - Raw candidate data
   * @param {string} jobId - The current job ID for context
   * @returns {Object} - Normalized candidate object
   */
  normalizeCandidate(candidate, jobId = null) {
    if (!candidate) return null;
    
    // Standard normalized format
    return {
      // Basic identification
      candidate_id: candidate.candidate_id || candidate.candidateId || candidate.id || null,
      
      // Resume metadata
      name: candidate.name || candidate.file_name || candidate.filename || 
            (candidate.candidate_id ? `Resume ${candidate.candidate_id.substring(0, 8)}` : 'Unknown Resume'),
      
      // Scores (normalize to 0-1 scale)
      score: this.normalizeScore(candidate.score || candidate.match_score || candidate.similarity || 0),
      match_score: this.normalizeScore(candidate.match_score || candidate.similarity || candidate.score || 0),
      
      // Job relationship
      job_id: candidate.job_id || candidate.jobId || candidate.last_ranked_job_id || jobId || null,
      
      // Timestamps
      timestamp: candidate.timestamp || candidate.ranked_at || candidate.created_at || candidate.last_ranked_at || new Date().toISOString(),
      
      // Contact information
      email: candidate.email || candidate.contact_email || null,
      phone: candidate.phone || candidate.contact_phone || null,
      
      // Resume content
      sections: this.normalizeSections(candidate.sections || candidate.parsed_sections || {}),
      
      // Skills and keywords
      entities: candidate.entities || candidate.skills || candidate.extracted_entities || [],
      matched_keywords: this.normalizeMatchedKeywords(candidate)
    };
  }
  
  /**
   * Normalizes a score value to be between 0 and 1
   * 
   * @param {number|string} score - Raw score value
   * @returns {number} - Normalized score between 0 and 1
   */
  normalizeScore(score) {
    // Convert to number if it's a string
    if (typeof score === 'string') {
      score = parseFloat(score);
    }
    
    // Handle NaN or undefined
    if (isNaN(score) || score === undefined) {
      console.warn(`Invalid score value: ${score}, defaulting to 0.5`);
      return 0.5;
    }
    
    // If score is already between 0 and 1, return it
    if (score >= 0 && score <= 1) {
      console.log(`Score ${score} already normalized between 0-1`);
      return score;
    }
    
    // If score is between 0 and 100, convert to 0-1 scale
    if (score >= 0 && score <= 100) {
      const normalizedScore = score / 100;
      console.log(`Normalizing score from ${score} to ${normalizedScore}`);
      return normalizedScore;
    }
    
    // Default fallback for invalid scores
    console.warn(`Invalid score value: ${score}, defaulting to 0.5`);
    return 0.5;
  }
  
  /**
   * Normalizes resume sections from different formats
   * 
   * @param {Object} sections - Raw sections data
   * @returns {Object} - Normalized sections
   */
  normalizeSections(sections) {
    if (!sections || typeof sections !== 'object') {
      return {};
    }
    
    // Clean up section names and content
    const normalizedSections = {};
    
    for (const [key, value] of Object.entries(sections)) {
      // Skip unknown sections
      if (key.toLowerCase() === 'unknown') continue;
      
      // Clean up section name
      const sectionName = this.capitalizeSectionName(key);
      
      // Clean up section content
      let content = value;
      if (typeof content === 'object') {
        content = JSON.stringify(content);
      }
      
      normalizedSections[sectionName] = content;
    }
    
    return normalizedSections;
  }
  
  /**
   * Capitalizes and cleans section names
   * 
   * @param {string} sectionName - Raw section name
   * @returns {string} - Clean, capitalized section name
   */
  capitalizeSectionName(sectionName) {
    if (!sectionName) return 'Other';
    
    // Remove special characters and convert to title case
    return sectionName
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Extract and normalize matched keywords from different API response formats
   * 
   * @param {Object} candidate - Candidate data
   * @returns {Array} - Normalized array of matched keywords
   */
  normalizeMatchedKeywords(candidate) {
    // Check various properties where matched keywords might be found
    const keywords = candidate.matched_keywords || 
                   candidate.matching_keywords || 
                   candidate.key_skills || 
                   candidate.matches;
    
    // If we have an array, use it
    if (keywords && Array.isArray(keywords)) {
      return keywords;
    }
    
    // If we have a string, split it by commas
    if (keywords && typeof keywords === 'string') {
      return keywords.split(',').map(k => k.trim()).filter(k => k);
    }
    
    // If we have match_details, try to extract keywords from it
    if (candidate.match_details) {
      try {
        // If match_details is a string, parse it
        if (typeof candidate.match_details === 'string') {
          const details = JSON.parse(candidate.match_details);
          if (details.matched_skills && Array.isArray(details.matched_skills)) {
            return details.matched_skills;
          }
        } 
        // If it's an object, access the property directly
        else if (candidate.match_details.matched_skills) {
          return candidate.match_details.matched_skills;
        }
      } catch (e) {
        console.warn('ParserService: Failed to extract keywords from match_details', e);
      }
    }
    
    // Fallback to entities/skills if available
    if (candidate.entities && Array.isArray(candidate.entities)) {
      return candidate.entities.slice(0, 5); // Just show top 5
    }
    
    return [];
  }
  
  /**
   * Parse job description response into a standard format
   * 
   * @param {Object} data - Raw job description data
   * @returns {Object} - Normalized job data
   */
  parseJobDescription(data) {
    if (!data) return null;
    
    // Handle API Gateway wrapped responses
    if (data.body && typeof data.body === 'string') {
      try {
        data = JSON.parse(data.body);
      } catch (e) {
        console.error('ParserService: Failed to parse job description body', e);
      }
    }
    
    return {
      job_id: data.job_id || null,
      description: data.job_description || data.description || '',
      title: this.extractJobTitle(data.job_description || data.description || ''),
      key_phrases: data.key_phrases || data.keyPhrases || [],
      entities: data.entities || data.skills || [],
      keywords: data.keywords || data.key_words || []
    };
  }
  
  /**
   * Extract job title from job description
   * 
   * @param {string} description - Job description text
   * @returns {string} - Extracted job title or default
   */
  extractJobTitle(description) {
    if (!description) return 'Untitled Job';
    
    // Look for common patterns that indicate the job title
    const patterns = [
      /job title:\s*([^\n]+)/i,
      /position:\s*([^\n]+)/i,
      /title:\s*([^\n]+)/i,
      /^([^\n.]{5,50})/  // Assume first line could be the title if it's reasonable length
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // If no title found, return the first 50 characters
    return description.substring(0, 50).trim() + '...';
  }
}

export default new ParserService(); 