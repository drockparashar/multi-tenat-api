import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  details: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
