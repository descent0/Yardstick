import mongoose from "mongoose"

const BudgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound index to ensure one budget per category per month/year
BudgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true })

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema)
