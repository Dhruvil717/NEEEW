let cropper;

        function toggleDropdown() {
            let dropdown = document.getElementById("dropdown");
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
            document.getElementById("uploadButton").style.display = "none";
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

                    document.getElementById("uploadButton").style.display = "block";
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