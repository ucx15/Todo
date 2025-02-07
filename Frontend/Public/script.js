
class Item {
	constructor(value) {
		this.uuid = null;
		this.value = value;
		this.timestamp = Date.now();
		this.marked = false;
		this.itemDOM = null;
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

	fetch("http://localhost:3000/api/add-task", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({task : newItem})
	})
	.then(resp => {
		if (!resp.ok) {
			console.error('Failed to add item');
			throw new Error('Failed to add item');
		}

		return resp.json();
	})
	.then(resp => {
		newItem.uuid = resp.uuid;
		items.unshift(newItem);
		newItem.renderToDOM(itemsListDOM);
		inputFieldDOM.value = '';
	})
	.catch(err => {
		console.error(err);
	});
}

function removeItem(item) {
	if (!item || !items.includes(item) || !item.uuid) {
		console.error('Invalid item');
		return;
	}

	const index = items.indexOf(item);

	fetch("http://localhost:3000/api/remove-task", {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({uuid : item.uuid})
	}).
	then(resp => {
		if (!resp.ok) {
			console.error('Failed to remove item');
			return;
		}

		console.log(`Removed:  ${item.uuid} ✔️`);
		items.splice(index, 1);
	});

}


inputFieldDOM.addEventListener('keydown', (e) => {if (e.key === 'Enter') addItem()});


// TODO: Fetch items from server and Render
// TODO: Mark items
