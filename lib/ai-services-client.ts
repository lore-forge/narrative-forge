/**
 * Definitive AI Services Client for Narrative Forge
 * 
 * This is the single source of truth for all AI service interactions.
 * Built strictly according to AI_SERVICES_API_DOCUMENTATION.md
 * 
 * @module ai-services-client
 */

// Re-export everything from the definitive client
export * from './ai-services-definitive-client'
import { aiServicesClient } from './ai-services-definitive-client'

// Export singleton instance with original name for backward compatibility
export const narrativeAIClient = aiServicesClient

// Export the client class for direct instantiation if needed
export { AIServicesClient } from './ai-services-definitive-client'