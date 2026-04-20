'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Github, Linkedin, CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  'Aggregate your identity across platforms',
  'Build verifiable reputation proofs',
  'Unlock achievements based on real activity',
  'Share trusted credentials anywhere',
]

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    // Simulate auth delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary/10 via-background to-background p-12">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="size-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">TrustGraph</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-balance">
              Build your verifiable developer reputation
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Connect your platforms, aggregate your achievements, and create cryptographic proofs of your professional identity.
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

      {/* Right panel - auth */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4 lg:hidden">
              <Shield className="size-6" />
            </div>
            <CardTitle className="text-2xl">Welcome to TrustGraph</CardTitle>
            <CardDescription>
              Sign in to start building your verifiable reputation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <svg className="mr-2 size-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Secure & Private
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy. 
              Your data is encrypted and never shared without consent.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
