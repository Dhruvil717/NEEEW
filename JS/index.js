function validateForm() {
    var question = document.getElementById("question").value;
    if (question.trim() === "") {
        document.getElementById("error-message").style.display = "block";
        return false;
    }
    return true;
}

function validateLoginForm() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("login-error-message");

    if (!email || !password) {
        errorMessage.textContent = "Both email and password are required!";
        return false;
    }
    errorMessage.textContent = "";
    return true;
}

function showLoginPopup() {
    document.getElementById("questionContainer").classList.add("blur"); 
    document.querySelector(".top-right-buttons").classList.add("blur"); 
    document.getElementById("loginPopup").style.display = "block"; 
}

function closeLoginPopup() {
    document.getElementById("questionContainer").classList.remove("blur"); 
    document.querySelector(".top-right-buttons").classList.remove("blur"); 
    document.getElementById("loginPopup").style.display = "none"; 
}

setTimeout(showLoginPopup, 2000);