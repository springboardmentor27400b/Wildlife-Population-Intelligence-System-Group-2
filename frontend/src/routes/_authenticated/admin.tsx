import { createFileRoute } from "@tanstack/react-router";

import { RoleGuard } from "@/components/role-guard";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { aiModels, users } from "@/lib/mock-data";
import { KpiCard } from "@/components/kpi-card";

import {
  Users,
  Database,
  Activity,
  LineChart,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      {
        title: "Admin — WPIS",
      },
    ],
  }),

  component: Admin,
});

function Admin() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminContent />
    </RoleGuard>
  );
}

function AdminContent() {
  return (
    <div>
      <PageHeader
        title="Administrator Console"
        description="Manage users, roles, datasets, AI models, and platform health."
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Users"
          value={users.length}
          icon={Users}
          accent="forest"
        />

        <KpiCard
          label="AI Models"
          value={aiModels.length}
          icon={Database}
          accent="ocean"
        />

        <KpiCard
          label="Uptime"
          value="99.94%"
          icon={Activity}
          accent="forest"
        />

        <KpiCard
          label="Predictions (24h)"
          value="12,483"
          icon={LineChart}
          accent="earth"
          trend={9}
        />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">
            Users
          </TabsTrigger>

          <TabsTrigger value="models">
            AI Models
          </TabsTrigger>

          <TabsTrigger value="logs">
            System Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="glass overflow-hidden rounded-2xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.name}
                    </TableCell>

                    <TableCell>
                      {u.email}
                    </TableCell>

                    <TableCell>
                      {u.role}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        value={
                          u.active
                            ? "Active"
                            : "Offline"
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="models">
          <div className="grid gap-4 md:grid-cols-2">
            {aiModels.map((m) => (
              <div
                key={m.id}
                className="glass rounded-2xl p-5"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="font-display text-lg font-semibold">
                      {m.name}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {m.type} · v{m.version}
                    </div>
                  </div>

                  <StatusBadge value={m.status} />
                </div>

                <div className="mb-1 mt-3 flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Accuracy
                  </span>

                  <span className="font-medium">
                    {m.accuracy}%
                  </span>
                </div>

                <Progress value={m.accuracy} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="glass rounded-2xl p-5">
            <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted/60 p-3 font-mono text-xs">
{`[2026-07-09 14:23:04] INFO  detection.pipeline finished job=cam-088 species=2 conf=0.94
[2026-07-09 14:22:41] INFO  auth.login user=priya@wildtrust.org ip=10.0.4.31
[2026-07-09 14:19:03] WARN  device.offline id=CT-088 duration=36h
[2026-07-09 14:12:15] INFO  audio.birdnet processed=127 species=14
[2026-07-09 13:58:44] INFO  gis.layer refreshed name=protected_areas
[2026-07-09 13:50:02] INFO  report.export type=biodiversity fmt=pdf user=ravi@wpis.io
[2026-07-09 13:42:11] ERROR job.retry queue=habitat.segmentation attempts=3
[2026-07-09 13:30:00] INFO  cron.daily kicked=analytics.rollup
`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

