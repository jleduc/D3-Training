
// Renderers for the Graphics based Views //


// render a basic 2D numeric table as a d3 stacked bar chart
EPS.StackedBarRenderer = function(dataBlock, el) {
	var colHeaders = ReduceToColumnHeaderData(dataBlock,dataBlock.indexDisplayOrder);
  var colDataBlock = ReduceToColumnData(dataBlock,dataBlock.indexDisplayOrder);
    
    var anchorPoint = el.prop("id");
    console.log("BEGIN - d3 graphing at location: " + anchorPoint);
		var w = 960, h = 500;
		 
		// create canvas
		var svg = d3.select("#" + anchorPoint ).append("svg:svg")
		.attr("class", "chart")
		.attr("width", w)
		.attr("height", h )
		.append("svg:g")
		.attr("transform", "translate(10,470)");
		 
		//console.log("RAW MATRIX---------------------------");
		// columns: ID,c1,c2,c3,...
		var matrix = [];
		_.each(colDataBlock, function(d,i){		  		
		    var rowData = [];
		    rowData.push(i);
		    _.each(d.colData, function(c) {
		    	if (isNumber(c.cell)) {
		    		rowData.push(parseInt(c.cell));
		    	} else {
		    		rowData.push(0);
		    	};		    	
		    });
		  matrix.push(rowData);
		});
		var rowNum = matrix[0].length;
		
		var rngCnt = 0;
		var colorList = ["darkblue", "blue", "lightblue","darkgreen", "green", "lightgreen","darkred", "red", "yellow","cyan","black"];
		var colorRange = [];
		var colList = [];
		for (i=1;i<=rowNum-1;i++) {
			colList.push("c"+i);
			if (rngCnt >= colorList.length) { rngCnt = 0;	}
			colorRange.push(colorList[rngCnt++]);
		};

		x = d3.scale.ordinal().rangeRoundBands([0, w-50]);
		y = d3.scale.linear().range([0, h-50]);
		z = d3.scale.ordinal().range(colorRange); 

/*   example data set structure
		var matrix = [
		[ 1, 5871, 8916, 2868],
		[ 2, 10048, 2060, 6171],
		[ 3, 16145, 8090, 8045],
		[ 4, 990, 940, 6907],
		[ 5, 450, 830, 5000]
		];
*/	
		//console.log(colList);
		//console.log(matrix); 
		//console.log("REMAP---------------------------");
		var remapped = colList.map(function(dat,i){	
											return matrix.map(function(d,ii){
																				return {x:ii ,y:d[i+1]};
																				});
											});
		//console.log(remapped);
		//console.log("LAYOUT---------------------------");
		var stacked = d3.layout.stack()(remapped);
		//console.log(stacked);
		 
		x.domain(stacked[0].map(function(d) { return d.x; }));
//		y.domain([0, d3.max(stacked[stacked.length - 1], function(d) { return d.y0 + d.y; })]);
		y.domain([0, d3.max(stacked[stacked.length - 1], function(d) { return d.y0+ d.y; })]);
		
		// show the domains of the scales
		//console.log("x.domain(): " + x.domain());
		//console.log("y.domain(): " + y.domain());
		//console.log("------------------------------------------------------------------");
		 
		// Add a group for each column.
		var valgroup = svg.selectAll("g.valgroup")
												.data(stacked)
												.enter().append("svg:g")
												.attr("class", "valgroup")
												.style("fill", function(d, i) { return z(i); })
												.style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });
		 
		// Add a rect for each data.
		var rect = valgroup.selectAll("rect")
									.data(function(d){return d;})
									.enter().append("svg:rect")
									.attr("x", function(d) { return x(d.x); })
									.attr("y", function(d) { return -y(d.y0) - y(d.y); })
									.attr("height", function(d) { return y(d.y); })
									.attr("width", x.rangeBand());

    console.log("END - d3 graphing");  
};
