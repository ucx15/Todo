// TODO: Implement proper login functionality
inputUsernameDOM = document.querySelector("#input-username");
inputPasswordDOM = document.querySelector("#input-password");
buttonSubmitDOM  = document.querySelector("#button-submit");

console.log(inputUsernameDOM);
console.log(inputPasswordDOM);
console.log(buttonSubmitDOM);

buttonSubmitDOM.addEventListener("click", (event) => {
	event.preventDefault();
	console.log("Button clicked");
	const username = inputUsernameDOM.value;
	const password = inputPasswordDOM.value;

	if (username !== "uc" && password !== "uc") {
		alert("Invalid credentials");
	}
	else {
		window.location.href = "app.html";
	}
})