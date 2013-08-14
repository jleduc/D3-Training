$(document).ready(function(){

	var tableValue=function(cell){
			var content=cell.html();
			var text=content.replace('$','').replace('(','-');
			var number=parseInt(text);
			if(isNaN(number)) {return 0;} else {return number;}
	};

	$('.ocell').each(function() {
			if (tableValue($(this))>=0)  { $(this).css("color", "blue"); }
		});

		var j=1;

		$('tr').each(function(i,r){
				var row=$(r).children();
				var rowclass=$(r).children().eq(2).attr('class');
				if (rowclass=="rh2") {j=j+2;} else {j=j+1;}
				if ((j%2==1) && (rowclass!="rh2"))	{
					row.addClass("greenRow");
				}
		});


		$('tr').each(function(){
			$(this).hover(
				function(){
					$(this).children().addClass("hoverClass");
				},
	
				function(){
					$(this).children().removeClass("hoverClass");
				});
		});


		$('tr').each(function() {
			var row_total=0;
			var row_type=$(this).children().eq(0).attr('class');
			var row_class=$(this).children().eq(1).attr('class');
	
			$('.ocell',this).each(function(){	row_total += tableValue($(this));	});

			if (row_type=="corner")
					{	$(this).append('<th class="r1" align="center">Total</th>');	}

			else if (row_class=="rh2")
					{	$(this).append('<th class="r1" align="center"></th>');	}

			else	{	$(this).append('<td class="ocell" style="color: #000000;" align="right">$'+row_total+'</td>');}

			$(this).children().addClass(row_class);
		});

	var clonedTable = $('#Financial_summary_c').clone();
	$('.othertable').append(clonedTable);


	$('tr',clonedTable).each(function(){
		var total=0;

		$('td',$(this)).each(function(i,r){

			if (i!==0)
			{
				var newvalue= tableValue($(this))*i;
				total += newvalue;
				$(this).html('$'+newvalue);//replace $(this) content with new value;
				if (newvalue===0) {$(this).html('');}
			}

			if (i===20)
			{
				$(this).html('$'+ total);
			}
		});
	});

	var secondClonedTable = $('#Financial_summary_c').clone();
	$('.thirdtable').append(secondClonedTable);

	$('tr',secondClonedTable).each(function(){
		$('td',$(this)).each(function(i,r){
			if (i!==0)
			{
				var first=$('.table').children('tr').children('td').val();
				var second=$('.othertable').children('tr').children('td').val();				
				console.log(i);
			}

		});
	});


});