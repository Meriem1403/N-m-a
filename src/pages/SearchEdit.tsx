import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SearchCriteriaForm } from '../components/forms/SearchCriteriaForm'
import { PageHeader } from '../components/ui/PageHeader'
import { SmartField } from '../components/ui/SmartField'
import { formatBudgetDisplay, parseBudgetInput } from '../lib/smart'
import type { SearchCriteria } from '../types'
import { useApp } from '../store/AppContext'

export function SearchEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSearch, updateSearch } = useApp()
  const search = getSearch(id!)

  const [label, setLabel] = useState(search?.label ?? '')
  const [active, setActive] = useState(search?.active ?? true)
  const [criteria, setCriteria] = useState<SearchCriteria>(search?.criteria ?? {} as SearchCriteria)
  const [budgetMaxStr, setBudgetMaxStr] = useState(search?.criteria.budgetMax ? formatBudgetDisplay(search.criteria.budgetMax) : '')
  const [surfaceMinStr, setSurfaceMinStr] = useState(search?.criteria.surfaceMin?.toString() ?? '')
  const [historyNote, setHistoryNote] = useState('')

  if (!search) {
    return (
      <div className="text-center py-16">
        <p className="text-nemea-subtle">Recherche introuvable</p>
        <Link to="/recherches" className="text-indigo-300 text-sm mt-2 inline-block">Retour</Link>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearch(search.id, {
      label: label.trim() || search.label,
      active,
      criteria: {
        ...criteria,
        budgetMax: parseBudgetInput(budgetMaxStr),
        surfaceMin: parseBudgetInput(surfaceMinStr),
      },
    }, historyNote.trim() || undefined)
    navigate(`/recherches/${search.id}`)
  }

  return (
    <div className="space-y-5 nemea-page nemea-page--narrow">
      <Link to={`/recherches/${search.id}`} className="btn-ghost !px-0 !border-0 !bg-transparent"><ArrowLeft size={16} /> Retour</Link>
      <PageHeader eyebrow="Modifier" title={search.label} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="nemea-panel space-y-4 animate-fade-up">
          <SmartField label="Libellé" value={label} onChange={setLabel} smartFormat={false} />
          <label className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 cursor-pointer">
            <span className="text-sm text-white/70">Recherche active</span>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-indigo-500 w-5 h-5" />
          </label>
          <SmartField label="Note pour l'historique (optionnel)" value={historyNote} onChange={setHistoryNote} smartFormat={false} />
        </section>

        <section className="nemea-panel animate-fade-up stagger-2">
          <SearchCriteriaForm
            criteria={criteria}
            onChange={setCriteria}
            budgetMaxStr={budgetMaxStr}
            onBudgetMaxStrChange={setBudgetMaxStr}
            surfaceMinStr={surfaceMinStr}
            onSurfaceMinStrChange={setSurfaceMinStr}
          />
        </section>

        <button type="submit" className="btn-primary w-full !rounded-xl">Enregistrer</button>
      </form>
    </div>
  )
}
