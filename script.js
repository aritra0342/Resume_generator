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
        e.preventDefault();
        const afterElement = getDragAfterElement(form, e.clientY);
        const sections = document.querySelectorAll(".form-section");

        sections.forEach((section) => {
            section.classList.remove("drag-over-top", "drag-over-bottom");
        });

        if (afterElement) {
            afterElement.classList.add("drag-over-top");
            form.insertBefore(draggedElement, afterElement);
        } else {
            const lastSection = form.querySelector(".form-section:last-child");
            if (lastSection) lastSection.classList.add("drag-over-bottom");
            form.insertBefore(draggedElement, form.querySelector("button"));
        }
    }

    function handleDragEnd() {
        this.classList.remove("dragging");
        const sections = document.querySelectorAll(".form-section");
        sections.forEach((section) => {
            section.classList.remove("drag-over-top", "drag-over-bottom");
        });
    }

    function getDragAfterElement(container, y) {
        const elements = [...container.querySelectorAll(".form-section:not(.dragging)")];
        return elements.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                return offset < 0 && offset > closest.offset ? { offset: offset, element: child } : closest;
            },
            { offset: -Infinity }
        ).element;
    }

    enableDragAndDrop();

    // ==============================
    // ✅ CERTIFICATE SECTION CODE ✅
    // ==============================
    const certificatesContainer = document.getElementById("certificates-container");
    const addCertificateButton = document.getElementById("add-certificate");

    function addCertificate() {
        const newEntry = document.createElement("div");
        newEntry.classList.add("certificate-entry");
        newEntry.innerHTML = `
            <input type="text" name="certificate_name" placeholder="Certificate Name">
            <input type="url" name="certificate_link" placeholder="Certificate Link (URL)">
            <button type="button" class="remove-certificate">❌</button>
        `;
        certificatesContainer.appendChild(newEntry);
    }

    addCertificateButton.addEventListener("click", addCertificate);

    certificatesContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove-certificate")) {
            e.target.parentElement.remove();
        }
    });

    // ==============================
    // ✅ FORM SUBMISSION HANDLING ✅
    // ==============================

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

            certificates: {},

            sections: {}
        };

        // Collect Certificates
        document.querySelectorAll(".certificate-entry").forEach(entry => {
            const name = entry.querySelector("input[name='certificate_name']").value;
            const link = entry.querySelector("input[name='certificate_link']").value;
            if (name && link) {
                resumeData.certificates[name] = link;
            }
        });

        // Collect Other Sections
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

            if (sectionContent.length > 0 && !['Personal Information', 'Certifications'].includes(sectionTitle)) {

                resumeData.sections[sectionTitle] = sectionContent.join('\n');
            }
        });


        // Generate Resume Output

        // Generate Resume HTML
        let resumeHTML = `<div class="resume-output">
            <h1>${resumeData.name}</h1>
            <h3>${resumeData.title}</h3>
            <p><strong>Email:</strong> ${resumeData.email}</p>
            <p><strong>Phone:</strong> ${resumeData.phone}</p>
            ${resumeData.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${resumeData.linkedin}" target="_blank">${resumeData.linkedin}</a></p>` : ''}
            ${resumeData.github ? `<p><strong>GitHub:</strong> <a href="${resumeData.github}" target="_blank">${resumeData.github}</a></p>` : ''}`;

        // Display Certificates
        if (Object.keys(resumeData.certificates).length > 0) {
            resumeHTML += `<h2>Certifications</h2><ul>`;
            for (const [name, link] of Object.entries(resumeData.certificates)) {
                resumeHTML += `<li>${name} ➡ <a href="${link}" target="_blank">View Certificate</a></li>`;
            }
            resumeHTML += `</ul>`;
        }

        Object.entries(resumeData.sections).forEach(([sectionName, content]) => {
            resumeHTML += `<h2>${sectionName}</h2><p>${content.replace(/\n/g, '</p><p>')}</p>`;
        });

        resumeHTML += `
            <div class="export-buttons">
                <button onclick="window.print()">Print PDF</button>
                <button onclick="window.location.reload()">Edit Resume</button>
            </div>
        </div>`;

        resumeHTML += `</div>`;
        outputContainer.innerHTML = resumeHTML;
        outputContainer.style.display = "block";
        form.style.display = "none";
    });
});
