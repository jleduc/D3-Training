
// managers for EPS Variables //

// register a model to a view and return the view for linkage assignment
function regFormVar(varName, varModel, varView, anchorPoint){
  if (anchorPoint == null) { anchorPoint = varName; };
  var varMod = EPS.formTables.findWhere({'variable':varName});
  
  if (varMod == null) {
   varMod = new varModel({'variable':varName});
	 EPS.formTables.add(varMod);   
	} else {
		console.log("Reusing a Table:" + varName);
	};
  
  var modView = new varView(varMod,anchorPoint);
  EPS.TableViews.add(modView);
 
 return modView; 
};



// used to build a filter set, or just get the order
function MakeIndexOrderInfo(rawData, indexOrderArray) {	
	var indexOrderNames = [];
	var indexOrderValues = [];
	// create a savvy index order if none provided
	if (indexOrderArray == null || indexOrderArray.length == 0){
		var savvyIndexOrder = [];
		// check flags
		if (rawData.simpleFlags != null) {
			//check for def row/col settings
			 var defCol = rawData.simpleFlags['default_column_index'];
			 var defRow = rawData.simpleFlags['default_row_index'];			 
			 if (defRow != null) {
//			 	console.log("	default_row_index:" + defRow);
			 	savvyIndexOrder.push(defRow);
			};
			 if (defCol != null) {
//			 	console.log("	default_column_index:" + defCol);
			 	savvyIndexOrder.push(defCol);
			};
			if (savvyIndexOrder.length > 0) {
				_.each(rawData.indexOrder, function(k,v) {
							  //console.log(k+'='+v);
							  if (savvyIndexOrder.indexOf(k) == -1) { 
							  	savvyIndexOrder.push(k);
							  	//console.log('savvyIndexOrder add:' + k);
							   };
							});				
			} else {
				savvyIndexOrder = rawData.indexOrder;
			};
		}  else {
			savvyIndexOrder = rawData.indexOrder;
		};
		for(i=0;i<savvyIndexOrder.length;i++) {
			if (i<2) {
				indexOrderNames.push(savvyIndexOrder[i]);
				indexOrderValues.push(savvyIndexOrder[i]);
			} else {
				indexOrderNames.push(savvyIndexOrder[i]);
				indexOrderValues.push(rawData.indexes[savvyIndexOrder[i]][0]);	
			};
		};
	} else {		
		_.each(indexOrderArray, function(idx) {
						indexOrderNames.push(idx.name)
						// check to make sure we have a valid entry, else set to fist entry
						if (idx.value == '') {
							indexOrderValues.push(rawData.indexes[idx.name][0]);	
						} else {
							indexOrderValues.push(idx.value);									
						};
		});		
	};
	return {names:indexOrderNames, values:indexOrderValues};
};


// ** create a 2D view on n-D data **//
function ReduceToColumnData(rawData, indexOrderArray) {
	var colDataBlock = [];
	var indexInfo = MakeIndexOrderInfo(rawData, indexOrderArray);
	var indexOrderNames = indexInfo.names;
	var indexOrderValues = indexInfo.values;		
	if (rawData.indexOrder.length == 1) { 
		var colIdx = rawData.indexes[indexOrderValues[0]];
		 for(i=0;i<colIdx.length;i++) {
		    var rowData = [];
		    rowData.push({cell:rawData.data[i], loc:(i+1).toString(), rawpos:i});
		    colDataBlock.push({colName:colIdx[i],colData:rowData});
 		 };
	} else {
		  var myTrans = [];
		  TransformDataToFact(rawData,myTrans);

      var filterList = [];
      // build slicer filter list
      for(idxPos=2;idxPos<indexOrderNames.length;idxPos++) {      	
	      var fCol = indexOrderNames[idxPos];
	      var fVal = indexOrderValues[idxPos];
	      console.log("making filter:  " + fCol + " = " + fVal);
	      filterList.push({col:fCol,val:fVal});    
      };      
      // filter set down as needed
			var filteredData = myTrans;
			for(f=0;f<filterList.length;f++) {
				filteredData = filteredData.filter(function(d) {
																						var tF = filterList[f];
																						var isMatch = (d[tF.col] == tF.val);
																						return isMatch;
																						});			
			};
			// check for flipped index order
			// get ROW/COL pos
			var rowPos = 0;
			var colPos = 0;
			for(idx=0;idx<rawData.indexOrder.length;idx++) {
			  if (rawData.indexOrder[idx] == indexOrderValues[0]) { rowPos = idx; }
			  if (rawData.indexOrder[idx] == indexOrderValues[1]) { colPos = idx; }
			};
			console.log('rowPos:' + rowPos + '  colPos:' + colPos);			
			var colIdx = rawData.indexes[indexOrderValues[0]];	 	
			var rowIdx = rawData.indexes[indexOrderValues[1]];
			var dataPos = 0;
			// flip it or no
			if (rowPos < colPos) {
				// make natural order
				for(i=0;i<colIdx.length;i++) {
					var rowData = [];
					for(r=0;r<rowIdx.length;r++) {
						if (filteredData[dataPos] == null) {
							console.log("null flip error at r:" + r + " c:" + i + "   pos:" + dataPos);						
						} else {
							var cellLoc = (parseInt(i)+1) + ',' + (parseInt(r)+1);
						  rowData.push({cell:filteredData[dataPos].cell, loc:cellLoc, rawpos:filteredData[dataPos].rawpos});							
						};
						dataPos++;
					};
					colDataBlock.push({colName:colIdx[i],colData:rowData});
				};				
			} else {
				console.log("flipping data");
				var tempData = []
				// make natural order first
				var colIdxNatural = rawData.indexes[indexOrderValues[1]];	 	
				var rowIdxNatural = rawData.indexes[indexOrderValues[0]];
				for(i=0;i<colIdxNatural.length;i++) {
					var rowData = [];
					for(r=0;r<rowIdxNatural.length;r++) {
						if (filteredData[dataPos] == null) {
							console.log("null flip error at r:" + r + " c:" + i + "   pos:" + dataPos);						
						} else {
						  rowData.push({cell:filteredData[dataPos].cell, rawpos:filteredData[dataPos].rawpos});							
						};
						dataPos++;
					};
					tempData.push(rowData);
				};
				// flip data
				for(r=0;r<=rowIdxNatural.length-1;r++) {
					var rowData = [];
					for(c=0;c<=colIdxNatural.length;c++) {
					  if (tempData[c] != null) { 
							var cellLoc = (parseInt(r)+1) + ',' + (parseInt(c)+1);
					  	rowData.push({cell:tempData[c][r].cell, loc:cellLoc, rawpos:tempData[c][r].rawpos});
					   }
					};
					colDataBlock.push({colName:rowIdxNatural[r],colData:rowData});
				};
			};			
	};
	
	return colDataBlock;	
};



function ReduceToColumnHeaderData(rawData, indexOrderArray) {
	var indexInfo = MakeIndexOrderInfo(rawData, indexOrderArray);	
	var rowData = [];
	if(rawData.indexOrder.length > 1) {
			 rowData = rawData.indexes[indexInfo.values[1]];	 	
	};		
	return rowData;
};



// recurse through the raw data and make a multidimensional String dataset as a fact table
function TransformDataToFact(rawData, transformedData, level, mask, counter) {
	if(typeof counter === "undefined") { 
		counter=0; // reset counter into data array if we are just getting started
		mask = new Array(rawData.indexOrder.length); // mask of dimensions
		level = 0;
	};
	// create a loop at the current level that walks through this dimension
	for(mask[level]=0; mask[level]<rawData.indexes[rawData.indexOrder[level]].length; mask[level]++) {
		// are we at the innermost dimension?
		if(level==rawData.indexOrder.length-1) { // innermost level so we do the work
			// first we push the value itself, making a new element in the array
			transformedData.push({cell: rawData.data[counter].toString(), rawpos:counter});
			// now we add the index attributes to the element we just made
			for(theIndex=0; theIndex < rawData.indexOrder.length; theIndex++) {
				transformedData[transformedData.length-1][rawData.indexOrder[theIndex]] = rawData.indexes[rawData.indexOrder[theIndex]][mask[theIndex]]	
			};
			counter = counter + 1; // increment data array counter -- cheaper than doing the array arithmetic
		} else {
			// not at innermost level so call another level down
			counter = TransformDataToFact(rawData, transformedData, level+1, mask, counter);
		};
	};
	return counter;
};



// helpers

// build a name/value pair set for model and ask view to render
function setIndexDisplayOrder(varName,viewList){
  console.log("setIndexDisplayOrder : " + varName);
	var idxList = [];
	var pList = $("select[pivot='" + varName + "']");   
	_.each(pList,function(s){ 
//console.log("pivot selected index:" + $(s).prop("selectedIndex"));
    if ($(s).prop("selectedIndex") == -1) {
			var idxEntry = {name:$(s).attr("index"),value:$(s).attr("index")}; 
			idxList.push(idxEntry);      	    	
    } else {
			var opt = $(s).prop("options")[$(s).prop("selectedIndex")];
					var idxEntry = {name:$(s).attr("index"),value:opt.id}; 
					idxList.push(idxEntry);      	
    };
	});		
	
	var sList = $("select[slice='" + varName + "']");   
	_.each(sList,function(s){ 
//console.log("slicer selected index:" + $(s).prop("selectedIndex"));
		if ($(s).prop("selectedIndex") == -1) {
						var idxEntry = {name:$(s).attr("index"),value:''}; 
						idxList.push(idxEntry);  				
		} else {
				var opt = $(s).prop("options")[$(s).prop("selectedIndex")];
						var idxEntry = {name:$(s).attr("index"),value:opt.value}; 
						idxList.push(idxEntry);  	
		};
	});		

  _.each(viewList,function(view){
										view.model.set({"indexDisplayOrder":idxList});
										view.render();
									});

};

// resolve conflict when pivots are the same
function resolve_pivots(selObj,varName){
	var orgPivotIndex = $(selObj).attr("index");
	var orgPivotSelectedId = selObj.options[selObj.selectedIndex].id;
//console.log("orgPivotIndex:" + orgPivotIndex);
//console.log("orgPivotSelectedId:" + orgPivotSelectedId);
	var pList = $("select[pivot='" + varName + "']");   
	_.each(pList,function(s){ 
		if ($(s).prop("id") != selObj.id) {  
			if($(s).prop("selectedIndex") == selObj.selectedIndex){ 
				if (selObj.selectedIndex==0) {  
				 $(s).prop("selectedIndex",1); 
				} else {
				 $(s).prop("selectedIndex",selObj.selectedIndex-1); 
				};
			};		
		};
	});
	// check to see if we pivoted to a slicer, if so reset them
	var slicerObj = $("select[slice='" + varName + "'][index='" + orgPivotSelectedId + "'], select[pivot='" + varName + "'][index='" + orgPivotSelectedId + "']");
	if (slicerObj.length == 1) {
		console.log('pivoting to a slicer');
		slicerObj.attr("index",orgPivotIndex);
		slicerObj.html('');
		$(selObj).attr("index",orgPivotSelectedId); 
		$(selObj).html('');
	};
	setIndexDisplayOrder(varName,EPS.TableViews.get(varName));
};

/* collection cell information and coords to be shipped back to server */
function trackCellChange(cellObj) {
	var tbl = $(cellObj).closest('table');	
//	console.log("var: " + tbl.attr('var_name') + " xy:" + $(cellObj).attr('loc'));
	var varModel = EPS.formTables.findWhere({'variable':tbl.attr('var_name')});
  var locInfo = [];
  var rawData = varModel.get("rawData");
  var indexOrder = rawData.indexOrder;

   
  _.each($(cellObj).attr('loc').split(","),function(k,v){
  	locInfo.push(k);
  });
  
  if (indexOrder.length > 2) {
	  var indexInfo = MakeIndexOrderInfo(rawData,varModel.get("indexDisplayOrder"));	  	  
  	for (i=2;i<indexOrder.length;i++) {
  		 var valPos = parseInt(rawData.indexes[indexInfo.names[i]].indexOf(indexInfo.values[i]))+1;	
  		locInfo.push(valPos);
  	}
  	indexOrder = indexInfo.names;
  }
  
  var cellData = $(cellObj).text();
  console.log('recording cell data -  cell:' + locInfo.toString() + '  data:' + cellData);
  // wrie back data
  var rawPos = $(cellObj).attr('rawpos');
  rawData["data"][rawPos] = cellData;
  // record changes into Model
  varModel.get('pftcObj').setIndexOrder(indexOrder);	//also set on render, we are doing this for now to testout send-on-every-change
  varModel.get('pftcObj').addDataChange({loc:locInfo,cell:cellData});  //{loc:array,cell:string}  
  // push data to server  
  varModel.SaveData();
	varModel.get('pftcObj').clear();  // if we dont clear we dont need to set the index order above

  // tell everyone to render that share the same Model we do
  var varName = tbl.attr('var_name');
  var viewList = EPS.TableViews.get(varName);
  var thisViewName = tbl.attr('view_name');
  _.each(viewList,function(view){
	  	if (view.anchorPoint != thisViewName) {
	  		view.render();
	  	}
	});

};

// misc stuff - legacy //
function HideLoadingDiv(s)
{
  var fld = null;
  if (top.document.getElementById('load1')) {
    fld = top.document.getElementById('load1');
  } else {
    if (top.header) {
      fld = top.header.document.getElementById('load1');
    };
  };
  if (fld) fld.style.display = 'none';

  if (top.document.getElementById('load2')) {
    fld = top.document.getElementById('load2');
  } else {
    fld = top.header.document.getElementById('load2');
  };
  if (fld) fld.style.display = 'none';
};


function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
