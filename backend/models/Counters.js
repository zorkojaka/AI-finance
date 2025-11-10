import mongoose from 'mongoose';

const CountersSchema = new mongoose.Schema(
  {
    _id: String,
    seq: { type: Number, default: 0 }
  },
  { versionKey: false }
);

const Counters = mongoose.models.Counters || mongoose.model('Counters', CountersSchema);
export default Counters;
