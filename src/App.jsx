import React, { useMemo, useState } from 'react'

const defaultMolitRates = [
  { year: '2026', base: 7326, basement: 2472, memo: '국토부 기본형건축비 기준' },
  { year: '2025', base: 7175, basement: 2400, memo: '직접 확인 후 수정 가능' },
  { year: '2024', base: 6900, basement: 2300, memo: '직접 확인 후 수정 가능' },
  { year: '2023', base: 6500, basement: 2200, memo: '직접 확인 후 수정 가능' },
]

const regionRates = [
  { key: 'seoul', label: '서울', min: 10500, max: 13500 },
  { key: 'busan', label: '부산', min: 8500, max: 10500 },
  { key: 'incheon', label: '인천', min: 8800, max: 10800 },
  { key: 'daegu', label: '대구', min: 7800, max: 9500 },
  { key: 'daejeon', label: '대전', min: 7800, max: 9300 },
  { key: 'gwangju', label: '광주', min: 7500, max: 9000 },
  { key: 'metro', label: '그 외 광역시', min: 7800, max: 9800 },
  { key: 'other', label: '그 외 지역', min: 7000, max: 8500 },
]

const apartmentTypes = [
  { key: 'private', label: '일반 민간아파트', min: 8000, max: 10000, premium: 0 },
  { key: 'brand', label: '브랜드 대단지', min: 10000, max: 13000, premium: 15 },
  { key: 'highend', label: '하이엔드 아파트', min: 15000, max: 20000, premium: 50 },
  { key: 'lh', label: '공공/LH형', min: 6500, max: 8000, premium: -5 },
]

const parkingTypes = [
  { key: 'normal', label: '일반 지하주차장', min: 4000, max: 6500, premium: 0 },
  { key: 'deep', label: '도심지 심도 깊은 현장', min: 7000, max: 12000, premium: 60 },
  { key: 'rock', label: '역타·암반 포함', min: 10000, max: 14000, premium: 90 },
  { key: 'gangnam', label: '강남권 하이엔드', min: 12000, max: 18000, premium: 120 },
]

const greenOptions = [
  { key: 'none', label: '미적용', min: 0, max: 0 },
  { key: 'green_good', label: '녹색건축 우수등급', min: 1, max: 2 },
  { key: 'green_best', label: '녹색건축 최우수', min: 2, max: 4 },
  { key: 'zeb5', label: '제로에너지 5등급', min: 3, max: 5 },
  { key: 'zeb4', label: '제로에너지 4등급', min: 5, max: 8 },
  { key: 'zeb3', label: '제로에너지 3등급 이상', min: 8, max: 15 },
]

const pfOptions = [
  { key: 'local', label: '지방 일반 공동주택', min: 8000, max: 9500 },
  { key: 'capital', label: '수도권 일반 공동주택', min: 9500, max: 11000 },
  { key: 'seoulUrban', label: '서울 도심형', min: 11000, max: 14000 },
  { key: 'gangnamHigh', label: '강남권 하이엔드', min: 15000, max: 20000 },
  { key: 'dataMixed', label: '데이터센터 복합형', min: 18000, max: 22000 },
]

const costFactors = ['노무비 상승', '철근·레미콘', '제로에너지 의무화', '지하층 증가', '금융비 증가', '안전관리 강화', '층간소음 기준 강화']

function formatNumber(value) {
  const num = Number(value || 0)
  return num.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
}

function formatInputNumber(value) {
  if (value === '' || value === null || value === undefined) return ''
  const raw = String(value).replace(/,/g, '')
  if (raw === '') return ''
  const num = Number(raw)
  if (!Number.isFinite(num)) return value
  return num.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
}

function removeComma(value) {
  return String(value || '').replace(/,/g, '')
}

function toNumber(value) {
  const parsed = Number(String(value || '0').replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function NumberInput({ label, value, setValue, comma = false, placeholder = '' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        value={comma ? formatInputNumber(value) : value}
        onChange={(e) => setValue(comma ? removeComma(e.target.value) : e.target.value)}
        className="input-yellow"
        placeholder={placeholder}
        inputMode="decimal"
      />
    </label>
  )
}

function TextInput({ label, value, setValue, placeholder = '' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(e) => setValue(e.target.value)} className="input-yellow" placeholder={placeholder} />
    </label>
  )
}

function ChoiceCards({ options, value, onChange, unit = '천원/평', showPremium = false }) {
  return (
    <div className="choice-grid">
      {options.map((option) => {
        const selected = option.key === value
        return (
          <button key={option.key} type="button" onClick={() => onChange(option.key)} className={`choice-card ${selected ? 'selected' : ''}`}>
            <div className="choice-title">
              <b>{option.label}</b>
              {selected ? <span>✓</span> : null}
            </div>
            <p>{formatNumber(option.min)} ~ {formatNumber(option.max)} {unit}</p>
            {showPremium ? <small>국토부 단가 적용 시 가산율 {option.premium}%</small> : null}
          </button>
        )
      })}
    </div>
  )
}

function Row({ label, value, danger = false }) {
  return (
    <div className={`result-row ${danger ? 'danger' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ProgressBar({ label, value, max }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="bar-wrap">
      <div className="bar-label"><span>{label}</span><span>{formatNumber(value)} 천원</span></div>
      <div className="bar"><div style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export default function App() {
  const [dark, setDark] = useState(false)
  const [tab, setTab] = useState('base')

  const [molitRates, setMolitRates] = useState(defaultMolitRates)
  const [molitYear, setMolitYear] = useState('2026')
  const [molitBaseCost, setMolitBaseCost] = useState('7326')
  const [molitBasementCost, setMolitBasementCost] = useState('2472')
  const [molitMemo, setMolitMemo] = useState('2026년 국토부 기본형건축비 기준')
  const [useMolitBase, setUseMolitBase] = useState(true)
  const [molitSearchYear, setMolitSearchYear] = useState('2026')

  const [landCost, setLandCost] = useState('0')
  const [apartmentArea, setApartmentArea] = useState('1000')
  const [retailArea, setRetailArea] = useState('200')
  const [basementArea, setBasementArea] = useState('500')
  const [increaseRate, setIncreaseRate] = useState('5')

  const [region, setRegion] = useState('seoul')
  const [apartmentType, setApartmentType] = useState('private')
  const [parkingType, setParkingType] = useState('normal')
  const [green, setGreen] = useState('zeb5')
  const [pf, setPf] = useState('capital')
  const [baseMode, setBaseMode] = useState('average')

  const [loanRatio, setLoanRatio] = useState('60')
  const [interestRate, setInterestRate] = useState('7.5')
  const [periodMonths, setPeriodMonths] = useState('24')
  const [salesRevenue, setSalesRevenue] = useState('0')
  const [operatingIncome, setOperatingIncome] = useState('0')
  const [annualDebtService, setAnnualDebtService] = useState('0')
  const [inflationRate, setInflationRate] = useState('3')
  const [inflationYears, setInflationYears] = useState('2')
  const [preSaleRate, setPreSaleRate] = useState('70')

  const selectedRegion = regionRates.find((v) => v.key === region)
  const selectedApt = apartmentTypes.find((v) => v.key === apartmentType)
  const selectedParking = parkingTypes.find((v) => v.key === parkingType)
  const selectedGreen = greenOptions.find((v) => v.key === green)
  const selectedPf = pfOptions.find((v) => v.key === pf)

  const pickRate = (item) => baseMode === 'min' ? item.min : baseMode === 'max' ? item.max : (item.min + item.max) / 2

  const searchMolitYear = () => {
    const found = molitRates.find((row) => row.year === molitSearchYear)
    if (found) {
      setMolitYear(found.year)
      setMolitBaseCost(String(found.base))
      setMolitBasementCost(String(found.basement))
      setMolitMemo(found.memo || '년도별 국토부 단가 적용')
      setUseMolitBase(true)
    } else {
      setMolitYear(molitSearchYear)
      setMolitBaseCost('')
      setMolitBasementCost('')
      setMolitMemo('해당 연도 금액을 직접 입력 후 저장 필요')
    }
  }

  const saveMolitRate = () => {
    const year = String(molitYear || '').trim()
    if (!year) return
    const nextRow = { year, base: toNumber(molitBaseCost), basement: toNumber(molitBasementCost), memo: molitMemo || '사용자 입력 단가' }
    setMolitRates((prev) => [nextRow, ...prev.filter((row) => row.year !== year)].sort((a, b) => Number(b.year) - Number(a.year)))
    setMolitSearchYear(year)
    setUseMolitBase(true)
  }

  const applyMolitRate = (row) => {
    setMolitYear(row.year)
    setMolitBaseCost(String(row.base))
    setMolitBasementCost(String(row.basement))
    setMolitMemo(row.memo || '년도별 국토부 단가 적용')
    setMolitSearchYear(row.year)
    setUseMolitBase(true)
  }

  const calculated = useMemo(() => {
    const land = toNumber(landCost)
    const aptArea = toNumber(apartmentArea)
    const retail = toNumber(retailArea)
    const basement = toNumber(basementArea)
    const increase = toNumber(increaseRate) / 100
    const loanRate = toNumber(loanRatio) / 100
    const interest = toNumber(interestRate) / 100
    const months = toNumber(periodMonths)
    const revenue = toNumber(salesRevenue)
    const noi = toNumber(operatingIncome)
    const debtService = toNumber(annualDebtService)
    const inflation = toNumber(inflationRate) / 100
    const years = toNumber(inflationYears)
    const presale = toNumber(preSaleRate) / 100

    const regionRate = pickRate(selectedRegion)
    const aptTypeRate = pickRate(selectedApt)
    const marketBaseRate = Math.max(regionRate, aptTypeRate)
    const molitBase = toNumber(molitBaseCost)
    const molitBasement = toNumber(molitBasementCost)
    const baseRate = useMolitBase && molitBase > 0 ? molitBase * (1 + selectedApt.premium / 100) : marketBaseRate
    const baseRateSource = useMolitBase && molitBase > 0 ? `${molitYear}년 국토부 기본형건축비 기준` : '지역·유형 실무단가 기준'
    const retailRate = baseRate * 1.25
    const apartmentExpenseRate = baseRate * 0.5
    const parkingMarketRate = pickRate(selectedParking)
    const parkingRate = useMolitBase && molitBasement > 0 ? molitBasement * (1 + selectedParking.premium / 100) : parkingMarketRate
    const greenRate = (selectedGreen.min + selectedGreen.max) / 2 / 100
    const pfRate = pickRate(selectedPf)

    const apartmentDirect = aptArea * baseRate
    const apartmentExpense = aptArea * apartmentExpenseRate
    const retailDirect = retail * retailRate
    const basementDirect = basement * parkingRate
    const greenCost = (apartmentDirect + retailDirect + basementDirect) * greenRate
    const constructionSubtotal = apartmentDirect + apartmentExpense + retailDirect + basementDirect + greenCost
    const subtotalBeforeIncrease = land + constructionSubtotal
    const increaseCost = subtotalBeforeIncrease * increase
    const totalBeforeFinance = subtotalBeforeIncrease + increaseCost
    const loanAmount = totalBeforeFinance * loanRate
    const financeCost = loanAmount * 0.5 * interest * (months / 12)
    const total = totalBeforeFinance + financeCost
    const totalArea = aptArea + retail + basement
    const averagePyeongCost = totalArea > 0 ? total / totalArea : 0
    const dscr = debtService > 0 ? noi / debtService : 0
    const profit = revenue > 0 ? revenue - total : 0
    const profitRate = revenue > 0 ? profit / revenue : 0
    const simpleIrr = total > 0 && revenue > 0 && months > 0 ? (Math.pow(revenue / total, 12 / months) - 1) * 100 : 0
    const inflationGap = constructionSubtotal * Math.pow(1 + inflation, years) - constructionSubtotal
    const presaleRevenue = revenue * presale
    const equityRequired = total - loanAmount
    const progress = [
      { step: '착공 전', rate: 5 }, { step: '토공·흙막이', rate: 15 }, { step: '골조', rate: 35 },
      { step: '외장·창호', rate: 20 }, { step: '마감·설비', rate: 20 }, { step: '준공·정산', rate: 5 },
    ].map((v) => ({ ...v, amount: constructionSubtotal * (v.rate / 100) }))

    return { land, baseRateSource, molitBase, molitBasement, baseRate, retailRate, apartmentExpenseRate, parkingRate, greenRate, pfRate, apartmentDirect, apartmentExpense, retailDirect, basementDirect, greenCost, constructionSubtotal, subtotalBeforeIncrease, increaseCost, totalBeforeFinance, loanAmount, financeCost, total, totalArea, averagePyeongCost, dscr, profit, profitRate, simpleIrr, inflationGap, presaleRevenue, equityRequired, progress }
  }, [landCost, apartmentArea, retailArea, basementArea, increaseRate, loanRatio, interestRate, periodMonths, salesRevenue, operatingIncome, annualDebtService, inflationRate, inflationYears, preSaleRate, region, apartmentType, parkingType, green, pf, baseMode, molitBaseCost, molitBasementCost, molitYear, useMolitBase])

  const reset = () => window.location.reload()

  const downloadCsv = () => {
    const rows = [
      ['항목', '금액(천원)', '비고'], ['적용연도', molitYear, calculated.baseRateSource], ['국토부 기본형건축비', calculated.molitBase, '천원/평'],
      ['국토부 지하층건축비', calculated.molitBasement, '천원/평'], ['토지대', calculated.land, '사용자 입력'],
      ['아파트 직접공사비', calculated.apartmentDirect, `${formatNumber(calculated.baseRate)}천원/평`], ['아파트 경비 50%', calculated.apartmentExpense, '아파트 공사비 기준'],
      ['근린상가 공사비 25% 가산', calculated.retailDirect, `${formatNumber(calculated.retailRate)}천원/평`], ['지하층건축비', calculated.basementDirect, `${formatNumber(calculated.parkingRate)}천원/평`],
      ['친환경·제로에너지 가산', calculated.greenCost, `${(calculated.greenRate * 100).toFixed(1)}%`], ['물가 상승률 반영액', calculated.increaseCost, `${increaseRate}%`],
      ['PF 금융비', calculated.financeCost, '평균잔액×금리×기간'], ['총 사업비 추정액', calculated.total, '토지대 포함'], ['평균 평당 단가', calculated.averagePyeongCost, '천원/평'], ['DSCR', calculated.dscr.toFixed(2), '영업수익/연간채무상환액'], ['단순 IRR', calculated.simpleIrr.toFixed(2), '%'],
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '아파트_공사비_산출표.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const maxChart = Math.max(calculated.apartmentDirect, calculated.apartmentExpense, calculated.retailDirect, calculated.basementDirect, calculated.greenCost, calculated.financeCost, 1)

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <header className="top">
        <div><h1>아파트 공사비·PF 사업성 계산 앱</h1><p>국토부 기본형건축비 연도별 적용 및 사업성 분석</p></div>
        <div className="top-actions">
          <button onClick={() => setDark(!dark)}>{dark ? '밝은화면' : '다크모드'}</button>
          <button onClick={downloadCsv}>엑셀용 CSV</button>
          <button onClick={() => window.print()}>PDF 출력</button>
          <button onClick={reset}>초기화</button>
        </div>
      </header>

      <section className="steps"><div>① 국토부 단가 선택</div><div>② 기본 선택란</div><div>③ 면적·금액 입력</div><div>④ 계산결과 확인</div></section>

      <section className="card">
        <h2>국토부 아파트 시공단가 연도별 입력·조회</h2>
        <p className="notice">조회연도 입력 → 검색 → 해당 연도 금액 없으면 직접 입력 → 저장/적용 순서로 사용함.</p>
        <div className="grid six">
          <NumberInput label="조회연도" value={molitSearchYear} setValue={setMolitSearchYear} />
          <TextInput label="적용연도" value={molitYear} setValue={setMolitYear} placeholder="예: 2026" />
          <NumberInput label="기본형건축비(천원/평)" value={molitBaseCost} setValue={setMolitBaseCost} comma />
          <NumberInput label="지하층건축비(천원/평)" value={molitBasementCost} setValue={setMolitBasementCost} comma />
          <TextInput label="비고" value={molitMemo} setValue={setMolitMemo} placeholder="출처·고시일 입력" />
          <div className="button-stack"><button className="primary" onClick={searchMolitYear}>검색</button><button className="success" onClick={saveMolitRate}>저장/적용</button></div>
        </div>
        <div className="mode-buttons"><button className={useMolitBase ? 'active' : ''} onClick={() => setUseMolitBase(true)}>국토부 연도별 단가 적용</button><button className={!useMolitBase ? 'active' : ''} onClick={() => setUseMolitBase(false)}>지역·유형 실무단가 적용</button><span>현재 적용: {calculated.baseRateSource}</span></div>
        <div className="table-wrap"><table><thead><tr><th>연도</th><th>기본형건축비</th><th>지하층건축비</th><th>비고</th><th>적용</th></tr></thead><tbody>{molitRates.map((row) => (<tr key={row.year}><td>{row.year}</td><td>{formatNumber(row.base)} 천원/평</td><td>{formatNumber(row.basement)} 천원/평</td><td>{row.memo}</td><td><button className="small" onClick={() => applyMolitRate(row)}>적용</button></td></tr>))}</tbody></table></div>
      </section>

      <section className="card">
        <h2>기본 입력란</h2>
        <div className="grid five"><NumberInput label="토지대 입력란(천원)" value={landCost} setValue={setLandCost} comma placeholder="예: 8,000,000" /><NumberInput label="아파트 평면적(평)" value={apartmentArea} setValue={setApartmentArea} comma /><NumberInput label="근린상가 평면적(평)" value={retailArea} setValue={setRetailArea} comma /><NumberInput label="지하층 평면적(평)" value={basementArea} setValue={setBasementArea} comma /><NumberInput label="물가 상승률(%)" value={increaseRate} setValue={setIncreaseRate} /></div>
      </section>

      <section className="card">
        <div className="section-head"><h2>기본 선택란</h2><span>선택항목은 파란색으로 표시됨</span></div>
        <nav className="tabs">
          {[['base','기본형건축비'],['apt','주거유형'],['basement','지하층'],['green','친환경·제로에너지'],['pf','PF·수지'],['result','계산결과']].map(([key,label]) => <button key={key} className={tab===key?'active':''} onClick={() => setTab(key)}>{label}</button>)}
        </nav>
        {tab === 'base' && <div className="tab-panel"><h3>서울·광역시·그 외 지역 선택</h3><ChoiceCards options={regionRates} value={region} onChange={setRegion} /><div className="mode-buttons"><button className={baseMode==='min'?'active':''} onClick={()=>setBaseMode('min')}>하한 적용</button><button className={baseMode==='average'?'active':''} onClick={()=>setBaseMode('average')}>중간값 적용</button><button className={baseMode==='max'?'active':''} onClick={()=>setBaseMode('max')}>상한 적용</button></div></div>}
        {tab === 'apt' && <div className="tab-panel"><h3>일반민간·브랜드·하이엔드·공공/LH 선택</h3><ChoiceCards options={apartmentTypes} value={apartmentType} onChange={setApartmentType} showPremium /><p className="notice">국토부 연도별 단가 적용 시 주거유형별 가산율을 적용함.</p></div>}
        {tab === 'basement' && <div className="tab-panel"><h3>지하층건축비 및 지하주차장 유형 선택</h3><ChoiceCards options={parkingTypes} value={parkingType} onChange={setParkingType} showPremium /></div>}
        {tab === 'green' && <div className="tab-panel split"><div><h3>친환경·제로에너지 가산 선택</h3><ChoiceCards options={greenOptions} value={green} onChange={setGreen} unit="%" /></div><div><h3>금융기관 검토용 기준 선택</h3><ChoiceCards options={pfOptions} value={pf} onChange={setPf} /></div></div>}
        {tab === 'pf' && <div className="tab-panel"><h3>PF 금융비·DSCR·IRR·물가연동 입력란</h3><div className="grid four"><NumberInput label="대출비율(%)" value={loanRatio} setValue={setLoanRatio} /><NumberInput label="금리(%)" value={interestRate} setValue={setInterestRate} /><NumberInput label="사업기간(개월)" value={periodMonths} setValue={setPeriodMonths} /><NumberInput label="예상매출액(천원)" value={salesRevenue} setValue={setSalesRevenue} comma /><NumberInput label="연간영업수익(천원)" value={operatingIncome} setValue={setOperatingIncome} comma /><NumberInput label="연간채무상환액(천원)" value={annualDebtService} setValue={setAnnualDebtService} comma /><NumberInput label="공사비 물가상승률(%)" value={inflationRate} setValue={setInflationRate} /><NumberInput label="물가반영 기간(년)" value={inflationYears} setValue={setInflationYears} /><NumberInput label="분양률/확약률(%)" value={preSaleRate} setValue={setPreSaleRate} /></div></div>}
        {tab === 'result' && <ResultPanel calculated={calculated} maxChart={maxChart} increaseRate={increaseRate} />}
      </section>

      <ResultPanel calculated={calculated} maxChart={maxChart} increaseRate={increaseRate} />
    </div>
  )
}

function ResultPanel({ calculated, maxChart, increaseRate }) {
  const dscrRisk = calculated.dscr > 0 && calculated.dscr < 1.2
  const irrRisk = calculated.simpleIrr > 0 && calculated.simpleIrr < 12
  return (
    <section className="results">
      <div className="card wide">
        <h2>계산결과</h2>
        <Row label="적용 단가 기준" value={calculated.baseRateSource} />
        <Row label="국토부 기본형건축비" value={`${formatNumber(calculated.molitBase)} 천원/평`} />
        <Row label="국토부 지하층건축비" value={`${formatNumber(calculated.molitBasement)} 천원/평`} />
        <Row label="최종 지상 적용단가" value={`${formatNumber(calculated.baseRate)} 천원/평`} />
        <Row label="최종 지하 적용단가" value={`${formatNumber(calculated.parkingRate)} 천원/평`} />
        <Row label="토지대" value={`${formatNumber(calculated.land)} 천원`} />
        <Row label="아파트 직접공사비" value={`${formatNumber(calculated.apartmentDirect)} 천원`} />
        <Row label="아파트 경비 50%" value={`${formatNumber(calculated.apartmentExpense)} 천원`} />
        <Row label="근린상가 공사비 25% 가산" value={`${formatNumber(calculated.retailDirect)} 천원`} />
        <Row label="지하층건축비" value={`${formatNumber(calculated.basementDirect)} 천원`} />
        <Row label="친환경·제로에너지 가산" value={`${formatNumber(calculated.greenCost)} 천원`} />
        <Row label={`물가 상승률 ${increaseRate}% 반영액`} value={`${formatNumber(calculated.increaseCost)} 천원`} />
        <Row label="PF 금융비" value={`${formatNumber(calculated.financeCost)} 천원`} />
        <div className="total-box"><div><span>총 사업비 추정액</span><strong>{formatNumber(calculated.total)} 천원</strong></div><div><span>전체 평균 평당 단가</span><strong>{formatNumber(calculated.averagePyeongCost)} 천원/평</strong></div></div>
      </div>
      <div className="card">
        <h2>PF 지표 요약</h2>
        <Row label="대출금 추정액" value={`${formatNumber(calculated.loanAmount)} 천원`} />
        <Row label="필요 자기자본" value={`${formatNumber(calculated.equityRequired)} 천원`} />
        <Row label="DSCR" value={`${calculated.dscr.toFixed(2)} 배`} danger={dscrRisk} />
        <Row label="단순 IRR" value={`${calculated.simpleIrr.toFixed(2)} %`} danger={irrRisk} />
        <Row label="예상손익" value={`${formatNumber(calculated.profit)} 천원`} />
        <Row label="손익률" value={`${(calculated.profitRate * 100).toFixed(2)} %`} />
        <Row label="분양률/확약률 반영 매출" value={`${formatNumber(calculated.presaleRevenue)} 천원`} />
        <Row label="물가연동 추가분" value={`${formatNumber(calculated.inflationGap)} 천원`} />
      </div>
      <div className="card wide"><h2>공사비 구성 그래프</h2><ProgressBar label="아파트 직접공사비" value={calculated.apartmentDirect} max={maxChart}/><ProgressBar label="아파트 경비" value={calculated.apartmentExpense} max={maxChart}/><ProgressBar label="근린상가" value={calculated.retailDirect} max={maxChart}/><ProgressBar label="지하층" value={calculated.basementDirect} max={maxChart}/><ProgressBar label="친환경·제로에너지" value={calculated.greenCost} max={maxChart}/><ProgressBar label="PF 금융비" value={calculated.financeCost} max={maxChart}/></div>
      <div className="card"><h2>공정률 기반 자금집행</h2>{calculated.progress.map((v) => <Row key={v.step} label={`${v.step} ${v.rate}%`} value={`${formatNumber(v.amount)} 천원`} />)}<div className="tags">{costFactors.map((f) => <span key={f}>{f}</span>)}</div></div>
    </section>
  )
}
