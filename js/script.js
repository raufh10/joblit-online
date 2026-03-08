/**
 * JOBLIT - Career Centroid Search
 */

const CONFIG = {
  // Switches between local development and your live Railway API
  BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://127.0.0.1:8000' 
            : 'https://joblit-production.up.railway.app',
  LIMIT: 10
};

// State Management
let SKILL_ENUMS = [];
let selectedSkills = new Set();

const skillInput = document.getElementById('skillInput');
const suggestionsBox = document.getElementById('suggestions');
const tagContainer = document.getElementById('selectedSkills');
const resultsArea = document.getElementById('results');
const searchBtn = document.getElementById('searchBtn');

/**
 * 1. Initialize: Fetch real skills from the DB
 */
async function loadSkillVocabulary() {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/skills`);
    const data = await response.json();
    SKILL_ENUMS = data.skills || [];
    console.log(`✅ Loaded ${SKILL_ENUMS.length} skills from Joblit engine.`);
  } catch (err) {
    console.error("❌ Failed to load skills from API:", err);
    // Fallback constants if API is unreachable
    SKILL_ENUMS = ["Python", "SQL", "Machine Learning", "Data Engineering"];
  }
}

/**
 * 2. Suggestion Logic
 */
skillInput.addEventListener('input', (e) => {
  const val = e.target.value.toLowerCase().trim();
  suggestionsBox.innerHTML = '';
  
  if (val.length < 1) {
    suggestionsBox.style.display = 'none';
    return;
  }

  // Filter existing skills that aren't already selected
  const matches = SKILL_ENUMS.filter(s => 
    s.toLowerCase().includes(val) && !selectedSkills.has(s)
  ).slice(0, 8); // Limit to top 8 suggestions for UI clarity

  if (matches.length > 0) {
    matches.forEach(match => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.textContent = match;
      div.onclick = () => addSkill(match);
      suggestionsBox.appendChild(div);
    });
    suggestionsBox.style.display = 'block';
  } else {
    suggestionsBox.style.display = 'none';
  }
});

/**
 * 3. Tag Management
 */
function addSkill(skill) {
  selectedSkills.add(skill);
  skillInput.value = '';
  suggestionsBox.style.display = 'none';
  renderTags();
}

function removeSkill(skill) {
  selectedSkills.delete(skill);
  renderTags();
}

function renderTags() {
  tagContainer.innerHTML = '';
  selectedSkills.forEach(skill => {
    const tag = document.createElement('div');
    tag.className = 'skill-tag';
    tag.innerHTML = `
      ${skill} 
      <span class="remove-tag" onclick="removeSkill('${skill}')">×</span>
    `;
    tagContainer.appendChild(tag);
  });
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!skillInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
    suggestionsBox.style.display = 'none';
  }
});

/**
 * 4. Search Execution
 */
searchBtn.addEventListener('click', async () => {
  if (selectedSkills.size === 0) {
    alert("Please select at least one skill to match.");
    return;
  }

  resultsArea.innerHTML = `
    <div class="placeholder">
      <p>Calculating your career centroid...</p>
    </div>
  `;

  try {
    const response = await fetch(`${CONFIG.BASE_URL}/match?limit=${CONFIG.LIMIT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        texts: Array.from(selectedSkills) 
      })
    });

    if (!response.ok) throw new Error('Search failed');

    const result = await response.json();
    renderResults(result.data, result.terms_identified);

  } catch (error) {
    console.error('Joblit API Error:', error);
    resultsArea.innerHTML = `
      <div class="placeholder">
        <p style="color: #d63031;">Unable to reach the search engine. Please try again later.</p>
      </div>
    `;
  }
});

/**
 * 5. Rendering Results
 */
function renderResults(jobs, terms) {
  if (!jobs || jobs.length === 0) {
    resultsArea.innerHTML = `
      <div class="placeholder">
        <p>No roles found that match these specific skills. Try adding broader terms.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div style="text-align:center; margin-bottom:30px; font-size: 0.9rem; color: #666;">
      Matching based on: <strong>${terms.join(', ')}</strong>
    </div>
  `;
  
  jobs.forEach(job => {
    html += `
      <div class="job-card">
        <h3>${job.title}</h3>
        <div class="job-meta">
          <strong>🏢 ${job.company_name}</strong><br>
          📍 ${job.location || 'Remote'} | 📅 ${job.date ? new Date(job.date).toLocaleDateString() : 'Recent'}
        </div>
        <a href="${job.url}" target="_blank" class="view-btn">View Opportunity</a>
      </div>
    `;
  });
  
  resultsArea.innerHTML = html;
  resultsArea.scrollIntoView({ behavior: 'smooth' });
}

// Load vocabulary immediately
loadSkillVocabulary();

