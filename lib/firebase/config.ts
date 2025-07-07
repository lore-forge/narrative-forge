import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

// Client-side Firebase config
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Admin SDK initialization
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  try {
    // Parse service account credentials
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    
    if (!serviceAccountKey) {
      throw new Error('Firebase service account key not found in environment variables')
    }

    let credentials
    try {
      credentials = JSON.parse(serviceAccountKey)
    } catch (parseError) {
      console.error('Failed to parse Firebase service account key:', parseError)
      throw new Error('Invalid Firebase service account key format')
    }

    // Ensure private key has proper newlines
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n')
    }

    const app = initializeApp({
      credential: cert(credentials),
      projectId: credentials.project_id,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })

    console.log('✅ Firebase Admin initialized successfully')
    return app
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error)
    throw error
  }
}

// Initialize Firebase Admin
const adminApp = initializeFirebaseAdmin()

// Export admin services
export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)
export const adminStorage = getStorage(adminApp)

// Firestore collections for Narrative Forge
export const COLLECTIONS = {
  STORIES: 'narrative_stories',
  CHAPTERS: 'narrative_chapters', 
  STORY_CHARACTERS: 'narrative_story_characters',
  USER_PROGRESS: 'narrative_user_progress',
  STORY_TEMPLATES: 'narrative_story_templates',
  COLLABORATIONS: 'narrative_collaborations',
  GENERATED_IMAGES: 'narrative_generated_images',
  GENERATED_AUDIO: 'narrative_generated_audio',
  SKILL_ASSESSMENTS: 'narrative_skill_assessments',
  WRITING_GOALS: 'narrative_writing_goals',
  STORY_ANALYTICS: 'narrative_story_analytics',
} as const

// Validation function for Firebase configuration
export function validateFirebaseConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ]

  const adminRequiredVars = [
    'FIREBASE_SERVICE_ACCOUNT_KEY',
  ]

  const missingVars = []

  // Check client config
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar)
    }
  }

  // Check admin config (server-side only)
  if (typeof window === 'undefined') {
    for (const envVar of adminRequiredVars) {
      if (!process.env[envVar] && !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        missingVars.push(envVar)
      }
    }
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`)
  }

  return true
}

// Helper to get collection reference
export function getCollection(collectionName: keyof typeof COLLECTIONS) {
  return adminDb.collection(COLLECTIONS[collectionName])
}

// Helper to get document reference
export function getDocument(collectionName: keyof typeof COLLECTIONS, docId: string) {
  return adminDb.collection(COLLECTIONS[collectionName]).doc(docId)
}

// Initialize validation on import
try {
  validateFirebaseConfig()
} catch (error) {
  console.warn('Firebase configuration validation failed:', error)
}