import { PrimusZKTLS } from '@primuslabs/zktls-js-sdk'

// Mirrors AttModeAlgorithmType from the SDK (not publicly re-exported)
type AttModeAlgorithmType = 'mpctls' | 'proxytls'

// ─── Primus app credentials ──────────────────────────────────────────────────
// NOTE: These are exposed client-side intentionally for now.
// Move to a backend route once the server-side integration is ready.
const APP_ID = process.env.NEXT_PUBLIC_PRIMUS_APP_ID ?? ''
const APP_SECRET = process.env.NEXT_PUBLIC_PRIMUS_APP_SECRET ?? ''
const USER_ADDRESS = process.env.NEXT_PUBLIC_PRIMUS_USER_ADDRESS ?? ''

// ─── Template IDs per AI tool ─────────────────────────────────────────────────
export const PRIMUS_TEMPLATE_IDS = {
  cursor:        '8a2eeeb1-ccef-468e-9357-e231ab5005e6',
  claude_console: '741c7000-7f01-4bd6-aa7e-605f955b2399',
  chatgpt:       'dc998a8f-2d65-46f5-853f-ef506ae4c62a',
  claude:        '49c18b6b-9977-4f5a-aa9d-cc672a969acd',
} as const

export type PrimusPlatform = keyof typeof PRIMUS_TEMPLATE_IDS

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AttestationResult<T = unknown> {
  success: boolean
  message: string
  data?: T
  rawAttestation?: unknown
}

export interface AttestationOptions {
  templateId: string
  algorithmType?: AttModeAlgorithmType
  resultType?: 'plain' | 'cipher'
}

// ─── Core attestation runner ──────────────────────────────────────────────────
export async function runAttestation<T = unknown>(
  options: AttestationOptions,
): Promise<AttestationResult<T>> {
  const { templateId, algorithmType = 'proxytls', resultType = 'plain' } = options

  const primusZKTLS = new PrimusZKTLS()

  console.log('primusZKTLS=', primusZKTLS)
  const initResult = await primusZKTLS.init(APP_ID, APP_SECRET)
  console.log('primusProof initAttestationResult=', initResult)

  const request = primusZKTLS.generateRequestParams(templateId, USER_ADDRESS)
  request.setAttMode({ algorithmType, resultType })

  const requestStr = request.toJsonString()
  const signedRequestStr = await primusZKTLS.sign(requestStr)
  const attestation = await primusZKTLS.startAttestation(signedRequestStr)
  console.log('attestation=', attestation)

  const verifyResult = primusZKTLS.verifyAttestation(attestation)
  console.log('verifyResult=', verifyResult)

  if (verifyResult === true) {
    let parsedData: T | undefined
    try {
      const attestationObj =
        typeof attestation === 'string' ? JSON.parse(attestation) : attestation
      if (attestationObj?.data) {
        parsedData = JSON.parse(attestationObj.data) as T
      }
    } catch (e) {
      console.error('Failed to parse attestation data:', e)
    }

    return {
      success: true,
      message: 'Attestation verified successfully!',
      data: parsedData,
      rawAttestation: attestation,
    }
  }

  return {
    success: false,
    message: 'Attestation verification failed',
    rawAttestation: attestation,
  }
}

// ─── Convenience helper ───────────────────────────────────────────────────────
export async function attestPlatform<T = unknown>(
  platform: PrimusPlatform,
  algorithmType: AttModeAlgorithmType = 'proxytls',
): Promise<AttestationResult<T>> {
  return runAttestation<T>({
    templateId: PRIMUS_TEMPLATE_IDS[platform],
    algorithmType,
  })
}
