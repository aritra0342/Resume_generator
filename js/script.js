document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resume-form");
    const outputContainer = document.getElementById("output-container");
    const themeToggleButton = document.querySelector(".theme-toggle");
    const preview = document.getElementById("resume-preview");
    let profilePicture = null;
    let draggedElement = null;
    const sections = {
        'work': {
            container: '#work-experience-entries',
            button: '#add-work',
            entry: `<div class="work-entry">
                      <input type="text" name="job_title" placeholder="Job Title">
                      <input type="text" name="company" placeholder="Company">
                      <input type="text" name="work_dates" placeholder="Dates">
                      <textarea name="work_description" placeholder="Description"></textarea>
                      <button type="button" class="remove-entry">Remove</button>
                    </div>`
        },
        'education': { 
            container: '#education-entries',
            button: '#add-education',
            entry: `<div class="education-entry">
                        <input type="text" name="degree" placeholder="Degree">
                        <input type="text" name="institution" placeholder="Institution">
                        <input type="text" name="education_dates" placeholder="Dates">
                        <textarea name="education_details" placeholder="Details"></textarea>
                        <button type="button" class="remove-entry">Remove</button>
                    </div>`
        },
        'skills': { 
            container: '#skills-entries',
            button: '#add-skill',
            entry: `<div class="skill-entry">
                        <input type="text" name="skill" placeholder="Skill">
                        <button type="button" class="remove-entry">Remove</button>
                    </div>`
        },
        'projects': { 
            container: '#project-entries',
            button: '#add-project',
            entry: `<div class="project-entry">
                        <input type="text" name="project_title" placeholder="Project Title">
                        <input type="url" name="project_link" placeholder="Project Link">
                        <textarea name="project_description" placeholder="Description"></textarea>
                        <button type="button" class="remove-entry">Remove</button>
                    </div>`
        },
        'achievements': { 
            container: '#achievement-entries',
            button: '#add-achievement',
            entry: `<div id="achievement-entries">
                        <div class="achievement-entry">
                            <input type="text" name="achievement" placeholder="Achievement">
                            <button type="button" class="remove-entry">Remove</button>
                        </div>
                    </div>`
        }
    };

    Object.entries(sections).forEach(([key, config]) => {
        const container = document.querySelector(config.container);
        const addBtn = document.querySelector(config.button);
        
        addBtn.addEventListener('click', () => {
            const newEntry = document.createElement('div');
            newEntry.innerHTML = config.entry;
            container.appendChild(newEntry);
            updatePreview();
        });
    });
    
    // Generic remove handler
    document.querySelectorAll('.form-section').forEach(section => {
        section.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-entry')) {
                e.target.closest('.work-entry, .education-entry, .skill-entry, .project-entry, .achievement-entry').remove();
                updatePreview();
            }
        });
    });

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
            const title = section.querySelector("h2").textContent.replace('*', "").trim();
            const inputs = Array.from(section.querySelectorAll("input, textarea"))
                .filter(input => input.value.trim() !== "")
                .map(input => input.value);
            
            switch(title) {
                case 'Work Experience':
                    sectionsData[title] = Array.from(section.querySelectorAll('.work-entry')).map(entry => ({
                        job: entry.querySelector('[name="job_title"]').value,
                        company: entry.querySelector('[name="company"]').value,
                        dates: entry.querySelector('[name="work_dates"]').value,
                        description: entry.querySelector('[name="work_description"]').value
                    }));
                    break;
                case 'Certifications':
                    const certs = Array.from(section.querySelectorAll(".certificate-entry"))
                        .map(entry => {
                            const name = entry.querySelector('input[type="text"]').value;
                            const link = entry.querySelector('input[type="url"]').value;
                            return link ? `<a href="${link}">${name}</a>` : name;
                        });
                    if (certs.length > 0) sectionsData[title] = certs.join('<br>');
                    break;
                case 'Education':
                    sectionsData[title] = Array.from(section.querySelectorAll('.education-entry')).map(entry => ({
                        degree: entry.querySelector('[name="degree"]').value,
                        institution: entry.querySelector('[name="institution"]').value,
                        dates: entry.querySelector('[name="education_dates"]').value,
                        details: entry.querySelector('[name="education_details"]').value
                    }));
                    break;
                case 'Skills':
                    sectionsData[title] = Array.from(section.querySelectorAll('.skill-entry')).map(entry => ({
                        skill: entry.querySelector('[name="skill"]').value
                    }));
                    break;
                case 'Projects':
                    sectionsData[title] = Array.from(section.querySelectorAll('.project-entry')).map(entry => ({
                        title: entry.querySelector('[name="project_title"]').value,
                        link: entry.querySelector('[name="project_link"]').value,
                        description: entry.querySelector('[name="project_description"]').value
                    }));
                    break;
                case 'Achievements':
                    sectionsData[title] = Array.from(section.querySelectorAll('.achievement-entry')).map(entry => ({
                        achievement: entry.querySelector('[name="achievement"]').value
                    }));
                    break;
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

            ${data.sections['Work Experience']?.map(exp => `
                <div class="experience-item">
                    <h3>${exp.job}</h3>
                    <p>${exp.company} | ${exp.dates}</p>
                    <p>${exp.description}</p>
                </div>
            `).join('')}

            ${data.sections['Education']?.map(exp => `
                <div class="education-item">
                    <h3>${exp.degree}</h3>
                    <p>${exp.institution} | ${exp.dates}</p>
                    <p>${exp.details}</p>
                </div>
            `).join('')}

            ${data.sections['Skills']?.map(exp => `
                <div class="skills-item">
                    <h3>${exp.skill}</h3>
                </div>
            `).join('')}

            ${data.sections['Projects']?.map(exp => `
                <div class="projects-item">
                    <h3>${exp.title}</h3>
                    <p>${exp.link}</p>
                    <p>${exp.description}</p>
                </div>
            `).join('')}

            ${data.sections['Achievements']?.map(exp => `
                <div class="achievements-item">
                    <h3>${exp.achievement}</h3>
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






function toggleAboutPopup() {
    const popup = document.getElementById("aboutPopup");
    const overlay = document.getElementById("overlay");
    const main = document.getElementById("mainContent");
  
    popup.classList.toggle("hidden");
    overlay.classList.toggle("hidden");
    main.classList.toggle("blurred");
  }
    

  function toggleContactPopup() {
    const popup = document.getElementById("contactPopup");
    const overlay = document.getElementById("overlay");
    const main = document.getElementById("mainContent");
  
    popup.classList.toggle("hidden");
    overlay.classList.toggle("hidden");
    main.classList.toggle("blurred");
  }

  
  

