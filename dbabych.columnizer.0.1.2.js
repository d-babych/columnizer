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
		// Setting up width of the temnporary block to calculate the height of the new column
		this.debug.style.width = this.params.width + 'px';
		// 'inline-block' type is needed to exclude influence of margins of the inner blocks on the calculated height of the new column
		this.debug.style.display = 'inline-block';
		this.debug.style.verticalAlign = 'top';
		// Additional class, that can be used to add pre-set styles to column
		this.debug.className = this.params.col_class;
	}


	Element.prototype.columnize_close = function() {
		// Function deletes created DOM-elements after Columnizer has finished its work

		// Delete temporary block
		this.to.removeChild(this.debug);

		// Delete source copy
		//document.removeChild(this.from_clone);
	}


	Element.prototype.columnize_cycle = function() {
		// Function splits initial block to columns in cycle

		// Start cycle of splitting HTML-markup to columns
		while (this.from_clone.childNodes.length > 0) {
			this.columnize_node(this.from_clone, this.debug, this.debug);
			this.save_column();
		}
	}


	Element.prototype.save_column = function() {
		// Function moves contents of temporary block to the newly created column in the final container

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
		// Function returns height of element in pixels

		var height = this.offsetHeight;
		return height;
	}


	Element.prototype.columnize_node = function(from, to, debug) {
		// Function moves contents from 'from' to 'to', considering that 'debug' is a block, through which the height of new column is calculated
		//
		// Parameters:
		// from  - DOM-element, child nodes of which are scanned by the function
		// to    - DOM-element, where the function moves contents to from 'from'
		// debug - DOM-element, contents of which is considered to be the contents of the newly created column
		//
		// result - the result of function execution
		// values: 0 - cannot copy nodes at all
		//         1 - some nodes where copied successfully
		var result = 0;
		// Flag, showing that the moved first node was deleted
		var removed_first = 0;
		while (from.childNodes.length > 0) {
			// Iterating through all the children from the selected element
		    if (from.firstChild.nodeType == document.ELEMENT_NODE || from.firstChild.nodeType == document.TEXT_NODE) {
				if (from.firstChild.nodeType == document.TEXT_NODE) {
					// If the first node is text - check, whether it is a 'space' symbol
					var node_text = encodeURIComponent(from.firstChild.nodeValue);
					node_text = node_text.replace(/%0A/, '').replace(/%09/, '').replace(/%20/, '');
					if (node_text == '') {
						// Deleting the first 'space' symbol
						from.removeChild(from.firstChild);
						// Go to the next iteration
						continue;
					}
				}
				// Trying to clone the whole node
				var clone = from.firstChild.cloneNode(true);
				to.appendChild(clone);
				// Forcibly setting parameters for the first node in the column
				if (to === debug) {
					// Detecting that we deal with the root node
					if (to.firstChild.nodeType == document.ELEMENT_NODE) {
						// If the forst node is tag - processing it as tag
						if (to.firstChild.nodeName == 'BR') {
							// Detect, whether to first node is a 'break' tag
							// Remove the first node, moved to the temporary block
							to.removeChild(to.firstChild);
							// Remembering, that the first node, moved to the temporary block, was removed
							removed_first = 1;
						} else {
							// Setting the top offset to zero
							to.firstChild.style.marginTop = '0px';
							to.firstChild.style.paddingTop = '0px';
						}
					}
				}
				if (debug.get_offsetHeight() > this.params.height) {
					// If the whole node doesn't fit - trying to fulfill the task in the other way
					// Deleting the previously copied node
					to.removeChild(to.lastChild);
					// Checking the type of the processing node
					if (from.firstChild.nodeType == document.ELEMENT_NODE) {
						// If node is HTML-tag - processing it as HTML-tag
						var node_name = from.firstChild.nodeName;
						if (node_name != 'H1' && node_name != 'H2' && node_name != 'H3' && node_name != 'H4' && node_name != 'H5' && node_name != 'H6') {
							// Processing node by parts only if it is not a header
							// Copying node again, but leaving it hollow to fill it by parts later
							var clone = from.firstChild.cloneNode(true);
							if (clone.innerHTML != '') {
								clone.innerHTML = "";
							}
							to.appendChild(clone);
							// Forcibly setting parameters for the last node in the column
							if (to === debug) {
								if (to.lastChild.nodeType == document.ELEMENT_NODE) {
									// Setting bottom offset to zero
									to.lastChild.style.marginBottom = '0px';
									to.lastChild.style.paddingBottom = '0px';
								}
							}
							// Starting attempt to copy node by parts
							result_inline = this.columnize_node(from.firstChild, to.lastChild, debug);
							if (result_inline == 0) {
								// If after attempt to move node's contents nothing has changed - delete the hollow copy of node
								to.removeChild(to.lastChild);
							}
							if (result == 0) {
								// If after all we have not managed to move any node - setting result to the result of moving node's contents
								result = result_inline;
							}
						}
						// Because we have not managed to move current node, we stop processing cycle after finish processing the node and it's contents
						break;
					} else if (from.firstChild.nodeType == document.TEXT_NODE) {
						// If the node is text, than processing it as a text
						// Split the text into an array of words
						text_array = from.firstChild.nodeValue.split(" ");
						for (i = text_array.length - 1; i > 0; i--) {
							// Attempting cyclically fill in new block with text, step-by-step removing the original one by single word
							// Creating string with the moving text for the next attempt
							text_new = text_array.slice(0, i).join(" ");
							// Adding the node with created text to the new block
							var clone = document.createTextNode(text_new);
							to.appendChild(clone);
							// Checking height of the new block
							if (debug.get_offsetHeight() > this.params.height) {
								// If the height if more than allowable value - deleting moved text
								to.removeChild(to.lastChild);
							} else {
								// Setting the result of the movement to 1
								result = 1;
								// Cutting text in the source block by the size of the text, moved to the new block
								from.firstChild.nodeValue = text_array.slice(i, text_array.length).join(" ");
								// Breaking the function execution, because the maximum length of text is moved already
								break;
							}
						}
						// Because the current node was not moved, we stop executing the cycle after finish processing the node and its contents
						break;
					}
				} else {
					// If the node was moved entirely - go further
					// Deleting the node from the source block
					from.removeChild(from.firstChild);
					if (removed_first == 0) {
						// if the current node was not deleted
						// Memorizing the result: that at least one node was moved successfully
						result = 1;
					} else {
						// If the current node was deleted
						// Do not change the result of execution and setting the first element flag to zero
						removed_first = 0;
					}
				}
		    } else {
				// If node's type is not Tag or Text - deleting it, not to interfere in the process
				from.removeChild(from.firstChild);
			}
		}
		// Finalizing check to avoid leaving header as the last element in the column
		if (to.lastChild != null) {
			// If the last element is defined - checking it
			if (to.lastChild.nodeType == document.ELEMENT_NODE) {
				// If the last node is tag - processing it
				// Detecting the tag name
				var node_name = to.lastChild.nodeName;
				if (node_name == 'H1' || node_name == 'H2' || node_name == 'H3' || node_name == 'H4' || node_name == 'H5' || node_name == 'H6') {
					// If we are dealing with the header - moving it back to the source block
					var clone = to.lastChild.cloneNode(true);
					from.insertBefore(clone, from.firstChild);
					to.removeChild(to.lastChild);
				}
			}
		}
		// Returning the result of function execution
		return result;
	}



	// Initializing Columnnizer
	this.columnize_init();

	// Start columnizing function
	this.columnize_cycle();

	// Ending Columnizer execution
	this.columnize_close();

	// Executing user function after the end of Columnizer execution
	this.params.done_func();
}
