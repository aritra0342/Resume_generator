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

    enableDragAndDrop(); // Ensure drag-and-drop functionality

    // Resume Generation using FormData
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        let resumeHTML = `<div class="resume-output">`;

        const sections = document.querySelectorAll(".form-section");
        sections.forEach((section) => {
            const sectionTitle = section.querySelector("h2").innerText;
            const inputs = section.querySelectorAll("input, textarea");
            let sectionContent = "";

            inputs.forEach((input) => {
                if (input.value.trim() !== "") {
                    sectionContent += `<p><strong>${input.name}:</strong> ${input.value}</p>`;
                }
            });

            if (sectionContent) {
                resumeHTML += `<h2>${sectionTitle}</h2>${sectionContent}`;
            }
        });

        resumeHTML += `
            <button onclick="window.print()">Print Resume</button>
            <button onclick="window.location.reload()">Edit Resume</button>
        </div>`;

        outputContainer.innerHTML = resumeHTML;
        outputContainer.style.display = "block";
        form.style.display = "none";
    });
});
