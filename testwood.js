"use strict";
/*globals $, getComputedStyle */


function testwood(initialModules) {
	if(document.getElementById("#testwood-menu")) return false;

	var modules = initialModules ? initialModules : {};

	var menu = document.createElement("div");
	menu.id = "testwood-menu";
	

	// в меню добаляем элементы
	for(var i in modules) {
		var a = document.createElement("a");
		a.setAttribute("data-testwood-toggle", i);
		a.innerHTML = modules[i];
		a.addEventListener("click", function() {
			document.body.classList.toggle("testwood-"+this.getAttribute("data-testwood-toggle"));
			this.classList.toggle("active");
		});
		menu.appendChild(a);
	}

	document.body.appendChild(menu);

	// выделяем flex
	var allElements = Array.prototype.slice.call(document.body.getElementsByTagName("*"), 0);
	allElements.forEach(function (tag) {
		if (getComputedStyle(tag).display === "flex") {
			tag.setAttribute("data-test-flex", "");
		}
	});

	return {
		addModule: function(title, label) {
			modules[title] = label;
		}
	}
}


// отложенная инициализация
document.addEventListener("DOMContentLoaded", function () {
	var api = testwood({
		line: "Высота строки",
		flex: "Flex",
		bounds: "Границы",
		title: "Названия",
		space: "Разрядить"
	});
});	

