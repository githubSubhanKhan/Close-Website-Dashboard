const express = require('express');
const router = express.Router();
const axios = require('axios');

const CLOSE_API_KEY = "api_0wNmJnH459tU6ILauwWvYH.7jFQUFpFk3ZdkRbrozTo9G";
const CLOSE_API_BASE_URL = 'https://api.close.com/api/v1';

// Generic Close API GET wrapper
const closeAPIRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${CLOSE_API_BASE_URL}${endpoint}`, {
      auth: {
        username: CLOSE_API_KEY,
        password: '',
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error(`Close API Error (${endpoint}):`, error.response?.data || error.message);
    throw error;
  }
};

// Fetch ALL records with auto pagination
const fetchAllCloseRecords = async (endpoint, limit = 200) => {
  let allData = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await closeAPIRequest(endpoint, {
      _limit: limit,
      _skip: skip,
    });

    if (!response?.data?.length) break;

    allData.push(...response.data);

    skip += limit;
    hasMore = response.data.length === limit; // if less, last page reached
  }

  return allData;
};

const isWithinDateRange = (dateStr, fromDate, toDate) => {
  if (!dateStr) return false;

  const created = new Date(dateStr);

  if (fromDate && created < fromDate) return false;
  if (toDate && created > toDate) return false;

  return true;
};


router.get("/locations", async (req, res) => {
  try {
    const pipelines = await fetchAllCloseRecords("/pipeline/");
    // Use a valid field; Close pipelines include 'name'
    const locations = pipelines
      .map(p => p.name)        // <-- use 'name' or your actual location field
      .filter(Boolean);

    const uniqueLocations = [...new Set(locations)];
    res.json({ success: true, locations: uniqueLocations });
  } catch (error) {
    console.error("Error fetching pipeline locations:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/locations-filtered", async (req, res) => {
  try {
    const pipelines = await fetchAllCloseRecords("/pipeline/");

    // Allowed locations
    const allowedLocations = [
      "Green Bay Sales",
      "Barrington Sales",
      "Greenwood Sales"
    ];

    const locations = pipelines
      .map(p => p.name)
      .filter(name => allowedLocations.includes(name));

    const uniqueLocations = [...new Set(locations)];

    res.json({
      success: true,
      locations: uniqueLocations
    });

  } catch (error) {
    console.error("Error fetching filtered pipeline locations:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


router.get("/leads-by-location", async (req, res) => {
  try {
    const allLeads = await fetchAllCloseRecords("/lead/");
    const pipelines = await fetchAllCloseRecords("/pipeline/");

    const allowedLocations = [
      "Green Bay Sales",
      "Barrington Sales",
      "Greenwood Sales"
    ];

    const filteredLocations = pipelines
      .map(p => p.name)
      .filter(name => allowedLocations.includes(name));

    const uniqueLocations = [...new Set(filteredLocations)];

    const leadsByLocation = uniqueLocations.map(loc => ({
      name: loc,
      value: allLeads.filter(lead =>
        lead?.opportunities?.some(op => op?.pipeline_name?.toLowerCase() === loc.toLowerCase())
      ).length,
    }));

    res.json({ success: true, data: leadsByLocation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


router.get('/dashboard-data', async (req, res) => {
  try {
    const data = await closeAPIRequest('/lead/', {
      _limit: 100
    });

    return res.json({
      success: true,
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch data',
      message: error.message
    });
  }
});

router.get('/total-leads', async (req, res) => {
  try {
    const { location, leadSource, funnelType, fromDate, toDate } = req.query;
    const allLeads = await fetchAllCloseRecords('/lead/', 200);
    let filteredLeads = allLeads;

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    // Filter by location (pipeline_name)
    if (location && location !== "All") {
      filteredLeads = filteredLeads.filter(lead =>
        lead?.opportunities?.some(op =>
          op?.pipeline_name?.toLowerCase() === location.toLowerCase()
        )
      );
    }

    // Filter by leadSource
    if (leadSource && leadSource !== "All") {
      filteredLeads = filteredLeads.filter(lead =>
        lead?.opportunities?.some(op =>
          (op["custom.cf_IlDxYq6z1N5djnZtgsAxWRHuNIKzd10fe1t3fDAMiPX"] || "")
            .trim()
            .toLowerCase() === leadSource.trim().toLowerCase()
        )
      );
    }

    // Filter by funnel type
    if (funnelType && funnelType !== "All") {
      filteredLeads = filteredLeads.filter(lead =>
        lead?.opportunities?.some(op =>
          (op["custom.cf_lHXCz96zGWThc3ojIl0Wcld64fJv7tnzkHSnTmALQPq"] || "")
            .trim()
            .toLowerCase() === funnelType.trim().toLowerCase()
        )
      );
    }

    if (from || to) {
      filteredLeads = filteredLeads.filter(lead =>
        isWithinDateRange(lead.date_created, from, to)
      );
    }

    return res.json({
      success: true,
      totalLeads: filteredLeads.length,
      data: filteredLeads,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch total leads',
      message: error.message
    });
  }
});

router.get("/leads-by-location-with-filter", async (req, res) => {
  try {
    const { location, leadSource, funnelType, fromDate, toDate } = req.query;

    const allLeads = await fetchAllCloseRecords("/lead/");
    const pipelines = await fetchAllCloseRecords("/pipeline/");

    const allowedLocations = [
      "Green Bay Sales",
      "Barrington Sales",
      "Greenwood Sales",
    ];

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    // Step 1: Filter leads SAME AS total-leads
    let filteredLeads = allLeads;

    // Location filter (only if explicitly selected)
    if (location && location !== "All") {
      filteredLeads = filteredLeads.filter(lead =>
        lead?.opportunities?.some(op =>
          op?.pipeline_name?.toLowerCase() === location.toLowerCase()
        )
      );
    }

    // Lead Source filter
    if (leadSource && leadSource !== "All") {
      filteredLeads = filteredLeads.filter(lead =>
        lead?.opportunities?.some(op =>
          (op["custom.cf_IlDxYq6z1N5djnZtgsAxWRHuNIKzd10fe1t3fDAMiPX"] || "")
            .trim()
            .toLowerCase() === leadSource.trim().toLowerCase()
        )
      );
    }

    // Funnel / Tags filter
    if (funnelType && funnelType !== "All") {
      filteredLeads = filteredLeads.filter(lead =>
        lead?.opportunities?.some(op =>
          (op["custom.cf_lHXCz96zGWThc3ojIl0Wcld64fJv7tnzkHSnTmALQPq"] || "")
            .trim()
            .toLowerCase() === funnelType.trim().toLowerCase()
        )
      );
    }

    // Date filter
    if (from || to) {
      filteredLeads = filteredLeads.filter(lead =>
        isWithinDateRange(lead.date_created, from, to)
      );
    }

    // Step 2: Prepare ONLY allowed locations
    const uniqueLocations = [
      ...new Set(
        pipelines
          .map(p => p.name)
          .filter(name => allowedLocations.includes(name))
      ),
    ];

    // Step 3: Aggregate counts per location
    const leadsByLocation = uniqueLocations.map(loc => ({
      name: loc,
      value: filteredLeads.filter(lead =>
        lead?.opportunities?.some(op =>
          op?.pipeline_name?.toLowerCase() === loc.toLowerCase()
        )
      ).length,
    }));

    res.json({
      success: true,
      data: leadsByLocation,
    });

  } catch (err) {
    console.error("Error in leads-by-location:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


router.get('/test-single-lead', async (req, res) => {
  try {
    const response = await closeAPIRequest('/lead/', {
      _limit: 1,
      _skip: 0
    });

    return res.json({
      success: true,
      lead: response?.data?.[0],
    });

  } catch (error) {
    console.error('Test Single Lead Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch single lead',
      message: error.message
    });
  }
});


router.get('/appointments', async (req, res) => {
  try {
    const appointments = await closeAPIRequest('/activity/', {
      _limit: 100,
      type: 'call'
    });

    return res.json({
      success: true,
      appointmentsBooked: appointments.data.length,
      data: appointments.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments',
      message: error.message
    });
  }
});

router.get('/memberships-closed', async (req, res) => {
  try {
    const { location, leadSource, funnelType, fromDate, toDate } = req.query;
    const memberships = await closeAPIRequest('/opportunity/', {
      _limit: 100,
      status_type: 'won'
    });
    let filteredMemberships = memberships.data;
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (location && location !== "All") {
      filteredMemberships = filteredMemberships.filter(
        opp => opp?.pipeline_name?.toLowerCase() === location.toLowerCase()
      );
    }

    if (leadSource && leadSource !== "All") {
      filteredMemberships = filteredMemberships.filter(op =>
        (op["custom.cf_IlDxYq6z1N5djnZtgsAxWRHuNIKzd10fe1t3fDAMiPX"] || "")
          .trim()
          .toLowerCase() === leadSource.trim().toLowerCase()
      );
    }

    // Filter by funnel type
    if (funnelType && funnelType !== "All") {
      filteredMemberships = filteredMemberships.filter(op =>
        (op["custom.cf_lHXCz96zGWThc3ojIl0Wcld64fJv7tnzkHSnTmALQPq"] || "")
          .trim()
          .toLowerCase() === funnelType.trim().toLowerCase()
      );
    }

    if (from || to) {
      filteredMemberships = filteredMemberships.filter(op =>
        isWithinDateRange(op.date_created, from, to)
      );
    }

    return res.json({
      success: true,
      membershipsClosed: filteredMemberships.length,
      data: filteredMemberships,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch memberships',
      message: error.message
    });
  }
});

const ALLOWED_STATUSES = [
  "Initial Signup",
  "Contacting",
  "Contacting 2",
  "Contacting 3",
  "Value",
  "Per-Appointment",
  "Showed-Pending",
  "Won-Insurance Only",
  "Closed-Lost",
];

router.get('/opportunities-status-count', async (req, res) => {
  try {
    const { location, leadSource, funnelType, fromDate, toDate } = req.query;

    let filteredOps = await fetchAllCloseRecords('/opportunity/');

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    // ---------- SAME FILTERING LOGIC ----------

    if (location && location !== 'All') {
      filteredOps = filteredOps.filter(op =>
        op?.pipeline_name?.toLowerCase() === location.toLowerCase()
      );
    }

    if (leadSource && leadSource !== 'All') {
      filteredOps = filteredOps.filter(op =>
        (op['custom.cf_IlDxYq6z1N5djnZtgsAxWRHuNIKzd10fe1t3fDAMiPX'] || '')
          .trim()
          .toLowerCase() === leadSource.trim().toLowerCase()
      );
    }

    if (funnelType && funnelType !== 'All') {
      filteredOps = filteredOps.filter(op =>
        (op['custom.cf_lHXCz96zGWThc3ojIl0Wcld64fJv7tnzkHSnTmALQPq'] || '')
          .trim()
          .toLowerCase() === funnelType.trim().toLowerCase()
      );
    }

    if (from || to) {
      filteredOps = filteredOps.filter(op =>
        isWithinDateRange(op.date_created, from, to)
      );
    }

    // ---------- COUNT ONLY REQUIRED STATUS_LABELS ----------

    // Initialize all statuses with 0
    const statusCounts = ALLOWED_STATUSES.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    // Count only allowed statuses
    filteredOps.forEach(op => {
      const status = op?.status_label;
      if (status && statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    return res.json({
      success: true,
      totalOpportunities: filteredOps.length,
      statusCounts,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunity status counts',
      message: error.message,
    });
  }
});

router.get('/appointment-insurance-stats', async (req, res) => {
  try {
    const { location, leadSource, funnelType, type, fromDate, toDate } = req.query;

    // Fetch all opportunities
    const allOpportunities = await fetchAllCloseRecords('/opportunity/', 200);

    let filteredOpportunities = allOpportunities;

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    // Filter by location (pipeline)
    if (location && location !== "All") {
      filteredOpportunities = filteredOpportunities.filter(
        opp => opp?.pipeline_name?.toLowerCase() === location.toLowerCase()
      );
    }

    // Filter by lead source
    if (leadSource && leadSource !== "All") {
      filteredOpportunities = filteredOpportunities.filter(op =>
        (op["custom.cf_IlDxYq6z1N5djnZtgsAxWRHuNIKzd10fe1t3fDAMiPX"] || "")
          .trim()
          .toLowerCase() === leadSource.trim().toLowerCase()
      );
    }

    // Filter by funnel type
    if (funnelType && funnelType !== "All") {
      filteredOpportunities = filteredOpportunities.filter(op =>
        (op["custom.cf_lHXCz96zGWThc3ojIl0Wcld64fJv7tnzkHSnTmALQPq"] || "")
          .trim()
          .toLowerCase() === funnelType.trim().toLowerCase()
      );
    }

    if (from || to) {
      filteredOpportunities = filteredOpportunities.filter(op =>
        isWithinDateRange(op.date_created, from, to)
      );
    }

    // Counting logic
    let count = 0;
    if (type === "appointments") {
      const appointmentStatuses = [
        'Pre-Appointment',
        'Showed-Pending',
        'Won - Insurance Only',
        'Close-Won'
      ];

      count = filteredOpportunities.filter(op =>
        appointmentStatuses.includes(op.status_label)
      ).length;

    } else if (type === "insurance") {
      count = filteredOpportunities.filter(op => op.status_label === 'Won - Insurance Only').length;
    }

    return res.json({
      success: true,
      type,
      count,
    });

  } catch (error) {
    console.error('Opportunity Stats Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunity stats',
      message: error.message
    });
  }
});

router.get("/funnel-types", async (req, res) => {
  try {
    const leads = await fetchAllCloseRecords('/lead/', 200); // already array
    const allValues = [];

    for (const lead of leads) {
      if (!lead.opportunities?.length) continue;

      for (const opp of lead.opportunities) {
        const val = opp["custom.cf_lHXCz96zGWThc3ojIl0Wcld64fJv7tnzkHSnTmALQPq"];
        if (val) allValues.push(val);
      }
    }

    const uniqueValues = [...new Set(allValues)]; // unique values only

    return res.json({
      success: true,
      uniqueValues,
    });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.get("/lead-sources", async (req, res) => {
  try {
    const leads = await fetchAllCloseRecords('/lead/', 200); // already array
    const allValues = [];

    for (const lead of leads) {
      if (!lead.opportunities?.length) continue;

      for (const opp of lead.opportunities) {
        const val = opp["custom.cf_IlDxYq6z1N5djnZtgsAxWRHuNIKzd10fe1t3fDAMiPX"];
        if (val) allValues.push(val);
      }
    }

    const uniqueValues = [...new Set(allValues)]; // unique values only

    return res.json({
      success: true,
      uniqueValues,
    });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.get('/membership-breakdown', async (req, res) => {
  try {
    const memberships = await closeAPIRequest('/opportunity/', {
      _limit: 100,
      status_type: 'won'
    });

    const breakdownMap = {};
    memberships.data.forEach(m => {
      const price = m.value || 0;
      breakdownMap[price] = (breakdownMap[price] || 0) + 1;
    });

    const breakdown = Object.entries(breakdownMap).map(([price, count]) => ({
      price: `$${Number(price).toLocaleString()}`,
      count
    }));

    return res.json({ success: true, breakdown });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch membership breakdown',
      message: error.message
    });
  }
});

// ----------------------- Test Routes -----------------------
router.get('/appointments-booked-test', async (req, res) => {
  try {
    const memberships = await closeAPIRequest('/opportunity/', {
      _limit: 100,
    });

    return res.json({
      success: true,
      total: memberships.data.length,
      data: memberships.data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunities',
      message: error.message
    });
  }
});

module.exports = router;