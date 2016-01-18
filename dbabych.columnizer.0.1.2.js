// version 0.1.2 (October 8th, 2011)
// created by: Dmytro Babych dima@babychstudio.com
// © 2011 Dmytro Babych Studio
// http://www.babychstudio.com/
// default charset: utf-8


Element.prototype.dbabych_columnize = function(options) {

	this.defaults = {
		// Column width in px
		width : 360,
		// Column height in px
		height : 700,
		// Style class name added to each column
		col_class : "column",
		// Container of columns stream to be managed in the function done_func()
		cols_block_obj : false,
		// Function to be launched after columnizing complete
		done_func : function(){},
		// Container to insert resulted columns in
		target : document.getElementById('to')
	};

	this.params = this.defaults;

	if (options !== undefined) {
		if (options.width !== undefined) {
			this.params.width = options.width;
		}
		if (options.height !== undefined) {
			this.params.height = options.height;
		}
		if (options.col_class !== undefined) {
			this.params.col_class = options.col_class;
		}
		if (options.cols_block_obj !== undefined) {
			this.params.cols_block_obj = options.cols_block_obj;
		}
		if (options.done_func !== undefined) {
			this.params.done_func = options.done_func;
		}
		if (options.target !== undefined) {
			this.params.target = options.target;
		}
	}


	Element.prototype.columnize_init = function() {
		// Function inits Columnizer:
		// - sets up defaut values
		// - sets up constants
		// - defines variables
		// - creates DOM elements, needed for work

		// Defining default constants - not present in all browsers
		document.ELEMENT_NODE = 1;
		document.TEXT_NODE = 3;

		// Copying original HTML-markup source
		this.from_clone = document.createElement("div");
		this.from_clone.innerHTML = this.innerHTML;
		this.to = this.params.target;
		this.to.innerHTML = '';

		// Creating temporary block to contain newly created column
		this.debug = document.createElement('div');
		// Adding temporary block to the final container to include style inheritance during work of columnizer
		this.to.appendChild(this.debug);
		// Задаем ширину промежуточного блока для вычисления высоты новой колонки
		this.debug.style.width = this.params.width + 'px';
		// Тип inline-block нужен для того, чтобы исключить влияние отступов margin внутренних блоков на вычисляемую высоту очередной колонки
		this.debug.style.display = 'inline-block';
		this.debug.style.verticalAlign = 'top';
		// Дополнительный класс, который используется в ЗиБе
		this.debug.className = this.params.col_class;
	}


	Element.prototype.columnize_close = function() {
		// Функция выполняет удаление созданных ДОМ-элементов после завершения работы колумнайзера

		// Удаляем промежуточный блок
		this.to.removeChild(this.debug);

		// Удаляем копию источника
		//document.removeChild(this.from_clone);
	}


	Element.prototype.columnize_cycle = function() {
		// Функция циклично выполняет дробление на колонки исходного блока

		// Запускаем цикл разбиения HTML-верстки на колонки
		while (this.from_clone.childNodes.length > 0) {
			this.columnize_node(this.from_clone, this.debug, this.debug);
			this.save_column();
		}
	}


	Element.prototype.save_column = function() {
		// Функция переносит накопленный в промежуточном блоке HTML во вновь созданную колонку в целевом блоке

		var clone = document.createElement("div");
		clone.innerHTML = this.debug.innerHTML;
		clone.style.display = 'inline-block';
		clone.style.verticalAlign = 'top';
		clone.style.width = this.params.width + 'px';
		clone.style.height = this.params.height + 'px';
		clone.style.float = 'left';
		clone.className = this.params.col_class;
		this.to.appendChild(clone);
		this.debug.innerHTML = '';
	}


	Element.prototype.get_offsetHeight = function() {
		// Функция возвращает высоту элемента в пикселях

		var height = this.offsetHeight;
		return height;
	}


	Element.prototype.columnize_node = function(from, to, debug) {
		// Функция выполняет перенос содержимого из from в to, учитывая, что debug - блок, через который определяется высота
		// очередной колонки
		//
		// Параметры:
		// from  - DOM-узел, дочерние узлы которого сканирует функция
		// to    - DOM-узел, в который функция переносит содержимое из from
		// debug - DOM-узел, содержимое которого является содержимым новой создаваемой колонки
		//
		// result - результат выполнения функции
		// значения: 0 - скопировать узлы не получилось вообще
		//           1 - получилось скопировать часть узлов
		var result = 0;
		// Флаг, который является признаком того, что перенесенный первый узел был удален
		var removed_first = 0;
		while (from.childNodes.length > 0) {
			// Перебираем все узлы из указанного узла
		    if (from.firstChild.nodeType == document.ELEMENT_NODE || from.firstChild.nodeType == document.TEXT_NODE) {
				if (from.firstChild.nodeType == document.TEXT_NODE) {
					// Если первый узел представляет с собой текст - проверяем, является ли первый узел пробельным символом
					var node_text = encodeURIComponent(from.firstChild.nodeValue);
					node_text = node_text.replace(/%0A/, '').replace(/%09/, '').replace(/%20/, '');
					if (node_text == '') {
						// Удаляем первый пробельный узел
						from.removeChild(from.firstChild);
						// Переходим к следующей итерации
						continue;
					}
				}
				// Пытаемся скопировать весь узел целиком
				var clone = from.firstChild.cloneNode(true);
				to.appendChild(clone);
				// Принудительно устанавливаем настройки для первого по счету узла в колонке
				if (to === debug) {
					// Определяем, что мы имеем дело с корневым узлом
					if (to.firstChild.nodeType == document.ELEMENT_NODE) {
						// Если первый узел представляет с собой тег - обрабатываем его как тег
						if (to.firstChild.nodeName == 'BR') {
							// Проверяем, является ли первый узел переводом строки
							// Удаляем первый узел, перенесенный в промежуточный блок
							to.removeChild(to.firstChild);
							// Запоминаем, что первый узел, перенесенный в промежуточный блок, был удален в итоге
							removed_first = 1;
						} else {
							// Устанавливаем отступ сверху равный нулю
							to.firstChild.style.marginTop = '0px';
							to.firstChild.style.paddingTop = '0px';
						}
					}
				}
				if (debug.get_offsetHeight() > this.params.height) {
					// Если целиком узел не влазит - пытаемся решить вопрос по-другому
					// Удаляем скопированный ранее узел
					to.removeChild(to.lastChild);
					// Проверяем тип обрабатываемого узла
					if (from.firstChild.nodeType == document.ELEMENT_NODE) {
						// Если узел - ХТМЛ-тег, то обрабатываем его как ХТМЛ-тег
						var node_name = from.firstChild.nodeName;
						if (node_name != 'H1' && node_name != 'H2' && node_name != 'H3' && node_name != 'H4' && node_name != 'H5' && node_name != 'H6') {
							// Обрабатываем узел по частям только если он является заголовком
							// Копируем узел повторно, но оставляем его пустым, чтобы затем наполнять постепенно
							var clone = from.firstChild.cloneNode(true);
							if (clone.innerHTML != '') {
								clone.innerHTML = "";
							}
							to.appendChild(clone);
							// Принудительно устанавливаем настройки для последнего по счету узла в колонке
							if (to === debug) {
								if (to.lastChild.nodeType == document.ELEMENT_NODE) {
									// Устанавливаем отступ снизу равный нулю
									to.lastChild.style.marginBottom = '0px';
									to.lastChild.style.paddingBottom = '0px';
								}
							}
							// Запускаем попытку копирования узла по частям
							result_inline = this.columnize_node(from.firstChild, to.lastChild, debug);
							if (result_inline == 0) {
								// Если в результате попытки переноса внутренностей узла ничего не изменилось - удаляем пустую копию узла
								to.removeChild(to.lastChild);
							}
							if (result == 0) {
								// Если до сих пор мы не перенесли ни одного узла - присваем результат переноса внутренностей текущего узла
								result = result_inline;
							}
						}
						// Поскольку текущий узел перенести не удалось, то после его обработки и обработки его внутренностей
						// мы прекращаем выполнение цикла
						break;
					} else if (from.firstChild.nodeType == document.TEXT_NODE) {
						// Если узел - Текст, то обрабатываем его как Текст
						// Разбиваем текстовый узел на массив, состоящий из слов
						text_array = from.firstChild.nodeValue.split(" ");
						for (i = text_array.length - 1; i > 0; i--) {
							// Циклически пытаемся заполнить новый блок текстом, постепенно уменьшая оригинальный на одно слово
							// Создаем строку с текстом переноса для очередной попытки
							text_new = text_array.slice(0, i).join(" ");
							// Добавляем в новый блок узел с созданным текстом
							var clone = document.createTextNode(text_new);
							to.appendChild(clone);
							// Проверяем высоту нового блока
							if (debug.get_offsetHeight() > this.params.height) {
								// Если высота блока превысила допустимый размер - удаляем перенесенный текст
								to.removeChild(to.lastChild);
							} else {
								// Устанавливаем результат переноса узлов в единицу
								result = 1;
								// Обрезаем текст в исходном блоке на размер текста, который мы перенесли в новый блок
								from.firstChild.nodeValue = text_array.slice(i, text_array.length).join(" ");
								// Прерываем выполнение функции, поскольку максимальный по размеру текст перенесли
								break;
							}
						}
						// Поскольку текущий узел перенести не удалось, то после его обработки и обработки его внутренностей
						// мы прекращаем выполнение цикла
						break;
					}
				} else {
					// Если узел влез целиком - идем дальше
					// Удаляем этот узел из исходного блока
					from.removeChild(from.firstChild);
					if (removed_first == 0) {
						// Если текущий узел не был удален
						// Запоминаем результат выполнения: что был перенесен по крайней мере один узел
						result = 1;
					} else {
						// Если текущий узел был удален
						// Результат выполнения не меняем и сбрасываем флаг первого узла в ноль
						removed_first = 0;
					}
				}
		    } else {
				// Если тип узла не Тег и не Текст - удаляем его, чтобы не мешал сканировать
				from.removeChild(from.firstChild);
			}
		}
		// Завершающая проверка на то, чтобы последним элементом в колонке не оставался заголовок
		if (to.lastChild != null) {
			// Если последний элемент определен - проверяем его
			if (to.lastChild.nodeType == document.ELEMENT_NODE) {
				// Если последний элемент является тегом - обрабатываем его
				// Определяем наименование тега
				var node_name = to.lastChild.nodeName;
				if (node_name == 'H1' || node_name == 'H2' || node_name == 'H3' || node_name == 'H4' || node_name == 'H5' || node_name == 'H6') {
					// Если имеем дело с заголовком - переносим его обратно в исходный блок
					var clone = to.lastChild.cloneNode(true);
					from.insertBefore(clone, from.firstChild);
					to.removeChild(to.lastChild);
				}
			}
		}
		// Возвращаем результат выполнения функции
		return result;
	}



	// Инициализируем колумнайзер
	this.columnize_init();

	// Запускаем функцию разбиения на колонки
	this.columnize_cycle();

	// Завершаем выполнение колумнайзера
	this.columnize_close();

	// Запускаем функцию по окончанию разбиения на колонки
	this.params.done_func();
}
