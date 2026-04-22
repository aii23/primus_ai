"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Github,
  Linkedin,
  CheckCircle2,
  Loader2,
  Wallet,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { SiweMessage } from "siwe";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  "Aggregate your identity across platforms",
  "Build verifiable reputation proofs",
  "Unlock achievements based on real activity",
  "Share trusted credentials anywhere",
];

type SignInStep = "idle" | "signing" | "verifying" | "error";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function LoginPage() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [step, setStep] = useState<SignInStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const siweLabel: Record<SignInStep, string> = {
    idle: "Sign in with Ethereum",
    signing: "Sign the message in your wallet…",
    verifying: "Verifying signature…",
    error: "Try again",
  };

  async function handleSiweSignIn() {
    if (!address) return;
    setError(null);
    setStep("signing");

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        setError("No Ethereum wallet found. Please install MetaMask.");
        setStep("error");
        return;
      }

      const chainIdHex: string = await ethereum.request({
        method: "eth_chainId",
      });
      const chainId = parseInt(chainIdHex, 16);

      const nonceRes = await fetch(`/api/nonce?address=${address}`);
      if (!nonceRes.ok) throw new Error("Failed to fetch nonce");
      const { nonce } = await nonceRes.json();

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to TrustGraph to verify your developer identity.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });
      const messageString = message.prepareMessage();

      const signature: string = await ethereum.request({
        method: "personal_sign",
        params: [messageString, address],
      });

      setStep("verifying");
      const result = await signIn("credentials", {
        message: messageString,
        signature,
        redirect: false,
      });

      if (result?.error) {
        setError("Signature verification failed. Please try again.");
        setStep("error");
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      if (err?.code === 4001) {
        setError("Signature request cancelled.");
      } else {
        setError(err?.message ?? "Unexpected error. Please try again.");
      }
      setStep("error");
    }
  }

  const isSiweLoading = step === "signing" || step === "verifying";

  // Prefer MetaMask connector; fall back to the first available one
  const primaryConnector =
    connectors.find((c) => c.name === "MetaMask") ?? connectors[0];

  return (
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary/10 via-background to-background p-12">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="size-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            TrustGraph
          </span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-balance">
              Build your verifiable developer reputation
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Connect your platforms, aggregate your achievements, and create
              cryptographic proofs of your professional identity.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-primary shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Github className="size-4" />
            <span>GitHub</span>
          </div>
          <div className="flex items-center gap-2">
            <Linkedin className="size-4" />
            <span>LinkedIn</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X / Twitter</span>
          </div>
        </div>
      </div>

      {/* Right panel – auth */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4 lg:hidden">
              <Shield className="size-6" />
            </div>
            <CardTitle className="text-2xl">Welcome to TrustGraph</CardTitle>
            <CardDescription>
              {isConnected
                ? "Wallet connected. Sign the message to verify ownership."
                : "Connect your Ethereum wallet to start building your verifiable reputation."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isConnected ? (
              /* ── Step 1: Connect wallet ── */
              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => connect({ connector: primaryConnector })}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Wallet className="mr-2 size-4" />
                  )}
                  {isConnecting ? "Connecting…" : "Connect Wallet"}
                </Button>

                {/* Show remaining connectors if there are multiple */}
                {connectors.length > 1 &&
                  connectors
                    .filter((c) => c.id !== primaryConnector?.id)
                    .map((connector) => (
                      <Button
                        key={connector.id}
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={() => connect({ connector })}
                        disabled={isConnecting}
                      >
                        {connector.name}
                      </Button>
                    ))}
              </div>
            ) : (
              /* ── Step 2: SIWE sign-in ── */
              <div className="space-y-3">
                {/* Connected address pill */}
                <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="size-4 shrink-0" />
                    <span className="font-mono">{truncateAddress(address!)}</span>
                  </div>
                  <button
                    onClick={() => {
                      disconnect();
                      setStep("idle");
                      setError(null);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Disconnect
                  </button>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSiweSignIn}
                  disabled={isSiweLoading}
                >
                  {isSiweLoading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <ChevronRight className="mr-2 size-4" />
                  )}
                  {siweLabel[step]}
                </Button>

                {/* Step indicator */}
                {isSiweLoading && (
                  <ol className="flex justify-center gap-6 text-xs text-muted-foreground">
                    {(["signing", "verifying"] as const).map((s) => (
                      <li
                        key={s}
                        className={`capitalize transition-colors ${step === s ? "text-primary font-medium" : ""}`}
                      >
                        {s}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  EIP-4361 · Secure & Private
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              No password required. Signing a message proves wallet ownership
              without any on-chain transaction or gas fee.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
