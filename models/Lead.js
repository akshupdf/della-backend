const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  date: { type: String, required: true },
  location: { type: String, required: true },
  name: { type: String, required: true },
  phone1: { type: String, required: true },
  phone2: { type: String, required: true },
  emailId: { type: String, required: true },
  age: { type: Number, required: true },
  profession: { type: String, required: true },
  income: { type: String, required: true },
  lastHoliday: { type: String, default: null },
  car: { type: String, required: true },
  creditCard: { type: String, required: true },
  time: { type: String, default: null },
  executive: { type: String, required: true },
  tl: { type: String, default: null },
  manager: { type: String, default: null },
  status: { type: String, required: true ,  lowercase: true},
  remark: { type: String },
});

module.exports = mongoose.model('Lead', leadSchema);
