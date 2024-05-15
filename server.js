const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

let members = [
  {
    id: "1",
    name: "Moaz",
    nationalId: "12434",
    phoneNumber: "0123123123",
    membership: {
      from: new Date("2024-01-01"),
      to: new Date("2024-03-30"),
      cost: 123,
    },
    status: "Active",
    trainerId: "1",
  },
  {
    id: "2",
    name: "sad asd",
    nationalId: "1234",
    phoneNumber: "0112121212",
    membership: {
      from: new Date("2024-02-21"),
      to: new Date("2024-07-21"),
      cost: 877,
    },
    status: "Active",
    trainerId: "12",
  },
];

let trainers = [
  {
    id: "1",
    name: "Trainer 1",
    duration: {
      from: new Date("2024-01-01"),
      to: new Date("2024-06-30"),
    },
  },
  {
    id: "2",
    name: "Trainer 2",
    duration: {
      from: new Date("2024-02-01"),
      to: new Date("2024-07-31"),
    },
  },
];

// Member's APIs

// Add Member
app.post("/members", (req, res) => {
  const member = req.body;
  const existingMember =
    members.find((m) => m.id === member.id) ||
    members.find((m) => m.nationalId === member.nationalId);
  if (existingMember) {
    return res.status(400).json({ error: "Member already exists" });
  }
  members.push(member);
  res.json(member);
});

// Get all Members and Member’s Trainer
app.get("/members", (req, res) => {
  const membersWithTrainers = members.map((member) => {
    const trainer = trainers.find((t) => t.id === member.trainerId);
    return {
      id: member.id,
      name: member.name,
      nationalId: member.nationalId,
      phone: member.phoneNumber,
      membership: member.membership,
      status: member.status,
      trainer,
    };
  });
  res.json(membersWithTrainers);
});

// Get a specific Member
app.get("/members/:id", (req, res) => {
  const member = members.find((m) => m.id === req.params.id);
  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }
  if (new Date(member.membership.to) < new Date()) {
    return res.status(403).json({ error: "This member is not allowed to enter the gym" });
  }
  res.json(member);
});

// Update Member
app.put("/members/:id", (req, res) => {
  const index = members.findIndex((m) => m.id === req.params.id);
  console.log(index);
  if (index === -1) {
    return res.status(404).json({ error: "Member not found" });
  }
  members[index] = { ...members[index], ...req.body };
  res.json(members[index]);
});

// Delete Member
app.delete("/members/:id", (req, res) => {
  const index = members.findIndex((m) => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Member not found" });
  }
  members.splice(index, 1);
  res.json({ message: "Member deleted successfully" });
});

// Trainer's APIs

// Add Trainer
app.post("/trainers", (req, res) => {
  const trainer = req.body;
  const existingTrainer = trainers.find((t) => t.id === trainer.id);
  if (existingTrainer) {
    return res.status(400).json({ error: "Trainer ID already exists" });
  }
  trainers.push(trainer);
  res.json(trainer);
});

// Get all Trainers and Trainer’s Members
app.get("/trainers", (req, res) => {
  const trainersWithMembers = trainers.map((trainer) => {
    const trainerMembers = members.filter((m) => m.trainerId === trainer.id);
    return { ...trainer, members: trainerMembers };
  });
  res.json(trainersWithMembers);
});

// Get a specific Trainer
app.get("/trainers/:id", (req, res) => {
  const trainer = trainers.find((t) => t.id === req.params.id);
  if (!trainer) {
    return res.status(404).json({ error: "Trainer not found" });
  }
  const trainerMembers = members.filter((m) => m.trainerId === req.params.id);
  res.json({ trainer, members: trainerMembers });
});

// Update Trainer
app.put("/trainers/:id", (req, res) => {
  const index = trainers.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Trainer not found" });
  }
  trainers[index] = { ...trainers[index], ...req.body };
  res.json(trainers[index]);
});

// Delete Trainer (soft delete)
app.delete("/trainers/:id", (req, res) => {
  const index = trainers.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Trainer not found" });
  }
  trainers.splice(index, 1);
  res.json({ message: "Trainer deleted successfully" });
});

// Statistics APIs

// Get all revenues of all members
app.get("/revenues", (req, res) => {
  const totalRevenue = members.reduce((total, member) => total + member.membership.cost, 0);
  res.json({ totalRevenue });
});

// Get the revenues of a specific trainer
app.get("/revenues/:trainerId", (req, res) => {
  const trainerId = req.params.trainerId;
  const trainerRevenue = members.reduce((total, member) => {
    if (member.trainerId === trainerId) {
      return total + member.membership.cost;
    }
    return total;
  }, 0);
  res.json({ trainerRevenue });
});

app.use("*", (req, res) => {
  res.status(404).json({ error: "API not found" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
