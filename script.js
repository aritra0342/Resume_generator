document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resume-form");
    const outputContainer = document.getElementById("output-container");
    let draggedElement = null;
    let profilePicture = null;

    // Handle Image Upload
    document.getElementById('profile-picture').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePicture = e.target.result; // Store the image as a base64 string
            };
            reader.readAsDataURL(file);
        }
    });

    // Drag-and-drop implementation
    function enableDragAndDrop() {
        const sections = form.querySelectorAll(".form-section");
        sections.forEach((section) => {
            section.draggable = true;
            section.addEventListener("dragstart", handleDragStart);
            section.addEventListener("dragover", handleDragOver);
            section.addEventListener("dragend", handleDragEnd);
        });
    }

    function handleDragStart(e) {
        draggedElement = this;
        this.classList.add("dragging");
        e.dataTransfer.setData("text/plain", "");
    }

    function handleDragOver(e) {
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
            <button type="button" class="remove-certificate"><i class="fa-solid fa-xmark"></i> Remove</button>
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
        event.preventDefault();
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
            const sectionTitle = section.querySelector("h2").innerText.replace(/\s*\*\s*$/, "").trim();
            const inputs = section.querySelectorAll("input, textarea");
            let sectionContent = [];

            inputs.forEach((input) => {
                if (input.value.trim() !== "") {
                    sectionContent.push(input.value);
                }
            });

            if (sectionContent.length > 0 && !['Personal Information', 'Certifications'].includes(sectionTitle)) {
                resumeData.sections[sectionTitle] = sectionContent.join('\n');
            }
        });

        // Generate Resume HTML
        let resumeHTML = `<div class="resume-output">
            <h1>${resumeData.name}</h1>
            <div>
            <p> <strong>Email: </strong>${resumeData.email}</p>
            <p><strong>Tel: </strong> ${resumeData.phone} </p>
            ${resumeData.linkedin ? `<p><strong>LinkedIn: </strong><a href="${resumeData.linkedin}" target="_blank">${resumeData.linkedin}  </a></p>` : ''}
            ${resumeData.github ? `<p><strong>GitHub: </strong> <a href="${resumeData.github}" target="_blank">${resumeData.github}</a></p>` : ''}
            </div>
            <hr>
            <h3>${resumeData.title}</h3>
            `;

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

        resumeHTML += `</div>`;
        outputContainer.innerHTML = resumeHTML;
        outputContainer.style.display = "block";
        form.style.display = "none";
    });
});
