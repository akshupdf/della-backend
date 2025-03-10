const mongoose = require("mongoose");

const benefitSchema = new mongoose.Schema({
  travelling: { type: String },
  pickUpDrop: { type: String },
  accommodation: { type: String },
  food: { type: String },
  sightseeing: { type: String },
  medicalFacilities: { type: String },
  games: { type: String },
  gym: { type: String},
  movie: { type: String },
  anniversaryDinner: { type: String },
  events: { type: [String], default: [] },
  memberId: { type: String},
  status_note : { type: String},
  trav_status : { type: String, default: 'new'}
});

const Benefit = mongoose.model("Benefit", benefitSchema);
module.exports = Benefit;
