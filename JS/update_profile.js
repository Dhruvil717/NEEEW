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
        document.getElementById("verifyDobButton").addEventListener("click", async function () {
            const dob = document.getElementById("dob_verify").value;
            if (!dob) {
                alert("Please enter your DOB.");
                return;
            }

            const response = await fetch("/verify-dob", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ dob_verify: dob }),
            });

            const result = await response.json();
            if (result.success) {
                document.getElementById("passwordFields").classList.remove("hidden");
            } else {
                alert("Invalid DOB. Please try again.");
            }
        });

        window.onload = fetchCountries;