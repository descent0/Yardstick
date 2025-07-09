"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = storedTheme === "dark" || (!storedTheme && prefersDark)

    document.documentElement.classList.toggle("dark", shouldBeDark)
    setIsDark(shouldBeDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark"
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    setIsDark(!isDark)
  }

  return (
    <div className="flex items-center justify-center  bg-transparent transition-colors">
      <div className="flex items-center space-x-4">
        {/* Toggle Button Wrapped in shadcn/ui Button */}
        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="default"
          className={`w-16 h-8 rounded-full p-1 flex items-center transition-colors duration-500 justify-start ${
            isDark ? "bg-[#0f172a]" : "bg-[#cbd5e1]"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full shadow-sm transform transition-transform duration-500 flex items-center justify-center ${
              isDark ? "translate-x-8 bg-[#1e293b]" : "translate-x-0 bg-yellow-300"
            }`}
          >
            {isDark ? (
              <Moon className="text-white w-4 h-4" />
            ) : (
              <Sun className="text-yellow-600 w-4 h-4" />
            )}
          </div>
        </Button>

      </div>
    </div>
  )
}
