let cropper;
            let currentChatId;

            async function fetchChats() {
                const response = await fetch("/get-chats");
                const data = await response.json();
                if (data.status === "success") {
                    const chatList = document.getElementById("chatList");
                    chatList.innerHTML = ""; 
                    data.chats.forEach(chat => {
                        const chatItem = document.createElement("li");
                        chatItem.className = "chat-item";
                        chatItem.innerHTML = `
                            <span onclick="openChat(${chat.id}, '${chat.chat_name}')">${chat.chat_name}</span>
                            <span class="edit-icon" onclick="showEditDropdown(${chat.id}, this)">✏️</span>
                        `;
                        chatList.appendChild(chatItem);
                    });
                }
            }
            
            function openChat(chatId, chatName) {
                window.location.href = `/conversation.html?chat_id=${chatId}&chat_name=${encodeURIComponent(chatName)}`;
            }

            function showEditDropdown(chatId, editIcon) {
                closeEditDropdown();
                const dropdown = document.createElement("div");
                dropdown.className = "edit-dropdown";
                dropdown.innerHTML = `
                    <button onclick="showUpdateField(${chatId})">Update</button>
                    <button onclick="showConfirmationModal(${chatId})">Delete</button>
                `;
                const chatItem = editIcon.parentElement;
                chatItem.appendChild(dropdown);
                dropdown.style.display = "block";
            }

            function closeEditDropdown() {
                const dropdowns = document.querySelectorAll(".edit-dropdown");
                dropdowns.forEach(dropdown => dropdown.remove());
            }

            function showUpdateField(chatId) {
                currentChatId = chatId; 
                document.getElementById("updateChatModal").style.display = "flex";
            }

            function closeUpdateChatModal() {
                document.getElementById("updateChatModal").style.display = "none";
            }

            async function updateChatName() {
                const newChatName = document.getElementById("newChatNameInput").value;
                if (!newChatName || newChatName.trim() === "") {
                    alert("Please enter a valid chat name.");
                    return;
                }
    
                const response = await fetch("/update-chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: `chat_id=${currentChatId}&chat_name=${encodeURIComponent(newChatName)}`,
                });
    
                const data = await response.json();
                if (data.status === "success") {
                    fetchChats(); 
                    closeUpdateChatModal(); 
                } else {
                    alert("Failed to update chat.");
                }
            }
            function showConfirmationModal(chatId) {
                currentChatId = chatId;
                document.getElementById("confirmationModal").style.display = "block";
            }
            function closeConfirmationModal() {
                document.getElementById("confirmationModal").style.display = "none";
            }

            async function confirmDelete() {
                const response = await fetch("/delete-chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: `chat_id=${currentChatId}`,
                });

                const data = await response.json();
                if (data.status === "success") {
                    fetchChats(); 
                } else {
                    alert("Failed to delete chat.");
                }
                closeConfirmationModal();
            }

            async function createNewChat() {
                const chatName = document.getElementById("chatNameInput").value;
                if (chatName.trim() === "") {
                    alert("Please enter a chat name.");
                    return;
                }
            
                const response = await fetch("/create-chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: `chat_name=${encodeURIComponent(chatName)}`,
                });
            
                const data = await response.json();
                if (data.status === "success") {
                    window.location.href = `/conversation.html?chat_id=${data.chat_id}&chat_name=${encodeURIComponent(chatName)}`;
                } else {
                    alert("Failed to create chat.");
                }
            }

            window.onload = fetchChats;

            function openSidebar() {
                document.getElementById("sidebar").classList.add("open");
            }

            function closeSidebar() {
                document.getElementById("sidebar").classList.remove("open");
            }
            function showNewChatModal() {
                document.getElementById("newChatModal").style.display = "flex";
            }

            function closeNewChatModal() {
                document.getElementById("newChatModal").style.display = "none";
            }

            function validateForm() {
                const question = document.getElementById("question").value;
                if (question.trim() === "") {
                    document.getElementById("error-message").style.display = "block";
                    return false;
                }
                return true;
            }
            function toggleDropdown() {
                const dropdown = document.getElementById("dropdown");
                dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
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

            function showChangeLogoModal() {
                document.getElementById("changeLogoModal").style.display = "flex";
            }
            function closeChangeLogoModal() {
                document.getElementById("changeLogoModal").style.display = "none";
                if (cropper) {
                    cropper.destroy();
                }
                document.getElementById("imagePreview").style.display = "none";
            }
            document.getElementById("logoUpload").addEventListener("change", function (e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const imagePreview = document.getElementById("imagePreview");
                        const cropperImage = document.getElementById("cropperImage");
                        imagePreview.style.display = "block";
                        cropperImage.src = e.target.result;
                        if (cropper) {
                            cropper.destroy();
                        }
                        cropper = new Cropper(cropperImage, {
                            aspectRatio: 1,
                            viewMode: 1,
                            autoCropArea: 1,
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
            function uploadLogo() {
                if (cropper) {
                    const croppedCanvas = cropper.getCroppedCanvas();
                    const croppedImage = croppedCanvas.toDataURL("image/jpeg");

                    fetch(croppedImage)
                        .then(res => res.blob())
                        .then(blob => {
                            const formData = new FormData();
                            formData.append("profile_image", blob, "profile.jpg");

                            fetch("/upload-profile-image", {
                                method: "POST",
                                body: formData
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.status === "success") {
                                    const profileLogo = document.getElementById("profileLogo");
                                    profileLogo.src = data.imagePath;
                                    closeChangeLogoModal();
                                } else {
                                    alert("Error uploading image: " + (data.message || "Unknown error"));
                                }
                            })
                            .catch(error => {
                                console.error("Error:", error);
                                alert("An error occurred while uploading the image.");
                            });
                        });
                } else {
                    alert("Please select and crop an image first.");
                }
            }
            document.getElementById('fileUpload').addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    alert(`Selected file: ${file.name}`);
                }
            });

            function showFileName() {
                var fileInput = document.getElementById('fileUpload');
                var fileNameDisplay = document.getElementById('selectedFileName');
            
                if (fileInput.files.length > 0) {
                    fileNameDisplay.textContent = "Selected: " + fileInput.files[0].name;
                } else {
                    fileNameDisplay.textContent = "";
                }
            }
            
            function validateFileUpload() {
                var fileInput = document.getElementById('fileUpload');
                if (fileInput.files.length === 0) {
                    alert("Please select a file before submitting!");
                    return false;
                }
                return true;
            }

            function showFileName() {
                var fileInput = document.getElementById('fileUpload');
                var fileNameDisplay = document.getElementById('selectedFileName');
            
                if (fileInput.files.length > 0) {
                    fileNameDisplay.textContent = "Selected: " + fileInput.files[0].name;
                } else {
                    fileNameDisplay.textContent = "";
                }
            }
            
            function handleFileSelection() {
                const fileInput = document.getElementById('fileUpload');
                const filePreview = document.getElementById('filePreview');
                const fileNameDisplay = document.getElementById('fileNameDisplay');
                const fileSubmitBtn = document.getElementById('fileSubmitBtn');
                
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    fileNameDisplay.textContent = file.name;
                    filePreview.style.display = 'block';
                    fileSubmitBtn.disabled = false;
                    
                    // Optional: Auto-fill the textarea with a prompt about the file
                    const questionTextarea = document.getElementById('question');
                    if (!questionTextarea.value.trim()) {
                        questionTextarea.value = "Please analyze the attached file: " + file.name;
                    }
                } else {
                    filePreview.style.display = 'none';
                    fileSubmitBtn.disabled = true;
                }
            }
        
            function removeFile() {
                const fileInput = document.getElementById('fileUpload');
                fileInput.value = ''; 
                handleFileSelection(); 
 
                const questionTextarea = document.getElementById('question');
                if (questionTextarea.value.includes("Please analyze the attached file:")) {
                    questionTextarea.value = '';
                }
            }
        
            async function submitFile() {
                const fileInput = document.getElementById('fileUpload');
                if (fileInput.files.length === 0) {
                    alert("Please select a file first!");
                    return;
                }
        
                const formData = new FormData();
                formData.append("file", fileInput.files[0]);
        
                try {
                    const response = await fetch("/upload-pdf-query", {
                        method: "POST",
                        body: formData
                    });
                    
                    if (!response.ok) {
                        throw new Error("File upload failed");
                    }
                    
                    const data = await response.json();
                    sessionStorage.setItem('fileResponse', JSON.stringify({
                        formatted_output: data.formatted_output,
                        structured_data: data.structured_data
                    }));
                    
                    window.location.href = "/file-answer.html";
                } catch (error) {
                    console.error(error);
                    alert("Error uploading file: " + error.message);
                }
            }
        
            async function searchSimilarFiles(query) {
                try {
                    const response = await fetch("/search-similar-files", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: `question=${encodeURIComponent(query)}`
                    });
                    
                    const data = await response.json();
                    
                    if (data.results && data.results.documents.length > 0) {
                        const resultsContainer = document.getElementById('similarFilesResults');
                        const listContainer = document.getElementById('similarFilesList');
                        
                        listContainer.innerHTML = '';
                        data.results.documents.forEach((doc, index) => {
                            const metadata = data.results.metadatas[index][0];
                            const div = document.createElement('div');
                            div.className = 'similar-file';
                            div.innerHTML = `
                                <h4>${metadata.filename}</h4>
                                <p>${doc.substring(0, 150)}...</p>
                                <small>Uploaded: ${new Date(metadata.upload_date).toLocaleString()}</small>
                            `;
                            listContainer.appendChild(div);
                        });
                        
                        resultsContainer.style.display = 'block';
                    }
                } catch (error) {
                    console.error("Error searching similar files:", error);
                }
            }
            
            function submitFollowUpQuestion() {
                const question = document.getElementById("followUpQuestion").value;
                if (question.trim() === "") {
                    alert("Please enter a follow-up question.");
                    return;
                }

                alert("Follow-up question submitted: " + question);
            }