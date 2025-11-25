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
} from "recharts";

const API_BASE_URL = "http://localhost:5000/api/close";

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


const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedLeadSource, setSelectedLeadSource] = useState("All");
  const [selectedFunnelType, setSelectedFunnelType] = useState("All");

  const fetchData = async () => {
  setLoading(true);

  try {
    const [leadsRes, appointmentsRes, membershipsRes, breakdownRes] =
      await Promise.all([
        fetch(`${API_BASE_URL}/total-leads`).then(r => r.json()),
        fetch(`${API_BASE_URL}/appointments`).then(r => r.json()),
        fetch(`${API_BASE_URL}/memberships-closed`).then(r => r.json()),
        fetch(`${API_BASE_URL}/membership-breakdown`).then(r => r.json()),
      ]);

    const dashboardData: DashboardData = {
      totals: {
        totalLeads: leadsRes.success ? leadsRes.totalLeads : 0,
        appointmentsBooked: appointmentsRes.success ? appointmentsRes.appointmentsBooked : 0,
        membershipsClosed: membershipsRes.success ? membershipsRes.membershipsClosed : 0,
        insuranceOnly: 0, // optional or compute separately
      },
      membershipBreakdown: breakdownRes.success ? breakdownRes.breakdown : [],
      filters: {
        locations: [], // optional, can fetch later
        leadSources: [], 
        funnelTypes: [],
      },
    };

    setData(dashboardData);
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }

  setLoading(false);
};


  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="animate-spin h-10 w-10 text-redcustom" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinic Performance Dashboard</h1>
          <p className="text-gray-600">Powered by Close CRM</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={fetchData} className="text-redcustom border-redcustom" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button className="bg-redcustom text-whitecustom">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-4">
          {/* Location */}
          <Select onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[200px] border-gray-300">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {data.filters.locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Lead Source */}
          <Select onValueChange={setSelectedLeadSource}>
            <SelectTrigger className="w-[200px] border-gray-300">
              <SelectValue placeholder="Lead Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {data.filters.leadSources.map((src) => (
                <SelectItem key={src} value={src}>{src}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Funnel Type */}
          <Select onValueChange={setSelectedFunnelType}>
            <SelectTrigger className="w-[200px] border-gray-300">
              <SelectValue placeholder="Funnel Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {data.filters.funnelTypes.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-redcustom">
          <CardHeader><CardTitle>Total Leads</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totals.totalLeads}</div></CardContent>
        </Card>

        <Card className="border-l-4 border-l-redcustom">
          <CardHeader><CardTitle>Appointments Booked</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totals.appointmentsBooked}</div></CardContent>
        </Card>

        <Card className="border-l-4 border-l-redcustom">
          <CardHeader><CardTitle>Memberships Closed</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totals.membershipsClosed}</div></CardContent>
        </Card>

        <Card className="border-l-4 border-l-redcustom">
          <CardHeader><CardTitle>Insurance-Only Patients</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totals.insuranceOnly}</div></CardContent>
        </Card>
      </div>

      {/* Membership Breakdown (Pie + Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="w-5 h-5" /> Membership Breakdown
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

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Membership Sales Volume
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

      </div>
    </div>
  );
};

export default Dashboard;