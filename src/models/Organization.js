import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  apiKeys: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
    },
  ],
});

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;
