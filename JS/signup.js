let countryList = [];

        async function fetchCountries() {
            try {
                const response = await fetch("https://restcountries.com/v3.1/all");
                const data = await response.json();

                countryList = data.map(country => ({
                    name: country.name.common,
                    code: country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : "")
                })).sort((a, b) => a.name.localeCompare(b.name));

                updateDropdown(countryList.slice(0, 5)); 
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        }

        function updateDropdown(countries) {
            const dropdownOptions = document.getElementById("dropdownOptions");
            dropdownOptions.innerHTML = "";

            countries.forEach(country => {
                const option = document.createElement("div");
                option.textContent = country.name;
                option.dataset.code = country.code;
                option.onclick = () => selectCountry(country.name, country.code);
                dropdownOptions.appendChild(option);
            });
        }

        function selectCountry(name, code) {
            document.getElementById("countrySearch").value = name;
            document.getElementById("country").value = name;
            document.getElementById("countryCode").value = code || ""; 
            document.getElementById("countryDropdown").style.display = "none";
        }

        document.getElementById("countrySearch").addEventListener("focus", function () {
            document.getElementById("countryDropdown").style.display = "block";
            updateDropdown(countryList.slice(0, 5)); 
        });

        document.getElementById("searchInput").addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const filteredCountries = countryList.filter(country => country.name.toLowerCase().includes(searchTerm));
            updateDropdown(filteredCountries.slice(0, 10)); 
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest(".dropdown-container")) {
                document.getElementById("countryDropdown").style.display = "none";
            }
        });

        function validateSignupForm() {
            const phoneNumber = document.querySelector('input[name="phone_number"]').value;
            const countryCode = document.querySelector('input[name="countryCode"]').value.trim();
            const errorMessage = document.getElementById("error-message");

            if (!/^\d{10}$/.test(phoneNumber)) {
                errorMessage.textContent = "Phone number must be exactly 10 digits!";
                return false;
            }

            const validCountryCodes = countryList.map(c => c.code);
            if (!validCountryCodes.includes(countryCode)) {
                errorMessage.textContent = "Invalid country code! Please select a valid one.";
                return false;
            }

            errorMessage.textContent = "";
            return true;
        }

        window.onload = fetchCountries;