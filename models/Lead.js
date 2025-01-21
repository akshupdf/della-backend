const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  date: { type: String },
  location: { type: String },
  name: { type: String},
  phone1: { type: String },
  phone2: { type: String },
  emailId: { type: String },
  age: { type: Number},
  profession: { type: String },
  income: { type: String },
  lastHoliday: { type: String, default: null },
  car: { type: String },
  creditCard: { type: String},
  time: { type: String, default: null },
  executive: { type: String },
  tl: { type: String, default: null },
  manager: { type: String, default: null },
  status: { type: String, lowercase: true},
  remark: { type: String },
  assignTo : { type: String },
  sale_executive: { type: String, default: null },
  sale_tl: { type: String, default: null },
});

module.exports = mongoose.model('Lead', leadSchema);
