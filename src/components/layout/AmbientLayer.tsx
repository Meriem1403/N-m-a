import { CosmicBackground } from './CosmicBackground'
import { StarField } from './StarField'

export function AmbientLayer() {
  return (
    <>
      <CosmicBackground />
      <StarField />
      <div className="ambient-orbs" aria-hidden>
        <div className="ambient-orb ambient-orb--1" />
        <div className="ambient-orb ambient-orb--2" />
        <div className="ambient-orb ambient-orb--3" />
      </div>
      <div className="ambient-grid" aria-hidden />
      <div className="cosmic-noise ambient-noise" aria-hidden />
    </>
  )
}
