export interface TranscriptEntry {
  timestamp: string;
  speaker: string;
  role: 'CITIZEN' | 'FIELD_RESCUE' | 'INFRA_CONTROL' | 'TRAFFIC_COP' | 'TRANSIT_OPERATOR';
  badgeColor: string;
  text: string;
}

export interface ScenarioTranscript {
  scenarioId: 'bellandur-flood' | 'silkboard-gridlock' | 'hebbal-surge';
  channelName: string;
  duration: string;
  frequency: string;
  sentimentStress: number; // 0 to 100
  acousticProfile: string;
  extractedLocation: string;
  extractedCoords: string;
  extractedAnomaly: string;
  confidenceScore: number;
  entries: TranscriptEntry[];
}

export const SCENARIO_TRANSCRIPTS: Record<string, ScenarioTranscript> = {
  'bellandur-flood': {
    scenarioId: 'bellandur-flood',
    channelName: 'CIVIS-TAC-CH4 · SOUTH CORRIDOR EMERGENCY INGESTION',
    duration: '0:48',
    frequency: 'VHF 154.280 MHz (BENGALURU DISASTER NET)',
    sentimentStress: 94,
    acousticProfile: 'Heavy Torrential Rain, Hydrostatic Vehicle Engine Stall, Water Splashing',
    extractedLocation: 'Outer Ring Road, Bellandur Lake Spillway Pier 4 Underpass',
    extractedCoords: '12.9352° N, 77.6772° E',
    extractedAnomaly: 'Hydraulic surface surge reaching 68cm depth; rising 4.2cm/min. 15+ sedans stalled.',
    confidenceScore: 98.4,
    entries: [
      {
        timestamp: '00:04.10',
        speaker: 'CITIZEN 911 SOS (ORR-PIER-4)',
        role: 'CITIZEN',
        badgeColor: 'text-red-400 bg-red-500/10 border-red-500/30',
        text: 'Operator, please hurry! Water has rushed completely over our bonnet near Bellandur Pier 4! The engine died instantly. There are at least 15 cars trapped behind us, water is rising up to the door handles! We have elderly passengers inside!',
      },
      {
        timestamp: '00:18.45',
        speaker: 'FIELD RESCUE ALS-24 (KFES UNIT)',
        role: 'FIELD_RESCUE',
        badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        text: 'Command, ALS-24 en route on HAL Bypass. Visual confirmation: Pier 4 underpass is totally impassable for civilian sedans. Our 4x4 high-clearance axle can navigate if current depth remains under 75cm. We need immediate hydrodynamic clearance routing from CIVIS.',
      },
      {
        timestamp: '00:32.20',
        speaker: 'BBMP SLUICE OPERATOR (GATE-KTH)',
        role: 'INFRA_CONTROL',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        text: 'Central Drainage Cell, Sluice Gate KTH operator reporting in. Spillway retention wall pressure is surging at 118% of rated structural threshold. Sump pump SDP-01 running at max 12,000 LPM capacity. Venting sequence required to avert backflow flooding residential basements.',
      },
    ],
  },
  'silkboard-gridlock': {
    scenarioId: 'silkboard-gridlock',
    channelName: 'CIVIS-TAC-CH2 · SOUTH CORRIDOR ARTERIAL REBALANCE',
    duration: '0:54',
    frequency: 'VHF 161.450 MHz (BTP TRAFFIC COMMAND)',
    sentimentStress: 91,
    acousticProfile: 'Continuous Vehicle Horns, Heavy Construction Crane Mechanical Clatter, Siren Echoes',
    extractedLocation: 'Silk Board Intermodal Flyover & Central Arterial Interchange',
    extractedCoords: '12.9172° N, 77.6229° E',
    extractedAnomaly: '4-way total arterial deadlock; 380 stalled vehicles; BMTC bus lane blocked by civilian spillover.',
    confidenceScore: 97.8,
    entries: [
      {
        timestamp: '00:03.40',
        speaker: 'BTP CONSTABLE (POST-SILK-04)',
        role: 'TRAFFIC_COP',
        badgeColor: 'text-red-400 bg-red-500/10 border-red-500/30',
        text: 'Traffic Control Room, Silk Board junction has suffered complete gridlock across all 4 quadrants! Construction crane at Metro Pillar 14 has mechanical failure and is blocking Lanes 2 and 3. BMTC buses are backed up 2 kilometers all the way to Madiwala!',
      },
      {
        timestamp: '00:21.15',
        speaker: 'EMS DISPATCH (AMBULANCE AMB-09)',
        role: 'FIELD_RESCUE',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        text: 'Priority Emergency Call! Ambulance AMB-09 transporting acute coronary patient to St. John Hospital. We are dead-stopped 400 meters south of Silk Board flyover. Civilian vehicles have subverted the emergency shoulder. We need an immediate green corridor override!',
      },
      {
        timestamp: '00:38.50',
        speaker: 'BMRCL METRO SITE SUPERVISOR',
        role: 'INFRA_CONTROL',
        badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        text: 'Metro Site Operations to BTP Command. We have auxiliary hydraulic power to retract crane boom 01 off Lane 2, but we need a strict 3-minute traffic hold on the Hosur Road feeder to maneuver safely.',
      },
    ],
  },
  'hebbal-surge': {
    scenarioId: 'hebbal-surge',
    channelName: 'CIVIS-TAC-CH7 · NORTH AIRPORT EXPRESSWAY MONITOR',
    duration: '0:46',
    frequency: 'VHF 156.800 MHz (AIRPORT HIGHWAY PATROL)',
    sentimentStress: 88,
    acousticProfile: 'High-Volume Stormwater Rushing, Heavy Diesel Engine Stutter, Airport Siren',
    extractedLocation: 'Hebbal Flyover Underpass & Kempegowda Airport Expressway Lane 1',
    extractedCoords: '13.0358° N, 77.5970° E',
    extractedAnomaly: 'Stormwater canal backflow surge at 54cm; central outflow sluice at 142% capacity. 5,800 airport passengers disrupted.',
    confidenceScore: 99.1,
    entries: [
      {
        timestamp: '00:04.25',
        speaker: 'BMTC AIRPORT SHUTTLE (BUS-KA-01-F)',
        role: 'TRANSIT_OPERATOR',
        badgeColor: 'text-red-400 bg-red-500/10 border-red-500/30',
        text: 'Hebbal Control, BMTC Airport Vayu Vajra shuttle near Hebbal underpass. Sluice backflow surged across both lanes without warning. Water depth is past 50cm and rising rapidly! 42 airport passengers onboard, engine just took in water. Requesting urgent passenger evacuation!',
      },
      {
        timestamp: '00:19.30',
        speaker: 'NHAI HIGHWAY PATROL (UNIT 8)',
        role: 'FIELD_RESCUE',
        badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        text: 'Highway Control, Unit 8 on scene at Hebbal Express ingress. Lanes 1 and 2 are completely submerged. Low clearance cabs and airport transit vehicles are stalling out. We are manually initiating traffic diversion to Kodigehalli feeder road.',
      },
      {
        timestamp: '00:35.05',
        speaker: 'MANYATA RETENTION CONTROL',
        role: 'INFRA_CONTROL',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        text: 'Manyata Drainage Cell. Secondary retention basin intake channel is operating at 92% capacity. Sluice Gate SG-HBL-01 and 03 must be modulated in coordination with BBMP main canal to avert cascading flooding across Tech Park basements.',
      },
    ],
  },
};
