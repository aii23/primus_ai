import { PrimusZKTLS } from "@primuslabs/zktls-js-sdk";
import { PRIMUS_TEMPLATE_IDS, type PrimusPlatform } from "@/lib/primus-attestation";

// Mirrors AttModeAlgorithmType from the SDK (not publicly re-exported)
type AttModeAlgorithmType = "mpctls" | "proxytls";

function getPrimusEnv(): {
  appId: string;
  appSecret: string;
  primusEnv: "production" | "development";
} {
  const appId = process.env.PRIMUS_APP_ID ?? "";
  const appSecret = process.env.PRIMUS_APP_SECRET ?? "";
  if (!appId || !appSecret) {
    throw new Error("PRIMUS_APP_ID and PRIMUS_APP_SECRET must be set on the server");
  }
  const raw = process.env.PRIMUS_ENV?.toLowerCase();
  const primusEnv: "production" | "development" =
    raw === "development" ? "development" : "production";
  return { appId, appSecret, primusEnv };
}

export interface PrimusSignedRequestPayload {
  appId: string;
  signedRequestStr: string;
  primusEnv: "production" | "development";
}

/**
 * Build a signed Primus attestation request on the server so APP_SECRET never
 * reaches the browser. The client must still run startAttestation via the
 * Primus extension (see completePrimusAttestationFromSignedRequest).
 */
export async function createPrimusSignedRequest(params: {
  userAddress: string;
  platform: PrimusPlatform;
  algorithmType?: AttModeAlgorithmType;
  resultType?: "plain" | "cipher";
}): Promise<PrimusSignedRequestPayload> {
  const {
    userAddress,
    platform,
    algorithmType = "proxytls",
    resultType = "plain",
  } = params;
  const { appId, appSecret, primusEnv } = getPrimusEnv();
  const templateId = PRIMUS_TEMPLATE_IDS[platform];

  const primusZKTLS = new PrimusZKTLS();
  await primusZKTLS.init(appId, appSecret, { env: primusEnv });

  const request = primusZKTLS.generateRequestParams(templateId, userAddress);
  request.setAttMode({ algorithmType, resultType });

  const requestStr = request.toJsonString();
  const signedRequestStr = await primusZKTLS.sign(requestStr);

  return { appId, signedRequestStr, primusEnv };
}
