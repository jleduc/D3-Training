
//////////////         VIEWS         /////////////////////
EPS.TableView = Backbone.View.extend({
		anchorPoint : '-',	
		viewRenderer : EPS.HandlebarTableRenderer ,
		initialize: function(modelObj, aPoint) {
			  this.model = modelObj;
			  this.anchorPoint = aPoint;			  
		    //this.listenTo(this.model, "change", this.render);
		  },
		  events: {
		    "change .select":          "render"
		  },		  	
    render: function (eventName) {
    	  console.log('rendering:' + this.model.get('variable') + ' at loc:' + this.anchorPoint);  	  
				this.$el = $('#' + this.anchorPoint);
    		if (this.$el.length==0) { console.log('bad anchorPoint:' + this.anchorPoint); };
        this.$el.empty();
        if (this.model.get('hasData') && !this.model.get('isDirty')) {
        	var dataBlock = this.model.get('rawData');
        	dataBlock.indexDisplayOrder = this.model.get('indexDisplayOrder');	  //someone could have changed our display order even though we didnt call for data...
	        this.viewRenderer(dataBlock, this.$el);        	
        	console.log('rendering existing data from model:' + this.model.get('variable'));
        } else {
        	console.log('fetching data from view:' + this.model.get('variable'));
  	      this.model.postProcessor = this.viewRenderer;
    	    this.model.postProcessorArgs = this.$el;
    	    this.model.fetch();
      	}
        return this;
    },
    remove: function() {
        this.el.empty();
        return this;
    }
});

/*
  extended view savvy to an input table and its specific needs  
*/
EPS.InputTableView = EPS.TableView.extend({
		viewRenderer : EPS.HandlebarInputTableRenderer,
		render: function (eventName) {
			console.log('render InputTableView');
			EPS.TableView.prototype.render.call(this);
			var iOrder = [];
			var ido = this.model.get('indexDisplayOrder');
			if (ido == null || ido.length ==0) {
				iOrder = this.model.get('rawData').indexOrder;
			} else {
				_.each(this.model.get('indexDisplayOrder'),function(k,v){
					iOrder.push(k);
				});				
			}
			this.model.get('pftcObj').setIndexOrder(iOrder); 
		}
});	

EPS.StringyTableView = EPS.TableView.extend({
		viewRenderer : EPS.StringyTableRenderer
});	


EPS.StackedBarView = EPS.TableView.extend({
		viewRenderer : EPS.StackedBarRenderer
});		

