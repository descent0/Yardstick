"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, RefreshCw, Loader2, TrendingUp, CreditCard, BarChart3 } from "lucide-react"
import TransactionForm from "@/components/transaction-form"
import TransactionList from "@/components/transaction-list"
import MonthlyExpensesChart from "@/components/monthly-expenses-chart"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DarkModeToggle from "@/components/DarkModeToggle"

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

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

  useEffect(() => {
    fetchTransactions()
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

  const totalExpenses = transactions.reduce((sum, tx) => sum + tx.amount, 0)

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
              <img src="/favicon.svg" alt="Logo" className="w-10 h-10" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Personal Finance Visualizer
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                  Track your expenses and visualize your spending
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <DarkModeToggle />
              <Button variant="ghost" onClick={handleRefresh} disabled={refreshing} className="border border-border bg-muted/30 hover:bg-muted text-foreground">
                {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
              </Button>
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700">
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

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
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
          ].map((item, idx) => (
            <div key={idx} className="bg-card border border-border rounded-2xl p-6 shadow hover:shadow-xl transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div className="text-right">
                  <h3 className="text-xs uppercase text-muted-foreground">{item.title}</h3>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                    {item.value}
                  </p>
                </div>
              </div>
              <div className={`h-1 bg-gradient-to-r ${item.gradient} rounded-full`} />
            </div>
          ))}
        </div>

        {/* Chart + List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <MonthlyExpensesChart transactions={transactions} />
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <TransactionList transactions={transactions} onEdit={handleEdit} onRefresh={fetchTransactions} />
          </div>
        </div>

        {/* Modal Form */}
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
