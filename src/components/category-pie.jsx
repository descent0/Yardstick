"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { getCategoryById } from "@/lib/categories"

export default function CategoryPieChart({ transactions }) {
  const chartData = useMemo(() => {
    const categoryTotals = {}

    transactions.forEach((transaction) => {
      const category = getCategoryById(transaction.category)
      if (!categoryTotals[category.id]) {
        categoryTotals[category.id] = {
          name: category.name,
          value: 0,
          color: category.color,
          icon: category.icon,
        }
      }
      categoryTotals[category.id].value += transaction.amount
    })

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value)
  }, [transactions])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">{data.icon}</span>
            <span className="font-medium">{data.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)} (
            {((data.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-1 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.payload.icon}</span>
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={false}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
