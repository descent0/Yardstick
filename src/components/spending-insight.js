"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react"
import { getCategoryById } from "@/lib/categories"

export default function SpendingInsights({ transactions, budgets }) {
  const insights = useMemo(() => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

    // Current month transactions
    const currentMonthTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.date)
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
    })

    // Last month transactions
    const lastMonthTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.date)
      return date.getMonth() + 1 === lastMonth && date.getFullYear() === lastMonthYear
    })

    // Calculate totals
    const currentTotal = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
    const lastTotal = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
    const monthlyChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0

    // Category analysis
    const categorySpending = {}
    currentMonthTransactions.forEach((transaction) => {
      if (!categorySpending[transaction.category]) {
        categorySpending[transaction.category] = 0
      }
      categorySpending[transaction.category] += transaction.amount
    })

    const topCategory = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0]

    // Budget analysis
    const currentBudgets = budgets.filter((budget) => budget.month === currentMonth && budget.year === currentYear)

    const budgetAnalysis = currentBudgets.map((budget) => {
      const spent = categorySpending[budget.category] || 0
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        percentage,
        status: percentage > 100 ? "over" : percentage > 80 ? "warning" : "good",
      }
    })

    const overBudgetCategories = budgetAnalysis.filter((b) => b.status === "over")
    const warningCategories = budgetAnalysis.filter((b) => b.status === "warning")
    const goodCategories = budgetAnalysis.filter((b) => b.status === "good")

    // Average transaction
    const avgTransaction = currentMonthTransactions.length > 0 ? currentTotal / currentMonthTransactions.length : 0

    // Spending patterns
    const dailySpending = currentMonthTransactions.reduce((acc, transaction) => {
      const day = new Date(transaction.date).getDate()
      acc[day] = (acc[day] || 0) + transaction.amount
      return acc
    }, {})

    const avgDailySpending =
      Object.values(dailySpending).reduce((sum, amount) => sum + amount, 0) / Object.keys(dailySpending).length || 0

    // Generate insights
    const generatedInsights = []

    if (monthlyChange > 20) {
      generatedInsights.push({
        type: "warning",
        title: "High Spending Increase",
        message: `Your spending increased by ${monthlyChange.toFixed(1)}% compared to last month`,
      })
    } else if (monthlyChange < -10) {
      generatedInsights.push({
        type: "success",
        title: "Great Savings!",
        message: `You reduced spending by ${Math.abs(monthlyChange).toFixed(1)}% compared to last month`,
      })
    }

    if (overBudgetCategories.length > 0) {
      generatedInsights.push({
        type: "error",
        title: "Budget Exceeded",
        message: `You're over budget in ${overBudgetCategories.length} ${overBudgetCategories.length === 1 ? "category" : "categories"}`,
      })
    }

    if (avgTransaction > 100) {
      generatedInsights.push({
        type: "info",
        title: "High Average Transaction",
        message: `Your average transaction is $${avgTransaction.toFixed(2)}. Consider tracking smaller expenses too.`,
      })
    }

    if (goodCategories.length > 0) {
      generatedInsights.push({
        type: "success",
        title: "Budget On Track",
        message: `You're doing well in ${goodCategories.length} ${goodCategories.length === 1 ? "category" : "categories"}`,
      })
    }

    return {
      monthlyChange,
      topCategory: topCategory
        ? {
            name: getCategoryById(topCategory[0]).name,
            amount: topCategory[1],
            icon: getCategoryById(topCategory[0]).icon,
          }
        : null,
      overBudgetCategories,
      warningCategories,
      goodCategories,
      avgTransaction,
      avgDailySpending,
      totalBudget: currentBudgets.reduce((sum, b) => sum + b.amount, 0),
      totalSpent: currentTotal,
      insights: generatedInsights,
    }
  }, [transactions, budgets])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--chart-5)] rounded-xl flex items-center justify-center">
          <Lightbulb className="h-5 w-5 text-[var(--card-foreground)]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Spending Insights</h3>
          <p className="text-sm text-[var(--muted-foreground)]">AI-powered financial analysis</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Monthly Trend */}
        <div className="bg-[var(--card)]/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {insights.monthlyChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm font-medium">Monthly Change</span>
            </div>
            <Badge variant={insights.monthlyChange >= 0 ? "destructive" : "default"}>
              {insights.monthlyChange >= 0 ? "+" : ""}
              {insights.monthlyChange.toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Top Category */}
        {insights.topCategory && (
          <div className="bg-[var(--card)]/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{insights.topCategory.icon}</span>
                <span className="text-sm font-medium">Top Category</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{insights.topCategory.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{formatCurrency(insights.topCategory.amount)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Budget Alerts */}
        {insights.overBudgetCategories.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Over Budget</span>
            </div>
            <div className="space-y-2">
              {insights.overBudgetCategories.map((category) => (
                <div key={category.category} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{getCategoryById(category.category).icon}</span>
                    <span>{getCategoryById(category.category).name}</span>
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-medium">{category.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.warningCategories.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl border border-yellow-200 dark:border-yellow-800 p-4">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-3">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Budget Warning</span>
            </div>
            <div className="space-y-2">
              {insights.warningCategories.map((category) => (
                <div key={category.category} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{getCategoryById(category.category).icon}</span>
                    <span>{getCategoryById(category.category).name}</span>
                  </span>
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    {category.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {insights.insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Smart Insights
            </h4>
            {insights.insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-sm ${
                  insight.type === "error"
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                    : insight.type === "warning"
                      ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300"
                      : insight.type === "success"
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                        : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                }`}
              >
                <p className="font-medium mb-1">{insight.title}</p>
                <p className="text-xs opacity-90">{insight.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(insights.avgTransaction)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Avg Transaction</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {insights.totalBudget > 0 ? `${((insights.totalSpent / insights.totalBudget) * 100).toFixed(0)}%` : "N/A"}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">Budget Used</p>
          </div>
        </div>
      </div>
    </div>
  )
}
