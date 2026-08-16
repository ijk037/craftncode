import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ShieldAlert, 
  HeartPulse, 
  Flame, 
  Activity, 
  Wind, 
  Bone, 
  Brain, 
  Sun, 
  Snowflake, 
  Skull, 
  Waves, 
  Zap, 
  PackageCheck, 
  ChevronRight, 
  AlertTriangle 
} from 'lucide-react';

interface SurvivalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

interface GuideItem {
  id: string;
  title: string;
  category: string;
  icon: any;
  subsections: {
    heading: string;
    steps: string[];
    warnings?: string[];
  }[];
}

export const SURVIVAL_GUIDES: GuideItem[] = [
  {
    id: 'bleeding',
    title: 'Bleeding & Wounds',
    category: 'TRAUMA',
    icon: HeartPulse,
    subsections: [
      {
        heading: 'Heavy bleeding',
        steps: [
          'Apply firm, continuous pressure directly to the wound.',
          'Use a clean cloth, clothing, sterile gauze, or any clean available fabric.',
          'Maintain continuous pressure without lifting the cloth until professional help arrives.',
          'Elevate the injured limb above heart level if no broken bones are suspected.'
        ],
        warnings: ["Don't remove saturated dressings — add more layers directly on top."]
      },
      {
        heading: 'Minor cuts & scrapes',
        steps: [
          'Wash your hands with clean water if available.',
          'Rinse the wound thoroughly with clean water.',
          'Cover with a clean dressing or bandage.'
        ]
      },
      {
        heading: 'Deep / open wound',
        steps: [
          "Maintain firm pressure. Don't repeatedly remove the dressing to check.",
          'Bandage securely and get emergency medical assistance.',
          'Watch for signs of shock (paleness, rapid pulse, clammy skin).'
        ]
      },
      {
        heading: 'Nosebleed',
        steps: [
          'Sit upright and lean slightly forward (NOT backward).',
          'Firmly pinch the soft part of the nose below the bridge for 10–15 minutes.',
          'Breathe through the mouth and avoid blowing the nose.'
        ],
        warnings: ["Don't tilt the head backward (prevents swallowing blood into airway)."]
      },
      {
        heading: 'Embedded object',
        steps: [
          "DO NOT pull or remove the embedded object — it may be plugging a ruptured vessel.",
          'Apply pressure around, rather than directly on, the object.',
          'Stabilize the object with rolled bandages or clothing on both sides.',
          'Keep the person calm and completely still.'
        ]
      }
    ]
  },
  {
    id: 'burns',
    title: 'Burns & Scalds',
    category: 'TRAUMA',
    icon: Flame,
    subsections: [
      {
        heading: 'Thermal burn',
        steps: [
          'Move away from the heat source immediately.',
          'Cool the burn with cool running water for at least 10–20 minutes.',
          'Remove nearby jewelry or loose clothing before swelling starts if not stuck.'
        ],
        warnings: ["Don't apply butter, toothpaste, oils, grease, or direct ice."]
      },
      {
        heading: 'Large / severe burn',
        steps: [
          'Transmit an emergency SOS via RESQ-MESH.',
          'Cool the affected area with cool water while avoiding hypothermia.',
          'Cover loosely with a clean plastic film or clean cloth.'
        ],
        warnings: ["Don't peel away clothing stuck to burned skin."]
      },
      {
        heading: 'Chemical burn',
        steps: [
          'Move away from the chemical source.',
          'Avoid touching the chemical substance directly with bare hands.',
          'Flush the affected area continuously with plenty of clean water for 20 minutes.'
        ]
      },
      {
        heading: 'Electrical burn',
        steps: [
          "Don't touch the person until the electrical source is safely disconnected.",
          'Transmit emergency SOS immediately.',
          'Treat visible entry/exit burns only once the area is confirmed 100% safe.'
        ]
      }
    ]
  },
  {
    id: 'cardiac',
    title: 'Breathing & Cardiac Emergencies',
    category: 'LIFE_CRITICAL',
    icon: Activity,
    subsections: [
      {
        heading: 'Person unconscious but breathing',
        steps: [
          'Check responsiveness (tap shoulders, speak loudly) and verify breathing.',
          'Place them in the recovery position (on their side) to keep airway open.',
          'Keep monitoring their breathing continually until help arrives.'
        ]
      },
      {
        heading: 'Person unconscious and NOT breathing normally (CPR)',
        steps: [
          'Transmit Priority-0 Emergency SOS immediately.',
          'Begin CPR: Place hands in center of chest, push hard and fast (100–120 beats/min, 2 inches deep).',
          'Perform continuous chest compressions (hands-only CPR).',
          'Ask someone to locate an Automated External Defibrillator (AED) if available.',
          'Continue compressions without stopping until professional help takes over.'
        ]
      },
      {
        heading: 'Suspected heart attack',
        steps: [
          'Help the person rest in a comfortable semi-sitting position.',
          'Transmit emergency SOS immediately.',
          'Keep monitoring breathing and responsiveness. Reassure them and do not leave them alone.'
        ]
      },
      {
        heading: 'Breathing difficulty / Asthma attack',
        steps: [
          'Help them sit upright leaning slightly forward.',
          'Move them away from smoke, dust, or flood humidity if safe.',
          'Assist with their prescribed emergency inhaler / medication if they have it.'
        ]
      }
    ]
  },
  {
    id: 'choking',
    title: 'Choking',
    category: 'LIFE_CRITICAL',
    icon: Wind,
    subsections: [
      {
        heading: 'Adult choking',
        steps: [
          'Encourage the person to cough forcefully if they can make sound.',
          'If severe choking continues: Give 5 sharp back blows between shoulder blades with heel of hand.',
          'If still blocked: Give 5 quick abdominal thrusts (Heimlich maneuver) pulling inward and upward.',
          'Alternate 5 back blows and 5 abdominal thrusts.',
          'If they become unresponsive, lower to the ground and begin CPR compressions.'
        ]
      },
      {
        heading: 'Child / infant choking',
        steps: [
          'For infants: Lay face down along your forearm supporting head, give 5 gentle back blows.',
          'Turn face up along forearm, give 5 gentle two-finger chest thrusts.',
          'DO NOT blindly sweep mouth with fingers (may push object deeper).'
        ]
      }
    ]
  },
  {
    id: 'fractures',
    title: 'Broken Bones & Injuries',
    category: 'TRAUMA',
    icon: Bone,
    subsections: [
      {
        heading: 'Suspected bone fracture',
        steps: [
          'Keep the injured area as still as possible.',
          'Support the limb with rolled clothing, cushions, or a sling.',
          'Apply an improvised cold pack wrapped in cloth to reduce swelling.'
        ],
        warnings: ["Don't attempt to straighten or force the bone back."]
      },
      {
        heading: 'Dislocated joint',
        steps: [
          'Support the joint in the position found.',
          'Apply padding around the joint to prevent accidental movement.',
          'Seek emergency medical assistance.'
        ],
        warnings: ["Don't try to push or pop the joint back into place."]
      },
      {
        heading: 'Spinal injury (Neck/Back)',
        steps: [
          'Avoid ANY unnecessary movement of the head, neck, or spine.',
          'Keep the person completely still, place hands on both sides of head to steady.',
          'Reassure the person and wait for rescue responders with a backboard.'
        ]
      },
      {
        heading: 'Crush injury (Building collapse)',
        steps: [
          'Transmit SOS immediately with structural trap details.',
          'Do not attempt unstable extrication that could cause further collapse.',
          'Keep the person calm, monitor breathing, and insulate them from the cold ground.'
        ]
      }
    ]
  },
  {
    id: 'neurological',
    title: 'Head, Stroke & Seizures',
    category: 'LIFE_CRITICAL',
    icon: Brain,
    subsections: [
      {
        heading: 'Head injury / Concussion',
        steps: [
          'Keep the person resting in a comfortable position.',
          'Monitor responsiveness and pupil dilation.',
          'Seek urgent attention if you observe vomiting, worsening confusion, or clear fluid from ears/nose.'
        ]
      },
      {
        heading: 'Suspected stroke (FAST Protocol)',
        steps: [
          'Face: Ask them to smile — does one side of face droop?',
          'Arms: Ask them to raise both arms — does one arm drift downward?',
          'Speech: Ask them to repeat a simple sentence — is speech slurred or strange?',
          'Time: Record exact symptom onset time and transmit emergency SOS immediately.'
        ]
      },
      {
        heading: 'Active seizure',
        steps: [
          'Move hard or sharp objects away from the person.',
          'Protect their head with a folded jacket or soft item.',
          'Time the duration of the seizure.',
          'Once seizure ends, place them in the recovery position and check breathing.'
        ],
        warnings: ["Don't restrain the person.", "Don't put anything in their mouth."]
      }
    ]
  },
  {
    id: 'heat',
    title: 'Heat & Dehydration',
    category: 'ENVIRONMENTAL',
    icon: Sun,
    subsections: [
      {
        heading: 'Heat exhaustion',
        steps: [
          'Move the person somewhere cool, shaded, or ventilated.',
          'Loosen tight clothing and let them rest flat with legs slightly elevated.',
          'Give sips of cool water or electrolyte fluid if alert and conscious.',
          'Cool skin with damp cloths or misting.'
        ]
      },
      {
        heading: 'Suspected heatstroke (Life Threatening)',
        steps: [
          'Body temperature > 103°F (40°C), hot dry or sweaty skin, confusion, loss of consciousness.',
          'Treat as an emergency — transmit SOS immediately.',
          'Actively cool body: apply cold damp cloths or ice packs to armpits, groin, and neck.'
        ]
      },
      {
        heading: 'Severe dehydration',
        steps: [
          'Move to shade. Provide small, frequent sips of safe drinking water.',
          'Avoid sugary, salty, or caffeinated liquids.',
          'Seek immediate medical help if confusion or inability to swallow occurs.'
        ]
      }
    ]
  },
  {
    id: 'cold',
    title: 'Cold & Hypothermia',
    category: 'ENVIRONMENTAL',
    icon: Snowflake,
    subsections: [
      {
        heading: 'Hypothermia',
        steps: [
          'Move the person to a dry shelter or out of the wind.',
          'Gently remove wet clothing and replace with dry layers.',
          'Insulate them from the ground using blankets, foam, or clothing.',
          'Cover head and torso. Warm them gradually.'
        ],
        warnings: ["Don't apply direct intense heat (boiling water/stoves) — warm gradually."]
      },
      {
        heading: 'Frostbite',
        steps: [
          'Move somewhere warm. Protect the affected fingers/toes/ears.',
          'Immerse in warm (NOT hot) water if thawed, or insulate with dry dressings.'
        ],
        warnings: ["Don't rub or massage frozen skin.", "Don't refreeze tissue once thawed."]
      }
    ]
  },
  {
    id: 'poisoning',
    title: 'Poisoning & Hazardous Gas',
    category: 'HAZMAT',
    icon: Skull,
    subsections: [
      {
        heading: 'Swallowed poison',
        steps: [
          'Identify what was swallowed, the approximate quantity, and time.',
          'Contact poison control or transmit SOS.'
        ],
        warnings: ["Don't induce vomiting unless explicitly directed by medical authorities."]
      },
      {
        heading: 'Gas leak / Toxic vapor',
        steps: [
          'Leave the area immediately. Move upwind and to fresh air.',
          'Do NOT operate light switches, electrical appliances, or match flames.',
          'Transmit SOS from a safe remote distance.'
        ]
      },
      {
        heading: 'Smoke inhalation',
        steps: [
          'Move into fresh air immediately.',
          'Loosen tight clothing around neck and chest.',
          'Seek emergency attention even if symptoms initially seem mild.'
        ]
      }
    ]
  },
  {
    id: 'floods',
    title: 'Water & Flood Emergencies',
    category: 'DISASTER',
    icon: Waves,
    subsections: [
      {
        heading: 'Trapped in rising floodwater',
        steps: [
          'Move immediately to the highest floor or roof structure.',
          'Do NOT enter closed attics unless an exit to the roof is accessible.',
          'Transmit SOS with your floor level, number of victims, and GPS coordinates.',
          'Signal rescuers with flashlights, phone screens, or high-visibility cloth.'
        ]
      },
      {
        heading: 'Moving floodwaters',
        steps: [
          'Avoid walking or driving through moving water (6 inches can knock you down).',
          'Stay completely away from submerged power poles and electrical cables.',
          'Do NOT drink floodwater under any circumstances (extreme biohazard).'
        ]
      }
    ]
  },
  {
    id: 'earthquake',
    title: 'Earthquake & Structural Collapses',
    category: 'DISASTER',
    icon: Zap,
    subsections: [
      {
        heading: 'During shaking',
        steps: [
          'DROP to your hands and knees.',
          'COVER your head and neck under a sturdy table or desk.',
          'HOLD ON until the shaking stops.'
        ]
      },
      {
        heading: 'Trapped under debris',
        steps: [
          'Cover your nose and mouth with cloth to filter out cement dust.',
          'Avoid unnecessary movement to preserve energy and prevent shifting debris.',
          'Tap rhythmically on pipes or walls with a stone or metal object to alert rescuers.',
          'Shout only as a last resort to avoid inhaling dangerous silica dust.'
        ]
      },
      {
        heading: 'After an earthquake',
        steps: [
          'Evacuate damaged buildings using stairwells (DO NOT use elevators).',
          'Expect aftershocks. Check for gas leaks and extinguish small fires if safe.'
        ]
      }
    ]
  },
  {
    id: 'improvised',
    title: '🧰 No First-Aid Kit? Improvised Supplies',
    category: 'IMPROVISED_KIT',
    icon: PackageCheck,
    subsections: [
      {
        heading: 'British Red Cross Approved Everyday Substitutes',
        steps: [
          '👕 Clean T-Shirt / Cotton Shirt → Temporary sterile pressure dressing & wound pad',
          '🧣 Scarf / Bandana / Tie → Arm sling, splint binder, or limb support',
          '🧥 Thick Jacket / Parka → Hypothermia protection, ground insulation & shock blanket',
          '🛏️ Blanket / Curtains → Body warmth, stretcher sling, or padding for fractures',
          '🧻 Clean Cotton Cloth → Direct wound pressure and hemorrhage control',
          '🛍️ Clean Plastic Bag / Food Wrap → Temporary sterile covering for burns & sucking chest wounds',
          '🧊 Wrapped Cold Drink / Wet Fabric → Cold pack to reduce sprain & fracture swelling',
          '📱 Phone Flashlight (Strobe) → Long-distance rescue beacon and optical signaling',
          '🔋 Power Bank → Radio mesh relay transceiver keep-alive power source',
          '🪢 Ripped Clothing Strips → Splint binding ties and sling securing straps'
        ]
      }
    ]
  }
];

export const SurvivalGuideModal: React.FC<SurvivalGuideModalProps> = ({ isOpen, onClose, initialCategory }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGuideId, setSelectedGuideId] = useState<string>(initialCategory || 'bleeding');

  if (!isOpen) return null;

  const filteredGuides = SURVIVAL_GUIDES.filter(guide => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      guide.title.toLowerCase().includes(q) ||
      guide.subsections.some(s => 
        s.heading.toLowerCase().includes(q) || 
        s.steps.some(st => st.toLowerCase().includes(q))
      )
    );
  });

  const activeGuide = SURVIVAL_GUIDES.find(g => g.id === selectedGuideId) || filteredGuides[0] || SURVIVAL_GUIDES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F5F3EE] text-[#252826] border border-[#d8d1c3] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col h-[90vh] font-sans">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#E9E5DC] border-b border-[#d8d1c3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173F35] text-[#F5F3EE] flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 text-[#8da999]" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#173F35] flex items-center gap-2">
                Emergency Survival & First-Aid Manual
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#173F35]/10 text-[#173F35] border border-[#173F35]/20">
                  100% Offline Guide
                </span>
              </h2>
              <p className="text-xs text-[#6F8F7D]">
                Life-saving protocols, medical triage, and British Red Cross improvised supplies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6F8F7D] hover:text-[#173F35] hover:bg-[#ded8cd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Quick Filter Bar */}
        <div className="p-3 bg-[#E9E5DC]/60 border-b border-[#d8d1c3] flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6F8F7D] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emergency protocols (e.g. bleeding, burns, cpr, snake bite, flood, improvised)..."
              className="w-full bg-[#F5F3EE] border border-[#d8d1c3] rounded-xl pl-9 pr-4 py-2 text-xs text-[#252826] placeholder-[#878e8a] focus:border-[#173F35] focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Body: Left Guide Index + Right Content Reader */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Category Index */}
          <div className="w-1/3 min-w-[200px] max-w-[280px] bg-[#E9E5DC]/80 border-r border-[#d8d1c3] overflow-y-auto p-2 space-y-1 user-scrollbar hidden sm:block">
            {filteredGuides.map(guide => {
              const Icon = guide.icon;
              const isSelected = guide.id === activeGuide.id;
              return (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuideId(guide.id)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                    isSelected
                      ? 'bg-[#173F35] text-[#F5F3EE] font-bold shadow-sm'
                      : 'hover:bg-[#ded8cd] text-[#252826]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#8da999]' : 'text-[#6F8F7D]'}`} />
                    <span className="truncate">{guide.title}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#F5F3EE]' : 'text-[#878e8a]'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Protocol Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 user-scrollbar bg-[#F5F3EE]">
            
            {/* Mobile Category Dropdown (visible only on small screens) */}
            <div className="sm:hidden mb-3">
              <label className="text-[11px] font-bold text-[#6F8F7D] uppercase font-mono block mb-1">
                Select Guide Topic:
              </label>
              <select
                value={activeGuide.id}
                onChange={(e) => setSelectedGuideId(e.target.value)}
                className="w-full bg-[#E9E5DC] border border-[#d8d1c3] rounded-xl p-2.5 text-xs text-[#252826] font-bold"
              >
                {SURVIVAL_GUIDES.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>

            {/* Guide Title Banner */}
            <div className="bg-[#E9E5DC] border border-[#d8d1c3] rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#173F35] text-[#F5F3EE] flex items-center justify-center shrink-0 shadow-sm">
                  <activeGuide.icon className="w-6 h-6 text-[#8da999]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#C65D32] tracking-wider">
                    {activeGuide.category} PROTOCOL
                  </span>
                  <h3 className="text-base md:text-lg font-bold text-[#173F35]">{activeGuide.title}</h3>
                </div>
              </div>

              {activeGuide.id === 'improvised' && (
                <span className="hidden md:inline-flex px-3 py-1 rounded-lg bg-[#C65D32]/15 text-[#C65D32] border border-[#C65D32]/30 text-xs font-bold font-mono">
                  British Red Cross Guidelines
                </span>
              )}
            </div>

            {/* Subsections List */}
            <div className="space-y-4">
              {activeGuide.subsections.map((sub, idx) => (
                <div
                  key={idx}
                  className="bg-[#E9E5DC]/80 border border-[#d8d1c3] rounded-2xl p-4 md:p-5 space-y-3 shadow-sm"
                >
                  <h4 className="text-sm font-bold text-[#173F35] flex items-center gap-2 border-b border-[#d8d1c3] pb-2 font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#C65D32]" />
                    {sub.heading}
                  </h4>

                  <ul className="space-y-2 text-xs text-[#252826] leading-relaxed pl-1">
                    {sub.steps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#173F35]/10 text-[#173F35] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="flex-1">{step}</span>
                      </li>
                    ))}
                  </ul>

                  {sub.warnings && sub.warnings.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-[#A83F35]/10 border border-[#A83F35]/30 space-y-1 text-xs">
                      {sub.warnings.map((w, wIdx) => (
                        <div key={wIdx} className="flex items-start gap-2 text-[#A83F35] font-semibold">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Improvised Supplies Highlight Card if on other pages */}
            {activeGuide.id !== 'improvised' && (
              <div className="bg-[#E9E5DC] border border-[#d8d1c3] rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <PackageCheck className="w-5 h-5 text-[#C65D32]" />
                  <div>
                    <strong className="text-[#173F35] block">Don't have a First-Aid Kit?</strong>
                    <span className="text-[#6F8F7D] text-[11px]">You can improvise with everyday items like clean t-shirts, scarves, or plastic bags.</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGuideId('improvised')}
                  className="px-3 py-1.5 rounded-lg bg-[#173F35] text-[#F5F3EE] font-bold text-[11px] shrink-0 ml-3 hover:bg-[#102d26] transition-colors"
                >
                  View Improvised Kit
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
