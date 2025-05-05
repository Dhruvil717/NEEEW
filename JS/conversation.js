let chatId;
        let messageHistory = [];
        function highlightSearch() {
            let searchInput = document.getElementById("searchInput").value.trim();
            if (!searchInput) {
                removeHighlights();
                return;
            }
        
            let regex = new RegExp(`(${searchInput})`, "gi");
        
            function wrapMatches(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    let parent = node.parentNode;
                    let text = node.textContent;
                    if (!regex.test(text)) return;
        
                    let tempElement = document.createElement("span");
                    tempElement.innerHTML = text.replace(regex, `<mark class="highlight">$1</mark>`);
        
                    parent.replaceChild(tempElement, node);
                } else {
                    node.childNodes.forEach(wrapMatches);
                }
            }
        
            function removeHighlights() {
                document.querySelectorAll(".highlight").forEach(mark => {
                    let parent = mark.parentNode;
                    parent.replaceChild(document.createTextNode(mark.textContent), mark);
                    parent.normalize(); 
                });
            }
        
            removeHighlights(); 
        
            let elementsToSearch = document.querySelectorAll(".conversation-container, table");
            elementsToSearch.forEach(element => wrapMatches(element));
        }
        
        document.getElementById("searchInput").addEventListener("input", highlightSearch);
                
        async function submitQuestion() {
            const submitButton = document.querySelector(".input-container button");
            submitButton.disabled = true;
        
            const question = document.getElementById("questionInput").value;
            if (!question.trim()) {
                alert("Please enter a valid question.");
                submitButton.disabled = false;
                return;
            }
        
            addMessage("user", question);
            document.getElementById("questionInput").value = "";

            const response = await fetch("/submit-question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `question=${encodeURIComponent(question)}&chat_id=${chatId}&history=${encodeURIComponent(JSON.stringify(messageHistory))}`,
            });
        
            const data = await response.json();
            if (data.formatted_output) {
                addMessage("bot", data.formatted_output);
        
                if (data.answer && data.answer.epics) {
                    renderTable(data.answer);
                }
        
                messageHistory.push({ user: question, bot: data.formatted_output });
        
                await storeConversation(chatId, question, data.formatted_output, data.answer);
            } else {
                alert("Failed to get a response from the bot.");
            }
        
            submitButton.disabled = false;
        }
        
        async function loadConversationHistory() {
            if (!chatId) return;  
        
            const response = await fetch(`/get-conversations?chat_id=${chatId}`);
            const data = await response.json();
        
            if (data.status === "success") {
                messageHistory = []; 
        
                data.conversations.forEach(conv => {
                    addMessage("user", conv.user_message);
                    addMessage("bot", conv.bot_response);
                    messageHistory.push({ user: conv.user_message, bot: conv.bot_response });
                });
            }
        }
        
        document.addEventListener("DOMContentLoaded", async () => {
            const urlParams = new URLSearchParams(window.location.search);
            chatId = urlParams.get("chat_id");
        
            if (chatId) {
                await loadConversationHistory();
            }
        });
        
        function showLogoutConfirmation() {
            document.getElementById("logoutModal").style.display = "flex";
        }

        function closeModal() {
            document.getElementById("logoutModal").style.display = "none";
        }

        function logout() {
            fetch('/logout', { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        window.location.href = "/";
                    } else {
                        console.error("Logout failed:", response.statusText);
                    }
                })
                .catch(error => console.error('Logout failed:', error));
        }

        async function storeConversation(chatId, userMessage, botResponse, structuredData) {
            const response = await fetch("/store-conversation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `chat_id=${chatId}&user_message=${encodeURIComponent(userMessage)}&bot_response=${encodeURIComponent(botResponse)}&structured_data=${encodeURIComponent(JSON.stringify(structuredData))}`,
            });

            const data = await response.json();
            if (data.status !== "success") {
                console.error("Failed to store conversation:", data.message);
            }
        }

        function addMessage(sender, message) {
            const conversationContainer = document.getElementById("conversationContainer");
            const messageDiv = document.createElement("div");
            messageDiv.className = `message ${sender}-message`;

            if (sender === "bot") {
                const formattedOutputDiv = document.createElement("div");
                formattedOutputDiv.className = "formatted-output";
                formattedOutputDiv.textContent = message;
                messageDiv.appendChild(formattedOutputDiv);
            } else {
                messageDiv.innerHTML = `<p>${message}</p>`;
            }

            conversationContainer.appendChild(messageDiv);
            conversationContainer.scrollTop = conversationContainer.scrollHeight;
        }

        function renderTable(structuredData) {
            const conversationContainer = document.getElementById("conversationContainer");

            const table = document.createElement("table");
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Estimation (Hours)</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector("tbody");

            structuredData.epics.forEach(epic => {
                let epicRow = document.createElement("tr");
                epicRow.style.backgroundColor = "#187693d4";
                epicRow.innerHTML = `
                    <td>Epic</td>
                    <td>${epic.title}</td>
                    <td>${epic.description}</td>
                    <td>${epic.estimation}</td>
                `;
                tbody.appendChild(epicRow);

                epic.stories.forEach(story => {
                    let storyRow = document.createElement("tr");
                    storyRow.style.backgroundColor = "#e81b1b66";
                    storyRow.innerHTML = `
                        <td>Story</td>
                        <td>${story.title}</td>
                        <td>${story.description}</td>
                        <td>${story.estimation}</td>
                    `;
                    tbody.appendChild(storyRow);

                    story.tasks.forEach(task => {
                        let taskRow = document.createElement("tr");
                        taskRow.style.backgroundColor = "#afdc1a3a";
                        taskRow.innerHTML = `
                            <td>Task</td>
                            <td>${task.title}</td>
                            <td>${task.description}</td>
                            <td>${task.estimation}</td>
                        `;
                        tbody.appendChild(taskRow);
                    });
                });
            });

            conversationContainer.appendChild(table);
        }

        async function loadChat() {
            const urlParams = new URLSearchParams(window.location.search);
            chatId = urlParams.get("chat_id");
            const chatName = urlParams.get("chat_name");

            if (!chatId || !chatName) {
                alert("Chat ID or name not found.");
                return;
            }
            document.getElementById("chatNameHeader").textContent = decodeURIComponent(chatName);

            const response = await fetch(`/get-conversations?chat_id=${chatId}`);
            const data = await response.json();
            if (data.status === "success") {
                data.conversations.forEach(conv => {
                    addMessage("user", conv.user_message);
                    addMessage("bot", conv.bot_response);

                    if (conv.structured_data) {
                        try {
                            const structuredData = JSON.parse(conv.structured_data);
                            renderTable(structuredData);
                        } catch (error) {
                            console.error("Error parsing structured_data:", error);
                        }
                    }
                });
            }
        }

        function toggleSidebar() {
            const sidebar = document.getElementById("sidebar");
            sidebar.classList.toggle("open");

            const settingsIcon = document.querySelector(".settings-icon");
            if (sidebar.classList.contains("open")) {
                settingsIcon.style.display = "none";
            } else {
                settingsIcon.style.display = "flex";
            }
        }

        let currentSearchTerm = '';
        let currentSearchResults = [];
        let currentPage = 0;
        const RESULTS_PER_PAGE = 3;

        function filterMessages() {
            const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
            if (searchTerm === "") {
                document.getElementById("searchResults").innerHTML = "";
                return;
            }

            currentSearchTerm = searchTerm;
            currentPage = 0;
            currentSearchResults = [];

            const messages = document.querySelectorAll(".message");
            const tables = document.querySelectorAll("table");

            messages.forEach(message => {
                const messageText = message.textContent.toLowerCase();
                if (messageText.includes(searchTerm)) {
                    currentSearchResults.push({
                        type: "Message",
                        content: message.textContent,
                        element: message
                    });
                }
            });

            tables.forEach(table => {
                const rows = table.querySelectorAll("tbody tr");
                rows.forEach(row => {
                    const rowText = row.textContent.toLowerCase();
                    if (rowText.includes(searchTerm)) {
                        currentSearchResults.push({
                            type: "Table Row",
                            content: row.textContent,
                            element: row
                        });
                    }
                });
            });

            displaySearchResults();
        }

        function displaySearchResults() {
            const searchResultsContainer = document.getElementById("searchResults");
            searchResultsContainer.innerHTML = "";

            if (currentSearchResults.length === 0) {
                searchResultsContainer.innerHTML = "<div>No results found.</div>";
                return;
            }

            const totalPages = Math.ceil(currentSearchResults.length / RESULTS_PER_PAGE);
            const startIdx = currentPage * RESULTS_PER_PAGE;
            const endIdx = Math.min(startIdx + RESULTS_PER_PAGE, currentSearchResults.length);

            for (let i = startIdx; i < endIdx; i++) {
                const result = currentSearchResults[i];
                const resultDiv = document.createElement("div");
                resultDiv.textContent = `${i+1}. ${result.content.substring(0, 50)}${result.content.length > 50 ? '...' : ''}`;
                resultDiv.onclick = () => {
                    result.element.scrollIntoView({ behavior: "smooth", block: "center" });
                    highlightElement(result.element);
                };
                searchResultsContainer.appendChild(resultDiv);
            }

            const navDiv = document.createElement("div");
            navDiv.className = "search-navigation";

            const prevButton = document.createElement("button");
            prevButton.textContent = "← Previous";
            prevButton.onclick = () => {
                currentPage = Math.max(0, currentPage - 1);
                displaySearchResults();
            };
            prevButton.disabled = currentPage === 0;
            
            const nextButton = document.createElement("button");
            nextButton.textContent = "Next →";
            nextButton.onclick = () => {
                currentPage = Math.min(Math.ceil(currentSearchResults.length / RESULTS_PER_PAGE) - 1, currentPage + 1);
                displaySearchResults();
            };
            nextButton.disabled = currentPage >= Math.ceil(currentSearchResults.length / RESULTS_PER_PAGE) - 1;

            navDiv.appendChild(prevButton);
            navDiv.appendChild(nextButton);
            searchResultsContainer.appendChild(navDiv);
        }

        function highlightElement(element) {
            document.querySelectorAll(".search-highlight").forEach(el => {
                el.classList.remove("search-highlight");
            });

            element.classList.add("search-highlight");
            setTimeout(() => {
                element.classList.remove("search-highlight");
            }, 2000);
        }

        function showLogoutConfirmation() {
            document.getElementById("logoutModal").style.display = "flex";
        }

        function closeModal() {
            document.getElementById("logoutModal").style.display = "none";
        }

        function logout() {
            window.location.href = "/";
        }
        function toggleDownloadDropdown() {
            const dropdown = document.getElementById("downloadDropdown");
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        }
        function downloadConversation(format) {
            const chatId = new URLSearchParams(window.location.search).get("chat_id");
            if (!chatId) {
                alert("Chat ID not found.");
                return;
            }

            fetch(`/download-conversation?chat_id=${chatId}&format=${format}`)
                .then(response => {
                    if (response.ok) {
                        return response.blob();
                    } else {
                        throw new Error("Failed to download conversation.");
                    }
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `conversation.${format}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Failed to download conversation.");
                });
        }
        function toggleFontDropdown() {
            const dropdown = document.getElementById("fontDropdown");
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        }

        function changeFontStyle(font) {
            document.body.style.fontFamily = font;

            document.getElementById("fontDropdown").style.display = "none";
            
            localStorage.setItem('selectedFont', font);
        }

        function toggleFontMenu() {
            const menu = document.querySelector('.font-menu');
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
          }
          
          function setFont(font) {
            document.body.style.fontFamily = font;
            document.querySelector('.font-menu').style.display = 'none';
          }
        document.addEventListener("DOMContentLoaded", function() {
            const savedFont = localStorage.getItem('selectedFont');
            if (savedFont) {
                document.body.style.fontFamily = savedFont;
            }
        });

        document.addEventListener("DOMContentLoaded", function() {
            const savedFont = localStorage.getItem('selectedFont');
            if (savedFont) {
                changeFontStyle(savedFont); 
            }
        });
        window.onload = loadChat;