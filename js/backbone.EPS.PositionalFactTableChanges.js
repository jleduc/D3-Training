

/* PositionalFactTableChanges object
  used to collect table change information that will be deserialized on the server and applied to the engine
																						//  ex:     pftc.indexOrder = ["Project_Phases1","Commit_delay"];  // 	pftc.dataChanges = [{"coordinates":[1,1],"cellValue":"1"}];
*/																						
function PositionalFactTableChanges() {
	this.pftc = {};
	this.pftc.indexOrder = [];		// ex: "Project_Phases1"
	this.pftc.dataChanges = [];		// ex: {"coordinates":[1,1],"cellValue":"1"}
};

PositionalFactTableChanges.prototype.setIndexOrder = function(idxData) { 
						console.log( "PFTC setIndexOrder  sz:" + idxData.length);
						this.pftc.indexOrder = idxData;
						this.pftc.dataChanges = [];	
  return this;
};

//  {loc:array,cell:string}
PositionalFactTableChanges.prototype.addDataChange = function(dataChange) { 
						console.log( "PFTC addDataChange  sz:" + dataChange.cell.length + "  pos:" + dataChange.loc.toString());
						var cords = dataChange.loc;
						var d = {"coordinates":cords,"cellValue":dataChange.cell};
						this.pftc.dataChanges.push(d);
  return this;						
};
					
PositionalFactTableChanges.prototype.json = function() { 
						console.log( "PFTC json stringify");
						return JSON.stringify(this.pftc);
};

PositionalFactTableChanges.prototype.clear = function() { 
	console.log( "PFTC clear");
	this.pftc.indexOrder = [];		// ex: "Project_Phases1"
	this.pftc.dataChanges = [];		// ex: {"coordinates":[1,1],"cellValue":"1"}
  return this;
};
