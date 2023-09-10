const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  occupation: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  review_status: {
    type: Boolean,
    default: false,
  },
  referral_count: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
  },
  referral_link: {
    type: String,
    unique: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  referral_amount: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  review_requested: {
    type: Boolean,
  },
  review_requested_date: {
    type: String,
  },
  review_submitted_date: {
    type: String,
  },
  referral_link_shared: {
    type: Boolean,
  },
  referral_link_last_shared: {
    type: String,
  },
  google_wallet_pass: {
    type: String,
  },
  apple_wallet_pass: {
    type: String,
  },
  google_wallet_pass_created_date: {
    type: String,
  },
  apple_wallet_pass_created_date: {
    type: String,
  },
  account_created_date: {
    type: String,
  },
  account_id: {
    type: String,
  },
  account_created: {
    type: Boolean,
  },
  account_creation_link_shared: {
    type: Boolean,
  },
  account_details_submitted: {
    type: Boolean,
  },
  total_amount_generated: {
    type: Number,
  },
  lead_generated: [
    {
      lead_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

  
    
module.exports = mongoose.model("Contact", contactSchema) || mongoose.models?.Contact;
