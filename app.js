// ===== EXTERNAL LIBRARIES =====
import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@3.6.2/+esm';

// ===== VISUAL CONSTANTS =====
const PRIORITY_COLORS = {
  urgent: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#0ea5e9',
};

// ===== USER PROFILE STATE =====
const CURRENT_USER = {
  id: 'coalition-dispatch',
  name: 'Coalition Dispatcher',
  org: 'Coalition of Care Dispatch',
};

// ===== PARTNER REGISTRY =====
const PARTNER_ORGS = [
  'Housing Mutual Aid Network',
  'Community Legal Services',
  'Neighborhood Safety Desk',
  'Tenant Health Collective',
  'Mutual Aid Logistics Team',
];

// ===== DATA SOURCING =====
const DATA_URL = 'data/mockReports.json';

// ===== IN-MEMORY STATE =====
let reports = [];
const filters = {
  priority: 'all',
  status: 'all',
  responsibility: 'all',
};
let activeUser = { ...CURRENT_USER };

const SEED_ENGAGEMENT = {};

// ===== STORAGE IDENTIFIERS =====
const STORAGE_KEY = 'flicr-engagement-v1';
const CASE_STATE_KEY = 'flicr-case-state-v1';
const CAN_USE_STORAGE =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const engagementState = loadEngagementState();
const caseState = loadCaseState();

let selectedCase = null;
let commentReplyTarget = null;

// ===== DOM REFERENCES =====
const filterPriority = document.getElementById('filter-priority');
const filterStatus = document.getElementById('filter-status');
const filterResponsibility = document.getElementById('filter-responsibility');
const filterResetBtn = document.getElementById('filter-reset');
const recentList = document.getElementById('recent-list');
const activityList = document.getElementById('activity-list');
const casePanel = document.getElementById('case-panel');
const closeCaseBtn = document.getElementById('close-case');
const caseTagsContainer = document.getElementById('case-tags');
const collaboratorsList = document.getElementById('case-collaborators-list');
const caseActionsBody = document.getElementById('case-actions-body');
const commentsList = document.getElementById('comments-list');
const notesList = document.getElementById('notes-list');
const commentCount = document.getElementById('comment-count');
const noteCount = document.getElementById('note-count');
const commentForm = document.getElementById('comment-form');
const commentField = document.getElementById('comment-text');
const replyHint = document.getElementById('reply-hint');
const cancelReplyBtn = document.getElementById('cancel-reply');
const noteForm = document.getElementById('note-form');
const noteField = document.getElementById('note-text');
const notePermissions = document.getElementById('note-permissions');
const commentColumn = document.getElementById('comments-column');
const notesColumn = document.getElementById('notes-column');
const authToggle = document.getElementById('auth-toggle');
const userNameEl = document.getElementById('user-name');
const userOrgEl = document.getElementById('user-org');

// ===== CASE SUMMARY FIELDS =====
// const caseSummaryFields = {
//   status: document.getElementById('case-status'),
//   title: document.getElementById('case-title'),
//   address: document.getElementById('case-address'),
//   type: document.getElementById('case-type-summary'),
//   responsibility: document.getElementById('case-responsibility-summary'),
// };

// ===== CASE HEADER FIELDS =====
const caseHeaderFields = {
  status: document.getElementById('case-status-detail'),
  title: document.getElementById('case-title-detail'),
  address: document.getElementById('case-address-detail'),
};

// ===== CASE META FIELDS =====
const caseMetaFields = {
  id: document.getElementById('case-id'),
  description: document.getElementById('case-description'),
  filed: document.getElementById('case-filed'),
  updated: document.getElementById('case-updated'),
  responsibility: document.getElementById('case-responsibility'),
  reporter: document.getElementById('case-reporter'),
  contacted: document.getElementById('case-contacted'),
  contact: document.getElementById('case-contact'),
};
const reporterDescriptionEl = document.getElementById('reporter-description');

// ===== MAPLIVRE CONFIG =====
let mapReady = false;
const map = new maplibregl.Map({
  container: 'locator-map',
  style: {
    version: 8,
    sources: {
      esri: {
        type: 'raster',
        tiles: [
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
      },
    },
    layers: [{ id: 'esri', type: 'raster', source: 'esri' }],
  },
  center: [-75.1635, 39.9526],
  zoom: 11.2,
});

map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
map.on('load', () => {
  mapReady = true;
  map.addSource('cases', {
    type: 'geojson',
    data: toGeoJSON(reports),
  });

  map.addLayer({
    id: 'cases-layer',
    type: 'circle',
    source: 'cases',
    paint: {
      'circle-radius': 7,
      'circle-color': ['get', 'color'],
      'circle-stroke-width': 1.2,
      'circle-stroke-color': '#ffffff',
    },
  });

  map.on('click', 'cases-layer', (event) => {
    const feature = event.features?.[0];
    if (!feature) return;
    const report = reports.find((r) => r.id === feature.properties.id);
    if (report) focusOnReport(report);
  });

  map.on('mouseenter', 'cases-layer', () => (map.getCanvas().style.cursor = 'pointer'));
  map.on('mouseleave', 'cases-layer', () => (map.getCanvas().style.cursor = ''));
});

// ===== EVENT WIRING =====
closeCaseBtn.addEventListener('click', () => closeCasePanel());
commentForm.addEventListener('submit', handleCommentSubmit);
noteForm.addEventListener('submit', handleNoteSubmit);
cancelReplyBtn.addEventListener('click', () => clearReplyTarget());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCasePanel();
});
filterPriority.addEventListener('change', () => updateFilters('priority', filterPriority.value));
filterStatus.addEventListener('change', () => updateFilters('status', filterStatus.value));
filterResponsibility.addEventListener('change', () =>
  updateFilters('responsibility', filterResponsibility.value),
);
filterResetBtn.addEventListener('click', resetFilters);
authToggle.addEventListener('click', toggleAuthentication);

// ===== APP INIT =====
async function init() {
  updateAuthUI();
  await loadReports();
}

// ===== DATA FETCH =====
async function loadReports() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const dataset = await response.json();
    const transformed = (dataset.reports ?? []).map(transformReport);
    setReports(transformed);
  } catch (error) {
    console.error('Unable to load reports dataset', error);
  }
}

init();

// ===== STATE HYDRATION =====
function setReports(data) {
  reports = data;
  applyCaseStateOverrides();
  bootstrapEngagementSeeds(data);
  populateFilterControls(data);
  renderLists();
  if (selectedCase) {
    const latest = reports.find((report) => report.id === selectedCase.id);
    if (latest) {
      selectedCase = latest;
      renderCasePanel(latest);
    }
  }
}

// ===== LIST RENDERING =====
function renderLists() {
  const scopedReports = getFilteredReports();
  renderReportList(recentList, sortReportsBy(scopedReports, 'reportedAt'), 'reportedAt');
  renderReportList(activityList, sortReportsBy(scopedReports, 'lastEngaged'), 'lastEngaged');
  refreshMapSource(scopedReports);
}

// ===== LIST ITEM BUILDER =====
function renderReportList(listEl, items, dateField) {
  listEl.innerHTML = '';
  if (!items.length) {
    const empty = document.createElement('li');
    empty.className = 'report-empty';
    empty.textContent = 'No reports match the current filters.';
    listEl.appendChild(empty);
    return;
  }
  items.forEach((report) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'report-row';
    button.innerHTML = buildReportRowMarkup(report, dateField);
    button.addEventListener('click', () => focusOnReport(report));
    li.appendChild(button);
    listEl.appendChild(li);
  });
}

// ===== FILTERING UTILITIES =====
function getFilteredReports() {
  return reports.filter((report) => {
    if (filters.priority !== 'all' && report.priority !== filters.priority) return false;
    if (filters.status !== 'all' && report.status !== filters.status) return false;
    if (
      filters.responsibility !== 'all' &&
      getResponsibilityLabel(report) !== filters.responsibility
    ) {
      return false;
    }
    return true;
  });
}

function updateFilters(key, value) {
  filters[key] = value;
  renderLists();
}

function resetFilters() {
  filters.priority = 'all';
  filters.status = 'all';
  filters.responsibility = 'all';
  filterPriority.value = 'all';
  filterStatus.value = 'all';
  filterResponsibility.value = 'all';
  renderLists();
}

function populateFilterControls(data) {
  populateSelect(filterPriority, getUniqueValues(data.map((report) => report.priority)));
  populateSelect(filterStatus, getUniqueValues(data.map((report) => report.status)));
  populateSelect(
    filterResponsibility,
    getUniqueValues(data.map((report) => getResponsibilityLabel(report))),
  );
}

function populateSelect(selectEl, values) {
  if (!selectEl) return;
  const currentValue = selectEl.value;
  selectEl.innerHTML = '<option value="all">All</option>';
  values.forEach((value) => {
    if (!value) return;
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    selectEl.appendChild(option);
  });
  if (currentValue && Array.from(selectEl.options).some((opt) => opt.value === currentValue)) {
    selectEl.value = currentValue;
  }
}

function getUniqueValues(list) {
  return [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

// ===== REPORT ROW MARKUP =====
function buildReportRowMarkup(report, dateField) {
  const priorityPill = `<span class="priority-pill priority-pill--${report.priority}">${report.priority.toUpperCase()} PRIORITY</span>`;
  const statusPill = formatStatusPill(report.status);
  const responsibility = getResponsibilityLabel(report);
  const badge = `<span class="report-label report-label--time">${formatRelativeDate(report[dateField])}</span>`;
  return `
    <div class="report-row__header">
      <p class="report-row__title">${report.title}</p>
      <div class="report-row__pills">${priorityPill}${statusPill}</div>
    </div>
    <div class="report-row__meta">
      <span>${report.address}</span>
      <span>${responsibility}</span>
    </div>
    <div class="report-row__badges">${badge}</div>
  `;
}

// ===== CASE FOCUS HANDLER =====
function focusOnReport(report) {
  selectedCase = report;
  renderCasePanel(report);
  highlightMap(report);
}

// ===== CASE PANEL RENDER =====
function renderCasePanel(report) {
  // updateSummary(report);
  updateCaseHeader(report);
  reporterDescriptionEl.textContent = formatReporterDescription(report);
  caseMetaFields.id.textContent = report.id;
  caseMetaFields.description.textContent = report.description;
  caseMetaFields.filed.textContent = formatAbsoluteDate(report.reportedAt);
  caseMetaFields.updated.textContent = formatAbsoluteDate(report.lastEngaged);
  caseMetaFields.responsibility.textContent = getResponsibilityLabel(report);
  caseMetaFields.reporter.textContent = formatReporterMeta(report);
  caseMetaFields.contacted.textContent = formatContactedAgency(report);
  caseMetaFields.contact.textContent = formatOptionalContact(report);
  renderTags(report);
  renderCollaborators(report);
  renderThreads(report);
  renderCaseActions(report);
  clearReplyTarget();
  casePanel.classList.remove('hidden');
}

// ===== SUMMARY WRITER =====
// function updateSummary(report) {
//   caseSummaryFields.status.textContent = report.status;
//   caseSummaryFields.title.textContent = report.title;
//   caseSummaryFields.address.textContent = formatCaseAddress(report);
//   caseSummaryFields.type.textContent = report.caseType ?? 'Case';
//   caseSummaryFields.responsibility.textContent = getResponsibilityLabel(report);
// }

// ===== HEADER WRITER =====
function updateCaseHeader(report) {
  caseHeaderFields.status.textContent = report.status;
  caseHeaderFields.title.textContent = report.title;
  caseHeaderFields.address.textContent = formatCaseAddress(report);
}

// ===== TAG RENDERER =====
function renderTags(report) {
  caseTagsContainer.innerHTML = '';
  const tags = report.tags ?? [];
  if (!tags.length) {
    caseTagsContainer.textContent = 'No tags yet';
    return;
  }
  tags.forEach((tag) => {
    const span = document.createElement('span');
    span.className = 'case-tag';
    span.textContent = tag;
    caseTagsContainer.appendChild(span);
  });
}

// ===== COLLAB RENDERER =====
function renderCollaborators(report) {
  collaboratorsList.innerHTML = '';
  const collaborators = report.collaborators ?? [];
  if (!collaborators.length) {
    const li = document.createElement('li');
    li.textContent = 'No collaborators yet';
    li.className = 'collaborator-empty';
    collaboratorsList.appendChild(li);
    return;
  }

  collaborators.forEach((name) => {
    const li = document.createElement('li');
    li.textContent = name;
    collaboratorsList.appendChild(li);
  });
}

// ===== THREAD RENDERER =====
function renderThreads(report) {
  const threads = getCaseThreads(report.id);
  const ownsCase = isCaseOwner(report);
  renderThreadItems(commentsList, threads.comments, 'comment', {
    allowReply: ownsCase,
    report,
  });
  renderThreadItems(notesList, threads.notes, 'note');
  commentCount.textContent = formatThreadCount(
    threads.comments.length,
    'community update',
    'No community updates yet',
  );
  noteCount.textContent = formatThreadCount(
    threads.notes.length,
    'internal note',
    'No internal notes yet',
  );
  noteForm.classList.toggle('is-hidden', !ownsCase);
  notesColumn.classList.toggle('notes-readonly', !ownsCase);
  notePermissions.classList.toggle('is-hidden', ownsCase);
  if (!ownsCase) {
    notePermissions.textContent = activeUser
      ? 'Only case owners can capture internal notes.'
      : 'Log in to capture internal notes.';
    noteField.value = '';
  } else {
    notePermissions.textContent = '';
  }
}

// ===== ACTION CENTER RENDER =====
function renderCaseActions(report) {
  caseActionsBody.innerHTML = '';
  if (!report) {
    caseActionsBody.innerHTML =
      '<p class="case-action-hint">Select a case to see engagement options.</p>';
    return;
  }
  if (!activeUser) {
    caseActionsBody.innerHTML =
      '<p class="case-action-hint">Log in to assign, refer, or tag coalition partners.</p>';
    return;
  }
  const isOwner = isCaseOwner(report);
  const isUnassigned = isCaseUnassigned(report);
  const referredToYou = Boolean(
    report.referredTo && activeUser && report.referredTo === activeUser.org,
  );

  if (isOwner) {
    caseActionsBody.appendChild(buildReferCard(report));
    caseActionsBody.appendChild(buildCloseCard(report));
    caseActionsBody.appendChild(buildTagCard(report));
    return;
  }

  if (isUnassigned) {
    caseActionsBody.appendChild(buildTakeOwnershipCard(report));
    caseActionsBody.appendChild(buildFocusCommentCard());
  } else {
    caseActionsBody.appendChild(buildFocusCommentCard());
    caseActionsBody.appendChild(buildCollaborationCard(report));
    caseActionsBody.appendChild(buildAssignmentRequestCard(report));
    if (referredToYou) {
      caseActionsBody.appendChild(buildAcceptReferralCard(report));
    }
  }
}

// ===== ACTION CARD FACTORY =====
function createActionCard(title, description) {
  const card = document.createElement('div');
  card.className = 'action-card';
  const heading = document.createElement('strong');
  heading.textContent = title;
  const body = document.createElement('p');
  body.textContent = description;
  card.append(heading, body);
  return card;
}

// ===== REFER CARD =====
function buildReferCard(report) {
  const card = createActionCard('Refer to partner', 'Route this case to a trusted organization.');
  const select = document.createElement('select');
  select.innerHTML = '<option value="">Select partner</option>';
  PARTNER_ORGS.forEach((org) => {
    const option = document.createElement('option');
    option.value = org;
    option.textContent = org;
    select.appendChild(option);
  });
  if (report.referredTo) {
    select.value = report.referredTo;
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ghost-btn';
  button.textContent = 'Refer case';
  button.addEventListener('click', () => {
    if (!select.value) return;
    referCaseToPartner(report, select.value);
  });
  card.append(select, button);
  return card;
}

// ===== CLOSE CARD =====
function buildCloseCard(report) {
  const card = createActionCard('Mark as closed', 'Wrap up when the coalition confirms resolution.');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ghost-btn';
  button.textContent = 'Close case';
  button.addEventListener('click', () => markCaseClosed(report));
  card.append(button);
  return card;
}

// ===== TAG CARD =====
function buildTagCard(report) {
  const card = createActionCard('Tag collaborators', 'Notify partners who should track this case.');
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '@partner or @user';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ghost-btn';
  button.textContent = 'Add tag';
  button.addEventListener('click', () => {
    const value = input.value.trim();
    if (!value) return;
    tagCollaborator(report, value);
    input.value = '';
  });
  card.append(input, button);
  return card;
}

// ===== OWNERSHIP CARD =====
function buildTakeOwnershipCard(report) {
  const orgLabel = activeUser?.org ?? 'Coalition of Care Dispatch';
  const card = createActionCard('Take responsibility', `Claim this case for ${orgLabel}.`);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'primary-btn';
  button.textContent = 'Assign to me';
  button.addEventListener('click', () => takeCaseOwnership(report));
  card.append(button);
  return card;
}

// ===== COMMENT CTA CARD =====
function buildFocusCommentCard() {
  const card = createActionCard('Leave a comment', 'Share observations with the current case owner.');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ghost-btn';
  button.textContent = 'Jump to comment box';
  button.addEventListener('click', () => {
    commentField.focus();
    commentColumn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  card.append(button);
  return card;
}

// ===== COLLAB REQUEST CARD =====
function buildCollaborationCard(report) {
  const card = createActionCard('Request collaboration', 'Ask the owner to add you to this case.');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ghost-btn';
  button.textContent = 'Request collaboration';
  button.addEventListener('click', () => requestCollaboration(report));
  card.append(button);
  return card;
}

// ===== ASSIGNMENT REQUEST CARD =====
function buildAssignmentRequestCard(report) {
  const card = createActionCard('Request to assume case', 'Offer to become the lead for this report.');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ghost-btn';
  button.textContent = 'Request assignment';
  button.addEventListener('click', () => requestAssignment(report));
  card.append(button);
  return card;
}

// ===== ACCEPT REFERRAL CARD =====
function buildAcceptReferralCard(report) {
  const orgLabel = activeUser?.org ?? 'your team';
  const card = createActionCard('Accept referral', `This case was referred to ${orgLabel}.`);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'primary-btn';
  button.textContent = 'Accept case';
  button.addEventListener('click', () => acceptReferral(report));
  card.append(button);
  return card;
}

// ===== REFER ACTION =====
function referCaseToPartner(report, partner) {
  updateCase(report, { referredTo: partner, status: 'Referred' });
  addThreadEntry(
    report.id,
    'notes',
    `Referred to ${partner} with supporting documents.`,
    getCurrentUserLabel(report),
  );
}

// ===== CLOSE ACTION =====
function markCaseClosed(report) {
  updateCase(report, { status: 'Closed', referredTo: '' });
  addThreadEntry(report.id, 'notes', 'Marked case as closed for coalition tracking.', getCurrentUserLabel(report));
}

// ===== TAG ACTION =====
function tagCollaborator(report, collaborator) {
  report.collaborators = report.collaborators ?? [];
  if (report.collaborators.includes(collaborator)) return;
  const updated = [...report.collaborators, collaborator];
  updateCase(report, { collaborators: updated }, { touch: false });
}

// ===== OWNERSHIP ACTION =====
function takeCaseOwnership(report) {
  if (!activeUser) return;
  updateCase(report, { responsibility: activeUser.org, referredTo: '' });
  addThreadEntry(report.id, 'notes', 'Took ownership of this case.', getCurrentUserLabel(report));
}

// ===== REQUEST COLLAB ACTION =====
function requestCollaboration(report) {
  addThreadEntry(
    report.id,
    'comments',
    'Requested to collaborate on this case.',
    getCurrentUserLabel(report),
  );
}

// ===== REQUEST OWNERSHIP ACTION =====
function requestAssignment(report) {
  addThreadEntry(
    report.id,
    'comments',
    'Requested to assume lead responsibility for this case.',
    getCurrentUserLabel(report),
  );
}

// ===== ACCEPT REFERRAL ACTION =====
function acceptReferral(report) {
  if (!activeUser) return;
  updateCase(report, { responsibility: activeUser.org, referredTo: '', status: 'In progress' });
  addThreadEntry(
    report.id,
    'comments',
    'Accepted referred case and moved to in-progress.',
    getCurrentUserLabel(report),
  );
}

// ===== COMMENT FORM HANDLER =====
function handleCommentSubmit(event) {
  event.preventDefault();
  if (!selectedCase) return;
  const text = commentField.value.trim();
  if (!text) return;
  const replyContext =
    commentReplyTarget && commentReplyTarget.reportId === selectedCase.id
      ? commentReplyTarget.entry
      : null;
  addThreadEntry(selectedCase.id, 'comments', text, getCurrentUserLabel(selectedCase), {
    replyTo: replyContext,
  });
  commentField.value = '';
  clearReplyTarget();
}

// ===== NOTE FORM HANDLER =====
function handleNoteSubmit(event) {
  event.preventDefault();
  if (!selectedCase) return;
  if (!isCaseOwner(selectedCase)) return;
  const text = noteField.value.trim();
  if (!text) return;
  addThreadEntry(selectedCase.id, 'notes', text, getCurrentUserLabel(selectedCase));
  noteField.value = '';
}

// ===== PANEL CLOSE ACTION =====
function closeCasePanel() {
  selectedCase = null;
  clearReplyTarget();
  casePanel.classList.add('hidden');
  if (map.getLayer('cases-layer')) {
    map.setPaintProperty('cases-layer', 'circle-stroke-width', 1.2);
  }
}

// ===== MAP HIGHLIGHT =====
function highlightMap(report) {
  if (!map.getSource('cases')) return;
  map.resize();
  map.flyTo({ center: report.coordinates, zoom: 14, speed: 0.7 });
  map.setPaintProperty('cases-layer', 'circle-stroke-width', [
    'case',
    ['==', ['get', 'id'], report.id],
    3,
    1.2,
  ]);
}

// ===== SORT UTILITY =====
function sortReportsBy(items, field) {
  return [...items].sort((a, b) => new Date(b[field]) - new Date(a[field]));
}

// ===== ADDRESS LABEL =====
function formatCaseAddress(report) {
  return `${report.address} · ${report.councilDistrict}`;
}

// ===== RESPONSIBILITY LABEL =====
function getResponsibilityLabel(report) {
  return report.responsibility && report.responsibility !== 'Unassigned'
    ? report.responsibility
    : 'Unassigned';
}

// ===== STATUS PILL BUILDER =====
function formatStatusPill(status) {
  if (!status) return '';
  const slug = status.toLowerCase().replace(/\s+/g, '-');
  return `<span class="status-pill status-pill--${slug}">${status.toUpperCase()}</span>`;
}

// ===== ABSOLUTE DATE FORMATTER =====
function formatAbsoluteDate(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

// ===== RELATIVE DATE FORMATTER =====
function formatRelativeDate(isoString) {
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const target = new Date(isoString);
  const diffMs = target.getTime() - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour');
  }
  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, 'day');
}

// ===== GEOJSON TRANSFORM =====
function toGeoJSON(items) {
  return {
    type: 'FeatureCollection',
    features: items.map((report) => ({
      type: 'Feature',
      properties: {
        id: report.id,
        color: PRIORITY_COLORS[report.priority] ?? '#ea580c',
      },
      geometry: {
        type: 'Point',
        coordinates: report.coordinates,
      },
    })),
  };
}

// ===== MAP SOURCE REFRESH =====
function refreshMapSource(data = getFilteredReports()) {
  if (mapReady && map.getSource('cases')) {
    map.getSource('cases').setData(toGeoJSON(data));
  }
}

// ===== THREAD STATE ACCESS =====
function getCaseThreads(caseId) {
  if (!engagementState[caseId]) {
    engagementState[caseId] = { comments: [], notes: [] };
  }
  return engagementState[caseId];
}

// ===== THREAD ITEM BUILDER =====
function renderThreadItems(listEl, entries, type, options = {}) {
  listEl.innerHTML = '';
  if (!entries.length) {
    const emptyMsg = document.createElement('li');
    emptyMsg.className = 'thread-empty';
    emptyMsg.textContent =
      type === 'comment'
        ? 'No public responses yet. Invite residents to weigh in.'
        : 'No coalition notes saved. Capture next steps here.';
    listEl.appendChild(emptyMsg);
    return;
  }

  const allowReply = Boolean(options.allowReply);
  const contextReport = options.report ?? selectedCase;
  const currentUserLabel = contextReport ? getCurrentUserLabel(contextReport) : CURRENT_USER.name;

  entries.forEach((entry) => {
    const li = document.createElement('li');
    if (entry.replyTo) {
      const preview = document.createElement('div');
      preview.className = 'reply-preview';
      preview.textContent = `${entry.replyTo.author}: ${entry.replyTo.text}`;
      li.appendChild(preview);
    }
    const author = document.createElement('strong');
    author.textContent = entry.author;
    const body = document.createElement('p');
    body.textContent = entry.text;
    const timestamp = document.createElement('span');
    timestamp.className = 'thread-timestamp';
    timestamp.textContent = formatThreadTimestamp(entry.createdAt);
    li.append(author, body, timestamp);

    if (
      type === 'comment' &&
      allowReply &&
      entry.author !== currentUserLabel &&
      contextReport &&
      isCaseOwner(contextReport)
    ) {
      const replyBtn = document.createElement('button');
      replyBtn.type = 'button';
      replyBtn.className = 'ghost-btn ghost-btn--small';
      replyBtn.textContent = 'Reply';
      replyBtn.addEventListener('click', () => setReplyTarget(contextReport, entry));
      li.appendChild(replyBtn);
    }

    listEl.appendChild(li);
  });
}

// ===== THREAD ADDITION =====
function addThreadEntry(caseId, threadType, text, author, options = {}) {
  const threads = getCaseThreads(caseId);
  const bucket = threads[threadType];
  const entry = {
    id: `${threadType}-${caseId}-${Date.now()}`,
    author,
    text,
    createdAt: new Date().toISOString(),
  };
  if (options.replyTo) {
    entry.replyTo = {
      id: options.replyTo.id,
      author: options.replyTo.author,
      text: options.replyTo.text,
    };
  }
  bucket.push(entry);
  bucket.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  saveEngagementState();
  if (selectedCase && selectedCase.id === caseId) {
    renderThreads(selectedCase);
  }
}

// ===== REPLY TARGET SETTER =====
function setReplyTarget(report, entry) {
  if (!isCaseOwner(report)) return;
  commentReplyTarget = { reportId: report.id, entry };
  replyHint.textContent = `Replying to ${entry.author}`;
  replyHint.classList.remove('is-hidden');
  cancelReplyBtn.classList.remove('is-hidden');
  commentField.placeholder = `Reply to ${entry.author}`;
  commentField.focus();
}

// ===== REPLY TARGET CLEAR =====
function clearReplyTarget() {
  commentReplyTarget = null;
  replyHint.textContent = '';
  replyHint.classList.add('is-hidden');
  cancelReplyBtn.classList.add('is-hidden');
  commentField.placeholder = 'Leave a comment';
}

// ===== THREAD COUNT LABEL =====
function formatThreadCount(count, noun, emptyLabel = 'No entries yet') {
  if (!count) {
    return emptyLabel;
  }
  const needsPlural = count !== 1;
  return `${count} ${noun}${needsPlural ? 's' : ''}`;
}

// ===== THREAD TIMESTAMP LABEL =====
function formatThreadTimestamp(isoString) {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

// ===== REPORTER DESCRIPTION BUILDER =====
function formatReporterDescription(report) {
  if (!report.reporter) return 'Reporter details unavailable.';
  const { description, submittedAt, name, type } = report.reporter;
  const date = formatAbsoluteDate(submittedAt ?? report.reportedAt);
  const attribution = [name, type].filter(Boolean).join(' · ');
  return `${date} — ${description} (${attribution})`;
}

// ===== REPORTER META BUILDER =====
function formatReporterMeta(report) {
  if (!report.reporter) return 'Not provided';
  const { name, role, type } = report.reporter;
  return [name, role ?? type].filter(Boolean).join(' · ');
}

// ===== CONTACTED AGENCY LABEL =====
function formatContactedAgency(report) {
  if (!report.contactedAnotherAgency) return 'None reported';
  return report.contactedAgency || 'Another agency notified';
}

// ===== OPTIONAL CONTACT LABEL =====
function formatOptionalContact(report) {
  if (!report.optionalContact) return 'Not on file';
  const { name, phone, email } = report.optionalContact;
  return [name, phone, email].filter(Boolean).join(' • ');
}

// ===== USER LABEL =====
function getCurrentUserLabel(report) {
  if (!activeUser) return 'Guest contributor';
  return isCaseOwner(report) ? `${activeUser.name} (${activeUser.org})` : activeUser.name;
}

// ===== OWNERSHIP CHECK =====
function isCaseOwner(report) {
  return Boolean(activeUser) && report.responsibility === activeUser.org;
}

// ===== UNASSIGNED CHECK =====
function isCaseUnassigned(report) {
  return !report.responsibility || report.responsibility === 'Unassigned';
}

// ===== CASE UPDATE PIPELINE =====
function updateCase(report, updates = {}, options = {}) {
  const mergedUpdates = { ...updates };
  if (options.touch !== false) {
    mergedUpdates.lastEngaged = new Date().toISOString();
  }
  Object.assign(report, mergedUpdates);
  persistCaseUpdate(report.id, mergedUpdates);
  renderLists();
  refreshMapSource();
  if (selectedCase && selectedCase.id === report.id) {
    renderCasePanel(report);
  }
}

// ===== CASE STATE PERSIST =====
function persistCaseUpdate(caseId, updates) {
  const record = caseState[caseId] ?? {};
  Object.entries(updates).forEach(([key, value]) => {
    record[key] = Array.isArray(value) ? [...value] : value;
  });
  caseState[caseId] = record;
  saveCaseState();
}

// ===== ENGAGEMENT LOAD =====
function loadEngagementState() {
  if (!CAN_USE_STORAGE) {
    return JSON.parse(JSON.stringify(SEED_ENGAGEMENT));
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Unable to load engagement state', error);
  }
  return JSON.parse(JSON.stringify(SEED_ENGAGEMENT));
}

// ===== ENGAGEMENT SAVE =====
function saveEngagementState() {
  if (!CAN_USE_STORAGE) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(engagementState));
  } catch (error) {
    console.warn('Unable to save engagement state', error);
  }
}

// ===== CASE STATE LOAD =====
function loadCaseState() {
  if (!CAN_USE_STORAGE) {
    return {};
  }
  try {
    const stored = localStorage.getItem(CASE_STATE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Unable to load case state', error);
    return {};
  }
}

// ===== CASE STATE SAVE =====
function saveCaseState() {
  if (!CAN_USE_STORAGE) return;
  try {
    localStorage.setItem(CASE_STATE_KEY, JSON.stringify(caseState));
  } catch (error) {
    console.warn('Unable to save case state', error);
  }
}

// ===== APPLY CASE OVERRIDES =====
function applyCaseStateOverrides() {
  reports.forEach((report) => {
    const stored = caseState[report.id];
    if (!stored) return;
    Object.entries(stored).forEach(([key, value]) => {
      report[key] = Array.isArray(value) ? [...value] : value;
    });
  });
}

// ===== ENGAGEMENT SEEDER =====
function bootstrapEngagementSeeds(reportList) {
  if (!CAN_USE_STORAGE) return;
  if (Object.keys(engagementState).length) return;
  reportList.slice(0, 3).forEach((report, index) => {
    engagementState[report.id] = {
      comments: [
        {
          id: `seed-comment-${report.id}`,
          author: `${report.neighborhood} neighbor`,
          text: `Checking in on the ${report.caseFocus?.toLowerCase() ?? 'reported issue'}.`,
          createdAt: new Date(Date.now() - (index + 2) * 60 * 60 * 1000).toISOString(),
        },
      ],
      notes: [
        {
          id: `seed-note-${report.id}`,
          author: 'Coalition dispatcher',
          text: `Coordinating response plan for ${report.caseFocus?.toLowerCase() ?? 'this case'}.`,
          createdAt: new Date(Date.now() - (index + 1) * 45 * 60 * 1000).toISOString(),
        },
      ],
    };
  });
  saveEngagementState();
}

// ===== REPORT TRANSFORMER =====
function transformReport(record) {
  const focus = record.casePriority?.focus ?? 'Community concern';
  const description =
    record.notes ||
    `Community partners flagged ${focus.toLowerCase()} at ${record.location?.address ?? 'this site'}.`;
  return {
    id: record.id,
    title: buildCaseTitle(record, focus),
    address: record.location?.address ?? 'Unspecified address',
    councilDistrict: record.location?.councilDistrict ?? 'District',
    neighborhood: record.location?.neighborhood ?? 'Philadelphia',
    caseType: record.caseType ?? 'Case',
    priority: record.casePriority?.level ?? 'medium',
    status: formatStatusLabel(record.status),
    responsibility: determineResponsibility(record),
    reportedAt: record.createdAt,
    lastEngaged: record.lastEngaged ?? record.createdAt,
    description,
    coordinates: record.location?.coordinates ?? [-75.1635, 39.9526],
    tags: focus ? [focus] : [],
    reporter: {
      name: record.optionalContact?.name ?? 'Community reporter',
      role: record.optionalContact ? 'Resident contact' : 'Hotline submission',
      type: record.optionalContact ? 'Community member' : 'Anonymous',
      submittedAt: record.createdAt,
      description,
    },
    contactedAnotherAgency: record.contactedAnotherAgency,
    contactedAgency: record.contactedAgency,
    optionalContact: record.optionalContact,
    referredTo: '',
    collaborators: [],
    caseFocus: focus,
  };
}

// ===== CASE TITLE BUILDER =====
function buildCaseTitle(record, focus) {
  const neighborhood = record.location?.neighborhood ?? 'community';
  const focusLabel = focus ? formatStatusLabel(focus) : 'Community issue';
  return `${focusLabel} in ${neighborhood}`;
}

// ===== RESPONSIBILITY PICKER =====
function determineResponsibility(record) {
  if (record.unread) return 'Unassigned';
  if (record.contactedAgency) return record.contactedAgency;
  return 'Coalition of Care Dispatch';
}

// ===== STATUS LABEL FORMATTER =====
function formatStatusLabel(rawStatus) {
  if (!rawStatus) return 'Under review';
  return rawStatus
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ===== AUTH TOGGLE =====
function toggleAuthentication() {
  activeUser = activeUser ? null : { ...CURRENT_USER };
  updateAuthUI();
  if (selectedCase) {
    renderCasePanel(selectedCase);
  } else {
    renderLists();
  }
}

// ===== AUTH UI SYNC =====
function updateAuthUI() {
  if (!authToggle || !userNameEl || !userOrgEl) return;
  if (activeUser) {
    userNameEl.textContent = activeUser.name;
    userOrgEl.textContent = activeUser.org;
    authToggle.textContent = 'Log out';
  } else {
    userNameEl.textContent = 'Guest';
    userOrgEl.textContent = 'Log in to collaborate';
    authToggle.textContent = 'Log in';
  }
}
