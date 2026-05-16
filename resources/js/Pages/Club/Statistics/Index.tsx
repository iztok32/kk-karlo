import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  CalendarCheck, Users, Star, TicketCheck, TrendingUp,
  MousePointerClick, Globe, BarChart2, Footprints, Ban,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface TopItem  { name: string; total: number }
interface TrendRow { period: string; active?: number; cancelled?: number; purchased?: number; used?: number }

interface Props {
  period: string;
  from: string;
  to: string;
  reservations: {
    total: number; active: number; cancelled: number; cancel_rate: number;
    occupancy: number; full_slots: number; capacity_slots: number;
    top_appointments: (TopItem & { time: string; capacity: number | null })[];
    by_day_of_week: { day: string; count: number }[];
  };
  appointments: {
    total_active: number; in_period: number;
    occupancy_detail: (TopItem & { reservations: number; capacity_total: number; occupancy: number })[];
  };
  coupons: {
    purchased: number; used: number; online: number; manual: number;
    revenue: number; balance_all: number;
  };
  users: {
    total_active: number; total_members: number; new_in_period: number;
    top_users: TopItem[];
  };
  horses: { top_horses: TopItem[] };
  visits: {
    total_views: number; unique_sessions: number; unique_users: number;
    guest_views: number; top_pages: { route: string; count: number }[];
  };
  trend: TrendRow[];
  couponTrend: TrendRow[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const PERIODS = [
  { key: 'week',  label: 'Ta teden' },
  { key: 'month', label: 'Ta mesec' },
  { key: 'year',  label: 'To leto'  },
];

function StatCard({
  title, value, sub, icon: Icon, color = 'blue', small = false,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string; small?: boolean;
}) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50   text-blue-600   dark:bg-blue-950   dark:text-blue-400',
    green:  'bg-green-50  text-green-600  dark:bg-green-950  dark:text-green-400',
    amber:  'bg-amber-50  text-amber-600  dark:bg-amber-950  dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    red:    'bg-red-50    text-red-600    dark:bg-red-950    dark:text-red-400',
    slate:  'bg-slate-50  text-slate-600  dark:bg-slate-800  dark:text-slate-300',
  };
  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
            <p className={cn('font-bold mt-0.5', small ? 'text-2xl' : 'text-3xl')}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <span className={cn('p-2.5 rounded-xl shrink-0', colors[color] ?? colors.blue)}>
            <Icon className="w-5 h-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{children}</h2>;
}

function RankTable({ rows, valueLabel = 'Skupaj' }: { rows: { name: string; total: number }[]; valueLabel?: string }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground py-2">Ni podatkov.</p>;
  const max = Math.max(...rows.map(r => r.total), 1);
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline gap-2 mb-0.5">
              <span className="text-sm truncate">{r.name}</span>
              <span className="text-sm font-semibold shrink-0">{r.total}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/60 transition-all"
                style={{ width: `${(r.total / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export default function Statistics({
  period, from, to,
  reservations, appointments, coupons, users, horses, visits,
  trend, couponTrend,
}: Props) {

  function changePeriod(p: string) {
    router.get(route('statistics.index'), { period: p }, { preserveState: false });
  }

  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? period;

  return (
    <AuthenticatedLayout>
      <Head title="Statistika" />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* Header + period selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Statistika</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {from} – {to}
            </p>
          </div>
          <div className="flex gap-1.5 p-1 bg-muted rounded-lg w-fit">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => changePeriod(p.key)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  period === p.key
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Rezervacije ── */}
        <section>
          <SectionTitle>Rezervacije — {periodLabel}</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard title="Aktivnih rezervacij" value={reservations.active}   icon={CalendarCheck} color="blue" />
            <StatCard title="Preklicanih"          value={reservations.cancelled} icon={Ban}           color="red"  />
            <StatCard title="Stopnja preklica"     value={`${reservations.cancel_rate}%`} icon={TrendingUp} color="amber" />
            <StatCard title="Zasedenost terminov"  value={`${reservations.occupancy}%`}   icon={BarChart2}  color="green" />
            <StatCard title="Polno zasedenih slots" value={reservations.full_slots}       icon={Star}       color="purple" />
            <StatCard title="Skupaj ponujenih mest" value={reservations.capacity_slots}   icon={CalendarCheck} color="slate" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Trend rezervacij */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Trend rezervacij</CardTitle>
              </CardHeader>
              <CardContent>
                {trend.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Ni podatkov za prikaz.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="active"    name="Aktivne"    stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="cancelled" name="Preklicane" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Rezervacije po dnevih tedna */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rezervacije po dnevu v tednu</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={reservations.by_day_of_week} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Rezervacije" fill="#3b82f6" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Termini & Top ── */}
        <section>
          <SectionTitle>Termini in priljubljenost</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <StatCard title="Aktivnih terminov (skupaj)"  value={appointments.total_active} icon={CalendarCheck} color="blue"  />
            <StatCard title="Terminov v izbranem obdobju" value={appointments.in_period}     icon={CalendarCheck} color="slate" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top termini po rezervacijah</CardTitle>
              </CardHeader>
              <CardContent>
                <RankTable rows={reservations.top_appointments.map(a => ({ name: `${a.time ? a.time + ' ' : ''}${a.name}`, total: a.total }))} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Zasedenost terminov (%)</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.occupancy_detail.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">Ni podatkov.</p>
                ) : (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {appointments.occupancy_detail.slice(0, 12).map((a, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2 mb-0.5">
                            <span className="text-xs truncate">{a.name}</span>
                            <span className="text-xs font-semibold shrink-0">{a.reservations} rez.</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all', a.occupancy >= 80 ? 'bg-red-500' : a.occupancy >= 50 ? 'bg-amber-500' : 'bg-green-500')}
                              style={{ width: `${Math.min(a.occupancy, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground w-9 text-right shrink-0">{a.occupancy}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Kuponi ── */}
        <section>
          <SectionTitle>Kuponi — {periodLabel}</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <StatCard title="Kupljeni kuponi"     value={coupons.purchased}  icon={TicketCheck} color="green"  />
            <StatCard title="Porabljeni kuponi"   value={coupons.used}       icon={TicketCheck} color="amber"  />
            <StatCard title="Online nakup"        value={coupons.online}     icon={Globe}       color="blue"   />
            <StatCard title="Ročni vnos"          value={coupons.manual}     icon={TicketCheck} color="slate"  />
            <StatCard title="Prihodki (online)"   value={`${coupons.revenue.toFixed(2)} €`} icon={TrendingUp} color="green" small />
            <StatCard title="Skupno stanje (vsi)" value={coupons.balance_all} icon={Star}        color="purple" />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Trend kuponov (kupljeni / porabljeni)</CardTitle>
            </CardHeader>
            <CardContent>
              {couponTrend.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Ni podatkov za prikaz.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={couponTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="purchased" name="Kupljeni"  fill="#22c55e" radius={[3,3,0,0]} />
                    <Bar dataKey="used"      name="Porabljeni" fill="#f59e0b" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── Uporabniki & Konji ── */}
        <section>
          <SectionTitle>Uporabniki in konji</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard title="Aktivnih uporabnikov" value={users.total_active}   icon={Users}  color="blue"   />
            <StatCard title="Članov kluba"          value={users.total_members}  icon={Star}   color="purple" />
            <StatCard title="Novih v obdobju"       value={users.new_in_period}  icon={Users}  color="green"  />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top jezdeci po rezervacijah</CardTitle>
              </CardHeader>
              <CardContent>
                <RankTable rows={users.top_users} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Najpogosteje uporabljeni konji</CardTitle>
              </CardHeader>
              <CardContent>
                <RankTable rows={horses.top_horses} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Obiski ── */}
        <section>
          <SectionTitle>Obiski strani — {periodLabel}</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard title="Skupaj ogledov"      value={visits.total_views}     icon={MousePointerClick} color="blue"   />
            <StatCard title="Unikatnih sej"        value={visits.unique_sessions} icon={Globe}             color="slate"  />
            <StatCard title="Prijavljenih uporab." value={visits.unique_users}    icon={Users}             color="green"  />
            <StatCard title="Ogledov gostov"       value={visits.guest_views}     icon={Globe}             color="amber"  />
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Najpogosteje obiskane strani</CardTitle>
            </CardHeader>
            <CardContent>
              {visits.top_pages.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Sledenje ogledov se je pravkar začelo — podatki bodo kmalu na voljo.</p>
              ) : (
                <RankTable rows={visits.top_pages.map(p => ({ name: p.route, total: p.count }))} />
              )}
            </CardContent>
          </Card>
        </section>

      </div>
    </AuthenticatedLayout>
  );
}
