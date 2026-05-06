import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

type CalcState = {
  current: string
  previous: string
  operator: string | null
  shouldReset: boolean
}

const initialState: CalcState = {
  current: "0",
  previous: "",
  operator: null,
  shouldReset: false,
}

const opSymbol: Record<string, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
}

export function Calculator() {
  const [state, setState] = useState<CalcState>(initialState)

  const inputNumber = useCallback((num: string) => {
    setState((s) => ({
      ...s,
      current: s.shouldReset
        ? num
        : s.current === "0"
        ? num
        : s.current.length >= 12
        ? s.current
        : s.current + num,
      shouldReset: false,
    }))
  }, [])

  const inputDot = useCallback(() => {
    setState((s) => ({
      ...s,
      current: s.shouldReset ? "0." : s.current.includes(".") ? s.current : s.current + ".",
      shouldReset: false,
    }))
  }, [])

  const compute = useCallback((s: CalcState, intermediate = false): CalcState => {
    if (!s.operator || !s.previous) return s
    const a = parseFloat(s.previous)
    const b = parseFloat(s.current)
    let result: number | string
    switch (s.operator) {
      case "+": result = a + b; break
      case "-": result = a - b; break
      case "*": result = a * b; break
      case "/": result = b !== 0 ? a / b : "Hata"; break
      default: return s
    }
    return {
      ...s,
      current: typeof result === "number" ? String(parseFloat(result.toFixed(10))) : result,
      previous: "",
      operator: intermediate ? null : null,
      shouldReset: true,
    }
  }, [])

  const setOperator = useCallback((op: string) => {
    setState((s) => {
      const next = s.operator && !s.shouldReset ? compute(s, true) : s
      return { ...next, previous: next.current, operator: op, shouldReset: true }
    })
  }, [compute])

  const calculate = useCallback(() => {
    setState((s) => compute(s))
  }, [compute])

  const clearAll = useCallback(() => setState(initialState), [])

  const toggleSign = useCallback(() => {
    setState((s) => ({
      ...s,
      current: s.current === "0" ? "0" : s.current.startsWith("-") ? s.current.slice(1) : "-" + s.current,
    }))
  }, [])

  const percent = useCallback(() => {
    setState((s) => ({ ...s, current: String(parseFloat(s.current) / 100) }))
  }, [])

  const backspace = useCallback(() => {
    setState((s) => ({
      ...s,
      current: s.current.length > 1 ? s.current.slice(0, -1) : "0",
    }))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") inputNumber(e.key)
      else if (e.key === ".") inputDot()
      else if (e.key === "+") setOperator("+")
      else if (e.key === "-") setOperator("-")
      else if (e.key === "*") setOperator("*")
      else if (e.key === "/") { e.preventDefault(); setOperator("/") }
      else if (e.key === "Enter" || e.key === "=") calculate()
      else if (e.key === "Escape") clearAll()
      else if (e.key === "Backspace") backspace()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [inputNumber, inputDot, setOperator, calculate, clearAll, backspace])

  const expression = state.previous
    ? `${state.previous} ${opSymbol[state.operator!] ?? state.operator}`
    : ""

  const fontSize =
    state.current.length > 11 ? "text-2xl" :
    state.current.length > 8 ? "text-3xl" :
    state.current.length > 5 ? "text-4xl" : "text-5xl"

  type ButtonDef = { label: string; action: () => void; variant: "function" | "operator" | "number" | "equals"; span?: boolean }

  const buttons: ButtonDef[] = [
    { label: "AC", action: clearAll, variant: "function" },
    { label: "+/-", action: toggleSign, variant: "function" },
    { label: "%", action: percent, variant: "function" },
    { label: "÷", action: () => setOperator("/"), variant: "operator" },
    { label: "7", action: () => inputNumber("7"), variant: "number" },
    { label: "8", action: () => inputNumber("8"), variant: "number" },
    { label: "9", action: () => inputNumber("9"), variant: "number" },
    { label: "×", action: () => setOperator("*"), variant: "operator" },
    { label: "4", action: () => inputNumber("4"), variant: "number" },
    { label: "5", action: () => inputNumber("5"), variant: "number" },
    { label: "6", action: () => inputNumber("6"), variant: "number" },
    { label: "−", action: () => setOperator("-"), variant: "operator" },
    { label: "1", action: () => inputNumber("1"), variant: "number" },
    { label: "2", action: () => inputNumber("2"), variant: "number" },
    { label: "3", action: () => inputNumber("3"), variant: "number" },
    { label: "+", action: () => setOperator("+"), variant: "operator" },
    { label: "0", action: () => inputNumber("0"), variant: "number", span: true },
    { label: ".", action: inputDot, variant: "number" },
    { label: "=", action: calculate, variant: "equals" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-80 bg-zinc-900 border-zinc-800 shadow-2xl">
        <div className="px-5 pt-5 pb-3">
          <div className="text-right">
            <p className="text-zinc-500 text-sm h-5 truncate">{expression}</p>
            <p className={cn("font-light text-white tabular-nums tracking-tight truncate mt-1", fontSize)}>
              {state.current}
            </p>
          </div>
        </div>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                className={cn(
                  "h-14 rounded-xl text-lg font-medium transition-all active:scale-95 select-none",
                  btn.span && "col-span-2",
                  btn.variant === "function" && "bg-zinc-600 text-white hover:bg-zinc-500",
                  btn.variant === "operator" && cn(
                    "text-orange-400 hover:bg-zinc-600",
                    state.operator && opSymbol[state.operator] === btn.label && state.shouldReset
                      ? "bg-orange-400 text-zinc-900"
                      : "bg-zinc-700"
                  ),
                  btn.variant === "number" && "bg-zinc-800 text-white hover:bg-zinc-700",
                  btn.variant === "equals" && "bg-orange-500 text-white hover:bg-orange-400",
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
