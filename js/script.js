/**
 * JOBLIT - Search Logic & Pagination
 */

const CONFIG = {
    // Switches between local development and your live Railway API
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
              ? 'http://127.0.0.1:8000' 
              : 'https://joblit-production.up.railway.app',
    LIMIT: 10
};

let currentOffset = 0;
let currentQuery = "";

const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('jobSearch');
const resultsArea = document.getElementById('results');

// Initial Search Handler
searchBtn.addEventListener('click', () => {
    currentQuery = searchInput.value.trim();
    if (!currentQuery) return;
    
    currentOffset = 0; // Reset pagination for new search
    fetchJobData();
});

// Allow "Enter" key to trigger search
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});

async function fetchJobData() {
    resultsArea.innerHTML = `<p class="placeholder">Loading Joblit opportunities...</p>`;

    try {
        const response = await fetch(`${CONFIG.BASE_URL}/matcher/role?limit=${CONFIG.LIMIT}&offset=${currentOffset}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: currentQuery,
                role: "" // Let the embedder handle identity via 'text'
            })
        });

        if (!response.ok) throw new Error('Search failed');

        const result = await response.json();
        renderResults(result);

    } catch (error) {
        console.error('Joblit API Error:', error);
        resultsArea.innerHTML = `
            <div class="placeholder">
                <p style="color: #d63031;">Unable to reach the search engine. Please try again later.</p>
            </div>
        `;
    }
}

function renderResults(result) {
    const jobs = result.data || [];
    
    if (jobs.length === 0 && currentOffset === 0) {
        resultsArea.innerHTML = `<p class="placeholder">No roles found for "${currentQuery}". Try "AI Engineer".</p>`;
        return;
    }

    // Header info for the search
    let html = `<p style="margin-bottom: 20px;">Identified Role: <strong>${result.identified_role}</strong></p>`;

    // Map through Supabase fields: title, company_name, location, date, url, company_url
    jobs.forEach(job => {
        const jobDate = job.date ? new Date(job.date).toLocaleDateString() : 'Recent';
        
        html += `
            <div class="job-card">
                <h3>${job.title}</h3>
                <div class="job-meta">
                    <strong>🏢 <a href="${job.company_url || '#'}" target="_blank">${job.company_name}</a></strong><br>
                    📍 ${job.location || 'Remote'} | 📅 ${jobDate}
                </div>
                <a href="${job.url}" target="_blank" class="view-btn">Apply on Company Site</a>
            </div>
        `;
    });

    // Pagination Controls
    html += `
        <div class="pagination-controls">
            <button class="nav-btn" id="prevBtn" ${currentOffset === 0 ? 'disabled' : ''}>← Previous</button>
            <span class="page-num">Page ${(currentOffset / CONFIG.LIMIT) + 1}</span>
            <button class="nav-btn" id="nextBtn" ${jobs.length < CONFIG.LIMIT ? 'disabled' : ''}>Next →</button>
        </div>
    `;

    resultsArea.innerHTML = html;

    // Attach Pagination Event Listeners
    document.getElementById('prevBtn')?.addEventListener('click', () => {
        currentOffset = Math.max(0, currentOffset - CONFIG.LIMIT);
        fetchJobData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        currentOffset += CONFIG.LIMIT;
        fetchJobData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

