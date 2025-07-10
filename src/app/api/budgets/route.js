import dbConnect from "@/lib/mongoose"
import Budget from "@/model/Budget"
import { NextResponse } from "next/server"


export async function GET() {
  try {
    await dbConnect()
    const budgets = await Budget.find({}).sort({ year: -1, month: -1 })
    return NextResponse.json(budgets)
  } catch (error) {
    console.error("GET /api/budgets error:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()
    const { category, amount, month, year } = body

    if (!category || !amount || !month || !year) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (isNaN(Number.parseFloat(amount))) {
      return NextResponse.json({ error: "Amount must be a valid number" }, { status: 400 })
    }

    if (Number.parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    // Check if budget already exists for this category and month/year
    const existingBudget = await Budget.findOne({
      category,
      month: Number.parseInt(month),
      year: Number.parseInt(year),
    })

    if (existingBudget) {
      // Update existing budget
      existingBudget.amount = Number.parseFloat(amount)
      await existingBudget.save()
      return NextResponse.json({ message: "Budget updated successfully" })
    } else {
      // Create new budget
      const budget = new Budget({
        category,
        amount: Number.parseFloat(amount),
        month: Number.parseInt(month),
        year: Number.parseInt(year),
      })
      await budget.save()
      return NextResponse.json({ id: budget._id, message: "Budget created successfully" })
    }
  } catch (error) {
    console.error("POST /api/budgets error:", error)
    return NextResponse.json({ error: "Failed to create/update budget" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Budget ID is required" }, { status: 400 })
    }

    const budget = await Budget.findByIdAndDelete(id)

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Budget deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/budgets error:", error)
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 })
  }
}
