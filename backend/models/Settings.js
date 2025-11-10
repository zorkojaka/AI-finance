import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'singleton' },
    company: {
      name: String,
      address: String,
      tax_id: String,
      iban: String,
      email: String
    },
    pdf: {
      locale: { type: String, default: 'sl-SI' },
      currency: { type: String, default: 'EUR' },
      font: { type: String, default: 'Inter' }
    },
    flags: {
      ENABLE_TIMELINE: { type: Boolean, default: true },
      ENABLE_CONFIRM: { type: Boolean, default: true },
      NORMALIZE_UNICODE_RESPONSES: { type: Boolean, default: true }
    },
    updated_at: { type: Date, default: Date.now }
  },
  { _id: false, timestamps: true }
);

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
export default Settings;
