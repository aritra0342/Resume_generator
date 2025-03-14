document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resume-form");
    const outputContainer = document.getElementById("output-container");
    let draggedElement = null;

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
            sections: {}
        };

        const sections = form.querySelectorAll(".form-section");
        sections.forEach((section) => {
            const sectionTitle = section.querySelector("h2").innerText;
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
            <h1>${resumeData.name}</h1>
            <h3>${resumeData.title}</h3>
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