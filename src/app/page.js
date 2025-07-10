"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, RefreshCw, Loader2, TrendingUp, CreditCard, BarChart3, PiggyBank } from "lucide-react"
import TransactionForm from "@/components/transaction-form"
import TransactionList from "@/components/transaction-list"
import MonthlyExpensesChart from "@/components/monthly-expenses-chart"
import CategoryPieChart from "@/components/category-pie"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DarkModeToggle from "@/components/DarkModeToggle"
import { getCategoryById } from "@/lib/categories"
import BudgetForm from "@/components/budget-form"
import BudgetComparisonChart from "@/components/budget-comparison-chart"
import SpendingInsights from "@/components/spending-insight"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [budgets, setBudgets] = useState([])
  const [showBudgetForm, setShowBudgetForm] = useState(false)

  const fetchTransactions = async () => {
    try {
      setError("")
      const res = await fetch("/api/transactions")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch transactions")
      setTransactions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchBudgets = async () => {
    try {
      const res = await fetch("/api/budgets")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch budgets")
      setBudgets(data)
    } catch (err) {
      console.error("Failed to fetch budgets:", err)
    }
  }

  useEffect(() => {
    fetchTransactions()
    fetchBudgets()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchTransactions()
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTransaction(null)
    fetchTransactions()
  }

  const handleEdit = (tx) => {
    setEditingTransaction(tx)
    setShowForm(true)
  }

  const handleBudgetFormSuccess = () => {
    setShowBudgetForm(false)
    fetchBudgets()
  }

  const handleCloseBudgetForm = () => {
    setShowBudgetForm(false)
  }

  // Calculate summary statistics
  const totalExpenses = transactions.reduce((sum, tx) => sum + tx.amount, 0)

  // Get category breakdown for current month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const currentMonthTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date)
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
  })

  const categoryBreakdown = currentMonthTransactions.reduce((acc, tx) => {
    const category = getCategoryById(tx.category)
    if (!acc[category.id]) {
      acc[category.id] = { name: category.name, icon: category.icon, total: 0, count: 0 }
    }
    acc[category.id].total += tx.amount
    acc[category.id].count += 1
    return acc
  }, {})

  const topCategory = Object.values(categoryBreakdown).sort((a, b) => b.total - a.total)[0]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 bg-card backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-border">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-foreground font-medium">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-popover/70 backdrop-blur-xl border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
            <div className="flex gap-4 items-start sm:items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-3 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Personal Finance Visualizer
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                  Track expenses, set budgets, and get smart insights
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <DarkModeToggle />
              <Button
                variant="ghost"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border border-border bg-muted/30 hover:bg-muted text-foreground"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-10">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <TrendingUp className="h-6 w-6 text-white" />,
                  title: "Total Expenses",
                  value: `$${totalExpenses.toFixed(2)}`,
                  gradient: "from-emerald-500 to-teal-600",
                },
                {
                  icon: <CreditCard className="h-6 w-6 text-white" />,
                  title: "Total Transactions",
                  value: transactions.length,
                  gradient: "from-blue-500 to-indigo-600",
                },
                {
                  icon: <BarChart3 className="h-6 w-6 text-white" />,
                  title: "Average Transaction",
                  value: `$${(transactions.length ? totalExpenses / transactions.length : 0).toFixed(2)}`,
                  gradient: "from-purple-500 to-pink-600",
                },
                {
                  icon: <PiggyBank className="h-6 w-6 text-white" />,
                  title: "Active Budgets",
                  value: budgets.length,
                  gradient: "from-orange-500 to-red-600",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-2xl p-6 shadow-md transition hover:shadow-xl hover:scale-[1.01]"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center`}
                    >
                      {item.icon}
                    </div>
                    <div className="text-right">
                      <h3 className="text-xs uppercase text-muted-foreground">{item.title}</h3>
                      <p
                        className={`text-2xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}
                      >
                        {item.value}
                      </p>
                      {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
                    </div>
                  </div>
                  <div className={`h-1 bg-gradient-to-r ${item.gradient} rounded-full`} />
                </div>
              ))}
            </div>

            {/* Charts and Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
                  <MonthlyExpensesChart transactions={transactions} />
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
                  <TransactionList transactions={transactions} onEdit={handleEdit} onRefresh={fetchTransactions} />
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl flex flex-col gap-16 p-6 shadow-md">
                <CategoryPieChart transactions={transactions} />
                {/* Category Breakdown */}
                {Object.keys(categoryBreakdown).length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold">This Month&apos;s Category Breakdown</h2>
                    <div className="flex flex-wrap gap-4">
                      {Object.values(categoryBreakdown)
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 5)
                        .map((category, idx) => (
                          <div
                            key={idx}
                            className="bg-card border border-border rounded-xl p-4 min-w-[48%] text-center shadow-sm hover:shadow-md transition"
                          >
                            <div className="text-2xl mb-2">{category.icon}</div>
                            <p className="text-sm font-medium text-muted-foreground">{category.name}</p>
                            <p className="text-lg font-bold text-foreground">${category.total.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{category.count} transactions</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                  <BudgetComparisonChart transactions={transactions} budgets={budgets} />
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                  <SpendingInsights transactions={transactions} budgets={budgets} />
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                  <CategoryPieChart transactions={transactions} />
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                  <MonthlyExpensesChart transactions={transactions} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Budget Management</h2>
              <Button
                onClick={() => setShowBudgetForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
              >
                <PiggyBank className="h-4 w-4 mr-2" />
                Set Budget
              </Button>
            </div>

            <div className="grid gap-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <BudgetComparisonChart transactions={transactions} budgets={budgets} />
              </div>

              {budgets.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Current Budgets</h3>
                  <div className="space-y-4">
                    {budgets.map((budget) => {
                      const category = getCategoryById(budget.category)
                      const currentMonth = new Date().getMonth() + 1
                      const currentYear = new Date().getFullYear()
                      const isCurrentMonth = budget.month === currentMonth && budget.year === currentYear

                      return (
                        <div
                          key={budget._id}
                          className="flex items-center justify-between p-4 border border-border rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{category.icon}</span>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(budget.year, budget.month - 1).toLocaleDateString("en-US", {
                                  month: "long",
                                  year: "numeric",
                                })}
                                {isCurrentMonth && (
                                  <Badge className="ml-2" variant="secondary">
                                    Current
                                  </Badge>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">${budget.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Budget Form Dialog */}
        <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
          <DialogContent className="bg-card border border-border backdrop-blur-xl shadow-xl max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Set Budget</DialogTitle>
            </DialogHeader>
            <BudgetForm onSuccess={handleBudgetFormSuccess} onCancel={handleCloseBudgetForm} />
          </DialogContent>
        </Dialog>

        {/* Transaction Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-card border border-border backdrop-blur-xl shadow-xl max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              transaction={editingTransaction}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setEditingTransaction(null)
                setShowForm(false)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
