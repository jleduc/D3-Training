
// backbone extensions for EPS Variable abtractions

/* base table, extend from here to add specific behavior 
	 UriTemplate:="/rawfact/{type}/{modelid}/{tempid}/{var}")
*/
EPS.Table = Backbone.Model.extend({
	idAttribute : "variable",
	serverRoot: EPS.baseurl,
  callPathRoot: '/FactTableService/rawfact/',
  engine: EPS.engine_type,
  variable: '-',
  indexOrder: [],
  indexDisplayOrder : [],
  modelId: EPS.model_id,
  tempId: EPS.template_id,
  hasData: false,
  isDirty: true,
  rawData:{},
  /** @private */ fullCallPath : function() {
  	return this.serverRoot + this.callPathRoot + this.engine + "/" + this.modelId + "/" + this.tempId + "/" + this.get('variable');
  },
  /** @public */ url : '',
  /** @public */ preProcessor : function (data) {
		data.indexDisplayOrder = this.get('indexDisplayOrder');	
		this.set('rawData', data);
		this.set('hasData', true);
		this.set('isDirty', false);
//  	alert(data);
  	console.log( "preProcessor: " + data.status );
  },
  /** @public */ initialize: function() { 
  	    this.set('url',this.fullCallPath());
  	    this.set('hasData', false);
  	    this.set('isDirty',true);
				this.set('indexOrder',[]);
				this.preProcessor = this.get('preProcessor');
  	 },
  /** @public */ constructor: function() { 
  		Backbone.Model.apply(this, arguments);
  	    this.set('url',this.fullCallPath());
//alert(this.get('url'));
  	 },
  /** @public */ fetch: function() {
  	if (this.get('isDirty')) {   
  		this.fetchData(this.get('variable'), this.postProcessor,this.postProcessorArgs);
  	} else {
  	  console.log('skipping fetch request, already have data:' + this.get('variable'));
  	}
  },  	 
  /** @private */ fetchData: function(varName, postProcessor,postProcessorArgs) {   
  	// do ajax call here 
    var serviceAPI =  this.get('url');
    var indexSortInfo = this.get('indexOrder');
    
		console.log( "calling json:" + serviceAPI );
    var jqxhr = $.getJSON( serviceAPI, function(data) {
				console.log( "success for variable: " + varName );
				postProcessor(data, postProcessorArgs);
//				alert(data);
		})
		.fail(function(data) { 
						console.log( "fail code:" + data.status );
						console.log( "fail msg:" + data.statusText );
					})
		.always(function(data) { 
		        // we seem to end up here in IE with error status 0
						if (data.status == 0) {
						  console.log( "captured data for variable: " + varName );
							postProcessor(data, postProcessorArgs);
//							alert(data);									
						}
					});  		
//  	alert('fullCallPath: ' + this.fullCallPath());
  	},
  readOnly: function() {
    return true;
  }

});

/* processes changes via 'PositionalFactTableChanges' object being sent to server
 UriTemplate:="/setfact/{type}/{modelid}/{tempid}/{var}"
*/
EPS.InputTable = EPS.Table.extend({

  /** @public */ initialize: function() { 
	 			Backbone.Model.prototype.initialize.apply(this, arguments);
	 			//var ack = new PositionalFactTableChanges;
  	    this.set('pftcObj',new PositionalFactTableChanges);
  	 },		
	pftcObj: {},
	callPathSaveRoot: '/FactTableService/setfact/',
  /** @private */ fullSaveCallPath : function() {
  	return this.serverRoot + this.callPathSaveRoot + this.engine + "/" + this.modelId + "/" + this.tempId + "/" + this.get('variable');
  },	  
  /** @public */ url : '',
  SaveData: function() { 
  	// do ajax call here 
    var serviceAPI =  this.fullSaveCallPath();
    var indexSortInfo = this.get('indexDisplayOrder');
    var pftc = this.get('pftcObj'); 
//    var postProc = this.PostSaveDirty;
  //  var procOnMod = this; 
		console.log("SaveData calling ajax:" + serviceAPI );
      $.ajax({
          type: "POST",
          url: serviceAPI,
          data: pftc.json(),
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function (r) {
              if (! r.success) {
              	alert(r.message);
            	}
            //	postProc(procOnMod);
          }
      });
  	return true; 
  	},
  readOnly: function() {
    return false;
  },
  PostSaveDirty: function(modObj) {
  	modObj.set('isDirty', true);
  	console.log('making model dirty');
  }

});



