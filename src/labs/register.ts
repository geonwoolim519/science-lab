import type { ComponentType } from 'react'
import { AtomLab, ConfigLab, CovalentLab, IonicLab, PeriodicLab } from './chem1'
import { PhLab, PolarityLab, RateLab, StoichLab, VseprLab } from './chem2'
import { AtpLab, DnaLab, EnzymeLab, MembraneLab, MendelLab, OsmosisLab, SelectionLab, TranscriptionLab } from './biology'
import { GreenhouseLab, PlatesLab, SeismicLab, VolcanoLab, WaterLab } from './earth'
import { CrystalLab, DefectLab, StressLab } from './materials'
import { BraggLab, PnLab, RamanLab, SemLab } from './analysis'
import { EnergyLab, GravityLab, MomentumLab, NewtonLab, ShmLab } from './physics1'
import { DiffractionLab, InductionLab, InterferenceLab, RefractionLab, WaveLab } from './physics2'

export const LABS: Record<string, ComponentType> = {
  newton: NewtonLab,
  momentum: MomentumLab,
  energy: EnergyLab,
  gravity: GravityLab,
  shm: ShmLab,
  wave: WaveLab,
  interference: InterferenceLab,
  diffraction: DiffractionLab,
  refraction: RefractionLab,
  induction: InductionLab,
  atom: AtomLab,
  config: ConfigLab,
  periodic: PeriodicLab,
  ionic: IonicLab,
  covalent: CovalentLab,
  vsepr: VseprLab,
  polarity: PolarityLab,
  stoich: StoichLab,
  rate: RateLab,
  ph: PhLab,
  membrane: MembraneLab,
  osmosis: OsmosisLab,
  enzyme: EnzymeLab,
  atp: AtpLab,
  dna: DnaLab,
  transcription: TranscriptionLab,
  mendel: MendelLab,
  selection: SelectionLab,
  plates: PlatesLab,
  seismic: SeismicLab,
  volcano: VolcanoLab,
  water: WaterLab,
  greenhouse: GreenhouseLab,
  crystal: CrystalLab,
  defect: DefectLab,
  stress: StressLab,
  bragg: BraggLab,
  raman: RamanLab,
  sem: SemLab,
  pn: PnLab,
}
