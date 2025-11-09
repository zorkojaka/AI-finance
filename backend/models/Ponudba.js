import mongoose from 'mongoose';

const ponudbaItemSchema = new mongoose.Schema(
  {
    artikelId: { type: mongoose.Schema.Types.ObjectId, ref: 'PricelistItem', required: true },
    kolicina: { type: Number, required: true }
  },
  { _id: false }
);

const ponudbaVersionArtikelSchema = new mongoose.Schema(
  {
    artikelId: { type: mongoose.Schema.Types.ObjectId, ref: 'PricelistItem' },
    naziv: String,
    enota: String,
    kolicina: Number,
    cenaNaEnoto: Number,
    cenaSkupaj: Number,
    ddv: Number,
    znesekZDDV: Number
  },
  { _id: false }
);

const ponudbaVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    artikli: { type: [ponudbaVersionArtikelSchema], default: [] },
    popust: { type: Number, default: 0 },
    vsotaBrezDDV: { type: Number, default: 0 },
    ddvZnesek: { type: Number, default: 0 },
    vsotaZDDV: { type: Number, default: 0 },
    skupnoSPopustom: { type: Number, default: 0 },
    pdfPot: { type: String },
    strankaSnapshot: {
      ime: String,
      naslov: String,
      davcna: String
    },
    createdAt: { type: Date, default: () => new Date() }
  },
  { _id: false }
);

const ponudbaSchema = new mongoose.Schema(
  {
    strankaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    artikli: { type: [ponudbaItemSchema], required: true },
    popust: { type: Number, default: 0 },
    stevilka: { type: String, required: true },
    pdfPot: { type: String },
    currentVersion: { type: Number, default: 1 },
    versions: { type: [ponudbaVersionSchema], default: [] },
    verzija: { type: Number, default: 1 },
    aktivna: { type: Boolean, default: true },
    originalId: { type: mongoose.Schema.Types.ObjectId }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const Ponudba =
  mongoose.models.Ponudba || mongoose.model('Ponudba', ponudbaSchema);
