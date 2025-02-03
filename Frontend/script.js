
class Item {
	constructor(value) {
		this.value = value;
		this.timestamp = Date.now();
		this.itemDOM = null;
		this.marked = false;
	}

	removeFromDOM() {
		this.itemDOM.remove();
	}

	renderToDOM(parentDOM) {
		// Create elements
		this.itemDOM = document.createElement('div');
		const textDOM = document.createElement('span');
		const checkboxDOM = document.createElement('input');
		const deleteBtnDOM = document.createElement('button');

		// Add classes
		this.itemDOM.classList.add('item');
		textDOM.classList.add('text');
		checkboxDOM.classList.add('check-item');
		deleteBtnDOM.classList.add('btn-delete', 'btn');

		// Handle Eventlisteners for buttons
		checkboxDOM.type = 'checkbox';
		checkboxDOM.name = 'check-item';
		checkboxDOM.addEventListener('change', () => {
			this.marked = !this.marked;
			textDOM.classList.toggle('marked');
		});

		deleteBtnDOM.textContent = '-';
		deleteBtnDOM.addEventListener('click', () => {
			this.removeFromDOM();
			removeItem(this);
		});

		// Add Content
		textDOM.textContent = this.value;

		// Append elements
		this.itemDOM.appendChild(checkboxDOM);
		this.itemDOM.appendChild(textDOM);
		this.itemDOM.appendChild(deleteBtnDOM);
		parentDOM.insertBefore(this.itemDOM, parentDOM.firstChild);
	}
}



// DOM elements
const itemsListDOM = document.querySelector('.list-items');
const inputFieldDOM = document.querySelector('.input-field');

let items = [];


function addItem() {
	const value = inputFieldDOM.value;
	if (!value) {
		// TODO: warn, empty value
		return;
	}
	const newItem = new Item(value);
	items.unshift(newItem);
	newItem.renderToDOM(itemsListDOM);

	inputFieldDOM.value = '';
}

function removeItem(item) {
	const index = items.indexOf(item);
	items.splice(index, 1);
}


inputFieldDOM.addEventListener('keydown', (e) => {if (e.key === 'Enter') addItem()});