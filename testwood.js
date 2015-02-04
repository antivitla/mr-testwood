
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
	
	
	// Так же нужно уметь пропарсить тесты
	
	function parseTestBlocks(selector, callback, callbackOfCallback) {
		var allTestBlocks = document.querySelectorAll(selector),
			i;
		callbackOfCallback = callbackOfCallback || function () {};
		for (i = 0; i < allTestBlocks.length; i = i + 1) {
			callbackOfCallback(callback(allTestBlocks[i]));
		}
	}
	
	// Обернуть всё в доп. контейнеры чтоб навешивать слои разные
	
	function wrapTestBlocks(testContainer) {
		var header = document.createElement("div"),
			footer = document.createElement("div"),
			wrapper = document.createElement("div");
		header.setAttribute("data-test-header", "");
		wrapper.setAttribute("data-test-wrapper", "");
		footer.setAttribute("data-test-footer", "");
		testContainer.parentElement.insertBefore(wrapper, testContainer);
		wrapper.appendChild(header);
		wrapper.appendChild(testContainer);
		wrapper.appendChild(footer);
		return testContainer;
	}
	
	parseTestBlocks("*[data-test]", wrapTestBlocks);
	
	
	// взять комменты все
	
	function findComment(testContainer) {
		var iterator = testContainer.previousSibling,
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
			element: testContainer,
			comment: comment
		};
	}

	parseTestBlocks("*[data-test-wrapper]", findComment, function (result) {
		if (!result.comment) {
			console.warn("Блок", result.element, "без комментариев");
			return;
		}
		var title = document.createElement("div");
		title.classList.add("testwood-comment");
		title.innerHTML = result.comment;
		result.element.querySelectorAll("*[data-test-header]")[0].appendChild(title);
	});
	
	
	// парсим блоки на предмет высоты строки
	
	function findLineHeight(testContainer) {
		var clone,
			lineHeight;
		// если внутри контейнера лежит всего один элемент,
		// берем его лайнхейт, если же нет, берем наследуемый
		if (testContainer.childElementCount < 2) {
			clone = testContainer.children[0].cloneNode();
			clone.innerHTML = "<br>";
			testContainer.appendChild(clone);
			lineHeight = clone.getBoundingClientRect().height;
			testContainer.removeChild(clone);
		} else {
			clone = testContainer.cloneNode();
			clone.innerHTML = "<br>";
			testContainer.parentElement.appendChild(clone);
			lineHeight = clone.getBoundingClientRect().height;
			testContainer.parentElement.removeChild(clone);
		}
		
		return {
			element: testContainer,
			lineHeight: lineHeight
		};
	}
	
	parseTestBlocks("*[data-test]", findLineHeight, function (result) {
		var footer = result.element.parentElement.querySelectorAll("*[data-test-footer]")[0],
			lines = document.createElement("div"),
			line,
			i;
		for (i = 0; i <= result.element.getBoundingClientRect().height / result.lineHeight; i = i + 1) {
			line = document.createElement("div");
			line.innerHTML = "&nbsp;";
			lines.appendChild(line);
		}
		lines.style.lineHeight = result.lineHeight + "px";
		lines.classList.add("testwood-line-height");
		footer.appendChild(lines);
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


