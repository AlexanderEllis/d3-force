
/*

User stories:

I can see a Force-directed Graph that shows which countries share borders.

I can see each country's flag on its node.

Country flags from http://365icon.com/icon-styles/ethnic/classic2/

*/

// Select svg element 
let svg = d3.select('svg');

// Define constants
let width = +svg.attr('width');
let height = +svg.attr('height');
let URL = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';

// Define boundary radius for distance from edge to use in tick function
let radius = 16;

// Create simulation
var simulation = d3.forceSimulation()
  .force('link', d3.forceLink().id((d, i) => i))
  .force('charge', d3.forceManyBody().strength(-10).distanceMax(100).distanceMin(20))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(20).strength(1))

// GET json information
d3.json(URL, function(error, graph) {
  // Handle error
  if (error) throw error;

  // Add link lines to svg
  let link = svg.append('g')
      .attr('class', 'links')
    .selectAll('line')
    .data(graph.links)
    .enter().append('line')
      .attr('stroke-width', '2');

  // Add nodes to svg
  let node = svg.append('g')
      .attr('class', 'nodes')
    .selectAll('image')
    .data(graph.nodes)
    .enter().append('image')
      .attr('xlink:href', d => 'flags/' + d.code + '.png')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('mouseover', function(d) {
        d3.select('.tooltip')
          .html('<span>' + d.country + '</span>')
          .style('visibility', 'visible')
      })
      .on('mousemove', function() {
        d3.select('.tooltip')
          .style('top', (d3.event.pageY - 30) + 'px')
          .style('left', (d3.event.pageX + 5) + 'px')
      })
      .on('mouseleave', function(d) {
        d3.select('.tooltip')
          .style('visibility', 'hidden')
      })
  
  node.append('title')
    .text(d => d.country);
  
  // Add the nodes to the simulation
  simulation
    .nodes(graph.nodes)
    .on('tick', ticked);


  // Add the links to the simulation
  simulation.force('link')
    .links(graph.links)

  function ticked() {
    link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

    node
        .style('x', d => d.x = Math.max(radius, Math.min(width - radius, d.x - 8)))
        .style('y', d => d.y = Math.max(radius, Math.min(height - radius, d.y - 8)))
  }

  // Add tooltip
  d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('background-color', '#333')
      .style('opacity', '0.8')
      .style('color', 'white')
      .style('font-size', '14px')
      .style('font-family', 'sans-serif')
      .style('visibility', 'hidden')
      .style('text-align', 'center')
      .style('padding', '5px')
      .style('border-radius', '4px')

});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}