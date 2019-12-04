const API_URL = "https://www.odata.org.il/group/entities/api?name=";

var current = window.location.search.substring(1);
if (current == "") current = "mof";

var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");

var simulation = d3.forceSimulation()
.force("link", d3.forceLink().id(function(d) { return d.id; }))
.force("charge", d3.forceManyBody().strength(-1000))
.force("center", d3.forceCenter(width / 2, height / 2));

d3.json(API_URL + current, function(error, odata) {
	if (error) throw error;
	
	var graph = {nodes:[], links:[]};
	
	graph.nodes = odata.related_groups;
	
	
	// set center element
	graph.nodes.unshift(odata.group);
	
	graph.nodes.forEach(function(d, i){
		d.id = i;
		d.text = d.display_name;
		if (d.name != odata.group.name) // skip the center group when it appears in the results
		graph.links.push({source: odata.group.id, target:i});
	});
	
	console.log(graph); 
	
	var link = svg.append("g")
	.style("stroke", "#aaa")
	.selectAll("line")
	.data(graph.links)
	.enter().append("line");
	
	// var node = svg.append("g")
	// .attr("class", "nodes")
	// .selectAll("circle")
	// .data(graph.nodes)
	// .enter().append("circle")
	// .attr("r", 10)
	// .call(d3.drag()
	// .on("start", dragstarted)
	// .on("drag", dragged)
	// .on("end", dragended));
	
	var label = svg.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(graph.nodes)
		.enter()
			.append("a")
			.attr("xlink:href", function (d) { 
					return window.location.href.split('?')[0]+"?"+d.name 
			})
				.append("text")
				.attr("class", "label")
				.attr("text-anchor", "middle")				
				.text(function(d) { return d.display_name });
	
	// var label = new d3plus.TextBox()
	// 	.data(graph.nodes)
	// 	.fontSize(10)
	// 	.width(60)
	// 	// .x(function (d, i) { return d.x; })
	// 	// .y(function (d, i) { return d.y; })
	// 	.render();
	
	simulation
	.nodes(graph.nodes)
	.on("tick", ticked);
	
	simulation.force("link")
	.links(graph.links);
	
	function ticked() {
		link
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; })
		.attr("stroke", "#eee")
		.attr("stroke-width", function (d) { return d.target.count + "px"});
		
		// node
		// .attr("r", 3)
		// .style("fill", "#e38d31")
		// .style("stroke", "#d9d9d9")
		// .style("stroke-width", "1px")
		// .attr("cx", function (d) { return d.x; })
		// .attr("cy", function(d) { return d.y; });
		
		// label
		// 	// .x(function (d) { return d.x; })
		// 	// .y(function (d) { return d.y; })
		// 	.render();
		label
		.attr("x", function(d) { return d.x; })
		.attr("y", function (d) { return d.y; })
			.style("font-size", function (d) { return (d.name == odata.group.name ? "20px" : "10px")});

		
	};
	
	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart()
		simulation.fix(d);
	}
	
	function dragged(d) {
		simulation.fix(d, d3.event.x, d3.event.y);
	}
	
	function dragended(d) {
		if (!d3.event.active) simulation.alphaTarget(0);
		simulation.unfix(d);
	}
});