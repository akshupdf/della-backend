const express = require("express");
const Lead = require("../models/Lead");
const User = require("../models/User");
const Membership = require("../models/Member");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");


// GET route to filter leads by status
router.get("/getleads", authenticate, async (req, res) => {
  const { status } = req.query; // Extract status from query params
  const { _id, role } = req.user;

  try {
    // If status is provided, filter leads; otherwise, return all leads

    const filter = { tl: _id }; // Match leads for this TL
    if (status) {
      filter.status = status;
    }

    let leads;

    if (role === "superadmin" || status === "all") {
      leads = await Lead.find();
      res.json(leads);
    } else {
      leads = await Lead.find(filter);
      res.json(leads);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/getleads/:location",  async (req, res) => {
  const { location } = req.params;

  try {

      const leads = await Lead.find({ location: { $regex: new RegExp(location, "i") } });
      res.json(leads);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/getleadsbyId/:id",  async (req, res) => {
  const { id } = req.params;

  try {

      const leads = await Lead.find({assignTo : id });
      res.json(leads);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:tlManager/executiveCount", async (req, res) => {
  const { tlManager } = req.params;

  try {
    const result = await Lead.aggregate([
      // Match leads for the specified TL Manager
      { $match: { tlManager } },

      // Group by executive and count the leads
      {
        $group: {
          _id: "$executive",
          leadCount: { $sum: 1 },
        },
      },

      // Optionally sort the result by lead count (descending)
      { $sort: { leadCount: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id/getUser", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:tlId/getUsersByTl", async (req, res) => {
  const { tlId } = req.params;

  try {
    // Get the Team Lead details
    const tl = await User.findById(tlId);
    if (!tl) {
      return res.status(404).json({ message: "Team Lead not found" });
    }

    // Get all agents under the TL
    const agents = await User.find({ tl: tlId, role: "agent" }).select(
      "-password -tl"
    );

    // Get lead counts for each agent by the 'executive' field
    const leadCountsByExecutive = await Lead.aggregate([
      { $match: { executive: { $in: agents.map((agent) => agent.name) } } }, // Match leads by executive names
      {
        $group: {
          _id: "$executive", // Group by executive field
          totalLeads: { $sum: 1 },
          confirmedLeads: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
        },
      },
    ]);

    // Map lead counts to the corresponding agents
    const agentData = agents.map((agent) => {
      const leadData = leadCountsByExecutive.find(
        (count) => count._id === agent.name
      ) || {
        totalLeads: 0,
        confirmedLeads: 0,
      };

      return {
        ...agent.toObject(),
        totalLeads: leadData.totalLeads,
        confirmedLeads: leadData.confirmedLeads,
      };
    });

    // let count = leadCountsByAgent[0].totalLeads;

    res.json({ agentData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/getUsersByRole/:role", async (req, res) => {
  const { role } = req.params;

  try {
    // Find users based on the role passed in the params
    const rolewiseUsers = await User.find({ role });

    if (!rolewiseUsers || rolewiseUsers.length === 0) {
      return res.status(404).json({ message: "No users found with the specified role" });
    }

    res.json({ rolewiseUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT route to update the status of a specific lead
router.put("/:id/status", async (req, res) => {
  const { id } = req.params; // Get lead ID from URL params
  const { status } = req.body; // Extract new status from request body

  try {
    const lead = await Lead.findById(id); // Find the lead by ID
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Update the status field
    lead.status = status || lead.status;
    const updatedLead = await lead.save(); // Save the updated lead

    res.json(updatedLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id/remark", async (req, res) => {
  const { id } = req.params; // Get lead ID from URL params
  const { remark } = req.body; // Extract new status from request body

  try {
    const lead = await Lead.findById(id); // Find the lead by ID
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Update the status field
    lead.remark = remark || lead.remark;
    const updatedLead = await lead.save(); // Save the updated lead

    res.json(updatedLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create a new lead
router.post(
  "/uploadLead",
  authenticate,
  authorize(["superadmin", "tl"]),
  async (req, res) => {
    const leads = req.body; // Expecting an array of leads
    if (!Array.isArray(leads)) {
      return res
        .status(400)
        .json({ message: "Input data must be an array of objects" });
    }

    try {
      // Save all leads in one go
      const newLeads = await Lead.insertMany(leads);

      // Count total and confirmed leads
      const totalLeads = leads.length;
      const confirmedLeads = leads.filter(
        (lead) => lead.status === "confirmed"
      ).length;

      // Extract TL IDs from leads
      const tlId = leads[0]?.tl; // Assuming all leads have the same TL ID
      if (tlId) {
        // Update the TL statistics (replace `TeamLead` with your TL model)
        await User.findByIdAndUpdate(
          tlId,
          {
            $inc: { totalLeads, confirmedLeads },
          },
          { new: true }
        );
      }

      res.status(201).json("Leads saved successfully");
    } catch (err) {
      console.error("Error saving leads:", err.message);
      res.status(400).json({ message: err.message });
    }
  }
);

// Update a lead
router.put("/updateLead/:id", async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a lead
router.delete("/:id", async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = user.generateAuthToken();
    const role = user?.role;
    const id = user?._id;
    const name = user?.username;

    res.json({
      message: "Login successful",
      token, // Send back the JWT token
      role,
      id,
      name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST route to add a new user
router.post(
  "/addUser",
  authenticate,
  authorize(["superadmin", "tl"]),
  async (req, res) => {
    const { username, email, password, role, tl, name } = req.body;

    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the role is valid
    const validRoles = ["agent", "tl", "superadmin", "reception", "sales"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    try {
      // Check if a user with the given email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }

      // Create a new user
      const user = new User({
        name,
        username,
        email,
        password,
        role,
        tl,
      });

      // Save the user
      await user.save();

      res.status(201).json({
        message: "User created successfully",
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Error creating user:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post("/getUsers", async (req, res) => {
  const { role } = req.body;
  try {
    const users = await User.find({ role });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/membership", async (req, res) => {
  try {
    const membership = new Membership(req.body);
    await membership.save();
    res
      .status(201)
      .json({ message: "Membership created successfully", membership });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/membership", async (req, res) => {
  try {
    const memberships = await Membership.find();
    res.status(200).json(memberships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/dashboard_count", authenticate, async (req, res) => {
  try {
    // Fetch total leads count
    const { _id, role } = req.user;
    const filter = { tl: _id };
    let totalLeadsCount;
    if (role === "superadmin") {
      totalLeadsCount = await Lead.countDocuments();
    } else {
      totalLeadsCount = await Lead.countDocuments(filter);
    }
    // Fetch confirmed leads count
    const confirmedLeadsCount = await Lead.countDocuments({
      status: "confirmed",
    });

    // Calculate conversion rate (handle division by zero)
    const conversionRate =
      totalLeadsCount > 0
        ? ((confirmedLeadsCount / totalLeadsCount) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      totalLeadsCount,
      confirmedLeadsCount,
      conversionRate: `${conversionRate}%`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/assignto", async (req, res) => {
  const { assigns, userId } = req.body; // Extract IDs and userId from the request body

  if (!assigns || !Array.isArray(assigns) || !userId) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  try {
    // Use Promise.all to wait for all updates to complete
    const updatedLeads = await Promise.all(
      assigns.map(async (leadId) => {
        const lead = await Lead.findById(leadId); // Find the lead by ID
        if (!lead) {
          throw new Error(`Lead with ID ${leadId} not found`);
        }

        lead.assignTo = userId; // Assign the user ID to the lead
        return await lead.save(); // Save and return the updated lead
      })
    );

    res.json(updatedLeads); // Send all updated leads as a response
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'uploads', // Folder name in Cloudinary
//     allowed_formats: ['jpg', 'png' , 'jpeg' , 'avif'], // Allowed formats
//   },
// });

// const upload = multer({ storage });

// router.post('/upload', upload.single('file'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }

//   try {   
//     res.json({ message: 'File uploaded successfully', url: req.file.path });
//   } catch (err) {   
//     res.status(500).json({ message: err.message });
//   }
// });


module.exports = router;
