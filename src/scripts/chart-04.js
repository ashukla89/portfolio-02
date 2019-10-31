import * as d3 from 'd3'

const margin = { top: 40, left: 80, right: 200, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 700 - margin.left - margin.right

const svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const xPositionScale = d3
  .scaleLinear()
  .domain([1980, 2012])
  .range([0, width])

const yPositionScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range([height, 0])

const colorScale = d3
  .scaleOrdinal()
  .range([
    '#a6cee3',
    '#1f78b4',
    '#b2df8a',
    '#33a02c',
    '#fb9a99',
    '#e31a1c',
    '#fdbf6f',
    '#ff7f00',
    '#cab2d6',
    '#6a3d9a',
    '#ffff99'
  ])

const area = d3
  .area()
  .x(d => xPositionScale(d.year))
  .y0(d => yPositionScale(d.values[0]))
  .y1(d => yPositionScale(d.values[1]))

// wanted to put in a tooltip that shows the actual values
// of patents on mouseover,
// but ran out of time to put in corresponding circles
// since this doesn't work well with paths

d3.csv(require('../data/us_share.csv')).then(ready)

function ready(datapoints) {
  console.log('Data read in:', datapoints)

  const countryGroups = datapoints.columns.slice(1)
  colorScale.domain(countryGroups)
  console.log('keys', countryGroups)

  // stack the data?
  const stack = d3.stack().keys(countryGroups)
  const stackedData = stack(datapoints)
  // console.log('first stacked data', stackedData)

  // Copy the stack offsets back into the data
  // Code below stolen from the internet
  const newStackedData = []
  stackedData.forEach((piece, index) => {
    console.log('piece', piece)
    const currentStack = []
    piece.forEach((d, i) => {
      currentStack.push({
        values: d,
        year: datapoints[i].year
      })
    })
    currentStack.key = piece.key
    currentStack.index = piece.index
    console.log('currentStack', currentStack)
    newStackedData.push(currentStack)
  })

  // console.log('second stacked data', newStackedData)

  const layer = svg
    .selectAll('.layer4')
    .data(newStackedData)
    .enter()
    .append('g')
    .attr('class', 'layer4')

  layer
    .append('path')
    .attr('class', function(d) {
      return 'areas4 area4' + d.key
    })
    .style('fill', function(d, i) {
      // console.log(i, d)
      // console.log(i, d.key)
      return colorScale(d.key)
    })
    .attr('d', area)
    .on('mouseover', function(d) {
      console.log(d)
      // reduce opacity of all groups
      d3.selectAll('.areas4').style('opacity', 0.1)
      // except the one that is hovered over
      d3.select('.area4' + d.key).style('opacity', 1)
      // bold the relevant text
      d3.select('.label4' + d.key).style('font-weight', 700)
    })
    .on('mouseout', function(d) {
      d3.selectAll('.areas4').style('opacity', 1)
      d3.selectAll('.mylabels4').style('font-weight', 400)
    })

  // Add one dot in the legend for each name
  const size = 20
  svg
    .selectAll('rect')
    .data(countryGroups)
    .enter()
    .append('rect')
    .attr('x', width + 10)
    .attr('y', function(d, i) {
      return i * (size + 5)
    })
    .attr('width', size)
    .attr('height', size)
    .style('fill', function(d) {
      return colorScale(d)
    })
    .on('mouseover', function(d) {
      console.log(d)
      // reduce opacity of all groups
      d3.selectAll('.areas4').style('opacity', 0.1)
      // except the one that is hovered over
      d3.select('.area4' + d).style('opacity', 1)
      // bold the relevant text
      d3.select('.label4' + d).style('font-weight', 700)
    })
    .on('mouseout', function(d) {
      d3.selectAll('.areas4').style('opacity', 1)
      d3.selectAll('.mylabels4').style('font-weight', 400)
    })

  // Add one dot in the legend for each name.
  svg
    .selectAll('mylabels4')
    .data(countryGroups)
    .enter()
    .append('text')
    .attr('class', function(d) {
      return 'mylabels4 label4' + d
    })
    .attr('x', width + size + 15)
    .attr('y', function(d, i) {
      return i * (size + 5) + size / 2
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .style('fill', 'black')
    .text(function(d) {
      return d
    })
    .attr('text-anchor', 'left')
    .style('alignment-baseline', 'middle')
    .style('font-size', 12)
    .on('mouseover', function(d) {
      console.log(d)
      // reduce opacity of all groups
      d3.selectAll('.areas4').style('opacity', 0.1)
      // except the one that is hovered over
      d3.select('.area4' + d).style('opacity', 1)
      d3.select(this).style('font-weight', 700)
    })
    .on('mouseout', function(d) {
      d3.selectAll('.areas  4').style('opacity', 1)
      d3.select(this).style('font-weight', 400)
    })

  svg
    .append('text')
    .text('Percentage by Region of US Patents, 1980 - 2012')
    .attr('x', width / 2) // in the center
    .attr('text-anchor', 'middle') // center aligned
    .attr('dy', -15)
    .attr('font-size', 16)
    .attr('fill', 'black')
    .attr('font-weight', 'bold')

  const yAxis = d3.axisLeft(yPositionScale).tickFormat(d3.format('.0%'))
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  const xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.format('d'))
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
}
