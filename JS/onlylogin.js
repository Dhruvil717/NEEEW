// js/login.js
function validateLoginForm() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    if (!email || !password) {
        errorMessage.textContent = "Both email and password are required!";
        return false;
    }
    errorMessage.textContent = "";
    return true;
}