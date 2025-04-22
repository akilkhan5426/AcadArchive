// ========== 📚 Data for Papers ==========
const papersData = {
    'engineering-ug': generateYears(2010, 2023, 'Engineering UG'),
    'engineering-pg': generateYears(2015, 2023, 'Engineering PG'),
    'medical-ug': generateYears(2012, 2023, 'Medical UG'),
    'medical-pg': generateYears(2016, 2023, 'Medical PG'),
    'business-ug': generateYears(2011, 2023, 'Business UG'),
    'business-pg': generateYears(2015, 2023, 'Business PG'),
    'allied-health-ug': generateYears(2014, 2023, 'Allied Health UG'),
    'allied-health-pg': generateYears(2017, 2023, 'Allied Health PG'),
    'architecture-ug': generateYears(2013, 2023, 'Architecture UG'),
    'architecture-pg': generateYears(2016, 2023, 'Architecture PG'),
    'dental-ug': generateYears(2014, 2023, 'Dental UG'),
    'dental-pg': generateYears(2017, 2023, 'Dental PG'),
    'humanities-ug': generateYears(2010, 2023, 'Humanities UG'),
    'humanities-pg': generateYears(2013, 2023, 'Humanities PG'),
    'law-ug': generateYears(2012, 2023, 'Law UG'),
    'law-pg': generateYears(2015, 2023, 'Law PG'),
    'nursing-ug': generateYears(2014, 2023, 'Nursing UG'),
    'nursing-pg': generateYears(2017, 2023, 'Nursing PG'),
    'pharmacy-ug': generateYears(2013, 2023, 'Pharmacy UG'),
    'pharmacy-pg': generateYears(2016, 2023, 'Pharmacy PG')
  };
  
  function generateYears(start, end, prefix) {
    const arr = [];
    for (let year = end; year >= start; year--) {
      const next = (year + 1).toString().slice(-2);
      arr.push({
        year: `${year}-${next}`,
        title: `${prefix} ${year}-${next}`,
        author: 'SU Question Bank'
      });
    }
    return arr;
  }
  
  function getSchoolName(key) {
    const names = {
      engineering: 'School of Engineering',
      medical: 'School of Medical Sciences',
      business: 'School of Business Studies',
      'allied-health': 'School of Allied Health Sciences',
      architecture: 'School of Architecture',
      dental: 'School of Dental Sciences',
      humanities: 'School of Humanities',
      law: 'School of Law',
      nursing: 'School of Nursing',
      pharmacy: 'School of Pharmacy'
    };
    return names[key] || key;
  }
  
  function navigateToUGPG(school) {
    window.location.href = `ug_pg.html?school=${school}`;
  }
  
  function navigateToYear(ugpg) {
    const urlParams = new URLSearchParams(window.location.search);
    const school = urlParams.get('school');
    window.location.href = `year.html?school=${school}&ugpg=${ugpg}`;
  }
  
  function generateYearsTable() {
  const params = new URLSearchParams(window.location.search);
  const school = params.get('school');
  const ugpg = params.get('ugpg');

  if (!school || !ugpg) {
    document.querySelector('h1').textContent = 'Invalid Selection';
    document.querySelector('.table-container').innerHTML = '<p>Please go back and select a school and program.</p>';
    return;
  }

  const key = `${school}-${ugpg}`;
  const papers = papersData[key] || [];
  const schoolName = getSchoolName(school);

  document.title = `${schoolName} ${ugpg.toUpperCase()} PYQs`;
  document.querySelector('h1').textContent = `${schoolName} ${ugpg.toUpperCase()} Previous Year Questions`;

  const tbody = document.querySelector('table tbody');
  tbody.innerHTML = '';

  if (!papers.length) {
    tbody.innerHTML = '<tr><td colspan="3">No papers available.</td></tr>';
    return;
  }

  papers.forEach(paper => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${paper.year.split('-')[0]}</td>
      <td>
        <a href="year_details.html?year=${paper.year}&school=${school}&ugpg=${ugpg}">
          ${paper.title}
        </a>
      </td>
      <td>${paper.author}</td>
    `;
    tbody.appendChild(row);
  });
}
  
  function fetchPDFsByYear() {
    const year = new URLSearchParams(window.location.search).get("year");
    if (!year) return;
  
    fetch(`http://localhost:5000/api/files/${year}`)
      .then(res => res.json())
      .then(pdfs => {
        const list = document.getElementById("pdfList");
        if (!pdfs.length) {
          list.innerHTML = "<li>No papers found.</li>";
          return;
        }
  
        pdfs.forEach(p => {
          const li = document.createElement("li");
          li.className = "list-group-item";
          li.innerHTML = `<a href="${p.url}" target="_blank">${p.name}</a>`;
          list.appendChild(li);
        });
      })
      .catch(err => console.error("Failed to fetch PDFs:", err));
  }
  
  function setupUploadForm() {
    const uploadForm = document.getElementById("uploadForm");
    const user = JSON.parse(localStorage.getItem("user")) || {};
  
    if (!uploadForm) return;
  
    if (user.role === "admin") {
      uploadForm.style.display = "block";
  
      // ✅ Set school value from URL
      const schoolInput = document.getElementById("school");
      const schoolFromURL = new URLSearchParams(window.location.search).get("school");
      if (schoolInput && schoolFromURL) {
        schoolInput.value = schoolFromURL;
      }
    } else {
      uploadForm.style.display = "none";
    }
  
    uploadForm.addEventListener("submit", async e => {
      e.preventDefault();
  
      const file = document.getElementById("pdf").files[0];
      const year = document.getElementById("year").value;
      const school = document.getElementById("school").value;
      const token = localStorage.getItem("token");
  
      if (!file || !year || !school) {
        alert("Please provide all fields: PDF, year, and school.");
        return;
      }
  
      if (!token) {
        alert("Session expired. Please login again.");
        return (window.location.href = "login.html");
      }
  
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("year", year);
      formData.append("school", school);
  
      try {
        const res = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          headers: { "x-auth-token": token },
          body: formData
        });
  
        const data = await res.json();
        if (res.ok) {
          alert(data.msg);
          location.reload();
        } else {
          alert(data.msg || "Upload failed");
        }
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Upload failed");
      }
    });
  }
  
  async function navigateToSchool() {
    const student_id = document.getElementById("student_id").value;
    const password = document.getElementById("password").value;
  
    if (student_id.trim() === "" || password.trim() === "") {
      alert("Please enter both system id and password.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id, password })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "school.html";
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  }
  
  async function registerUser() {
    const name = document.getElementById("name").value;
    const student_id = document.getElementById("student_id").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
  
    if (!role || !name || !student_id || !email || !password) {
      alert("Please fill in all fields including role.");
      return;
    }
  
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, student_id, password, role })
    });
  
    const data = await response.json();
    if (response.ok) {
      alert("Registration successful! You can now log in.");
      window.location.href = "login.html";
    } else {
      alert(data.msg);
    }
  }
  
  // Run things on DOM load
  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("table tbody")) {
      generateYearsTable();
    }
    fetchPDFsByYear();
    setupUploadForm();
  });
  