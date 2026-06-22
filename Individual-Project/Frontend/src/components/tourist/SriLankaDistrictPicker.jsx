import { useEffect, useMemo, useRef, useState } from 'react'
import Srilanka from '@react-map/srilanka'
import { sriLankaDistricts, districtCodeToId, districtIdToCode } from '../../data/sriLankaTour'

const chipBase = 'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-semibold transition border shadow-sm leading-tight whitespace-normal text-center'

const districts = sriLankaDistricts

const districtLookup = districts.reduce((acc, district) => {
  acc[district.id] = district
  return acc
}, {})

const mapSelectionColor = '#16a34a'

const getMapSelector = (code) => `path[id^="${code.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}-"]`

const SriLankaDistrictPicker = ({
  selectedDistricts,
  selectedLocationsByDistrict,
  onToggleDistrict,
  onToggleLocation,
  onSelectAllLocations,
  onClearDistrict,
  onClearAll,
  onSelectDistricts
}) => {
  const mapContainerRef = useRef(null)
  const syncingSelectionRef = useRef(false)
  const lastSyncedCodesRef = useRef([])
  const [labelPositions, setLabelPositions] = useState([])
  const [labelsViewBox, setLabelsViewBox] = useState(null)

  const selectedDistrictCodes = useMemo(
    () => selectedDistricts.map((districtId) => districtIdToCode[districtId]).filter(Boolean),
    [selectedDistricts]
  )

  const selectedCityColors = useMemo(() => {
    return selectedDistrictCodes.reduce((acc, code) => {
      acc[code] = mapSelectionColor
      return acc
    }, {})
  }, [selectedDistrictCodes])

  const selectedDistrictObjects = selectedDistricts.map((districtId) => districtLookup[districtId]).filter(Boolean)

  useEffect(() => {
    const currentCodes = lastSyncedCodesRef.current
    const desiredCodes = selectedDistrictCodes

    if (currentCodes.length === desiredCodes.length && currentCodes.every((code) => desiredCodes.includes(code))) {
      return
    }

    const container = mapContainerRef.current
    if (!container) {
      lastSyncedCodesRef.current = desiredCodes
      return
    }

    const toRemove = currentCodes.filter((code) => !desiredCodes.includes(code))
    const toAdd = desiredCodes.filter((code) => !currentCodes.includes(code))

    if (toRemove.length === 0 && toAdd.length === 0) {
      lastSyncedCodesRef.current = desiredCodes
      return
    }

    syncingSelectionRef.current = true

    toRemove.forEach((code) => {
      const path = container.querySelector(getMapSelector(code))
      if (path) {
        path.click()
      }
    })

    toAdd.forEach((code) => {
      const path = container.querySelector(getMapSelector(code))
      if (path) {
        path.click()
      }
    })

    lastSyncedCodesRef.current = desiredCodes
    syncingSelectionRef.current = false
  }, [selectedDistrictCodes])

  const handleMapSelect = (_code, selectedCodes = []) => {
    lastSyncedCodesRef.current = selectedCodes

    if (syncingSelectionRef.current || !onSelectDistricts) {
      return
    }

    const nextDistrictIds = selectedCodes.map((code) => districtCodeToId[code]).filter(Boolean)
    onSelectDistricts(nextDistrictIds)
  }

  useEffect(() => {
    let mounted = true

    const computeLabels = () => {
      const container = mapContainerRef.current
      if (!container) return

      const svg = container.querySelector('svg')
      if (!svg) return

      const vb = svg.getAttribute('viewBox')
      if (vb) setLabelsViewBox(vb)

      const codes = Object.keys(districtCodeToId)
      const positions = []

      codes.forEach((code) => {
        try {
          const path = container.querySelector(getMapSelector(code))
          if (path && typeof path.getBBox === 'function') {
            const bbox = path.getBBox()
            const x = bbox.x + bbox.width / 2
            const y = bbox.y + bbox.height / 2
            const districtId = districtCodeToId[code]
            const name = districtLookup[districtId]?.name || districtIdToCode[districtId] || code
            // special-case Ampara: nudge label to the right to avoid overlap with highlighted area
            let adjX = x
            if (code === 'Ampara') {
              adjX = x + Math.max(8, bbox.width * 0.45)
            }

            positions.push({ code, x: adjX, y, name })
          }
        } catch (e) {
          // ignore individual path errors
        }
      })

      if (mounted) setLabelPositions(positions)
    }

    // compute after a frame so package has rendered
    const raf = requestAnimationFrame(() => setTimeout(computeLabels, 0))

    window.addEventListener('resize', computeLabels)

    return () => {
      mounted = false
      window.removeEventListener('resize', computeLabels)
      cancelAnimationFrame(raf)
    }
  }, [selectedDistrictCodes])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Select Districts on Sri Lanka Map</h2>
          <p className="text-gray-600 mt-1">Click a district to select it. Selected districts turn green.</p>
        </div>

        {selectedDistricts.length > 0 && (
          <button type="button" onClick={onClearAll} className="text-sm text-gray-600 hover:text-red-600 transition">
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        <div className="bg-white border rounded-3xl p-5 shadow-sm">
          <div ref={mapContainerRef} className="relative rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5 border overflow-hidden min-h-[620px] flex items-center justify-center">
            <Srilanka
              type="select-multiple"
              size="100%"
              mapColor="#ffffff"
              strokeColor="#cbd5e1"
              strokeWidth={1}
              hoverColor="#dcfce7"
              selectColor={mapSelectionColor}
              cityColors={selectedCityColors}
              onSelect={handleMapSelect}
            />

            {labelsViewBox && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={labelsViewBox} preserveAspectRatio="xMidYMid meet">
                {labelPositions.map((lbl) => (
                  <text
                    key={lbl.code}
                    x={lbl.x}
                    y={lbl.y}
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fontSize={12}
                    fill="#0f172a"
                    stroke="#ffffff"
                    strokeWidth={0.75}
                    paintOrder="stroke"
                    style={{ fontWeight: 600 }}
                  >
                    {lbl.name}
                  </text>
                ))}
              </svg>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary" /> Selected district</span>
            <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-white border" /> Available district</span>
            <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-200 border border-emerald-300" /> Hover district</span>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 self-start">
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Selected districts</h3>
              <span className="text-xs text-gray-500">{selectedDistricts.length} chosen</span>
            </div>
            {selectedDistrictObjects.length === 0 ? (
              <p className="text-sm text-gray-500 leading-6">Click districts on the map to build your itinerary. Start with one or two districts, then add places inside each area.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedDistrictObjects.map((district) => (
                  <button
                    key={district.id}
                    type="button"
                    onClick={() => onToggleDistrict(district.id)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 text-sm font-medium hover:bg-primary hover:text-white transition"
                  >
                    {district.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm max-h-[620px] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold text-gray-800">Popular locations by district</h3>
              <p className="text-xs text-gray-500">Choose places inside the selected districts</p>
            </div>

            {selectedDistrictObjects.length === 0 ? (
              <div className="rounded-xl border border-dashed p-5 text-sm text-gray-500 bg-gray-50 leading-6">
                Select one or more districts first to see the best places to visit there.
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDistrictObjects.map((district) => {
                  const selectedLocations = selectedLocationsByDistrict[district.id] || []
                  return (
                    <div key={district.id} className="rounded-2xl border bg-gray-50/70 p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{district.name}</h4>
                          <p className="text-xs text-gray-500">{selectedLocations.length} place{selectedLocations.length === 1 ? '' : 's'} selected</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectAllLocations(district.id)}
                            className="text-xs text-primary font-medium hover:underline"
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            onClick={() => onClearDistrict(district.id)}
                            className="text-xs text-gray-500 hover:text-red-600"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {district.popularLocations.map((location) => {
                          const isSelected = selectedLocations.includes(location)
                          return (
                            <button
                              key={location}
                              type="button"
                              onClick={() => onToggleLocation(district.id, location)}
                              className={`${chipBase} px-4 py-2 text-xs sm:text-sm ${isSelected ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'}`}
                            >
                              {location}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SriLankaDistrictPicker
