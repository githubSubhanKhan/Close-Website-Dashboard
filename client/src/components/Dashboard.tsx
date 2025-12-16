import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Download,
  BarChart3,
  PieChart as PieIcon,
} from "lucide-react";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import LoadingAnimation from "./LoadingAnimation";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const COLORS = ["#880015", "#B8001F", "#E60026", "#FF3347", "#FF6B7A"];

interface DashboardData {
  totals: {
    totalLeads: number;
    appointmentsBooked: number;
    membershipsClosed: number;
    insuranceOnly: number;
  };
  membershipBreakdown: { price: string; count: number }[];
  filters: {
    locations: string[];
    leadSources: string[];
    funnelTypes: string[];
  };
}

type FilterParams = {
  location?: string;
  leadSource?: string;
  funnelType?: string;
};

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Filters
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedLeadSource, setSelectedLeadSource] = useState("All");
  const [selectedFunnelType, setSelectedFunnelType] = useState("All");

  const fetchData = async (filters?: FilterParams) => {
    const effectiveFilters: FilterParams = {
      location: filters?.location ?? selectedLocation,
      leadSource: filters?.leadSource ?? selectedLeadSource,
      funnelType: filters?.funnelType ?? selectedFunnelType,
    };

    if (!data) setInitialLoading(true);
    else setRefreshing(true);

    setLoadingProgress(0);

    try {
      const totalAPIs = 7; // 6 endpoints now
      let completed = 0;

      const updateProgress = () => {
        completed++;
        setLoadingProgress((completed / totalAPIs) * 100);
      };

      const query = new URLSearchParams({
        location: effectiveFilters.location || "All",
        leadSource: effectiveFilters.leadSource || "All",
        funnelType: effectiveFilters.funnelType || "All",
      }).toString();

      const [
        leadsRes,
        appointmentsRes,
        insuranceRes,
        membershipsRes,
        locationsRes,
        funnelTypesRes,
        leadSourcesRes,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/total-leads?${query}`).then((r) => r.json()).then(d => { updateProgress(); return d; }),
        fetch(`${API_BASE_URL}/appointment-insurance-stats?${query}&type=appointments`).then((r) => r.json()).then(d => { updateProgress(); return d; }),
        fetch(`${API_BASE_URL}/appointment-insurance-stats?${query}&type=insurance`).then((r) => r.json()).then(d => { updateProgress(); return d; }),
        fetch(`${API_BASE_URL}/memberships-closed?${query}`).then((r) => r.json()).then(d => { updateProgress(); return d; }),
        fetch(`${API_BASE_URL}/locations`).then((r) => r.json()).then(d => { updateProgress(); return d; }),
        fetch(`${API_BASE_URL}/funnel-types`).then((r) => r.json()).then(d => { updateProgress(); return d; }),
        fetch(`${API_BASE_URL}/lead-sources`).then((r) => r.json()).then(d => { updateProgress(); return d; }),
      ]);

      // ✅ BUILD BREAKDOWN FROM MEMBERSHIPS
      const breakdownMap: Record<string, number> = {};

      (membershipsRes.data || []).forEach((m: any) => {
        const rawValue = m.value || 0;
        const price = `$${Number(rawValue).toLocaleString()}`;

        breakdownMap[price] = (breakdownMap[price] || 0) + 1;
      });

      const computedBreakdown = Object.entries(breakdownMap).map(
        ([price, count]) => ({ price, count })
      );

      const dashboardData: DashboardData = {
        totals: {
          totalLeads: leadsRes.success ? leadsRes.totalLeads : 0,
          appointmentsBooked: appointmentsRes.success ? appointmentsRes.count : 0,
          membershipsClosed: membershipsRes.success ? membershipsRes.membershipsClosed : 0,
          insuranceOnly: insuranceRes.success ? insuranceRes.count : 0,
        },

        membershipBreakdown: computedBreakdown,

        filters: {
          locations: locationsRes.success ? locationsRes.locations : [],
          leadSources: leadSourcesRes.success ? leadSourcesRes.uniqueValues : [],
          funnelTypes: funnelTypesRes.success ? funnelTypesRes.uniqueValues : [],
        },
      };

      setData(dashboardData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  const clearFilters = () => {
    setSelectedLocation("All");
    setSelectedLeadSource("All");
    setSelectedFunnelType("All");
  };

  useEffect(() => {
    fetchData({
      location: selectedLocation,
      leadSource: selectedLeadSource,
      funnelType: selectedFunnelType,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, selectedLeadSource, selectedFunnelType]);

  if (initialLoading || !data) {
    return <LoadingAnimation progress={loadingProgress} />;
  }

  const conversionData = [
    { label: "Total Leads", value: data.totals.totalLeads },
    { label: "Memberships Closed", value: data.totals.membershipsClosed }
  ];


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clinic Performance Dashboard</h1>
          <p className="text-gray-600">Powered by Close CRM</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => fetchData()} variant="outline" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          {/* <Button className="bg-redcustom text-whitecustom">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button> */}
        </div>
      </div>

      {/* FILTERS */}
      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-4">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Pipeline</SelectItem>
              {data.filters.locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLeadSource} onValueChange={setSelectedLeadSource}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Lead Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Lead Source</SelectItem>
              {data.filters.leadSources.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedFunnelType} onValueChange={setSelectedFunnelType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Funnel Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Tags</SelectItem>
              {data.filters.funnelTypes.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Total Leads</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{data.totals.totalLeads}</CardContent></Card>
        <Card><CardHeader><CardTitle>Appointments Booked</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{data.totals.appointmentsBooked}</CardContent></Card>
        <Card><CardHeader><CardTitle>Memberships Closed</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{data.totals.membershipsClosed}</CardContent></Card>
        <Card><CardHeader><CardTitle>Insurance-Only Patients</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{data.totals.insuranceOnly}</CardContent></Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="w-5 h-5" />
              Membership Breakdown
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.membershipBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="count"
                  nameKey="price"
                  label
                >
                  {data.membershipBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Membership Sales Volume
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.membershipBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="price" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#880015" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Lead → Membership Conversion
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#B8001F" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;