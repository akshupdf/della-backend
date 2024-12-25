const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  memberName1: { type: String, required: true },
  partnerName: { type: String },
  mobile: { type: String, required: true },
  membershipPeriod: { type: String, required: true },
  membershipPrice: { type: String, required: true },
  packageType: { type: String, required: true },
  privilegeClub: { type: Boolean, required: true },
  gym: { type: Boolean, required: true },
  purchasedPrice: { type: String, required: true },
  downPayment: { type: String },
  balance: { type: String },
  modeOfPayment: { type: String },
  saleRep: { type: String },
  manager: { type: String },
  branchInCharge: { type: String },
  paymentProof: { type: String }, // URL or file path
  memberKyc: { type: String },   // URL or file path
  digitalSignature: { type: String }, // URL or file path
  agreementNumber: { type: String },
  amc: { type: String },
});

module.exports = mongoose.model('Membership', membershipSchema);
