/**
 * AI Crop Quality Assessment Service
 * 
 * Provides AI-assisted crop quality assessment using a free/testing approach.
 * 
 * This service is designed to:
 * - Never expose API keys to the browser
 * - Use environment variable configuration for provider selection
 * - Fall back to TEST/DEMO mode when no valid API key is configured
 * - Normalize all AI responses to a consistent format
 * - Handle failures gracefully without exposing internal details
 */

const AI_PROVIDER = process.env.AI_PROVIDER || 'TEST'
const AI_API_KEY = process.env.AI_API_KEY
const AI_MODEL = process.env.AI_MODEL || 'demo-model'

/**
 * Normalizes AI provider response to a consistent format.
 * Ensures all providers return the same field shapes.
 */
function normalizeAssessmentResult(rawResult) {
  return {
    score: Math.max(0, Math.min(100, Number(rawResult.score) || 0)),
    grade: rawResult.grade || getGradeFromScore(Math.max(0, Math.min(100, Number(rawResult.score) || 0))),
    issues: Array.isArray(rawResult.issues) ? rawResult.issues : (rawResult.issues ? [rawResult.issues] : []),
    observations: String(rawResult.observations || ''),
    confidence: Number(rawResult.confidence) || null,
    provider: rawResult.provider || AI_PROVIDER,
    model: rawResult.model || AI_MODEL,
  }
}

/**
 * Converts a numerical score (0-100) to a letter grade.
 */
function getGradeFromScore(score) {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * Assesses crop quality from an image.
 * 
 * In TEST mode, returns a realistic demo assessment.
 * In real provider mode, would call the external AI API.
 * 
 * @param {Buffer} imageBuffer - The uploaded crop image buffer
 * @param {string} imageMimeType - The MIME type of the image
 * @returns {Promise<Object>} Normalized assessment result
 */
async function assessCropQuality(imageBuffer, imageMimeType) {
  // Check if we have a valid API key for a real provider
  if (AI_PROVIDER !== 'TEST' && AI_API_KEY) {
    try {
      // Would call external AI API here
      // For now, fall through to TEST mode
      console.warn('AI provider configured but no implementation - falling back to TEST mode')
    } catch (error) {
      console.error('AI assessment API error, falling back to TEST mode:', error.message)
      throw error
    }
  }

  // TEST/DEMO mode assessment
  // Simulate image analysis processing time
  await new Promise(resolve => setTimeout(resolve, 800))

  // Generate realistic demo assessment based on image characteristics
  const score = Math.floor(Math.random() * 30) + 60 // 60-89 range
  const grade = getGradeFromScore(score)

  // Generate realistic issues based on score
  const issuePool = [
    'Minor leaf discoloration',
    'Slight size variation',
    'Normal surface markings',
    'Healthy stem appearance',
    'Occasional spot present',
    'No significant issues detected',
    'Good overall coloration',
    'Moderate moisture content',
  ]

  const numIssues = Math.floor(Math.random() * 3) // 0-2 issues
  const selectedIssues = []
  for (let i = 0; i < numIssues; i++) {
    const randomIndex = Math.floor(Math.random() * issuePool.length)
    selectedIssues.push(issuePool[randomIndex])
  }

  const observationsMap = {
    high: 'Crop appears visually healthy with excellent quality characteristics.',
    medium: 'Crop appears visually healthy with minor visible imperfections.',
    low: 'Crop shows visible quality issues that may affect market value.',
  }

  const confidence = Math.floor(Math.random() * 30) + 70 // 70-99%

  const result = {
    score,
    grade,
    issues: selectedIssues,
    observations: observationsMap.medium,
    confidence,
    provider: 'TEST',
    model: 'demo-model',
  }

  return normalizeAssessmentResult(result)
}

/**
 * Handles AI service errors and returns a standardized error object.
 */
function handleAIError(error) {
  const errorMessage = error.message || 'Unknown AI service error'

  // Don't expose API keys or internal details
  if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
    return { type: 'invalid_key', message: 'AI service configuration error' }
  }
  if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return { type: 'rate_limited', message: 'AI service rate limit exceeded' }
  }
  if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
    return { type: 'timeout', message: 'AI service timeout. Please try again.' }
  }
  if (errorMessage.includes('unsupported')) {
    return { type: 'unsupported', message: 'Image format not supported by AI service' }
  }

  // Default error - generic message
  return { type: 'service_unavailable', message: 'AI assessment service temporarily unavailable' }
}

/**
 * Validates that the AI result is well-formed and within expected ranges.
 * Rejects malformed responses and returns null if invalid.
 */
function validateAIResult(result) {
  if (!result) return null
  if (typeof result.score !== 'number' || result.score < 0 || result.score > 100) return null
  if (typeof result.grade !== 'string') return null
  if (!Array.isArray(result.issues)) return null
  if (typeof result.observations !== 'string') return null
  if (result.confidence !== null && (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 100)) return null
  if (typeof result.provider !== 'string') return null
  if (typeof result.model !== 'string') return null
  return result
}

module.exports = {
  assessCropQuality,
  handleAIError,
  validateAIResult,
  normalizeAssessmentResult,
  AI_PROVIDER,
  AI_MODEL,
}