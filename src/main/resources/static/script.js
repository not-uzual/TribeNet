// ==================== API BASE URL ====================
const API_BASE = '/api/v1';

// ==================== GLOBAL STATE ====================
let currentUser = null;
let authToken = null;
let allClubs = [];
let userClubs = [];
let allUsers = [];
let currentClubDetails = null;
let paymentClubId = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// ==================== AUTHENTICATION ====================
function checkAuth() {
    authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (authToken && userData) {
        currentUser = JSON.parse(userData);
        showMainApp();
    } else {
        showAuthSection();
    }
}

function showAuthSection() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('navbar').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    
    document.getElementById('userDisplay').textContent = currentUser.name || currentUser.username;
    
    // Show admin panel if user is admin
    if (currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    }
    
    loadDashboard();
}

// Toggle Auth Forms
function toggleAuthForm() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('registerForm').classList.toggle('hidden');
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const data = await response.json().catch(() => ({ error: 'Login failed' }));
            showToast(data.error || data.message || 'Invalid credentials', 'error');
            document.getElementById('loginPassword').value = '';
            return;
        }
        
        const data = await response.json();
        authToken = data.token;
        currentUser = data.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userData', JSON.stringify(currentUser));
        
        showToast('Login successful!', 'success');
        document.querySelector('#loginForm form').reset();
        showMainApp();
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please check your connection.', 'error');
    } finally {
        showLoading(false);
    }
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const name = document.getElementById('registerName').value;
    const password = document.getElementById('registerPassword').value;
    const roleElement = document.querySelector('input[name="registerRole"]:checked');
    const role = roleElement ? roleElement.value : 'USER';
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, name, password, role })
        });
        
        if (!response.ok) {
            const data = await response.json().catch(() => ({ error: 'Registration failed' }));
            showToast(data.error || data.message || 'Registration failed', 'error');
            return;
        }
        
        const data = await response.json();
        showToast(data.message || 'Registration successful! Please login.', 'success');
        toggleAuthForm();
        document.querySelector('#registerForm form').reset();
        
    } catch (error) {
        console.error('Register error:', error);
        showToast('Registration failed. Please check your connection.', 'error');
    } finally {
        showLoading(false);
    }
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    authToken = null;
    currentUser = null;
    allClubs = [];
    userClubs = [];
    allUsers = [];
    showAuthSection();
    showToast('Logged out successfully', 'success');
}

// ==================== NAVIGATION ====================
function showSection(sectionId) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Update sections
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    // Load section data
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'clubs':
            loadAllClubs();
            break;
        case 'myClubs':
            loadMyClubs();
            break;
        case 'users':
            loadAllUsers();
            break;
        case 'admin':
            loadAdminPanel();
            break;
    }
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    showLoading(true);
    
    try {
        // Load all clubs
        const clubsResponse = await apiCall(`${API_BASE}/clubs`);
        allClubs = clubsResponse;
        
        // Load user clubs
        const userClubsResponse = await apiCall(`${API_BASE}/users/${currentUser.id}/clubs`);
        userClubs = userClubsResponse;
        
        // Update stats
        document.getElementById('totalClubs').textContent = allClubs.length;
        document.getElementById('myClubsCount').textContent = userClubs.length;
        
        const adminClubs = userClubs.filter(club => club.clubRole === 'ADMIN');
        document.getElementById('adminClubsCount').textContent = adminClubs.length;
        
        // Show recent clubs
        const recentClubs = allClubs.slice(0, 6);
        renderClubs(recentClubs, 'recentClubsList');
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        showToast('Failed to load dashboard', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== CLUBS ====================
async function loadAllClubs() {
    showLoading(true);
    
    try {
        const response = await apiCall(`${API_BASE}/clubs`);
        allClubs = response;
        renderClubs(allClubs, 'allClubsList');
    } catch (error) {
        console.error('Clubs load error:', error);
        showToast('Failed to load clubs', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadMyClubs() {
    showLoading(true);
    
    try {
        const response = await apiCall(`${API_BASE}/users/${currentUser.id}/clubs`);
        userClubs = response;
        
        if (userClubs.length === 0) {
            document.getElementById('myClubsList').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <h3>No clubs yet</h3>
                    <p>Join a club to get started!</p>
                </div>
            `;
        } else {
            renderClubs(userClubs, 'myClubsList', true);
        }
    } catch (error) {
        console.error('My clubs load error:', error);
        showToast('Failed to load your clubs', 'error');
    } finally {
        showLoading(false);
    }
}

function renderClubs(clubs, containerId, showRole = false) {
    const container = document.getElementById(containerId);
    
    if (clubs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <h3>No clubs found</h3>
            </div>
        `;
        return;
    }
    
    container.innerHTML = clubs.map(club => {
        const fee = club.price || 0;
        const feeDisplay = fee > 0 ? `₹${fee}` : 'Free';
        const isAdmin = club.clubRole === 'ADMIN';
        const isMember = club.clubRole === 'MEMBER';
        
        return `
        <div class="club-card" onclick="showClubDetails(${club.id})">
            <h3>${escapeHtml(club.name)}</h3>
            <p>${escapeHtml(club.description)}</p>
            <div class="club-meta">
                <span class="club-fee">${feeDisplay}</span>
                <span class="club-members">👥 ${club.memberCount || 0} members</span>
            </div>
            ${showRole && isAdmin ? '<span class="club-badge badge-admin">ADMIN</span>' : ''}
            ${showRole && isMember ? '<span class="club-badge badge-member">MEMBER</span>' : ''}
        </div>
    `;
    }).join('');
}

function filterClubs() {
    const searchTerm = document.getElementById('clubSearch').value.toLowerCase();
    const filtered = allClubs.filter(club => 
        club.name.toLowerCase().includes(searchTerm) || 
        club.description.toLowerCase().includes(searchTerm) ||
        (club.category && club.category.toLowerCase().includes(searchTerm))
    );
    renderClubs(filtered, 'allClubsList');
}

// ==================== CLUB MODALS ====================
function showCreateClubModal() {
    document.getElementById('createClubModal').style.display = 'flex';
}

function closeCreateClubModal() {
    document.getElementById('createClubModal').style.display = 'none';
    document.querySelector('#createClubModal form').reset();
    document.getElementById('priceFieldGroup').style.display = 'none';
}

async function handleCreateClub(event) {
    event.preventDefault();
    
    const name = document.getElementById('clubName').value;
    const description = document.getElementById('clubDescription').value;
    const category = document.getElementById('clubCategory').value;
    const isFree = document.querySelector('input[name="clubType"]:checked').value === 'free';
    const price = isFree ? 0 : parseFloat(document.getElementById('clubPrice').value || 0);
    
    const clubData = {
        name,
        description,
        category,
        free: isFree,
        price: price
    };
    
    showLoading(true);
    
    try {
        await apiCall(`${API_BASE}/clubs`, {
            method: 'POST',
            body: JSON.stringify(clubData)
        });
        
        showToast('Club created successfully!', 'success');
        closeCreateClubModal();
        await loadAllClubs();
        await loadMyClubs();
        await loadDashboard();
    } catch (error) {
        console.error('Create club error:', error);
        showToast(error.message || 'Failed to create club', 'error');
    } finally {
        showLoading(false);
    }
}

function showEditClubModal(club) {
    document.getElementById('editClubId').value = club.id;
    document.getElementById('editClubName').value = club.name;
    document.getElementById('editClubDescription').value = club.description;
    document.getElementById('editClubCategory').value = club.category || '';
    
    const isFree = club.free || (club.price === 0);
    document.querySelector(`input[name="editClubType"][value="${isFree ? 'free' : 'paid'}"]`).checked = true;
    
    if (!isFree) {
        document.getElementById('editPriceFieldGroup').style.display = 'block';
        document.getElementById('editClubPrice').value = club.price || 0;
    } else {
        document.getElementById('editPriceFieldGroup').style.display = 'none';
    }
    
    document.getElementById('editClubModal').style.display = 'flex';
}

function closeEditClubModal() {
    document.getElementById('editClubModal').style.display = 'none';
    document.querySelector('#editClubModal form').reset();
    document.getElementById('editPriceFieldGroup').style.display = 'none';
}

async function handleEditClub(event) {
    event.preventDefault();
    
    const clubId = document.getElementById('editClubId').value;
    const name = document.getElementById('editClubName').value;
    const description = document.getElementById('editClubDescription').value;
    const category = document.getElementById('editClubCategory').value;
    const isFree = document.querySelector('input[name="editClubType"]:checked').value === 'free';
    const price = isFree ? 0 : parseFloat(document.getElementById('editClubPrice').value || 0);
    
    const clubData = {
        name,
        description,
        category,
        free: isFree,
        price: price
    };
    
    showLoading(true);
    
    try {
        await apiCall(`${API_BASE}/clubs/${clubId}`, {
            method: 'PUT',
            body: JSON.stringify(clubData)
        });
        
        showToast('Club updated successfully!', 'success');
        closeEditClubModal();
        await loadAllClubs();
        await loadMyClubs();
        
        if (currentClubDetails && currentClubDetails.id == clubId) {
            await showClubDetails(clubId);
        }
    } catch (error) {
        console.error('Update club error:', error);
        showToast(error.message || 'Failed to update club', 'error');
    } finally {
        showLoading(false);
    }
}

function togglePriceField() {
    const clubType = document.querySelector('input[name="clubType"]:checked').value;
    const priceFieldGroup = document.getElementById('priceFieldGroup');
    const priceInput = document.getElementById('clubPrice');
    
    if (clubType === 'paid') {
        priceFieldGroup.style.display = 'block';
        priceInput.required = true;
    } else {
        priceFieldGroup.style.display = 'none';
        priceInput.required = false;
        priceInput.value = '';
    }
}

function toggleEditPriceField() {
    const isFree = document.querySelector('input[name="editClubType"]:checked').value === 'free';
    document.getElementById('editPriceFieldGroup').style.display = isFree ? 'none' : 'block';
}

// ==================== CLUB DETAILS ====================
async function showClubDetails(clubId) {
    showLoading(true);
    
    try {
        console.log('Fetching club details for ID:', clubId);
        const club = await apiCall(`${API_BASE}/clubs/${clubId}`);
        console.log('Club data:', club);
        
        const members = await apiCall(`${API_BASE}/clubs/${clubId}/members`);
        console.log('Members data:', members);
        
        currentClubDetails = { ...club, members };
        
        const fee = club.price || 0;
        const feeDisplay = fee > 0 ? `₹${fee}` : 'Free';
        
        document.getElementById('clubDetailName').textContent = club.name;
        document.getElementById('clubDetailDescription').textContent = club.description;
        document.getElementById('clubDetailFee').textContent = feeDisplay;
        document.getElementById('clubDetailCreator').textContent = 'Club Admin';
        document.getElementById('clubDetailMemberCount').textContent = members.length;
        
        // Render actions and members
        renderClubActions(club);
        renderClubMembers(members, club);
        
        document.getElementById('clubDetailsModal').style.display = 'flex';
    } catch (error) {
        console.error('Club details error:', error);
        console.error('Error details:', error.message);
        showToast(`Failed to load club details: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function closeClubDetailsModal() {
    document.getElementById('clubDetailsModal').style.display = 'none';
    currentClubDetails = null;
}

function renderClubActions(club) {
    const actionsContainer = document.getElementById('clubActions');
    let actionsHtml = '';
    
    const userClub = userClubs.find(c => c.id === club.id);
    const isMember = !!userClub;
    const isAdmin = userClub?.clubRole === 'ADMIN';
    
    const fee = club.price || 0;
    const feeDisplay = fee > 0 ? `(₹${fee})` : '(Free)';
    
    if (!isMember) {
        actionsHtml = `
            <button class="btn-primary" onclick="joinClub(${club.id})">
                Join Club ${feeDisplay}
            </button>
        `;
    } else {
        if (isAdmin) {
            const clubJson = JSON.stringify(club).replace(/"/g, '&quot;');
            actionsHtml += `
                <button class="btn-primary" onclick='showEditClubModal(${clubJson})'>Edit Club</button>
                <button class="btn-danger" onclick="deleteClub(${club.id})">Delete Club</button>
            `;
        } else {
            actionsHtml += `
                <button class="btn-danger" onclick="leaveClub(${club.id})">Leave Club</button>
            `;
        }
    }
    
    actionsContainer.innerHTML = actionsHtml;
}

function renderClubMembers(members, club) {
    const membersContainer = document.getElementById('clubMembersList');
    const userClub = userClubs.find(c => c.id === club.id);
    const isAdmin = userClub?.clubRole === 'ADMIN';
    
    if (members.length === 0) {
        membersContainer.innerHTML = '<p class="no-data">No members yet</p>';
        return;
    }
    
    membersContainer.innerHTML = members.map(member => {
        const initial = (member.userName || member.username || 'U').charAt(0).toUpperCase();
        const isCurrentUser = member.userId === currentUser.id;
        const isMemberAdmin = member.role === 'ADMIN' || member.clubRole === 'ADMIN';
        const memberName = member.userName || member.username || 'Unknown';
        
        return `
            <div class="member-item">
                <div class="member-info">
                    <div class="member-avatar">${initial}</div>
                    <div>
                        <strong>${escapeHtml(memberName)}</strong>
                        ${isMemberAdmin ? '<span class="badge badge-admin">ADMIN</span>' : ''}
                    </div>
                </div>
                ${isAdmin && !isCurrentUser ? `
                    <div class="member-actions">
                        ${!isMemberAdmin ? `
                            <button class="btn-small btn-primary" onclick="promoteMember(${club.id}, ${member.userId})">
                                Promote
                            </button>
                        ` : ''}
                        <button class="btn-small btn-danger" onclick="removeMember(${club.id}, ${member.userId})">
                            Remove
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// ==================== CLUB ACTIONS ====================
async function joinClub(clubId) {
    const club = allClubs.find(c => c.id === clubId);
    const fee = club.price || 0;
    
    if (fee > 0) {
        // Show payment modal
        paymentClubId = clubId;
        document.getElementById('paymentClubName').textContent = club.name;
        document.getElementById('paymentAmount').textContent = `₹${fee}`;
        document.getElementById('paymentModal').style.display = 'flex';
    } else {
        // Free club - join directly
        await joinClubDirect(clubId);
    }
}

async function joinClubDirect(clubId) {
    showLoading(true);
    
    try {
        await apiCall(`${API_BASE}/clubs/${clubId}/join`, {
            method: 'POST'
        });
        
        showToast('Successfully joined the club!', 'success');
        closeClubDetailsModal();
        closePaymentModal();
        await loadMyClubs();
        await loadDashboard();
    } catch (error) {
        console.error('Join club error:', error);
        showToast(error.message || 'Failed to join club', 'error');
    } finally {
        showLoading(false);
    }
}

async function leaveClub(clubId) {
    if (!confirm('Are you sure you want to leave this club?')) return;
    
    showLoading(true);
    
    try {
        await apiCall(`${API_BASE}/clubs/${clubId}/leave`, {
            method: 'DELETE'
        });
        
        showToast('Successfully left the club', 'success');
        closeClubDetailsModal();
        await loadMyClubs();
        await loadDashboard();
    } catch (error) {
        console.error('Leave club error:', error);
        showToast(error.message || 'Failed to leave club', 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteClub(clubId) {
    if (!confirm('Are you sure you want to delete this club? This action cannot be undone.')) return;
    
    showLoading(true);
    
    try {
        await apiCall(`${API_BASE}/clubs/${clubId}`, {
            method: 'DELETE'
        });
        
        showToast('Club deleted successfully', 'success');
        closeClubDetailsModal();
        await loadAllClubs();
        await loadMyClubs();
        await loadDashboard();
    } catch (error) {
        console.error('Delete club error:', error);
        showToast(error.message || 'Failed to delete club', 'error');
    } finally {
        showLoading(false);
    }
}

async function promoteMember(clubId, userId) {
    if (!confirm('Promote this member to admin?')) return;
    
    showLoading(true);
    
    try {
        await apiCall(`${API_BASE}/clubs/${clubId}/members/${userId}/promote`, {
            method: 'PUT'
        });
        
        showToast('Member promoted successfully', 'success');
        await showClubDetails(clubId);
    } catch (error) {
        console.error('Promote member error:', error);
        showToast(error.message || 'Failed to promote member', 'error');
    } finally {
        showLoading(false);
    }
}

async function removeMember(clubId, userId) {
    if (!confirm('Remove this member from the club?')) return;
    
    showLoading(true);
    
    try {
        await apiCall(`${API_BASE}/clubs/${clubId}/members/${userId}`, {
            method: 'DELETE'
        });
        
        showToast('Member removed successfully', 'success');
        await showClubDetails(clubId);
    } catch (error) {
        console.error('Remove member error:', error);
        showToast(error.message || 'Failed to remove member', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== USERS ====================
async function loadAllUsers() {
    showLoading(true);
    
    try {
        const response = await apiCall(`${API_BASE}/users`);
        allUsers = response;
        await renderUsers(allUsers);
    } catch (error) {
        console.error('Users load error:', error);
        showToast('Failed to load users', 'error');
    } finally {
        showLoading(false);
    }
}

async function renderUsers(users) {
    const container = document.getElementById('allUsersList');
    
    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <h3>No users found</h3>
            </div>
        `;
        return;
    }
    
    // Fetch clubs for each user
    const usersWithClubs = await Promise.all(users.map(async (user) => {
        try {
            const clubs = await apiCall(`${API_BASE}/users/${user.id}/clubs`);
            return { ...user, clubs: clubs || [] };
        } catch (error) {
            return { ...user, clubs: [] };
        }
    }));
    
    container.innerHTML = usersWithClubs.map(user => {
        const initial = (user.username || user.name || 'U').charAt(0).toUpperCase();
        const isCurrentUser = user.id === currentUser.id;
        
        return `
            <div class="user-card">
                <div class="user-avatar">${initial}</div>
                <div class="user-info">
                    <h3>${escapeHtml(user.name)} ${isCurrentUser ? '(You)' : ''}</h3>
                    <p>@${escapeHtml(user.username)}</p>
                    <p class="user-email">${escapeHtml(user.email)}</p>
                    <span class="badge">${user.role}</span>
                </div>
                <div class="user-clubs-section">
                    <h4>Clubs (${user.clubs.length})</h4>
                    ${user.clubs.length > 0 ? `
                        <div class="user-club-list">
                            ${user.clubs.map(club => `
                                <div class="user-club-item" onclick="showClubDetails(${club.id})">
                                    <span>${escapeHtml(club.name)}</span>
                                    <span class="badge ${club.clubRole === 'ADMIN' ? 'badge-admin' : 'badge-member'}">
                                        ${club.clubRole}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--gray); font-size: 0.9rem;">Not in any clubs</p>'}
                </div>
            </div>
        `;
    }).join('');
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const filtered = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
    renderUsers(filtered);
}

// ==================== PAYMENT ====================
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    paymentClubId = null;
}

async function initiatePayment() {
    if (!paymentClubId) return;
    
    const club = allClubs.find(c => c.id === paymentClubId);
    if (!club) return;
    
    showLoading(true);
    
    try {
        // Create order
        const orderResponse = await apiCall(`${API_BASE}/payments/create-order?userId=${currentUser.id}`, {
            method: 'POST',
            body: JSON.stringify({
                amount: club.price,
                currency: 'INR',
                clubId: paymentClubId
            })
        });
        
        showLoading(false);
        
        // Razorpay options
        const options = {
            key: orderResponse.razorpayKeyId || 'rzp_test_S5hsKvn5I43NLN',
            amount: orderResponse.amount,
            currency: orderResponse.currency || 'INR',
            name: 'TribeNet',
            description: `Membership for ${club.name}`,
            order_id: orderResponse.orderId,
            handler: async function(response) {
                await verifyPayment(response);
            },
            prefill: {
                name: currentUser.name,
                email: currentUser.email
            },
            theme: {
                color: '#6366f1'
            },
            modal: {
                ondismiss: function() {
                    showToast('Payment cancelled', 'info');
                }
            }
        };
        
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response){
            showToast('Payment failed: ' + response.error.description, 'error');
        });
        rzp.open();
        
    } catch (error) {
        console.error('Payment initiation error:', error);
        showToast(error.message || 'Failed to initiate payment', 'error');
        showLoading(false);
    }
}

async function verifyPayment(response) {
    showLoading(true);
    
    try {
        await apiCall(`${API_BASE}/payments/verify`, {
            method: 'POST',
            body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                userId: currentUser.id,
                clubId: paymentClubId
            })
        });
        
        showToast('Payment verified! Joining club...', 'success');
        
        // Join club after successful payment
        await joinClubDirect(paymentClubId);
        
    } catch (error) {
        console.error('Payment verification error:', error);
        showToast(error.message || 'Payment verification failed', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== ADMIN PANEL ====================
async function loadAdminPanel() {
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab || activeTab.textContent.includes('Users')) {
        await loadAdminUsers();
    } else {
        await loadAdminClubs();
    }
}

function switchAdminTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    document.querySelectorAll('.admin-content').forEach(content => content.classList.add('hidden'));
    
    if (tab === 'users') {
        document.getElementById('adminUsers').classList.remove('hidden');
        loadAdminUsers();
    } else {
        document.getElementById('adminClubs').classList.remove('hidden');
        loadAdminClubs();
    }
}

async function loadAdminUsers() {
    showLoading(true);
    
    try {
        const users = await apiCall(`${API_BASE}/admin/users`);
        
        const html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${escapeHtml(user.username)}</td>
                            <td>${escapeHtml(user.email)}</td>
                            <td>${escapeHtml(user.name)}</td>
                            <td><span class="badge">${user.role}</span></td>
                            <td>
                                ${user.id !== currentUser.id ? `
                                    <button class="btn-danger btn-small" onclick="deleteUser(${user.id})">
                                        Delete
                                    </button>
                                ` : '<span>-</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('adminUsersList').innerHTML = html;
    } catch (error) {
        console.error('Admin users load error:', error);
        showToast('Failed to load users', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadAdminClubs() {
    showLoading(true);
    
    try {
        const clubs = await apiCall(`${API_BASE}/clubs`);
        
        const html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Fee</th>
                        <th>Members</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${clubs.map(club => {
                        const fee = club.price || 0;
                        const feeDisplay = fee > 0 ? `₹${fee}` : 'Free';
                        return `
                        <tr>
                            <td>${club.id}</td>
                            <td>${escapeHtml(club.name)}</td>
                            <td>${escapeHtml(club.description)}</td>
                            <td>${feeDisplay}</td>
                            <td>${club.memberCount || 0}</td>
                            <td>
                                <button class="btn-primary btn-small" onclick="showClubDetails(${club.id})">View</button>
                                <button class="btn-danger btn-small" onclick="adminDeleteClub(${club.id})">Delete</button>
                            </td>
                        </tr>
                    `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('adminClubsList').innerHTML = html;
    } catch (error) {
        console.error('Admin clubs load error:', error);
        showToast('Failed to load clubs', 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    showLoading(true);
    
    try {
        await apiCall(`${API_BASE}/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        showToast('User deleted successfully', 'success');
        await loadAdminUsers();
    } catch (error) {
        console.error('Delete user error:', error);
        showToast(error.message || 'Failed to delete user', 'error');
    } finally {
        showLoading(false);
    }
}

async function adminDeleteClub(clubId) {
    if (!confirm('Are you sure you want to delete this club?')) return;
    
    showLoading(true);
    
    try {
        await apiCall(`${API_BASE}/admin/clubs/${clubId}`, {
            method: 'DELETE'
        });
        
        showToast('Club deleted successfully', 'success');
        await loadAdminClubs();
    } catch (error) {
        console.error('Delete club error:', error);
        showToast(error.message || 'Failed to delete club', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== UTILITY FUNCTIONS ====================
async function apiCall(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
        showToast('Session expired. Please login again.', 'error');
        logout();
        throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || error.error || 'Request failed');
    }
    
    return response.json();
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// ==================== EVENT LISTENERS ====================
// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Close modals with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'flex' || modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
})
;
