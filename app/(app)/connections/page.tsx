import { mockConnections } from '@/lib/mock-data'
import { IntegrationCard } from '@/components/integration-card'

export default function ConnectionsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="text-muted-foreground">
          Connect and verify your accounts across platforms to build your reputation.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockConnections.map((connection) => (
          <IntegrationCard key={connection.id} connection={connection} />
        ))}
      </div>

      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          More integrations coming soon: Stack Overflow, Discord, GitLab, and more.
        </p>
      </div>
    </div>
  )
}
