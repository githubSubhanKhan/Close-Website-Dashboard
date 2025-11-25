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
    const leads = await closeAPIRequest('/lead/', { _limit: 100 }); // max 200
    return res.json({
      success: true,
      totalLeads: leads.data.length,
      data: leads.data // optional, can remove if just count needed
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