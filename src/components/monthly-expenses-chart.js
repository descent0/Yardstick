"use client"

import { useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell
} from "recharts"
import { ChartTooltip } from "@/components/ui/chart"
import { BarChart3, TrendingUp, Calendar } from "lucide-react"

export default function MonthlyExpensesChart({ transactions }) {
  const chartData = useMemo(() => {
    const monthlyData = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthLabel = date.toLocaleDateString("en-US", { year: "numeric", month: "short" })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          expenses: 0,
          fullDate: date,
        }
      }

      monthlyData[monthKey].expenses += transaction.amount
    })

    return Object.values(monthlyData)
      .sort((a, b) => a.fullDate - b.fullDate)
      .slice(-6)
      .map(item => ({
        month: item.month,
        expenses: item.expenses,
      }))
  }, [transactions])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0)
  const avgExpenses = chartData.length > 0 ? totalExpenses / chartData.length : 0
  const maxExpenses = Math.max(...chartData.map(item => item.expenses))

  const getBarColor = (value) => {
    const ratio = value / maxExpenses
    if (ratio > 0.8) return 'var(--destructive)'      // Very High
    if (ratio > 0.6) return 'var(--chart-4)'          // High
    if (ratio > 0.4) return 'var(--chart-3)'          // Medium
    return 'var(--chart-1)'                           // Low
  }

  if (chartData.length === 0) {
    return (
      <div className="h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--chart-3)] rounded-xl flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-[var(--card-foreground)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--foreground)]">Monthly Expenses</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Track your spending over time</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
            <p className="text-[var(--muted-foreground)] font-medium">No expense data available</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Add some transactions to see your monthly trends</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--chart-3)] rounded-xl flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-[var(--card-foreground)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--foreground)]">Monthly Expenses</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Last 6 months trend</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">Avg: {formatCurrency(avgExpenses)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Period", value: totalExpenses },
          { label: "Average", value: avgExpenses },
          { label: "Peak Month", value: maxExpenses },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <p className="text-sm text-[var(--muted-foreground)] font-medium">{stat.label}</p>
            <p className="text-lg font-bold text-[var(--foreground)]">{formatCurrency(stat.value)}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[var(--card)]/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] p-4">
        <ResponsiveContainer width="100%" height={256}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              strokeOpacity={0.6}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              stroke="var(--muted-foreground)"
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
              stroke="var(--muted-foreground)"
              width={80}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[var(--popover)]/95 text-[var(--popover-foreground)] backdrop-blur-sm border border-[var(--border)] rounded-xl p-3 shadow-lg">
                      <p className="font-semibold mb-1">{label}</p>
                      <p className="text-sm">
                        <span className="font-medium text-[var(--primary)]">Expenses: </span>
                        {formatCurrency(payload[0].value)}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="expenses" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.expenses)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <LegendDot color="var(--chart-1)" label="Low Spending" />
        <LegendDot color="var(--chart-3)" label="Medium" />
        <LegendDot color="var(--chart-4)" label="High" />
        <LegendDot color="var(--destructive)" label="Very High" />
      </div>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-[var(--muted-foreground)]">{label}</span>
    </div>
  )
}
