import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

const CONFIRM_WORD = 'CONFIRMAR'

export default function ConfirmModal({ title, description, onConfirm, onCancel }) {
  const [input, setInput] = useState('')
  const ready = input === CONFIRM_WORD

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-xl w-full max-w-md p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <AlertTriangle size={18} className="text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-600 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Confirm input */}
        <div className="mt-5">
          <label className="text-xs text-slate-400 mb-2 block">
            Escribí <span className="font-mono font-bold text-white">{CONFIRM_WORD}</span> para continuar
          </label>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={CONFIRM_WORD}
            className="w-full bg-[#080c18] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 font-mono"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-[#1e2d4a] text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => ready && onConfirm()}
            disabled={!ready}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
