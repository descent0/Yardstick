// models/Transaction.js
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true }, 
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
