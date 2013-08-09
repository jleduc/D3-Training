
// Renderers for the Views //


// pure DOM via d3 - for test only DO NOT USE
EPS.TableRenderer = function(data, el) {
	var d = d3.selectAll(el);
	var d2 = d.append('h0');
	d2.html(data.title);

	var t = d.append('table');
	t.attr('class','gridtbl epsgrid');
	t.attr('id',data.name);
	t.attr('border',0);

	if (data.indexOrder.length == 1) {
		 var idx = data.indexes[data.indexOrder[0]];
//alert(idx);		 
     for (var i=0;i<idx.length;i++)
			{
				var tr = t.append('tr');
//				tr.attr('class','r'+(i%2));
				tr.append('td').attr('class','c1').html(idx[i]);
				tr.append('td').attr('class','ocell').attr('id',i).html(data.data[i]);	
			}
	} else {
		// make headers
		t.append('th').attr('class','corner');
		var headerIdx = data.indexes[data.indexOrder[1]];
		for (var h=0;h<headerIdx.length;h++) {
			var th = t.append('th').attr('class','r1').html(headerIdx[h]);			
		}
		var tblDataPos = 0;
			var idxData = data.indexes[data.indexOrder[0]];
			for (var i=0;i<idxData.length;i++) {
				var tr = t.append('tr');
//				tr.attr('class','r'+(i%2));
				// header
				tr.append('td').attr('class','r1').html(idxData[i]);

				for (var j=0;j<headerIdx.length;j++) {
					tr.append('td').attr('class','ocell').attr('id',i+'_'+j).html(data.data[tblDataPos++]);	
				}				
		}
	}	
	
};


// string based render, simple table, natural order, no filtering - very fast
EPS.StringyTableRenderer = function(data, el) {
	var d = '';
	d += '<h0>' +	data.title + '</h0>';
	d += '<table border="1">';
	if (data.indexOrder.length == 1) {
		 var idx = data.indexes[data.indexOrder[0]];
     for (var i=0;i<idx.length;i++)
			{
				var r = '<tr>';
				r += '<td>' + idx[i] + '</td>';
				r += '<td>' + data.data[i] + '</td>';
				r += '</tr>';
				d += r;
			}
	} else {
		// make headers
		d += '<th></th>';
		var headerIdx = data.indexes[data.indexOrder[1]];
		for (var h=0;h<headerIdx.length;h++) {
			d += '<th>' + headerIdx[h] + '</th>';		
		}
		var tblDataPos = 0;
			var idxData = data.indexes[data.indexOrder[0]];
			for (var i=0;i<idxData.length;i++) {
				var r = '<tr>';
				r += '<td>' + idxData[i] + '</td>';

				for (var j=0;j<headerIdx.length;j++) {
					r += '<td>' + data.data[tblDataPos++] + '</td>';
				}	
				d += r;			
			}
	}
		d += '</table>';	
		el.html(d);
};



// ************************************************************************************************ //
// ********** handlebar js helpers for mashing raw data into structures before rendering ********** //
// ************************************************************************************************ //

//render table pivots and slicers
Handlebars.registerHelper('tablePivots', function(dataBlock) {
	if (dataBlock.indexOrder.length == 1) { return  new Handlebars.SafeString(''); }
		var indexInfo = MakeIndexOrderInfo(dataBlock, dataBlock.indexDisplayOrder);
	  var selDataBlock = [];	  
	  for(i=0;i<dataBlock.indexOrder.length;i++) {
	  	if (i<2) {
			 var selData = [];
				_.each(dataBlock.indexNames,function(val,key){				
				    selData.push({name:key,title:val,selected:(key == indexInfo.values[i] ? 'selected' : '')});
		 		 	});
		    selDataBlock.push({name:dataBlock.name, data:selData,pname:(i>0? 'Column Pivot':'Row Pivot'), prefix:(i>0?'ci':'ri'), index: indexInfo.names[i], ptype:'pivot', resolvePivot:true});
	  	} else {
			 var selData = [];
				_.each(dataBlock.indexes[indexInfo.names[i]],function(val, key){				
				    selData.push({name:key,title:val,selected:(val == indexInfo.values[i] ? 'selected' : '')});
		 		 	});
		    selDataBlock.push({name:dataBlock.name, data:selData,pname:'Slicer ' + dataBlock.indexNames[indexInfo.names[i]], prefix:'si', index: indexInfo.names[i], ptype:'slice', resolvePivot:false});	  		
	  	};	  
     };	  
	  var sel = '';
		
		sel += '<table>';
		sel += '';
		sel += '';
		sel += '';
		sel += '{{#each this}}';
		sel += '<tr>';
		sel += '<td class="rh" align="right">{{pname}}</td>';
		sel += '<td align="left">';

	  sel += '<select class="dd1" size="1" id="{{prefix}}_{{name}}" {{ptype}}="{{name}}" index="{{index}}" ';
	  sel += ' {{#if resolvePivot}}';
	  sel += '    onChange="resolve_pivots(this,\'{{name}}\');" ';
	  sel += ' {{else}}';
	  sel += '    onChange="setIndexDisplayOrder(\'{{name}}\',EPS.TableViews.get(\'{{name}}\'));" ';
	  sel += ' {{/if}}';
  	sel += '>';
		
		sel += '  {{#each data}}';
		sel += '  <option id="{{name}}" {{selected}}>{{title}}</option>';
		sel += '  {{/each}}';
	  sel += '</select>';
		sel += '</td>';
		sel += '</tr>';
	  sel += '{{/each}}';
		sel += '';
		sel += '';
		sel += '';
		sel += '';
		sel += '</table>';
		sel += '';
	  var selProc = Handlebars.compile(sel);
  return new Handlebars.SafeString(selProc(selDataBlock));
});



// render Column Headers based on data and index order
Handlebars.registerHelper('tableColumnHeaders', function(dataBlock) {
	if (dataBlock.indexOrder.length == 1) { return  new Handlebars.SafeString('<td class="r1"/>'); }
	  var colHeaders = ReduceToColumnHeaderData(dataBlock,dataBlock.indexDisplayOrder);
	  var td = '';
		td += '<tr>';
		td += '<td class="corner"/>';  
		td += '  {{#each this}}';
		td += '  <td class="r1">{{.}}</td>';
		td += '  {{/each}}';
		td += '</tr>';
	  var tdProc = Handlebars.compile(td);
  return new Handlebars.SafeString(tdProc(colHeaders));
});

// render table data based on index order and slicer filters
Handlebars.registerHelper('tableData', function(dataBlock,options) {
  var colData = ReduceToColumnData(dataBlock,dataBlock.indexDisplayOrder);
  var tr = '';
	tr += '{{#each this}}';
	tr += '  <tr>';
	tr += '			<td class="c1">{{colName}}</td>';
	tr += ' 	 {{#each colData}}';
	tr += '		  <td class="' + options.hash['class'] + '" contenteditable="' + options.hash['edit'] + '" onblur="' + options.hash['blur'] + '" loc="{{loc}}" rawpos="{{rawpos}}">{{cell}}</td>';
	tr += ' 	 {{/each}}';
	tr += '  </tr>';
	tr += '{{/each}}';
  var trProc = Handlebars.compile(tr);		
	return new Handlebars.SafeString(trProc(colData));
});

// render a standard table, savvy to Pivots and Slicers
EPS.HandlebarTableRenderer = function(data, el) {
  var t = '';
  t += '<h0>{{title}}</h0>';
  t += '<br/><br/>';
  t += '{{tablePivots this}}';
  t += '<table class="gridtbl epsgrid" border="1" >';
  t += '';
	t += ' {{tableColumnHeaders this}}';
  t += '';
  t += ' {{tableData this edit="false" class="ocell"}}';
  t += '';
  t += '</table>';
  var tProc = Handlebars.compile(t);
  el.html(tProc(data));  
};



// render a standard table - for editing, savvy to Pivots and Slicers
EPS.HandlebarInputTableRenderer = function(data, el) {
  var t = '';
  t += '<h0 title="{{description}}" >{{title}}</h0>';
  t += '<br/><br/>';
  t += '{{tablePivots this}}';
  t += '<table class="gridtbl epsgrid" border="1" var_name="{{this.name}}" view_name="{{this.view_name}}" onblur="alet(\'ack\');" >';
  t += '';
	t += ' {{tableColumnHeaders this}}';
  t += '';
  t += ' {{tableData this edit="true" class="editable" blur="trackCellChange(this);"}}';
  t += '';
  t += '</table>';
  var viewName = el.attr("id");
  data.view_name = viewName;
  var tProc = Handlebars.compile(t);
  el.html(tProc(data));  
};


