function _1(md: any) {
  return md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">Bar Chart Race</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>

# Bar Chart Race

This chart animates the GDP per capita of the top countries from 1960 to 2023. Color indicates sector. Data: [Worldbank](https://data.worldbank.org/indicator/NY.GDP.PCAP.CD)`
}

const EXCLUDE_CODES = [
  'AFE',
  'AFW',
  'ARB',
  'CEB',
  'CSS',
  'EAP',
  'EAR',
  'EAS',
  'ECA',
  'ECS',
  'EMU',
  'EUU',
  'FCS',
  'HIC',
  'HPC',
  'IBD',
  'IBT',
  'IDA',
  'IDB',
  'IDX',
  'INX',
  'LAC',
  'LCN',
  'LDC',
  'LIC',
  'LMC',
  'LMY',
  'LTE',
  'MEA',
  'MIC',
  'MNA',
  'NAC',
  'OED',
  'OSS',
  'PRE',
  'PSS',
  'PST',
  'SAS',
  'SSA',
  'SSF',
  'SST',
  'TEA',
  'TEC',
  'TLA',
  'TMN',
  'TSA',
  'TSS',
  'UMC',
  'WLD',
]

function _data(FileAttachment: any) {
  return FileAttachment('gdp.csv').csv({ typed: true })
}

function _replay(html: any) {
  return html`<button>Replay</button>`
}

async function* _chart(
  replay: any,
  d3: any,
  width: any,
  height: any,
  bars: (arg0: any) => any,
  axis: (arg0: any) => any,
  labels: (arg0: any) => any,
  ticker: (arg0: any) => any,
  keyframes: any,
  duration: any,
  x: any,
  invalidation: Promise<any>
) {
  replay

  const svg = d3
    .create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('width', width)
    .attr('height', height)
    .attr('style', 'max-width: 100%; height: auto;')

  const updateBars = bars(svg)
  const updateAxis = axis(svg)
  const updateLabels = labels(svg)
  const updateTicker = ticker(svg)

  yield svg.node()

  for (const keyframe of keyframes) {
    const transition = svg.transition().duration(duration).ease(d3.easeLinear)

    // Extract the top bar’s value.
    x.domain([0, keyframe[1][0].value])

    updateAxis(keyframe, transition)
    updateBars(keyframe, transition)
    updateLabels(keyframe, transition)
    updateTicker(keyframe, transition)

    invalidation.then(() => svg.interrupt())
    await transition.end()
  }
}

function _duration() {
  return 50
}

function _n() {
  return 16
}

function _names(data: any[]) {
  return new Set(
    data
      .filter((d: { code: string }) => !EXCLUDE_CODES.includes(d.code))
      .map((d: { name: any }) => d.name)
  )
}

function _datevalues(d3: any, data: any[]) {
  data = data.filter((d: { code: string }) => !EXCLUDE_CODES.includes(d.code))
  return Array.from(
    d3.rollup(
      data,
      ([d]: [any]) => d.value,
      (d: any) => +d.year,
      (d: any) => d.name
    )
  )
    .map(([year, data]) => [new Date(year, 0, 1), data])
    .sort(([a], [b]) => d3.ascending(a, b))
}

function _rank(names: Iterable<unknown> | ArrayLike<unknown>, d3: any, n: number) {
  return function rank(value: (arg0: unknown) => any) {
    const data = Array.from(names, (name) => ({ name, value: value(name) }))
    data.sort((a, b) => d3.descending(a.value, b.value))
    for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i)
    return data
  }
}

function _k() {
  return 10
}

function _keyframes(d3: any, datevalues: any, k: number, rank: any) {
  const keyframes = []
  let ka, a: { get: (arg0: any) => any }, kb, b: { get: (arg0: any) => any }
  for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
    for (let i = 0; i < k; ++i) {
      const t = i / k
      keyframes.push([
        new Date(ka * (1 - t) + kb * t),
        rank((name: any) => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t),
      ])
    }
  }
  keyframes.push([new Date(kb), rank((name: any) => b.get(name) || 0)])
  return keyframes
}

function _nameframes(d3: any, keyframes: [any, any][]) {
  return d3.groups(
    keyframes.flatMap(([, data]) => data),
    (d: { name: any }) => d.name
  )
}

function _prev(nameframes: [any, any][], d3: any) {
  return new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a: any, b: any) => [b, a])))
}

function _next(nameframes: [any, any][], d3: any) {
  return new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))
}

function _bars(n: any, color: any, y: any, x: any, prev: any, next: any) {
  return function bars(svg: any) {
    let bar = svg.append('g').attr('fill-opacity', 0.6).selectAll('rect')

    return ([_date, data]: any, transition: any) =>
      (bar = bar
        .data(data.slice(0, n), (d: { name: any }) => d.name)
        .join(
          (enter: any) =>
            enter
              .append('rect')
              .attr('fill', color)
              .attr('height', y.bandwidth())
              .attr('x', x(0))
              .attr('y', (d: any) => y((prev.get(d) || d).rank))
              .attr('width', (d: any) => x((prev.get(d) || d).value) - x(0)),
          (update: any) => update,
          (exit: any) =>
            exit
              .transition(transition)
              .remove()
              .attr('y', (d: any) => y((next.get(d) || d).rank))
              .attr('width', (d: any) => x((next.get(d) || d).value) - x(0))
        )
        .call((bar: any) =>
          bar
            .transition(transition)
            .attr('y', (d: { rank: any }) => y(d.rank))
            .attr('width', (d: { value: any }) => x(d.value) - x(0))
        ))
  }
}

function _labels(n: any, x: any, prev: any, y: any, next: any, textTween: any) {
  return function labels(svg: any) {
    let label = svg
      .append('g')
      .style('font', 'bold 12px var(--sans-serif)')
      .style('font-variant-numeric', 'tabular-nums')
      .style('fill', 'white')
      .attr('text-anchor', 'end')
      .selectAll('text')

    return ([_date, data]: any, transition: any) =>
      (label = label
        .data(data.slice(0, n), (d: { name: any }) => d.name)
        .join(
          (enter: any) =>
            enter
              .append('text')
              .attr(
                'transform',
                (d: any) =>
                  `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`
              )
              .attr('y', y.bandwidth() / 2)
              .attr('x', -6)
              .attr('dy', '-0.25em')
              .text((d: { name: any }) => d.name)
              .call((text: any) =>
                text
                  .append('tspan')
                  .attr('fill-opacity', 0.7)
                  .attr('font-weight', 'normal')
                  .attr('x', -6)
                  .attr('dy', '1.15em')
              ),
          (update: any) => update,
          (exit: any) =>
            exit
              .transition(transition)
              .remove()
              .attr(
                'transform',
                (d: any) =>
                  `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`
              )
              .call((g: any) =>
                g
                  .select('tspan')
                  .tween('text', (d: { value: any }) =>
                    textTween(d.value, (next.get(d) || d).value)
                  )
              )
        )
        .call((bar: any) =>
          bar
            .transition(transition)
            .attr(
              'transform',
              (d: { value: any; rank: any }) => `translate(${x(d.value)},${y(d.rank)})`
            )
            .call((g: any) =>
              g
                .select('tspan')
                .tween('text', (d: { value: any }) => textTween((prev.get(d) || d).value, d.value))
            )
        ))
  }
}

function _textTween(d3: any, formatNumber: any) {
  return function textTween(a: any, b: any) {
    const i = d3.interpolateNumber(a, b)
    return function (t: any) {
      this.textContent = formatNumber(i(t))
    }
  }
}

function _formatNumber(d3: any) {
  return d3.format(',d')
}

function _tickFormat() {
  return undefined
}

function _axis(
  marginTop: any,
  d3: any,
  x: any,
  width: number,
  tickFormat: any,
  barSize: number,
  n: any,
  y: any
) {
  return function axis(svg: any) {
    const g = svg.append('g').attr('transform', `translate(0,${marginTop})`)

    const axis = d3
      .axisTop(x)
      .ticks(width / 160, tickFormat)
      .tickSizeOuter(0)
      .tickSizeInner(-barSize * (n + y.padding()))

    return (_: any, transition: any) => {
      g.transition(transition).call(axis)
      g.select('.tick:first-of-type text').remove()
      g.selectAll('.tick:not(:first-of-type) line').attr('stroke', 'white')
      g.select('.domain').remove()
    }
  }
}

function _ticker(
  barSize: number,
  width: number,
  marginTop: number,
  n: number,
  formatDate: (arg0: any) => any,
  keyframes: any[][]
) {
  return function ticker(svg: any) {
    const now = svg
      .append('text')
      .style('font', `bold ${barSize}px var(--sans-serif)`)
      .style('font-variant-numeric', 'tabular-nums')
      .style('fill', 'white')
      .attr('text-anchor', 'end')
      .attr('x', width - 6)
      .attr('y', marginTop + barSize * (n - 0.45))
      .attr('dy', '0.32em')
      .text(formatDate(keyframes[0][0]))

    return ([date]: any, transition: { end: () => Promise<any> }) => {
      transition.end().then(() => now.text(formatDate(date)))
    }
  }
}

function _formatDate(d3: { utcFormat: (arg0: string) => any }) {
  return d3.utcFormat('%Y')
}

function _color(d3: any, data: any) {
  const scale = d3.scaleOrdinal(d3.schemeTableau10)
  if (data.some((d: { code: undefined }) => d.code !== undefined)) {
    const categoryByName = new Map(data.map((d: { name: any; code: any }) => [d.name, d.code]))
    scale.domain(categoryByName.values())
    return (d: { name: unknown }) => scale(categoryByName.get(d.name))
  }
  return (d: { name: any }) => scale(d.name)
}

function _x(d3: any, marginLeft: any, width: number, marginRight: number) {
  return d3.scaleLinear([0, 1], [marginLeft, width - marginRight])
}

function _y(d3: any, n: number, marginTop: number, barSize: number) {
  return d3
    .scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([marginTop, marginTop + barSize * (n + 1 + 0.1)])
    .padding(0.1)
}

function _height(marginTop: number, barSize: number, n: number, marginBottom: any) {
  return marginTop + barSize * n + marginBottom
}

function _barSize() {
  return 48
}

function _marginTop() {
  return 16
}

function _marginRight() {
  return 6
}

function _marginBottom() {
  return 6
}

function _marginLeft() {
  return 0
}

export function gdpPerCapita(runtime: any, observer: any) {
  const main = runtime.module()
  const fileAttachments = new Map([
    [
      'gdp.csv',
      {
        url: new URL('./files/API_NY.GDP.PCAP.CD_DS2_en_csv_v2_622726_LIST.csv', import.meta.url),
        mimeType: 'text/csv',
      },
    ],
  ])
  main.builtin(
    'FileAttachment',
    runtime.fileAttachments((name: string) => fileAttachments.get(name))
  )
  main.variable(observer()).define(['md'], _1)
  main.variable(observer('data')).define('data', ['FileAttachment'], _data)
  main.variable(observer('viewof replay')).define('viewof replay', ['html'], _replay)
  main
    .variable(observer('replay'))
    .define('replay', ['Generators', 'viewof replay'], (G: { input: (arg0: any) => any }, _: any) =>
      G.input(_)
    )
  main
    .variable(observer('chart'))
    .define(
      'chart',
      [
        'replay',
        'd3',
        'width',
        'height',
        'bars',
        'axis',
        'labels',
        'ticker',
        'keyframes',
        'duration',
        'x',
        'invalidation',
      ],
      _chart
    )
  main.variable(observer('duration')).define('duration', _duration)
  main.variable(observer('n')).define('n', _n)
  main.variable(observer('names')).define('names', ['data'], _names)
  main.variable(observer('datevalues')).define('datevalues', ['d3', 'data'], _datevalues)
  main.variable(observer('rank')).define('rank', ['names', 'd3', 'n'], _rank)
  main.variable(observer('k')).define('k', _k)
  main
    .variable(observer('keyframes'))
    .define('keyframes', ['d3', 'datevalues', 'k', 'rank'], _keyframes)
  main.variable(observer('nameframes')).define('nameframes', ['d3', 'keyframes'], _nameframes)
  main.variable(observer('prev')).define('prev', ['nameframes', 'd3'], _prev)
  main.variable(observer('next')).define('next', ['nameframes', 'd3'], _next)
  main.variable(observer('bars')).define('bars', ['n', 'color', 'y', 'x', 'prev', 'next'], _bars)
  main
    .variable(observer('labels'))
    .define('labels', ['n', 'x', 'prev', 'y', 'next', 'textTween'], _labels)
  main.variable(observer('textTween')).define('textTween', ['d3', 'formatNumber'], _textTween)
  main.variable(observer('formatNumber')).define('formatNumber', ['d3'], _formatNumber)
  main.variable(observer('tickFormat')).define('tickFormat', _tickFormat)
  main
    .variable(observer('axis'))
    .define('axis', ['marginTop', 'd3', 'x', 'width', 'tickFormat', 'barSize', 'n', 'y'], _axis)
  main
    .variable(observer('ticker'))
    .define('ticker', ['barSize', 'width', 'marginTop', 'n', 'formatDate', 'keyframes'], _ticker)
  main.variable(observer('formatDate')).define('formatDate', ['d3'], _formatDate)
  main.variable(observer('color')).define('color', ['d3', 'data'], _color)
  main.variable(observer('x')).define('x', ['d3', 'marginLeft', 'width', 'marginRight'], _x)
  main.variable(observer('y')).define('y', ['d3', 'n', 'marginTop', 'barSize'], _y)
  main
    .variable(observer('height'))
    .define('height', ['marginTop', 'barSize', 'n', 'marginBottom'], _height)
  main.variable(observer('barSize')).define('barSize', _barSize)
  main.variable(observer('marginTop')).define('marginTop', _marginTop)
  main.variable(observer('marginRight')).define('marginRight', _marginRight)
  main.variable(observer('marginBottom')).define('marginBottom', _marginBottom)
  main.variable(observer('marginLeft')).define('marginLeft', _marginLeft)
  return main
}
