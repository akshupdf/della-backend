const mongoose = require("mongoose");

const ClubbenefitSchema = new mongoose.Schema({
  medicalFacilities: { type: String },
  games: { type: String },
  gym: { type: String},
  movie: { type: String },
  anniversaryDinner: { type: String },
  events: { type: [String], default: [] },
  memberId: { type: String},
  ben_status : { type: String, default: 'new'},
  status_note : { type: String},
});

const ClubBenefit = mongoose.model("clubBenefit", ClubbenefitSchema);
module.exports = ClubBenefit;
