

//////////////         COLLECTIONS         /////////////////////
EPS.Tables = Backbone.Collection.extend({
	url: EPS.baseurl,
  model: EPS.Table
});



/*  singelton for holding all views in a form */
EPS.TableViews = {};
  EPS.TableViews.views = new Array; 
  EPS.TableViews.add = function(viw) {
  	this.views.push(viw);
  };
  EPS.TableViews.get = function(key) {
  	var varViews = [];
  	this.views.forEach(function(viw) {
  		if (viw.model.get('variable') == key) {
  			varViews.push(viw);
  		};
  	}); 
  	return varViews;
  };
  EPS.TableViews.render = function() {
  	this.views.forEach(function(viw) {
  		viw.render();
  	});
  };
	EPS.TableViews.alignData = function(dataGlob) {
	  this.views.forEach(function(v){
	   	 var vName = v.model.get('variable');
//	   	 alert(vName);
	   	 var dataItem = {};
			 for(i=0;i<dataGlob.dataList.length;i++) {
			 	 if( dataGlob.dataList[i].name == vName ) {
			 	 	dataItem=dataGlob.dataList[i];
			 	 	i = 9999;
			 	}
			}
//	   	 alert(dataItem.name);
			  v.model.set('rawData',dataItem);
			  v.model.set('hasData', true);
			  v.model.set('isDirty', false);
				v.render();
	  });  
	};  
 // "/rawlist/{type}/{modelid}/{tempid}/{vars}"
  EPS.TableViews.fetchEnMasse = function() {
  	var url = EPS.baseurl + '/FactTableService/rawlist/' + EPS.engine_type + '/' + EPS.model_id + '/' + EPS.template_id + '/';
  	var vList = '';
  	var uniqueList = [];
	  this.views.forEach(function(v){
				if (uniqueList.indexOf(v.model.get('variable')) == -1) {
	   	 		vList += v.model.get('variable') + ',';
	   	 		uniqueList.push(v.model.get('variable'));
				}
	  });
	  url += vList;
  	// do ajax call here 
    var serviceAPI =  url;
		console.log( "calling json:" + serviceAPI );
    var jqxhr = $.getJSON( serviceAPI, function(data) {
				console.log( "success for variableList: " + vList );	
				EPS.TableViews.alignData(data);
//				alert(data);							
		})
		.fail(function(data) { 
						console.log( "fail code:" + data.status );
						console.log( "fail msg:" + data.statusText );
					})
		.always(function(data) { 
		        // we seem to end up here in IE with error status 0
						if (data.status == 0) {
						  console.log( "captured data for variableList: " + vList);
							EPS.TableViews.alignData(data);
//							alert(data);									
						}
					});  	
 };	


// collection instances //
EPS.formTables = new EPS.Tables;

EPS.formTables.on("update", function(tab) {
	tab.fetch();
});



/**  behavior for collection
EPS.formTables.on("add", function(tab) {
	tab.fetch();
});

EPS.formTables.on("change", function(tab) {
	tab.set('isDirty', true);
});
**/





