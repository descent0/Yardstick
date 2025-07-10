"use client"

import { useMemo, useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getCategoryById } from "@/lib/categories"
import { Target } from "lucide-react"

export default function BudgetComparisonChart({ transactions, budgets }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark"))
    }
  }, [])

  const chartData = useMemo(() => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const currentBudgets = budgets.filter(
      (budget) => budget.month === currentMonth && budget.year === currentYear
    )

    const actualSpending = {}
    transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return (
          transactionDate.getMonth() + 1 === currentMonth &&
          transactionDate.getFullYear() === currentYear
        )
      })
      .forEach((transaction) => {
        if (!actualSpending[transaction.category]) {
          actualSpending[transaction.category] = 0
        }
        actualSpending[transaction.category] += transaction.amount
      })

    const data = currentBudgets.map((budget) => {
      const category = getCategoryById(budget.category)
      const actual = actualSpending[budget.category] || 0
      const remaining = Math.max(0, budget.amount - actual)
      const overspent = Math.max(0, actual - budget.amount)

      return {
        category: category.name,
        icon: category.icon,
        budget: budget.amount,
        actual: actual,
        remaining: remaining,
        overspent: overspent,
        percentage: budget.amount > 0 ? (actual / budget.amount) * 100 : 0,
      }
    })

    return data.sort((a, b) => b.budget - a.budget)
  }, [transactions, budgets])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (chartData.length === 0) {
    return (
      <div className="h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--chart-4)] rounded-xl flex items-center justify-center">
            <Target className="h-5 w-5 text-[var(--card-foreground)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--foreground)]">Budget vs Actual</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Current month comparison</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="text-center">
            <Target className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
            <p className="text-[var(--muted-foreground)] font-medium">No budgets set for this month</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Set your first budget to see comparisons</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--chart-4)] rounded-xl flex items-center justify-center">
          <Target className="h-5 w-5 text-[var(--card-foreground)]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Budget vs Actual</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[var(--card)]/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] p-4">
        <ChartContainer
          config={{
            budget: { label: "Budget", color: isDarkMode ? "#5dafff" : "#1e90ff" },
            actual: { label: "Actual", color: isDarkMode ? "#4ad991" : "#2cb673" },
          }}
          className="h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.6} />
              <XAxis
                dataKey="category"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
                stroke="var(--muted-foreground)"
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [formatCurrency(value), name === "budget" ? "Budget" : "Actual"]}
              />
              <Legend />
              <Bar
                dataKey="budget"
                fill={isDarkMode ? "#5dafff" : "#1e90ff"}
                name="Budget"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="actual"
                fill={isDarkMode ? "#4ad991" : "#2cb673"}
                name="Actual"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Budget Status Cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {chartData.slice(0, 3).map((item, idx) => (
          <div key={idx} className="bg-[var(--card)]/40 rounded-xl p-3 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium text-[var(--foreground)]">{item.category}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted-foreground)]">Budget</span>
                <span className="font-medium">{formatCurrency(item.budget)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted-foreground)]">Spent</span>
                <span
                  className={`font-medium ${
                    item.overspent > 0
                      ? "text-red-500 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {formatCurrency(item.actual)}
                </span>
              </div>
              <div className="w-full bg-[var(--muted)] rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    item.percentage > 100
                      ? "bg-red-500 dark:bg-red-400"
                      : item.percentage > 80
                      ? "bg-yellow-500 dark:bg-yellow-400"
                      : "bg-green-500 dark:bg-green-400"
                  }`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-center text-[var(--muted-foreground)]">
                {item.percentage.toFixed(0)}% used
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
