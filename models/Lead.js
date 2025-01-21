const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  date: { type: String, required: false },
  location: { type: String, required: false },
  name: { type: String, required: false },
  phone1: { type: String, required: false },
  phone2: { type: String, required: false },
  emailId: { type: String, required: false },
  age: { type: Number, required: false },
  profession: { type: String, required: false },
  income: { type: String, required: false },
  lastHoliday: { type: String, default: null },
  car: { type: String, required: false },
  creditCard: { type: String, required: false },
  time: { type: String, default: null },
  executive: { type: String, required: false },
  tl: { type: String, default: null },
  manager: { type: String, default: null },
  status: { type: String, required: false ,  lowercase: true},
  remark: { type: String },
  assignTo : { type: String },
  sale_executive: { type: String, default: null },
  sale_tl: { type: String, default: null },
});

module.exports = mongoose.model('Lead', leadSchema);
