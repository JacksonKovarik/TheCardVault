class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoginMode = true;
        this.init();
    }

    init() {
        this.checkStoredAuth();
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        const authBtn = document.getElementById('authBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const authModalOverlay = document.getElementById('authModalOverlay');
        const authModalClose = document.getElementById('authModalClose');
        const authForm = document.getElementById('authForm');
        const authToggleBtn = document.getElementById('authToggleBtn');

        if (authBtn) {
            authBtn.addEventListener('click', () => this.openModal());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        if (authModalOverlay) {
            authModalOverlay.addEventListener('click', (e) => {
                if (e.target === authModalOverlay) {
                    this.closeModal();
                }
            });
        }

        if (authModalClose) {
            authModalClose.addEventListener('click', () => this.closeModal());
        }

        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (authToggleBtn) {
            authToggleBtn.addEventListener('click', () => this.toggleMode());
        }
    }

    openModal() {
        const overlay = document.getElementById('authModalOverlay');
        if (overlay) {
            overlay.classList.add('active');
            this.clearError();
        }
    }

    closeModal() {
        const overlay = document.getElementById('authModalOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            this.clearForm();
            this.clearError();
        }
    }

    toggleMode() {
        this.isLoginMode = !this.isLoginMode;
        this.updateModalUI();
        this.clearError();
    }

    updateModalUI() {
        const modalTitle = document.getElementById('authModalTitle');
        const displayNameGroup = document.getElementById('displayNameGroup');
        const submitBtn = document.getElementById('authSubmitBtn');
        const toggleText = document.getElementById('authToggleText');

        if (this.isLoginMode) {
            if (modalTitle) modalTitle.textContent = 'Login';
            if (displayNameGroup) displayNameGroup.classList.add('hidden');
            if (submitBtn) submitBtn.textContent = 'Login';
            if (toggleText) toggleText.textContent = "Don't have an account? Sign up";
        } else {
            if (modalTitle) modalTitle.textContent = 'Create Account';
            if (displayNameGroup) displayNameGroup.classList.remove('hidden');
            if (submitBtn) submitBtn.textContent = 'Create Account';
            if (toggleText) toggleText.textContent = 'Already have an account? Login';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.clearError();

        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const displayName = document.getElementById('authDisplayName')?.value;

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        const submitBtn = document.getElementById('authSubmitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Please wait...';
        }

        try {
            if (this.isLoginMode) {
                await this.login(email, password);
            } else {
                await this.signup(email, password, displayName);
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = this.isLoginMode ? 'Login' : 'Create Account';
            }
        }
    }

    async login(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }

        this.setUser(data.user);
        this.closeModal();
    }

    async signup(email, password, displayName) {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName || email.split('@')[0]
                }
            }
        });

        if (error) {
            throw new Error(error.message);
        }

        if (data.user) {
            await supabaseClient
                .from('user_profiles')
                .insert([
                    {
                        id: data.user.id,
                        email: data.user.email,
                        display_name: displayName || email.split('@')[0]
                    }
                ]);
        }

        this.setUser(data.user);
        this.closeModal();
    }

    async logout() {
        await supabaseClient.auth.signOut();
        this.currentUser = null;
        localStorage.removeItem('user');
        this.updateUI();
    }

    setUser(user) {
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        this.updateUI();
    }

    checkStoredAuth() {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
    }

    updateUI() {
        const authBtn = document.getElementById('authBtn');
        const userInfo = document.getElementById('userInfo');
        const addListingBtn = document.getElementById('addListingBtn');

        if (this.currentUser) {
            if (authBtn) authBtn.classList.add('d-none');
            if (userInfo) {
                userInfo.classList.remove('d-none');
                const userEmail = document.getElementById('userEmail');
                const userAvatar = document.getElementById('userAvatar');
                if (userEmail) userEmail.textContent = this.currentUser.email;
                if (userAvatar) {
                    userAvatar.textContent = this.currentUser.email.charAt(0).toUpperCase();
                }
            }
            if (addListingBtn) addListingBtn.classList.remove('d-none');
        } else {
            if (authBtn) authBtn.classList.remove('d-none');
            if (userInfo) userInfo.classList.add('d-none');
            if (addListingBtn) addListingBtn.classList.add('d-none');
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }

    clearError() {
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.add('hidden');
        }
    }

    clearForm() {
        const form = document.getElementById('authForm');
        if (form) form.reset();
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getUser() {
        return this.currentUser;
    }
}

// Initialize auth manager when DOM is loaded
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});
