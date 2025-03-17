
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resume-form");
    const outputContainer = document.getElementById("output-container");
    let draggedElement = null;

    // Character limits configuration
    const CHAR_LIMITS = {
        name: 50,
        summary: 250,
        work_experience: 500,
        education: 300,
        skills: 100,
        certifications: 200,
        projects: 400,
        achievements: 150,
        languages: 100
    };

    // Smart truncation function (preserves whole words)
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        let truncated = text.substr(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        return (lastSpace > 0 ? truncated.substr(0, lastSpace) : truncated) + '...';
    }

    // Character counter updates
    function updateCounter(field) {
        const counter = document.getElementById(field.dataset.counterId);
        if (!counter) return;
        
        const current = field.value.length;
        const max = parseInt(field.dataset.maxLength);
        
        counter.textContent = `${current}/${max}`;
        counter.className = 'char-counter';
        
        if (current >= max * 0.9) counter.classList.add('warning');
        if (current >= max) counter.classList.add('error');
    }

    // Initialize character counters
    document.querySelectorAll('[data-counter-id]').forEach(field => {
        field.addEventListener('input', function() {
            if (this.value.length > this.maxLength) {
                this.value = truncateText(this.value, this.maxLength);
            }
            updateCounter(this);
        });
        updateCounter(field);
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

    // DOCX Generation function
    window.generateDOCX = async function(resumeData) {
        const doc = new docx.Document({
            sections: [{
                properties: {},
                children: [
                    new docx.Paragraph({
                        text: resumeData.name,
                        heading: docx.HeadingLevel.TITLE,
                        spacing: { after: 300 },
                    }),
                    new docx.Paragraph({
                        text: resumeData.title,
                        heading: docx.HeadingLevel.HEADING_1,
                        spacing: { after: 200 },
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `Email: ${resumeData.email} | Phone: ${resumeData.phone}`,
                                size: 22,
                            }),
                            ...(resumeData.linkedin ? [new docx.TextRun({
                                text: ` | LinkedIn: ${resumeData.linkedin}`,
                                size: 22,
                            })] : []),
                            ...(resumeData.github ? [new docx.TextRun({
                                text: ` | GitHub: ${resumeData.github}`,
                                size: 22,
                            })] : []),
                        ],
                        spacing: { after: 300 },
                    }),
                    ...Object.entries(resumeData.sections).map(([sectionName, content]) => [
                        new docx.Paragraph({
                            text: sectionName,
                            heading: docx.HeadingLevel.HEADING_2,
                            spacing: { before: 200, after: 150 },
                        }),
                        new docx.Paragraph({
                            text: content,
                            spacing: { after: 200 },
                        })
                    ]).flat()
                ],
            }],
        });

        const blob = await docx.Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resumeData.name.replace(' ', '_')}_Resume.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Form Submission Handler
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(form);

        const resumeData = {
            name: truncateText(formData.get("name"), CHAR_LIMITS.name),
            title: truncateText(formData.get("title"), 50),
            email: formData.get("email"),
            phone: formData.get("phone"),
            linkedin: formData.get("linkedin"),
            github: formData.get("github"),
            sections: {}
        };

        // Process sections with truncation
        document.querySelectorAll(".form-section").forEach(section => {
            const sectionTitle = section.querySelector("h2").innerText;
            const inputs = section.querySelectorAll("input, textarea");
            let sectionContent = [];
            
            inputs.forEach(input => {
                let value = input.value.trim();
                if (CHAR_LIMITS[input.name]) {
                    value = truncateText(value, CHAR_LIMITS[input.name]);
                }
                if (value) sectionContent.push(value);
            });

            if (sectionContent.length > 0 && !['Personal Information'].includes(sectionTitle)) {
                resumeData.sections[sectionTitle] = sectionContent.join('\n');
            }
        });

        // Generate HTML Output
        let resumeHTML = `<div class="resume-output">
            <h1>${resumeData.name}</h1>
            <h3>${resumeData.title}</h3>
            <p><strong>Email:</strong> ${resumeData.email}</p>
            <p><strong>Phone:</strong> ${resumeData.phone}</p>
            ${resumeData.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${resumeData.linkedin}" target="_blank">${resumeData.linkedin}</a></p>` : ''}
            ${resumeData.github ? `<p><strong>GitHub:</strong> <a href="${resumeData.github}" target="_blank">${resumeData.github}</a></p>` : ''}`;

        Object.entries(resumeData.sections).forEach(([sectionName, content]) => {
            resumeHTML += `<h2>${sectionName}</h2><p>${content.replace(/\n/g, '</p><p>')}</p>`;
        });

        resumeHTML += `
            <div class="export-buttons">
                <button onclick="window.print()">Print PDF</button>
                <button onclick="generateDOCX(${JSON.stringify(resumeData).replace(/"/g, '&quot;')})">Download DOCX</button>
                <button onclick="window.location.reload()">Edit Resume</button>
            </div>
        </div>`;

        outputContainer.innerHTML = resumeHTML;
        outputContainer.style.display = "block";
        form.style.display = "none";
    });

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

    // Make generateDOCX globally accessible
    window.generateDOCX = async function(resumeData) {
        const doc = new docx.Document({
            sections: [{
                properties: {},
                children: [
                    new docx.Paragraph({
                        text: resumeData.name,
                        heading: docx.HeadingLevel.TITLE,
                        spacing: { after: 300 },
                    }),
                    new docx.Paragraph({
                        text: resumeData.title,
                        heading: docx.HeadingLevel.HEADING_1,
                        spacing: { after: 200 },
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `Email: ${resumeData.email} | Phone: ${resumeData.phone}`,
                                size: 22,
                            }),
                            ...(resumeData.linkedin ? [new docx.TextRun({
                                text: ` | LinkedIn: ${resumeData.linkedin}`,
                                size: 22,
                            })] : []),
                            ...(resumeData.github ? [new docx.TextRun({
                                text: ` | GitHub: ${resumeData.github}`,
                                size: 22,
                            })] : []),
                        ],
                        spacing: { after: 300 },
                    }),
                    ...Object.entries(resumeData.sections).map(([sectionName, content]) => [
                        new docx.Paragraph({
                            text: sectionName,
                            heading: docx.HeadingLevel.HEADING_2,
                            spacing: { before: 200, after: 150 },
                        }),
                        new docx.Paragraph({
                            text: content,
                            spacing: { after: 200 },
                        })
                    ]).flat()
                ],
            }],
        });

        const blob = await docx.Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resumeData.name.replace(' ', '_')}_Resume.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Form Submission Handler
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
            profilePicture: profilePicture, // Add profile picture to resume data
            sections: {}
        };

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

            if (sectionContent.length > 0 && !['Personal Information'].includes(sectionTitle)) {
                resumeData.sections[sectionTitle] = sectionContent.join('\n');
            }
        });

        // Generate HTML Output
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
                <button onclick="generateDOCX(${JSON.stringify(resumeData).replace(/"/g, '&quot;')})">Download DOCX</button>
                <button onclick="window.location.reload()">Edit Resume</button>
            </div>
        </div>`;

        outputContainer.innerHTML = resumeHTML;
        outputContainer.style.display = "block";
        form.style.display = "none";
    });

});