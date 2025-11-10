import mongoose from 'mongoose';

const projektSchema = new mongoose.Schema(
  {
    naziv: { type: String, required: true, trim: true },
    strankaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    lokacija: { type: String },
    kategorije: { type: [String], default: [] },
    zahteve: { type: String },
    status: {
      type: String,
      default: 'v pripravi',
      enum: ['v pripravi', 'potrjeno', 'v izvedbi', 'zaklju─ìeno', 'na ─ìakanju']
    },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const Projekt = mongoose.models.Projekt || mongoose.model('Projekt', projektSchema);

export default Projekt;
