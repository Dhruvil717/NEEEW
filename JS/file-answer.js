const responseData = JSON.parse(sessionStorage.getItem('fileResponse'));
        
        if (responseData) {
            document.getElementById('formattedOutput').textContent = responseData.formatted_output;

            if (responseData.structured_data && responseData.structured_data.epics) {
                const tbody = document.querySelector('#dataTable tbody');
                
                responseData.structured_data.epics.forEach(epic => {

                    const epicRow = tbody.insertRow();
                    epicRow.className = 'epic-row';
                    epicRow.innerHTML = `
                        <td>Epic</td>
                        <td>${epic.title}</td>
                        <td>${epic.description}</td>
                        <td>${epic.estimation}</td>
                    `;
                    
                    epic.stories.forEach(story => {
                        const storyRow = tbody.insertRow();
                        storyRow.className = 'story-row';
                        storyRow.innerHTML = `
                            <td>Story</td>
                            <td>${story.title}</td>
                            <td>${story.description}</td>
                            <td>${story.estimation}</td>
                        `;

                        story.tasks.forEach(task => {
                            const taskRow = tbody.insertRow();
                            taskRow.className = 'task-row';
                            taskRow.innerHTML = `
                                <td>Task</td>
                                <td>${task.title}</td>
                                <td>${task.description}</td>
                                <td>${task.estimation}</td>
                            `;
                        });
                    });
                });
            }
        } else {
            document.getElementById('formattedOutput').textContent = "No response data found.";
        }
        
        async function submitFollowUp() {
            const question = document.getElementById('followUpQuestion').value;
            if (question.trim() === "") {
                alert("Please enter a question.");
                return;
            }
    
            try {

                const previousResponse = JSON.parse(sessionStorage.getItem('fileResponse'));
                const previousOutput = previousResponse?.formatted_output || "";

                const submitBtn = document.querySelector('button');
                submitBtn.disabled = true;
                submitBtn.textContent = "Processing...";

                const response = await fetch("/submit-file-followup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        question: question,
                        previous_output: previousOutput
                    })
                });
    
                if (!response.ok) {
                    throw new Error("Failed to process follow-up question");
                }
    
                const data = await response.json();

                sessionStorage.setItem('fileResponse', JSON.stringify({
                    formatted_output: data.formatted_output,
                    structured_data: data.answer
                }));
     
                window.location.reload();
    
            } catch (error) {
                console.error(error);
                alert("Error processing follow-up: " + error.message);
            } finally {
                const submitBtn = document.querySelector('button');
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit Follow-up";
            }
        }

        function toggleDropdown() {
            const dropdown = document.getElementById('dropdown');
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    
        function showLogoutConfirmation() {
            document.getElementById('logoutModal').style.display = 'flex';
        }
    
        function closeModal() {
            document.getElementById('logoutModal').style.display = 'none';
        }
    
        function logout() {
            window.location.href = "/logout";
        }
    
        function showChangeLogoModal() {
            document.getElementById('changeLogoModal').style.display = 'flex';
        }
    
        function closeChangeLogoModal() {
            document.getElementById('changeLogoModal').style.display = 'none';
        }

        document.getElementById('logoUpload')?.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const image = document.getElementById('cropperImage');
                    image.src = e.target.result;
                    document.getElementById('imagePreview').style.display = 'block';
                    document.getElementById('uploadButton').style.display = 'inline-block';
                };
                reader.readAsDataURL(file);
            }
        });
    
        function uploadLogo() {
            alert("Upload logic to be implemented.");
            closeChangeLogoModal();
        }