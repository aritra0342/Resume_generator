document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resume-form");
    const outputContainer = document.getElementById("output-container");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        let resumeHTML = `
            <div class="resume-output">
                <h1>${formData.get("name")}</h1>
                <h3>${formData.get("title")}</h3>
                <p><strong>Email:</strong> ${formData.get("email")}</p>
                <p><strong>Phone:</strong> ${formData.get("phone")}</p>
                <p><strong>LinkedIn:</strong> <a href="${formData.get("linkedin")}" target="_blank">${formData.get("linkedin")}</a></p>
                <p><strong>GitHub:</strong> <a href="${formData.get("github")}" target="_blank">${formData.get("github")}</a></p>

                <h2>Professional Summary</h2>
                <p>${formData.get("summary")}</p>

                <h2>Work Experience</h2>
                <p>${formData.get("work_experience")}</p>

                <h2>Education</h2>
                <p>${formData.get("education")}</p>

                <h2>Skills</h2>
                <p>${formData.get("skills")}</p>

                <h2>Certifications</h2>
                <p>${formData.get("certifications")}</p>

                <h2>Projects</h2>
                <p>${formData.get("projects")}</p>

                <h2>Achievements</h2>
                <p>${formData.get("achievements")}</p>

                <h2>Languages</h2>
                <p>${formData.get("languages")}</p>

                <button onclick="window.print()">Print Resume</button>
                <button onclick="window.location.reload()">Edit Resume</button>
            </div>
        `;

        outputContainer.innerHTML = resumeHTML;
        outputContainer.style.display = "block";
        form.style.display = "none";
    });
});
