
class Item {
	constructor(value) {
		this.uuid = null;
		this.value = value;
		this.timestamp = Date.now();
		this.marked = false;
		this.itemDOM = null;
	}


	makeFromObject(obj) {
		this.uuid      = obj.uuid;
		this.value     = obj.value;
		this.timestamp = obj.timestamp;
		this.marked    = obj.marked;
	}


	makeFromElements(uuid, value, timestamp, marked) {
		this.uuid = uuid;
		this.value = value;
		this.timestamp = timestamp;
		this.marked = marked;
		return this;
	}

	removeFromDOM() {
		this.itemDOM.remove();
	}

	renderToDOM(parentDOM) {
		// Create task
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
			toggleItem(this);
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


// Network Updates

function fetchItems() {
	fetch("http://localhost:3000/api/tasks", {
		method: 'GET',
	})
	.then(resp => {
		if (!resp.ok) {
			throw new Error('Failed to fetch items');
		}

		return resp.json();
	})
	.then(resp => {
		resp.forEach(task => {
			let item = new Item();
			item.makeFromObject(task);
			// item.makeFromElements(task.uuid, task.value, task.timestamp, task.marked);

			items.unshift(item);
			item.renderToDOM(itemsListDOM);
		});
	})
	.catch(err => {
		console.error(err);
	});
}

// TODO: Decouple network requests and DOM Manipulation
function addItem(newItem) {
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
		body: JSON.stringify({task : item})
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

function toggleItem(item) {
	if (!item || !items.includes(item) || !item.uuid) {
		console.error('Invalid item');
		return;
	}

	fetch("http://localhost:3000/api/toggle-task", {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({task : item})
	}).
	then(resp => {
		if (!resp.ok) {
			console.error('Failed to toggle item');
			return;
		}

		console.log(`TOGGLE:  ${item.uuid} ✔️`);
	});
}


// EventListeners
inputFieldDOM.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {

		const value = inputFieldDOM.value;
		// TODO: warn in UI if empty value

		if ( value ) {
			const item = new Item(value);
			addItem(item);
		}

	}
});

window.onload = (event) => {
	fetchItems();
};


// TODO: Fix checkbox Rendering of fetched items
// TODO: Make operations batched, to avoid unnecessary network load