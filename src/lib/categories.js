export const CATEGORIES = [
  { id: "food", name: "Food & Dining", icon: "🍽️", color: "#FF6B6B" },
  { id: "transportation", name: "Transportation", icon: "🚗", color: "#4ECDC4" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#45B7D1" },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "#96CEB4" },
  { id: "bills", name: "Bills & Utilities", icon: "💡", color: "#FFEAA7" },
  { id: "healthcare", name: "Healthcare", icon: "🏥", color: "#DDA0DD" },
  { id: "education", name: "Education", icon: "📚", color: "#98D8C8" },
  { id: "travel", name: "Travel", icon: "✈️", color: "#F7DC6F" },
  { id: "fitness", name: "Fitness & Sports", icon: "💪", color: "#BB8FCE" },
  { id: "other", name: "Other", icon: "📦", color: "#AED6F1" },
]

export const getCategoryById = (id) => {
  return CATEGORIES.find((category) => category.id === id) || CATEGORIES.find((category) => category.id === "other")
}

export const getCategoryColor = (id) => {
  const category = getCategoryById(id)
  return category.color
}
