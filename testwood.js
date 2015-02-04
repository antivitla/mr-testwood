
function testwood(initialModules) {
	"use strict";
	/*globals console, getComputedStyle, document, localStorage */
	
	if (document.getElementById("testwood-menu")) {
		console.warn("Testwood уже инициализирован");
		return;
	}
	
	/* Хранение модулей (параметров) тестирования в едином месте */

	var modules = {},
		menu = document.createElement("div"),
		iterator,
		button,
		allElements;
		
	function readState(moduleName) {
		return (localStorage.getItem("testwood-" + moduleName) === "true" ? true : false);
	}
	
	function sync2localstorage(moduleObj) {
		localStorage.setItem("testwood-" + moduleObj.name, moduleObj.active);
	}
	
	function sync2dom(moduleObj) {
		if (moduleObj.active) {
			moduleObj.element.classList.add("active");
			document.body.classList.add("testwood-" + moduleObj.name);
		} else {
			moduleObj.element.classList.remove("active");
			document.body.classList.remove("testwood-" + moduleObj.name);
		}
	}
	
	
	
	
	
	/* По клику на кнопках меню вкл/выкл параметры какие-то */
	
	function handleClick(event) {
		var moduleName = event.target.getAttribute("data-testwood-toggle");
		// переключаем состояние в модели
		modules[moduleName].active = !modules[moduleName].active;
		// синхронизируем DOM и localstorage
		sync2dom(modules[moduleName]);
		sync2localstorage(modules[moduleName]);
	}

	
	// в меню добавляем элементы
	for (iterator in initialModules) {
		if (initialModules.hasOwnProperty(iterator)) {
			// создаем кнопку
			button = document.createElement("a");
			button.setAttribute("data-testwood-toggle", iterator);
			button.innerHTML = initialModules[iterator];
			// навешиваем переключение
			button.addEventListener("click", handleClick);
			// регистрируем модуль (и грузим предварительное состояние)
			modules[iterator] = {
				active: readState(iterator),
				label: initialModules[iterator],
				name: iterator,
				element: button
			};
			sync2dom(modules[iterator]);
			// добавляем в меню
			menu.appendChild(button);
		}
	}

	menu.id = "testwood-menu";
	document.body.appendChild(menu);

	// выделяем flex
	
	allElements = Array.prototype.slice.call(document.body.getElementsByTagName("*"), 0);
	allElements.forEach(function (tag) {
		if (getComputedStyle(tag).display === "flex") {
			tag.setAttribute("data-test-flex", "");
		}
	});
	
	
	// так же нужно уметь пропарсить тесты и взять например комменты все
	// и пихнуть их например перед блоком, а потом удалять опять
	
	function parseTestBlocks(callback, callbackOfCallback) {
		var allTestBlocks = document.querySelectorAll("*[data-test]"),
			i;
		for (i = 0; i < allTestBlocks.length; i = i + 1) {
			callbackOfCallback(callback(allTestBlocks[i]));
		}
	}
	
	function findComment(element) {
		var iterator = element.previousSibling,
			comment;
		
		while (iterator) {
			if (iterator.nodeType === 8) {
				comment = iterator.nodeValue.trim();
				break;
			} else if (iterator.nodeType === 1) {
				break;
			} else {
				iterator = iterator.previousSibling;
			}
		}
		
		return {
			element: element,
			comment: comment
		};
	}

	parseTestBlocks(findComment, function (result) {
		if (!result.comment) {
			console.warn("Блок", result.element, "без комментариев");
			return;
		}
		var title = document.createElement("header");
		title.classList.add("testwood-comment");
		title.innerHTML = result.comment;
		result.element.parentElement.insertBefore(title, result.element);
	});
}


// отложенная инициализация
document.addEventListener("DOMContentLoaded", function () {
	"use strict";
	var api = testwood({
		line: "Высота строки",
		flex: "Flex",
		bounds: "Границы",
		space: "Разрядить",
		title: "Названия",
		comments: "Комментарии"
	});
});


