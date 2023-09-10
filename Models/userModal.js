const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
  isActive: {
    type: Boolean,
    default: false,
  },
  profile_image: {
    type: String,
    default:
      "https://referme-user-images.s3.eu-west-2.amazonaws.com/Profile+Icon+(1).jpeg",
  },
  isUploadingContacts: {
    type: Boolean,
    default: false,
  },
  totalContactsToUpload: {
    type: Number,
  },
  totalContactsBeforeUpload: {
    type: Number,
  },
  pendingContactsToUpload: {
    type: Number,
  },
  username: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  aboutme: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  date_joined: {
    type: Date,
    default: Date.now,
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  cover_image: {
    type: String,
    default:
      "https://referme-user-images.s3.eu-west-2.amazonaws.com/default_cover.jpeg",
  },
  services: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
  ],
  businessAddress: {
    postcode: {
      type: String,
      default: null,
    },
    calendly: {
      type: String,
      default: null,
    },
    address_line_1: {
      type: String,
      default: null,
    },
    address_line_2: {
      type: String,
      default: null,
    },

    distance: {
      type: String,
      default: null,
    },
  },
  socials: {
    facebook: {
      type: String,
      default: null,
    },
    twitter: {
      type: String,
      default: null,
    },
    instagram: {
      type: String,
      default: null,
    },
    linkedin: {
      type: String,
      default: null,
    },
    // Add other social media platforms as needed
  },
  business_address: {
    address: {
      type: String,
    },
    location: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
  },
  contacts: [
    {
      contact_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact",
      },
    },
  ],
  comments_made: [
    {
      comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    },
  ],
  referrals_received: {
    type: Number,
    default: 0,
  },
  total_reviews: {
    type: Number,
    default: 0,
  },
  total_income: {
    type: Number,
    default: 0,
  },
  total_spend: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
  },
  organization: {
    type: String,
  },
  total_sales: {
    type: Number,
    default: 0,
  },
  average_spend: {
    type: Number,
    default: 0,
  },
  conversion_rate: {
    type: Number,
    default: 0,
  },
  reset_password_token: {
    type: String,
    default: null,
  },
  reset_password_expire: {
    type: String,
    default: null,
  },
  otp: {
    type: Number,
    default: null,
  },
  otp_expiration_time: {
    type: String,
    default: null,
  },
  my_leads: [
    {
      lead_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
      },
    },
  ],
  reviews: [
    {
      review_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    },
  ],
  disclaimer: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema) || mongoose.models?.User;
