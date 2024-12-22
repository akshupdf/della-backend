const express = require('express');
const Lead = require('../models/Lead');
const User = require('../models/User');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// GET route to filter leads by status
router.get('/getleads', async (req, res) => {
  const { status } = req.query; // Extract status from query params

  try {
    // If status is provided, filter leads; otherwise, return all leads
    const leads = status ? await Lead.find({ status }) : await Lead.find();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/getUser', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT route to update the status of a specific lead
router.put('/:id/status', async (req, res) => {
  const { id } = req.params; // Get lead ID from URL params
  const { status } = req.body; // Extract new status from request body

  try {
    const lead = await Lead.findById(id); // Find the lead by ID
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Update the status field
    lead.status = status || lead.status;
    const updatedLead = await lead.save(); // Save the updated lead

    res.json(updatedLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create a new lead
router.post('/uploadLead', authenticate, authorize(['superadmin', 'tl']), async (req, res) => {
  console.log('Request body:', req.body); // Debugging

  const leads = req.body; // Expecting an array of leads
  if (!Array.isArray(leads)) {
    return res.status(400).json({ message: 'Input data must be an array of objects' });
  }

  try {
    // Save all leads in one go
    const newLeads = await Lead.insertMany(leads);
    
    res.status(201).json('Leads saved successfully');
  } catch (err) {
    console.error('Error saving leads:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Update a lead
router.put('/:id', async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a lead
router.delete('/:id', async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = user.generateAuthToken();
    const role = user?.role ;
    const id = user?._id

    res.json({
      message: 'Login successful',
      token, // Send back the JWT token
      role,
      id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST route to add a new user
router.post('/addUser', authenticate, authorize(['superadmin']), async (req, res) => {
  const { username, email, password, role } = req.body;

  // Validate input
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if the role is valid
  const validRoles = ['agent', 'tl', 'superadmin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create a new user
    const user = new User({
      username,
      email,
      password,
      role,
    });

    // Save the user
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/getUsers', async (req, res) => {
  const { role } = req.body; 
  try {
    const users = await User.find({role});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
