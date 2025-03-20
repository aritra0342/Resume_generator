document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resume-form");
    const outputContainer = document.getElementById("output-container");
    const themeToggleButton = document.querySelector(".theme-toggle");
    let profilePicture = null;

    // Handle Image Upload
    document.getElementById('profile-picture').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePicture = e.target.result; // Store the image as a base64 string
            };
            reader.readAsDataURL(file);
        }
    });

    // Theme Toggle Implementation (Dark & Light Mode)
    if (themeToggleButton) {
        const savedTheme = localStorage.getItem("theme") || "light"; // Default to light mode
        document.body.classList.add(savedTheme);
        themeToggleButton.textContent = savedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

        themeToggleButton.addEventListener("click", function () {
            const isDarkMode = document.body.classList.toggle("dark-mode");
            document.body.classList.toggle("light-mode", !isDarkMode);
            themeToggleButton.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
            localStorage.setItem("theme", isDarkMode ? "dark" : "light");
        });
    }

    // Form Submission Handler (Fixes Page Refresh Issue)
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevents page refresh

        const formData = new FormData(form);

        const resumeData = {
            name: formData.get("name"),
            title: formData.get("title"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            linkedin: formData.get("linkedin"),
            github: formData.get("github"),
            profilePicture: profilePicture,
            sections: {}
        };

        const sections = form.querySelectorAll(".form-section");
        sections.forEach((section) => {
            const sectionTitle = section.querySelector("h2").innerText.trim();
            const inputs = section.querySelectorAll("input, textarea");
            let sectionContent = [];

            inputs.forEach((input) => {
                if (input.value.trim() !== "") {
                    sectionContent.push(input.value);
                }
            });

            // 🔥 Ensure "Education" and "Languages" always appear
            if (sectionContent.length > 0 || ["Education", "Languages"].includes(sectionTitle)) {
                resumeData.sections[sectionTitle] = sectionContent.join('\n');
            }
        });

        // Generate Resume Output
        let resumeHTML = `<div class="resume-output">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                ${resumeData.profilePicture ? `<img src="${resumeData.profilePicture}" alt="Profile Picture" style="width: 100px; height: 100px; border-radius: 50%; margin-right: 20px;">` : ''}
                <div>
                    <h1>${resumeData.name}</h1>
                    <h3>${resumeData.title}</h3>
                </div>
            </div>
            <p><strong>Email:</strong> ${resumeData.email}</p>
            <p><strong>Phone:</strong> ${resumeData.phone}</p>
            ${resumeData.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${resumeData.linkedin}" target="_blank">${resumeData.linkedin}</a></p>` : ''}
            ${resumeData.github ? `<p><strong>GitHub:</strong> <a href="${resumeData.github}" target="_blank">${resumeData.github}</a></p>` : ''}`;

        Object.entries(resumeData.sections).forEach(([sectionName, content]) => {
            resumeHTML += `<h2>${sectionName}</h2>
                <p>${content.replace(/\n/g, '</p><p>')}</p>`;
        });

        resumeHTML += `
            <div class="export-buttons">
                <button onclick="window.print()">Print PDF</button>
                <button onclick="window.location.reload()">Edit Resume</button>
            </div>
        </div>`;

        outputContainer.innerHTML = resumeHTML;
        outputContainer.style.display = "block";
        form.style.display = "none";
    });
});
