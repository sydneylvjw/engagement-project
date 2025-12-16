import maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@3.6.2/+esm';

const PRIORITY_COLORS = {
  urgent: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#0ea5e9',
};

const CURRENT_USER = {
  id: 'coalition-dispatch',
  name: 'Coalition Dispatcher',
  org: 'Coalition of Care Dispatch',
};

const PARTNER_ORGS = [
  'Housing Mutual Aid Network',
  'Community Legal Services',
  'Neighborhood Safety Desk',
  'Tenant Health Collective',
  'Mutual Aid Logistics Team',
];

const reports = [
  {
    id: 'R-2031',
    title: 'No heat, boiler outage',
    address: '1417 W Girard Ave',
    councilDistrict: 'District 5',
    neighborhood: 'Francisville',
    caseType: 'Utilities',
    priority: 'urgent',
    status: 'Needs urgent assistance',
    responsibility: 'Housing Mutual Aid Network',
    reportedAt: '2025-10-27T14:32:00Z',
    lastEngaged: '2025-10-28T09:15:00Z',
    description:
      'Tenant collective reported apartment temp below 60°F across multiple floors. Elderly residents requesting temporary heaters.',
    coordinates: [-75.1612, 39.9726],
    tags: ['Heating', 'Urgent'],
    reporter: {
      name: 'Latoya H.',
      role: 'Tenant captain',
      type: 'Community member',
      submittedAt: '2025-10-27T13:58:00Z',
      description:
        'I called because the radiators are ice cold and steam is pouring into the stairwell. Folks are sleeping in coats.',
    },
    contactedAnotherAgency: true,
    contactedAgency: 'Licenses & Inspections emergency line',
    optionalContact: {
      name: 'Latoya H.',
      email: 'latoya.h@neighborsunited.org',
      phone: '(215) 555-4173',
    },
    referredTo: '',
    collaborators: ['Heating Strike Team'],
  },
  {
    id: 'R-2027',
    title: 'Water infiltration in stairwell',
    address: '2230 N 16th St',
    councilDistrict: 'District 5',
    neighborhood: 'Sharswood',
    caseType: 'Maintenance',
    priority: 'high',
    status: 'In progress',
    responsibility: 'Coalition of Care Dispatch',
    reportedAt: '2025-10-26T21:04:00Z',
    lastEngaged: '2025-10-28T13:45:00Z',
    description:
      'Rain from the weekend entered stairwell and damaged fire-rated doors. Photos indicate mold growth along baseboards.',
    coordinates: [-75.157, 39.9892],
    tags: ['Mold watch'],
    reporter: {
      name: 'Devon R.',
      role: 'Resident organizer',
      type: 'Community member',
      submittedAt: '2025-10-26T18:40:00Z',
      description:
        'I saw water leaking in from the rain and it is running down the stairs. The doors are warped and smell like mold.',
    },
    contactedAnotherAgency: false,
    contactedAgency: '',
    optionalContact: {
      name: 'Devon R.',
      email: 'devon.r@mutualaid.org',
      phone: '(267) 555-8094',
    },
    referredTo: '',
    collaborators: ['Building Stewards', 'Legal Hotline'],
  },
  {
    id: 'R-2025',
    title: 'Uncollected trash blocking egress',
    address: '501 W Norris St',
    councilDistrict: 'District 7',
    neighborhood: 'Ludlow',
    caseType: 'Solid waste',
    priority: 'medium',
    status: 'Under review',
    responsibility: 'Unassigned',
    reportedAt: '2025-10-25T15:20:00Z',
    lastEngaged: '2025-10-27T10:22:00Z',
    description:
      'Mutual aid partner noted overflowing dumpsters and rodents. Coalition coordinating with sanitation nonprofit for removal.',
    coordinates: [-75.1407, 39.9814],
    tags: ['Sanitation'],
    reporter: {
      name: 'Marcus T.',
      role: 'Block captain',
      type: 'Community member',
      submittedAt: '2025-10-25T12:05:00Z',
      description:
        'Their yard is full of garbage and making the neighborhood look bad. Kids have to walk in the street.',
    },
    contactedAnotherAgency: true,
    contactedAgency: 'Sanitation 311 intake',
    optionalContact: {
      name: 'Marcus T.',
      email: 'marcus.t@blockcaptains.org',
      phone: '(215) 555-1120',
    },
    referredTo: '',
    collaborators: ['Neighborhood Sanitation Crew'],
  },
  {
    id: 'R-2022',
    title: 'Locked emergency exits',
    address: '722 Tasker St',
    councilDistrict: 'District 1',
    neighborhood: 'Passyunk Square',
    caseType: 'Life safety',
    priority: 'high',
    status: 'Referred',
    responsibility: 'Neighborhood Safety Desk',
    reportedAt: '2025-10-24T18:30:00Z',
    lastEngaged: '2025-10-28T08:07:00Z',
    description:
      'Residents documented chained rear exit doors. Coalition counsel preparing notice to landlord and city safety office.',
    coordinates: [-75.1575, 39.9298],
    tags: ['Fire watch'],
    reporter: {
      name: 'Nicole T.',
      role: 'Parent volunteer',
      type: 'Community member',
      submittedAt: '2025-10-24T16:12:00Z',
      description:
        'The exit doors are chained shut every night. If there is a fire we cannot get out with the kids.',
    },
    contactedAnotherAgency: false,
    contactedAgency: '',
    optionalContact: {
      name: 'Nicole T.',
      email: 'nicole.torres@gmail.com',
      phone: '(267) 555-2240',
    },
    referredTo: 'Coalition of Care Dispatch',
    collaborators: ['Fire Safety Advocates'],
  },
  {
    id: 'R-2019',
    title: 'Lead paint chipping',
    address: '1816 Dickinson St',
    councilDistrict: 'District 2',
    neighborhood: 'Point Breeze',
    caseType: 'Health',
    priority: 'medium',
    status: 'Needs follow up',
    responsibility: 'Tenant Health Collective',
    reportedAt: '2025-10-23T12:55:00Z',
    lastEngaged: '2025-10-27T16:12:00Z',
    description:
      'Family with toddlers observed paint chips throughout windowsills. Coalition nurse scheduled for follow-up on-site.',
    coordinates: [-75.1756, 39.9344],
    tags: ['Lead'],
    reporter: {
      name: 'Shawnice B.',
      role: 'Parent',
      type: 'Community member',
      submittedAt: '2025-10-23T11:45:00Z',
      description:
        'Paint is peeling off the windows and we keep sweeping up chips. My toddler has dust on her toys.',
    },
    contactedAnotherAgency: true,
    contactedAgency: 'Department of Public Health hotline',
    optionalContact: {
      name: 'Shawnice B.',
      email: 'shawniceb@gmail.com',
      phone: '(215) 555-7421',
    },
    referredTo: '',
    collaborators: ['Health Desk Liaisons'],
  },
];

reports.forEach((report) => {
  if (!Array.isArray(report.tags)) report.tags = [];
  if (!Array.isArray(report.collaborators)) report.collaborators = [];
  report.referredTo = report.referredTo ?? '';
});

const SEED_ENGAGEMENT = {
  'R-2031': {
    comments: [
      {
        id: 'c-r-2031-1',
        author: 'Tenant captain A. Lewis',
        text: 'Shared photos of the boilers with the housing collective. Waiting on vendor ETA.',
        createdAt: '2025-10-28T21:10:00Z',
      },
    ],
    notes: [
      {
        id: 'n-r-2031-1',
        author: 'Coalition dispatcher',
        text: 'Need to confirm heater delivery schedule before 6 p.m. curfew.',
        createdAt: '2025-10-28T22:45:00Z',
      },
    ],
  },
  'R-2027': {
    comments: [
      {
        id: 'c-r-2027-1',
        author: 'Sharswood safety team',
        text: 'Residents ready to help tarp stairwell tonight if supplies arrive.',
        createdAt: '2025-10-28T17:05:00Z',
      },
    ],
    notes: [
      {
        id: 'n-r-2027-1',
        author: 'Legal triage',
        text: 'Prepping notice for landlord citing safety violations.',
        createdAt: '2025-10-28T18:15:00Z',
      },
    ],
  },
  'R-2025': {
    comments: [
      {
        id: 'c-r-2025-1',
        author: 'North Philly Cleaners',
        text: 'Volunteers can do a trash pickup Saturday morning.',
        createdAt: '2025-10-27T14:30:00Z',
      },
    ],
    notes: [
      {
        id: 'n-r-2025-1',
        author: 'Operations desk',
        text: 'Coordinate with sanitation nonprofit for bins/hauling.',
        createdAt: '2025-10-27T15:10:00Z',
      },
    ],
  },
  'R-2022': {
    comments: [
      {
        id: 'c-r-2022-1',
        author: 'Block captain N. Torres',
        text: 'Parents are documenting exit doors nightly for escalation.',
        createdAt: '2025-10-28T12:50:00Z',
      },
    ],
    notes: [
      {
        id: 'n-r-2022-1',
        author: 'Safety counsel',
        text: 'Drafted letter to landlord. Need signatures from residents.',
        createdAt: '2025-10-28T13:05:00Z',
      },
    ],
  },
  'R-2019': {
    comments: [
      {
        id: 'c-r-2019-1',
        author: 'Point Breeze health team',
        text: 'Family requested dust masks for weekend cleaning.',
        createdAt: '2025-10-27T20:00:00Z',
      },
    ],
    notes: [
      {
        id: 'n-r-2019-1',
        author: 'Health desk',
        text: 'Nurse visit scheduled for Friday morning. Bring lead test kits.',
        createdAt: '2025-10-27T21:35:00Z',
      },
    ],
  },
};

const STORAGE_KEY = 'flicr-engagement-v1';
const CASE_STATE_KEY = 'flicr-case-state-v1';
const CAN_USE_STORAGE =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const engagementState = loadEngagementState();
const caseState = loadCaseState();
applyCaseStateOverrides();

let selectedCase = null;
let commentReplyTarget = null;

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

const caseSummaryFields = {
  status: document.getElementById('case-status'),
  title: document.getElementById('case-title'),
  address: document.getElementById('case-address'),
  type: document.getElementById('case-type-summary'),
  responsibility: document.getElementById('case-responsibility-summary'),
};

const caseHeaderFields = {
  status: document.getElementById('case-status-detail'),
  title: document.getElementById('case-title-detail'),
  address: document.getElementById('case-address-detail'),
};

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

closeCaseBtn.addEventListener('click', () => closeCasePanel());
commentForm.addEventListener('submit', handleCommentSubmit);
noteForm.addEventListener('submit', handleNoteSubmit);
cancelReplyBtn.addEventListener('click', () => clearReplyTarget());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCasePanel();
});

renderLists();

function renderLists() {
  renderReportList(recentList, sortReportsBy('reportedAt'), 'reportedAt');
  renderReportList(activityList, sortReportsBy('lastEngaged'), 'lastEngaged');
}

function renderReportList(listEl, items, dateField) {
  listEl.innerHTML = '';
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

function focusOnReport(report) {
  selectedCase = report;
  renderCasePanel(report);
  highlightMap(report);
}

function renderCasePanel(report) {
  updateSummary(report);
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

function updateSummary(report) {
  caseSummaryFields.status.textContent = report.status;
  caseSummaryFields.title.textContent = report.title;
  caseSummaryFields.address.textContent = formatCaseAddress(report);
  caseSummaryFields.type.textContent = report.caseType ?? 'Case';
  caseSummaryFields.responsibility.textContent = getResponsibilityLabel(report);
}

function updateCaseHeader(report) {
  caseHeaderFields.status.textContent = report.status;
  caseHeaderFields.title.textContent = report.title;
  caseHeaderFields.address.textContent = formatCaseAddress(report);
}

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
    notePermissions.textContent = 'Only case owners can capture internal notes.';
    noteField.value = '';
  } else {
    notePermissions.textContent = '';
  }
}

function renderCaseActions(report) {
  caseActionsBody.innerHTML = '';
  const isOwner = isCaseOwner(report);
  const isUnassigned = isCaseUnassigned(report);
  const referredToYou = Boolean(report.referredTo && report.referredTo === CURRENT_USER.org);

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

function buildTakeOwnershipCard(report) {
  const card = createActionCard('Take responsibility', 'Claim this case for the Coalition of Care Dispatch.');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'primary-btn';
  button.textContent = 'Assign to me';
  button.addEventListener('click', () => takeCaseOwnership(report));
  card.append(button);
  return card;
}

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

function buildAcceptReferralCard(report) {
  const card = createActionCard('Accept referral', `This case was referred to ${CURRENT_USER.org}.`);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'primary-btn';
  button.textContent = 'Accept case';
  button.addEventListener('click', () => acceptReferral(report));
  card.append(button);
  return card;
}

function referCaseToPartner(report, partner) {
  updateCase(report, { referredTo: partner, status: 'Referred' });
  addThreadEntry(
    report.id,
    'notes',
    `Referred to ${partner} with supporting documents.`,
    getCurrentUserLabel(report),
  );
}

function markCaseClosed(report) {
  updateCase(report, { status: 'Closed', referredTo: '' });
  addThreadEntry(report.id, 'notes', 'Marked case as closed for coalition tracking.', getCurrentUserLabel(report));
}

function tagCollaborator(report, collaborator) {
  report.collaborators = report.collaborators ?? [];
  if (report.collaborators.includes(collaborator)) return;
  const updated = [...report.collaborators, collaborator];
  updateCase(report, { collaborators: updated }, { touch: false });
}

function takeCaseOwnership(report) {
  updateCase(report, { responsibility: CURRENT_USER.org, referredTo: '' });
  addThreadEntry(report.id, 'notes', 'Took ownership of this case.', getCurrentUserLabel(report));
}

function requestCollaboration(report) {
  addThreadEntry(
    report.id,
    'comments',
    'Requested to collaborate on this case.',
    getCurrentUserLabel(report),
  );
}

function requestAssignment(report) {
  addThreadEntry(
    report.id,
    'comments',
    'Requested to assume lead responsibility for this case.',
    getCurrentUserLabel(report),
  );
}

function acceptReferral(report) {
  updateCase(report, { responsibility: CURRENT_USER.org, referredTo: '', status: 'In progress' });
  addThreadEntry(
    report.id,
    'comments',
    'Accepted referred case and moved to in-progress.',
    getCurrentUserLabel(report),
  );
}

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

function handleNoteSubmit(event) {
  event.preventDefault();
  if (!selectedCase) return;
  if (!isCaseOwner(selectedCase)) return;
  const text = noteField.value.trim();
  if (!text) return;
  addThreadEntry(selectedCase.id, 'notes', text, getCurrentUserLabel(selectedCase));
  noteField.value = '';
}

function closeCasePanel() {
  selectedCase = null;
  clearReplyTarget();
  casePanel.classList.add('hidden');
  if (map.getLayer('cases-layer')) {
    map.setPaintProperty('cases-layer', 'circle-stroke-width', 1.2);
  }
}

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

function sortReportsBy(field) {
  return [...reports].sort((a, b) => new Date(b[field]) - new Date(a[field]));
}

function formatCaseAddress(report) {
  return `${report.address} · ${report.councilDistrict}`;
}

function getResponsibilityLabel(report) {
  return report.responsibility && report.responsibility !== 'Unassigned'
    ? report.responsibility
    : 'Unassigned';
}

function formatStatusPill(status) {
  if (!status) return '';
  const slug = status.toLowerCase().replace(/\s+/g, '-');
  return `<span class="status-pill status-pill--${slug}">${status.toUpperCase()}</span>`;
}

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

function refreshMapSource() {
  if (mapReady && map.getSource('cases')) {
    map.getSource('cases').setData(toGeoJSON(reports));
  }
}

function getCaseThreads(caseId) {
  if (!engagementState[caseId]) {
    engagementState[caseId] = { comments: [], notes: [] };
  }
  return engagementState[caseId];
}

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

function setReplyTarget(report, entry) {
  if (!isCaseOwner(report)) return;
  commentReplyTarget = { reportId: report.id, entry };
  replyHint.textContent = `Replying to ${entry.author}`;
  replyHint.classList.remove('is-hidden');
  cancelReplyBtn.classList.remove('is-hidden');
  commentField.placeholder = `Reply to ${entry.author}`;
  commentField.focus();
}

function clearReplyTarget() {
  commentReplyTarget = null;
  replyHint.textContent = '';
  replyHint.classList.add('is-hidden');
  cancelReplyBtn.classList.add('is-hidden');
  commentField.placeholder = 'Leave a comment';
}

function formatThreadCount(count, noun, emptyLabel = 'No entries yet') {
  if (!count) {
    return emptyLabel;
  }
  const needsPlural = count !== 1;
  return `${count} ${noun}${needsPlural ? 's' : ''}`;
}

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

function formatReporterDescription(report) {
  if (!report.reporter) return 'Reporter details unavailable.';
  const { description, submittedAt, name, type } = report.reporter;
  const date = formatAbsoluteDate(submittedAt ?? report.reportedAt);
  const attribution = [name, type].filter(Boolean).join(' · ');
  return `${date} — ${description} (${attribution})`;
}

function formatReporterMeta(report) {
  if (!report.reporter) return 'Not provided';
  const { name, role, type } = report.reporter;
  return [name, role ?? type].filter(Boolean).join(' · ');
}

function formatContactedAgency(report) {
  if (!report.contactedAnotherAgency) return 'None reported';
  return report.contactedAgency || 'Another agency notified';
}

function formatOptionalContact(report) {
  if (!report.optionalContact) return 'Not on file';
  const { name, phone, email } = report.optionalContact;
  return [name, phone, email].filter(Boolean).join(' • ');
}

function getCurrentUserLabel(report) {
  return isCaseOwner(report)
    ? `${CURRENT_USER.name} (${CURRENT_USER.org})`
    : CURRENT_USER.name;
}

function isCaseOwner(report) {
  return report.responsibility === CURRENT_USER.org;
}

function isCaseUnassigned(report) {
  return !report.responsibility || report.responsibility === 'Unassigned';
}

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

function persistCaseUpdate(caseId, updates) {
  const record = caseState[caseId] ?? {};
  Object.entries(updates).forEach(([key, value]) => {
    record[key] = Array.isArray(value) ? [...value] : value;
  });
  caseState[caseId] = record;
  saveCaseState();
}

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

function saveCaseState() {
  if (!CAN_USE_STORAGE) return;
  try {
    localStorage.setItem(CASE_STATE_KEY, JSON.stringify(caseState));
  } catch (error) {
    console.warn('Unable to save case state', error);
  }
}

function applyCaseStateOverrides() {
  reports.forEach((report) => {
    const stored = caseState[report.id];
    if (!stored) return;
    Object.entries(stored).forEach(([key, value]) => {
      report[key] = Array.isArray(value) ? [...value] : value;
    });
  });
}
