const express = require('express');
const router = express.Router();
const axios = require('axios');

const CLOSE_API_KEY = process.env.CLOSE_API_KEY;
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
    const allLeads = await fetchAllCloseRecords('/lead/', 200);

    return res.json({
      success: true,
      totalLeads: allLeads.length,
      data: allLeads, // remove later if only count needed
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch total leads',
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
    const memberships = await closeAPIRequest('/opportunity/', {
      _limit: 100,
      status_type: 'won'
    });

    return res.json({
      success: true,
      membershipsClosed: memberships.data.length,
      data: memberships.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch memberships',
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


module.exports = router;