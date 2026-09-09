import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { SmartField } from '../components/ui/SmartField'
import { SmartSelect } from '../components/ui/SmartSelect'
import { formatDate, sourceLabels } from '../lib/utils'
import type { ContactSource } from '../types'
import { useApp } from '../store/AppContext'

const sourceOptions = Object.entries(sourceLabels).map(([value, label]) => ({ value, label }))
const exchangeTypes = ['appel', 'email', 'sms', 'visite', 'note'].map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))

export function ProfileEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProfile, updateProfile, addExchange } = useApp()
  const profile = getProfile(id!)

  const [firstName, setFirstName] = useState(profile?.firstName ?? '')
  const [lastName, setLastName] = useState(profile?.lastName ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [firstContactDate, setFirstContactDate] = useState(profile?.firstContactDate ?? '')
  const [source, setSource] = useState<ContactSource>(profile?.source ?? 'autre')
  const [notes, setNotes] = useState(profile?.notes ?? '')
  const [exType, setExType] = useState<'appel' | 'email' | 'sms' | 'visite' | 'note'>('note')
  const [exContent, setExContent] = useState('')

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-nemea-subtle">Profil introuvable</p>
        <Link to="/profils" className="text-indigo-300 text-sm mt-2 inline-block">Retour</Link>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile(profile.id, {
      firstName: firstName.trim() || profile.firstName,
      lastName: lastName.trim() || profile.lastName,
      phone: phone || undefined,
      email: email || undefined,
      firstContactDate,
      source,
      notes: notes || undefined,
    })
    navigate(`/profils/${profile.id}`)
  }

  const handleAddExchange = () => {
    if (!exContent.trim()) return
    addExchange(profile.id, { date: new Date().toISOString().split('T')[0], type: exType, content: exContent.trim() })
    setExContent('')
  }

  return (
    <div className="space-y-5 nemea-page nemea-page--narrow">
      <Link to={`/profils/${profile.id}`} className="btn-ghost !px-0 !border-0 !bg-transparent"><ArrowLeft size={16} /> Retour</Link>
      <PageHeader eyebrow="Modifier" title={`${profile.firstName} ${profile.lastName}`} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="nemea-panel space-y-3 animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SmartField label="Prénom" value={firstName} onChange={setFirstName} required />
            <SmartField label="Nom" value={lastName} onChange={setLastName} required />
          </div>
          <SmartField label="Téléphone" value={phone} onChange={setPhone} type="tel" />
          <SmartField label="Email" value={email} onChange={setEmail} type="email" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SmartField label="Date de contact" value={firstContactDate} onChange={setFirstContactDate} type="date" smartFormat={false} />
            <SmartSelect label="Source" value={source} onChange={(v) => setSource(v as ContactSource)} options={sourceOptions} />
          </div>
          <SmartField label="Notes" value={notes} onChange={setNotes} smartFormat={false} />
        </section>

        <section className="nemea-panel space-y-3 animate-fade-up stagger-2">
          <h2 className="nemea-panel-title !mb-0">Ajouter un échange</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SmartSelect label="Type" value={exType} onChange={(v) => setExType(v as typeof exType)} options={exchangeTypes} />
            <div className="sm:col-span-2">
              <SmartField label="Contenu" value={exContent} onChange={setExContent} smartFormat={false} />
            </div>
          </div>
          <button type="button" onClick={handleAddExchange} className="btn-ghost"><Plus size={14} /> Ajouter l'échange</button>

          {profile.exchanges.length > 0 && (
            <div className="pt-3 border-t border-white/6 space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {profile.exchanges.map((ex) => (
                <div key={ex.id} className="text-sm rounded-lg bg-white/[0.02] border border-white/6 p-2.5">
                  <p className="text-xs text-nemea-subtle">{formatDate(ex.date)} · {ex.type}</p>
                  <p className="text-white/70 mt-0.5">{ex.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <button type="submit" className="btn-primary w-full !rounded-xl">Enregistrer</button>
      </form>
    </div>
  )
}
