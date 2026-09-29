let funnelChartInstance = null;
let riskChartInstance = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initCharts();
  loadDashboardData();
  loadTemplatesDropdown();

  // Auto-refresh dashboard data every 3 seconds to catch live user clicks immediately
  setInterval(() => {
    loadDashboardData();
  }, 3000);
});

// Switch Tab
function switchTab(tab) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(l => l.classList.remove('active'));
  event.target.classList.add('active');

  const title = document.getElementById('viewTitle');
  if (tab === 'dashboard') title.textContent = 'Cybersecurity Awareness Operations';
  if (tab === 'campaigns') title.textContent = 'Awareness Campaign Management';
  if (tab === 'templates') title.textContent = 'Simulated Attack Scenarios';
  if (tab === 'reports') title.textContent = 'Security Compliance Reports';
}

// Chart Initializations
function initCharts() {
  const funnelCtx = document.getElementById('funnelChart').getContext('2d');
  funnelChartInstance = new Chart(funnelCtx, {
    type: 'bar',
    data: {
      labels: ['Delivered', 'Opened', 'Simulated Click', 'Attachment', 'Trained'],
      datasets: [{
        label: 'Recipients Count',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#d946ef',
          '#10b981'
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#94a3b8', stepSize: 1 },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { display: false }
        }
      }
    }
  });

  const riskCtx = document.getElementById('riskDoughnut').getContext('2d');
  riskChartInstance = new Chart(riskCtx, {
    type: 'doughnut',
    data: {
      labels: ['Safe / Aware', 'Susceptible (Clicked/Opened)'],
      datasets: [{
        data: [100, 0],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 12 } }
        }
      },
      cutout: '70%'
    }
  });
}

// Fetch dashboard KPIs & Campaigns
async function loadDashboardData() {
  try {
    const statsRes = await fetch('/api/admin/dashboard-stats');
    const stats = await statsRes.json();

    document.getElementById('statDelivered').textContent = stats.totalDelivered || 0;
    document.getElementById('statSent').textContent = `Out of ${stats.totalSent || 0} sent`;
    document.getElementById('statOpened').textContent = stats.totalOpened || 0;
    document.getElementById('statOpenRate').textContent = `${stats.rates?.openRate || 0}% Open Rate`;
    document.getElementById('statClicked').textContent = stats.totalClicked || 0;
    document.getElementById('statClickRate').textContent = `${stats.rates?.clickRate || 0}% Click Rate`;
    document.getElementById('statAwareness').textContent = stats.totalAwarenessCompleted || 0;

    // Update Charts
    if (funnelChartInstance) {
      funnelChartInstance.data.datasets[0].data = [
        stats.totalDelivered || 0,
        stats.totalOpened || 0,
        stats.totalClicked || 0,
        stats.totalAttachmentInteracted || 0,
        stats.totalAwarenessCompleted || 0
      ];
      funnelChartInstance.update();
    }

    if (riskChartInstance) {
      const vulnerable = (stats.totalClicked || 0) + (stats.totalAttachmentInteracted || 0);
      const safe = Math.max(0, (stats.totalDelivered || 0) - vulnerable);
      riskChartInstance.data.datasets[0].data = [safe, vulnerable];
      riskChartInstance.update();
    }

    // Load Campaigns Table
    const campRes = await fetch('/api/admin/campaigns');
    const campaigns = await campRes.json();
    renderCampaignsTable(campaigns);
    renderRecipientsTable(campaigns);

  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}

// Render Campaigns in table
function renderCampaignsTable(campaigns) {
  const tbody = document.getElementById('campaignsTableBody');
  if (!campaigns || campaigns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No campaigns launched yet. Click "+ New Campaign" to start.</td></tr>`;
    return;
  }

  tbody.innerHTML = campaigns.map(c => `
    <tr>
      <td><strong>${c.title}</strong></td>
      <td>${c.template ? c.template.name : 'Custom Scenario'}</td>
      <td>${c.recipients?.length || 0}</td>
      <td><span class="tag tag-delivered">${c.stats?.deliveredCount || 0}</span></td>
      <td><span class="tag tag-opened">${c.stats?.openedCount || 0}</span></td>
      <td><span class="tag tag-clicked">${c.stats?.clickedCount || 0}</span></td>
      <td><span class="tag tag-attachment">${c.stats?.attachmentInteractedCount || 0}</span></td>
      <td>
        <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="viewReport('${c._id}')">
          📊 Report
        </button>
      </td>
    </tr>
  `).join('');
}

// Render User Interaction Breakdown
function renderRecipientsTable(campaigns) {
  const tbody = document.getElementById('recipientsTableBody');
  const allRecipients = [];

  campaigns.forEach(c => {
    (c.recipients || []).forEach(r => {
      allRecipients.push({ ...r, campaignTitle: c.title });
    });
  });

  if (allRecipients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No recipients logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = allRecipients.map(r => `
    <tr>
      <td><strong>${r.fullName}</strong></td>
      <td><code>${r.email}</code></td>
      <td>${r.department || 'General'}</td>
      <td>${r.status === 'delivered' ? '<span class="tag tag-delivered">Delivered</span>' : '<span class="tag">Pending</span>'}</td>
      <td>${r.opened ? '<span class="tag tag-opened">Opened (' + r.openCount + ')</span>' : '<span class="tag" style="background:rgba(255,255,255,0.05); color:#64748b;">Not Opened</span>'}</td>
      <td>
        ${r.clicked 
          ? `<span class="tag tag-clicked">⚠️ CLICKED (${r.clickCount})</span><div style="font-size:10px; color:#f87171; margin-top:3px;">${r.clickedAt ? new Date(r.clickedAt).toLocaleTimeString() : ''}</div>` 
          : `<span class="tag tag-safe">Not Clicked</span>`
        }
      </td>
      <td>
        ${r.attachmentInteracted 
          ? `<span class="tag tag-attachment">📎 ATTACHMENT OPENED</span><div style="font-size:10px; color:#e879f9; margin-top:3px;">${r.attachmentInteractedAt ? new Date(r.attachmentInteractedAt).toLocaleTimeString() : ''}</div>` 
          : `<span class="tag" style="background:rgba(255,255,255,0.05); color:#64748b;">Not Opened</span>`
        }
      </td>
      <td>
        <a href="/track/click?token=${r.trackingToken}" target="_blank" style="display:inline-block; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.4); color:#60a5fa; padding:4px 8px; border-radius:4px; font-size:11px; text-decoration:none; margin-right:4px;">
          🔗 Test Link
        </a>
        <a href="/track/attachment?token=${r.trackingToken}" target="_blank" style="display:inline-block; background:rgba(217,70,239,0.15); border:1px solid rgba(217,70,239,0.4); color:#e879f9; padding:4px 8px; border-radius:4px; font-size:11px; text-decoration:none;">
          📎 Test File
        </a>
      </td>
    </tr>
  `).join('');
}

// Load Templates Dropdown
async function loadTemplatesDropdown() {
  try {
    const res = await fetch('/api/admin/templates');
    const templates = await res.json();
    const select = document.getElementById('campaignTemplate');
    if (templates && templates.length > 0) {
      select.innerHTML = templates.map(t => `
        <option value="${t._id}">[${t.scenario.toUpperCase()}] ${t.name} - ${t.subject}</option>
      `).join('');
    } else {
      select.innerHTML = `<option value="">No templates found. Please load defaults.</option>`;
    }
  } catch (err) {
    console.error('Error fetching templates:', err);
  }
}

// Seed default templates
async function seedDefaultTemplates() {
  try {
    const res = await fetch('/api/admin/seed-defaults', { method: 'POST' });
    const data = await res.json();
    alert(data.message);
    loadTemplatesDropdown();
  } catch (err) {
    alert('Failed to load default templates: ' + err.message);
  }
}

// Modal handling
function openCampaignModal() {
  document.getElementById('campaignModal').classList.add('active');
}

function closeCampaignModal() {
  document.getElementById('campaignModal').classList.remove('active');
}

function closeReportModal() {
  document.getElementById('reportModal').classList.remove('active');
}

// Toggle custom email composer vs preset scenario
function toggleComposerMode() {
  const isCustom = document.getElementById('toggleCustomEmail').checked;
  document.getElementById('presetTemplateSection').style.display = isCustom ? 'none' : 'block';
  document.getElementById('customComposerSection').style.display = isCustom ? 'block' : 'none';
}

function toggleAttachmentField() {
  const hasAttachment = document.getElementById('includeAttachmentCheck').checked;
  document.getElementById('attachmentNameField').style.display = hasAttachment ? 'block' : 'none';
}

// Handle Campaign Creation
async function handleCreateCampaign(e) {
  e.preventDefault();

  const title = document.getElementById('campaignTitle').value;
  const description = document.getElementById('campaignDesc').value;
  const rawRecipients = document.getElementById('campaignRecipients').value;
  const isCustom = document.getElementById('toggleCustomEmail').checked;

  const templateId = document.getElementById('campaignTemplate').value;

  // Parse lines: Name, email, department
  const lines = rawRecipients.split('\n').filter(l => l.trim().length > 0);
  const recipientsList = lines.map(line => {
    const parts = line.split(',').map(p => p.trim());
    return {
      fullName: parts[0] || 'Employee',
      email: parts[1] || parts[0],
      department: parts[2] || 'Corporate'
    };
  });

  const payload = {
    title,
    description,
    recipientsList,
    templateId
  };

  if (isCustom) {
    payload.customSenderName = document.getElementById('customSenderName').value || 'Security Alert';
    payload.customSenderEmail = document.getElementById('customSenderEmail').value || 'no-reply@security-alert.org';
    payload.customSubject = document.getElementById('customSubject').value;
    payload.customBody = document.getElementById('customBody').value;
    payload.hasAttachment = document.getElementById('includeAttachmentCheck').checked;
    payload.customAttachmentName = document.getElementById('customAttachmentName').value;
  }

  try {
    const res = await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Phishing mail campaign "${data.title}" created & dispatched to target recipients!`);
      closeCampaignModal();
      document.getElementById('createCampaignForm').reset();
      toggleComposerMode();
      loadDashboardData();
    } else {
      alert('Error launching campaign: ' + (data.error || 'Unknown error'));
    }
  } catch (err) {
    alert('Request failed: ' + err.message);
  }
}

// View Detailed Campaign Report
async function viewReport(campaignId) {
  try {
    const res = await fetch(`/api/admin/campaigns/${campaignId}/report`);
    const report = await res.json();

    document.getElementById('reportTitle').textContent = `Campaign Audit: ${report.title}`;

    const content = `
      <div style="font-size: 13.5px; line-height: 1.6; margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">
            <div style="color: var(--text-muted); font-size: 11px;">TEMPLATE</div>
            <strong>${report.templateName}</strong>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">
            <div style="color: var(--text-muted); font-size: 11px;">DELIVERED / TOTAL</div>
            <strong>${report.summary.delivered} / ${report.summary.total}</strong>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">
            <div style="color: var(--text-muted); font-size: 11px;">SUSCEPTIBILITY RISK</div>
            <strong style="color: #f87171;">${report.summary.riskScore}%</strong>
          </div>
        </div>

        <h3 style="font-size: 15px; margin-bottom: 10px; color: #fbbf24;">Department Breakdown</h3>
        <div class="table-container" style="margin-bottom: 20px;">
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Total</th>
                <th>Opened</th>
                <th>Link Clicks</th>
                <th>Attachment Access</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(report.departmentBreakdown).map(([dept, s]) => `
                <tr>
                  <td><strong>${dept}</strong></td>
                  <td>${s.total}</td>
                  <td>${s.opened}</td>
                  <td>${s.clicked}</td>
                  <td>${s.attachment}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <h3 style="font-size: 15px; margin-bottom: 10px; color: #38bdf8;">Recipient Status Log</h3>
        <div class="table-container" style="max-height: 250px; overflow-y: auto;">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Opened</th>
                <th>Clicked</th>
                <th>Risk Evaluation</th>
              </tr>
            </thead>
            <tbody>
              ${report.recipients.map(r => `
                <tr>
                  <td>${r.fullName}</td>
                  <td>${r.email}</td>
                  <td>${r.status}</td>
                  <td>${r.opened ? 'Yes' : 'No'}</td>
                  <td>${r.clicked ? 'Yes' : 'No'}</td>
                  <td><span class="tag ${r.riskFlag === 'High Susceptibility' ? 'tag-clicked' : (r.riskFlag === 'Caution' ? 'tag-opened' : 'tag-safe')}">${r.riskFlag}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('reportContent').innerHTML = content;
    document.getElementById('reportModal').classList.add('active');
  } catch (err) {
    alert('Error loading report: ' + err.message);
  }
}
