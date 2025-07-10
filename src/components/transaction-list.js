"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Edit, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getCategoryById } from "@/lib/categories"

export default function TransactionList({ transactions, onEdit, onRefresh }) {
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState("")

  const handleDelete = async (id) => {
    setError("")
    setDeletingId(id)

    try {
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete transaction")
      }

      onRefresh()
    } catch (error) {
      setError(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (transactions.length === 0) {
    return (
      <div className="h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] rounded-xl flex items-center justify-center">
            <Edit className="h-5 w-5 text-[var(--card-foreground)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--foreground)]">Recent Transactions</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Your latest expenses</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-64 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="text-center">
            <Edit className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
            <p className="text-[var(--muted-foreground)] font-medium">No transactions found</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Add your first transaction to get started</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--chart-2)] rounded-xl flex items-center justify-center">
          <Edit className="h-5 w-5 text-[var(--card-foreground)]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Recent Transactions</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Your latest {transactions.length} expenses</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Transactions List */}
      <div className="bg-[var(--card)]/60 backdrop-blur-sm rounded-2xl border border-[var(--border)] p-4 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {transactions.slice(0, 10).map((transaction) => {
            const category = getCategoryById(transaction.category)
            return (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 bg-[var(--background)]/50 border border-[var(--border)]/50 rounded-xl hover:bg-[var(--muted)]/30 transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg" title={category.name}>
                        {category.icon}
                      </span>
                      <p className="font-medium truncate text-[var(--foreground)]">{transaction.description}</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <span>{formatDate(transaction.date)}</span>
                    <span>•</span>
                    <span>{category.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                    className="h-8 w-8 p-0 hover:bg-[var(--muted)]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === transaction._id}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        {deletingId === transaction._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this transaction? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(transaction._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {transactions.length > 10 && (
        <p className="text-center text-sm text-[var(--muted-foreground)] mt-4">
          Showing 10 of {transactions.length} transactions
        </p>
      )}
    </div>
  )
}
