document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resume-form");
    const outputContainer = document.getElementById("output-container");
    const themeToggleButton = document.querySelector(".theme-toggle");
    const preview = document.getElementById("resume-preview");
    let profilePicture = null;
    let draggedElement = null;

    // Handle Image Upload
    document.getElementById('profile-picture').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePicture = e.target.result;
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    // Theme Toggle Implementation
    if (themeToggleButton) {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.body.classList.add(savedTheme);
        themeToggleButton.textContent = savedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

        themeToggleButton.addEventListener("click", function () {
            const isDarkMode = document.body.classList.toggle("dark-mode");
            document.body.classList.toggle("light-mode", !isDarkMode);
            themeToggleButton.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
            localStorage.setItem("theme", isDarkMode ? "dark" : "light");
        });
    }

    // Real-time Preview Updater
    function updatePreview() {
        const formData = new FormData(form);
        const sectionsData = {};

        form.querySelectorAll(".form-section").forEach(section => {
            const title = section.querySelector("h2").textContent.replace(/\*/g, "").trim();
            const inputs = Array.from(section.querySelectorAll("input, textarea"))
                .filter(input => input.value.trim() !== "")
                .map(input => input.value);
            
            // Handle certificate fields separately
            if (title === "Certifications") {
                const certs = Array.from(section.querySelectorAll(".certificate-entry"))
                    .map(entry => {
                        const name = entry.querySelector('input[type="text"]').value;
                        const link = entry.querySelector('input[type="url"]').value;
                        return link ? `<a href="${link}">${name}</a>` : name;
                    });
                if (certs.length > 0) sectionsData[title] = certs.join('<br>');
            }
            else if (inputs.length > 0 || ["Education", "Languages"].includes(title)) {
                sectionsData[title] = inputs.join('\n');
            }
        });

        preview.innerHTML = generateResumeHTML({
            name: formData.get("name") || "Your Name",
            title: formData.get("title") || "Job Title",
            email: formData.get("email") || "email@example.com",
            phone: formData.get("phone") || "+123 456 7890",
            linkedin: formData.get("linkedin"),
            github: formData.get("github"),
            profilePicture: profilePicture,
            sections: sectionsData
        });
    }

    // Shared HTML generator
    function generateResumeHTML(data) {
        return `
            <div class="header-section">
                ${data.profilePicture ? 
                    `<img src="${data.profilePicture}" alt="Profile Picture" class="profile-image">` : ''}
                <div class="header-info">
                    <h1>${data.name}</h1>
                    <h3>${data.title}</h3>
                </div>
            </div>
            
            <div class="contact-info">
                ${data.email ? `<p><strong>Email:</strong> ${data.email}</p>` : ''}
                ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
                ${data.linkedin ? `<p><strong>LinkedIn:</strong> ${data.linkedin}</p>` : ''}
                ${data.github ? `<p><strong>GitHub:</strong> ${data.github}</p>` : ''}
            </div>

            ${Object.entries(data.sections).map(([title, content]) => `
                <div class="section">
                    <h2>${title}</h2>
                    <div class="content">${content.replace(/\n/g, '</div><div class="content">')}</div>
                </div>
            `).join('')}
        `;
    }

    // Event Listeners for real-time updates
    form.addEventListener("input", () => updatePreview());
    form.addEventListener("change", () => updatePreview());
    document.addEventListener('sectionReordered', () => updatePreview());

    // =============================
    // DRAG-AND-DROP HANDLING
    // =============================
    function enableDragAndDrop() {
        const formContainer = document.getElementById("resume-form");
        const sections = formContainer.querySelectorAll(".form-section");

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
        this.style.transform = 'scale(1.02)';
        this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
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
        
        // Trigger custom event for preview update
        document.dispatchEvent(new Event('sectionReordered'));
    }

    function handleDragEnd() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = 'none';
        this.classList.remove("dragging");
        document.querySelectorAll(".form-section").forEach(section => {
            section.classList.remove("drag-over-top", "drag-over-bottom");
        });
    }

    function getDragAfterElement(container, y) {
        const elements = [...container.querySelectorAll(".form-section:not(.dragging)")];
        return elements.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                return offset < 0 && offset > closest.offset ? 
                    { offset: offset, element: child } : closest;
            },
            { offset: -Infinity }
        ).element;
    }

    // Initialize drag and drop
    enableDragAndDrop();

    // =============================
    // CERTIFICATE SECTION HANDLING
    // =============================
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
        updatePreview(); // Update preview when new certificate is added
    }

    function validatePhoneNumber(phone) {
        const regex = /^(?:\+91\s?)?(?:\d{5}\s?\d{5}|\d{10})$/;
        return regex.test(phone);
    }

    addCertificateButton.addEventListener("click", addCertificate);

    certificatesContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove-certificate")) {
            e.target.parentElement.remove();
            updatePreview(); // Update preview when certificate is removed
        }
    });

    // Modified Form Submission
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        // Get current phone value from form
        const phoneInput = document.querySelector('input[name="phone"]');
        
        // Validate the actual input value
        if (!validatePhoneNumber(phoneInput.value)) {
            alert("Please enter a valid Indian phone number.");
            return;
        }
    
        // Show loading spinner
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        outputContainer.appendChild(spinner);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate output
        outputContainer.innerHTML = `
            <div class="resume-output">
                ${preview.innerHTML}
                <div class="export-buttons">
                    <button onclick="window.print()">Print PDF</button>
                    <button onclick="window.location.reload()">Edit Resume</button>
                </div>
            </div>
        `;
        
        outputContainer.style.display = "block";
        form.style.display = "none";
    });

    // Back-to-top button functionality
    const backToTopButton = document.getElementById("backToTop");
    window.onscroll = function () {
        backToTopButton.style.display = document.documentElement.scrollTop > 300 ? "block" : "none";
    };
    backToTopButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    // Initial preview update
    updatePreview();

});

//auto-save-the-progress feature ,so that user dont loose progress on accedental refresh

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resume-form");

    Object.keys(localStorage).forEach((key) => {
        let input = form.elements[key];
        if (input) {
            input.value = localStorage.getItem(key);
        }
    });

    form.addEventListener("input", function (e) {
        localStorage.setItem(e.target.name, e.target.value);
    });

    form.addEventListener("submit", function () {
        localStorage.clear();
    });
});

//Clear form feature...................

document.getElementById("clearFormBtn").addEventListener("click", function () {
    
    document.getElementById("resume-form").reset();

   
    localStorage.removeItem("resumeData");
});

document.addEventListener("DOMContentLoaded", function () {
    const logoText = document.querySelector(".logo span");

    setTimeout(() => {
        logoText.classList.add("typing-complete"); 
    }, 2000); 
});






// particle-js library logic...........................


particlesJS("particles-js", {
    particles: {
        number: { value: 150, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        move: { enable: true, speed: 2, direction: "none", out_mode: "out" }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" }
        },
        modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 4 }
        }
    },
    retina_detect: true
});











