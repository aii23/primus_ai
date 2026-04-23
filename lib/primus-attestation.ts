import { PrimusZKTLS } from "@primuslabs/zktls-js-sdk";

// ─── Template IDs per AI tool ─────────────────────────────────────────────────
export const PRIMUS_TEMPLATE_IDS = {
  cursor: "e5dd6e17-13ef-43c6-ae76-c47f25ac4fe7",
  claude_console: "741c7000-7f01-4bd6-aa7e-605f955b2399",
  chatgpt: "dc998a8f-2d65-46f5-853f-ef506ae4c62a",
  claude: "49c18b6b-9977-4f5a-aa9d-cc672a969acd",
} as const;

export type PrimusPlatform = keyof typeof PRIMUS_TEMPLATE_IDS;

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AttestationResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  rawAttestation?: unknown;
}

export interface CompletePrimusAttestationInput {
  /** JSON string from the server (connections.primusSignedRequest) */
  signedRequestStr: string;
  appId: string;
  primusEnv: "production" | "development";
}

/**
 * Finish zkTLS in the browser: extension-based attestation + local verify.
 * Signing is done on the server — this path never touches APP_SECRET.
 */
export async function completePrimusAttestationFromSignedRequest<T = unknown>(
  input: CompletePrimusAttestationInput,
): Promise<AttestationResult<T>> {
  const { signedRequestStr, appId, primusEnv } = input;

  const primusZKTLS = new PrimusZKTLS();
  await primusZKTLS.init(appId, undefined, { env: primusEnv });

  const attestation = await primusZKTLS.startAttestation(signedRequestStr);

  const verifyResult = primusZKTLS.verifyAttestation(attestation);

  if (verifyResult === true) {
    let parsedData: T | undefined;
    try {
      const attestationObj =
        typeof attestation === "string" ? JSON.parse(attestation) : attestation;
      if (attestationObj?.data) {
        parsedData = JSON.parse(attestationObj.data) as T;
      }
    } catch (e) {
      console.error("Failed to parse attestation data:", e);
    }

    return {
      success: true,
      message: "Attestation verified successfully!",
      data: parsedData,
      rawAttestation: attestation,
    };
  }

  return {
    success: false,
    message: "Attestation verification failed",
    rawAttestation: attestation,
  };
}
