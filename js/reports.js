// reports.js
// Javascript for reports
// $Id: //depot/AnaBrowse/js/reports.js#1 $

function wrapElementsWithNobr(oElm, strTagName, strClassName) {
 var l = getElementsByClassName(oElm, strTagName, strClassName);
 
 for(var i=l.length-1;i>=0;i--) {
  var elem = l[i];
  var content = elem.innerHTML;
  elem.innerHTML = "<nobr>" + content + "</nobr>"
 }
}
 
function getElementsByClassName(oElm, strTagName, strClassName){
    var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
    var arrReturnElements = new Array();
    strClassName = strClassName.replace(/\-/g, "\\-");
    var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
    var oElement;
    for(var i=0; i<arrElements.length; i++){
        oElement = arrElements[i];
        if(oRegExp.test(oElement.className)){
            arrReturnElements.push(oElement);
        }
    }
    return (arrReturnElements)
}
 
function dynamicRemove(nodeToRemove, nodeToTest) {
//To be used with a scalar result node wrapped in a container object with id=nodeToTest
//If the nodeToTest node is true (nonzero) then delete the container object with id=nodeToRemove
	
	var testNode = document.getElementById(nodeToTest)
	var removeNode = document.getElementById(nodeToRemove)
	var resultString = testNode.innerText;
	
	if (resultString == false) {
		removeNode.parentNode.removeChild(removeNode)
	}
	testNode.id = '';
	removeNode.id = '';
}