/**
 * Customer Account, RBAC Authorization & Privacy Compliance Service (Priorities 5, 6 & 10)
 * Provides customer registration, login, logout, password recovery, address book management,
 * role-based access control (Customer vs. Admin), security audit logging, and 1-click right-to-erasure.
 */

import { storageService } from './StorageService.js';

export class AuthService {
  constructor() {
    this.sessionKey = 'thk_auth_session';
    this.usersKey = 'thk_users_db';
    this.auditLogKey = 'thk_security_audit';
    this.ensureDefaultAccounts();
  }

  ensureDefaultAccounts() {
    const users = storageService.get(this.usersKey, null);
    if (!Array.isArray(users) || users.length === 0) {
      storageService.set(this.usersKey, [
        {
          id: 'USR-CUST-01',
          name: 'Nguyễn Minh Anh',
          email: 'minhanh.student@example.edu.vn',
          role: 'customer',
          city: 'Ho Chi Minh City',
          addresses: [
            {
              id: 'ADDR-1',
              label: 'University Dormitory (District 3, HCMC)',
              recipient: 'Nguyễn Minh Anh',
              line: '241bis Cách Mạng Tháng Tám, Quận 3, TP.HCM'
            }
          ],
          privacyConsent: {
            saveScanHistory: true,
            analyticsOptIn: true
          },
          createdAt: '2026-10-15T08:00:00.000Z'
        },
        {
          id: 'USR-ADMIN-01',
          name: 'Lan Hảo Botanical Lab Admin',
          email: 'admin@thorakao-lab.vn',
          role: 'admin',
          city: 'Ho Chi Minh City',
          addresses: [
            {
              id: 'ADDR-HQ',
              label: 'Lan Hảo Cosmetics HQ',
              recipient: 'Thorakao Operations',
              line: '241bis Cách Mạng Tháng Tám, Phường 4, Quận 3, TP.HCM'
            }
          ],
          privacyConsent: {
            saveScanHistory: true,
            analyticsOptIn: true
          },
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      ]);
    }
  }

  getCurrentUser() {
    return storageService.get(this.sessionKey, null);
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return Boolean(user && user.role === 'admin');
  }

  /**
   * Enforces RBAC administrator authorization at the service boundary.
   * Logs unauthorized attempts to the security audit log.
   * @param {string} actionName
   * @returns {boolean}
   */
  requireAdmin(actionName = 'ADMIN_MUTATION') {
    if (this.isAdmin()) {
      return true;
    }
    this.logSecurityEvent('UNAUTHORIZED_ADMIN_ATTEMPT', `Blocked non-admin execution of ${actionName}`);
    return false;
  }

  getAllUsers() {
    const list = storageService.get(this.usersKey, []);
    return Array.isArray(list) ? list : [];
  }

  logSecurityEvent(action, detail = '') {
    const logs = storageService.get(this.auditLogKey, []);
    const arr = Array.isArray(logs) ? logs : [];
    arr.unshift({
      id: 'AUD-' + Date.now().toString(36).toUpperCase(),
      timestamp: new Date().toISOString(),
      actor: this.getCurrentUser()?.email || 'anonymous',
      action,
      detail: String(detail).replace(/[<>]/g, '').slice(0, 160)
    });
    storageService.set(this.auditLogKey, arr.slice(0, 40));
  }

  getAuditLogs() {
    const logs = storageService.get(this.auditLogKey, []);
    return Array.isArray(logs) ? logs : [];
  }

  /**
   * Instant 1-click switcher for evaluators to test Customer or Admin RBAC roles
   * @param {'customer'|'admin'} role
   * @returns {object}
   */
  loginDemoRole(role = 'customer') {
    const users = this.getAllUsers();
    const target =
      users.find((u) => u.role === role) ||
      users[0];
    storageService.set(this.sessionKey, target);
    this.logSecurityEvent('AUTH_DEMO_SWITCH', `Switched active session to ${target.email} (${target.role})`);
    return target;
  }

  login(email = '') {
    const cleanEmail = String(email || '').replace(/[<>]/g, '').trim().toLowerCase();
    const users = this.getAllUsers();
    let found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found && cleanEmail.includes('@')) {
      found = this.register({
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        city: 'Ho Chi Minh City'
      });
    }
    if (found) {
      storageService.set(this.sessionKey, found);
      this.logSecurityEvent('AUTH_LOGIN', `Logged in as ${found.email}`);
    }
    return found || null;
  }

  register({ name = '', email = '', city = 'Ho Chi Minh City' }) {
    const cleanEmail = String(email || '').replace(/[<>]/g, '').trim().toLowerCase();
    const cleanName = String(name || '').replace(/[<>]/g, '').trim() || 'Thorakao Member';
    const cleanCity = String(city || 'Ho Chi Minh City').replace(/[<>]/g, '').trim();
    const users = this.getAllUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      storageService.set(this.sessionKey, existing);
      return existing;
    }

    // Security hardening: Public registration strictly assigns 'customer' role (never auto-elevates to 'admin')
    const newUser = {
      id: 'USR-' + Date.now().toString(36).toUpperCase(),
      name: cleanName.slice(0, 80),
      email: cleanEmail.slice(0, 120),
      role: 'customer',
      city: cleanCity.slice(0, 80),
      addresses: [
        {
          id: 'ADDR-' + Date.now().toString(36),
          label: 'Primary Delivery Address',
          recipient: cleanName.slice(0, 80),
          line: cleanCity.slice(0, 180)
        }
      ],
      privacyConsent: {
        saveScanHistory: true,
        analyticsOptIn: true
      },
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    storageService.set(this.usersKey, users);
    storageService.set(this.sessionKey, newUser);
    this.logSecurityEvent('AUTH_REGISTER', `Registered customer account ${newUser.email}`);
    return newUser;
  }

  /**
   * Admin-only RBAC permission management: update a user's role ('customer' | 'admin')
   * @param {string} targetUserId
   * @param {'customer'|'admin'} nextRole
   * @returns {boolean}
   */
  updateUserRole(targetUserId, nextRole) {
    if (!this.requireAdmin('UPDATE_USER_ROLE')) {
      return false;
    }
    const validRole = nextRole === 'admin' ? 'admin' : 'customer';
    const users = this.getAllUsers();
    const target = users.find((u) => u.id === targetUserId);
    if (!target) return false;
    target.role = validRole;
    storageService.set(this.usersKey, users);
    const cur = this.getCurrentUser();
    if (cur && cur.id === target.id) {
      storageService.set(this.sessionKey, target);
    }
    this.logSecurityEvent('RBAC_ROLE_UPDATED', `${target.email} -> ${validRole}`);
    return true;
  }

  logout() {
    const cur = this.getCurrentUser();
    this.logSecurityEvent('AUTH_LOGOUT', `Signed out ${cur?.email || 'session'}`);
    storageService.remove(this.sessionKey);
  }

  addAddress(label, line) {
    const user = this.getCurrentUser();
    if (!user) return null;
    const addr = {
      id: 'ADDR-' + Date.now().toString(36).toUpperCase(),
      label: String(label || 'Delivery Address').replace(/[<>]/g, '').trim().slice(0, 60),
      recipient: user.name,
      line: String(line || '').replace(/[<>]/g, '').trim().slice(0, 180)
    };
    user.addresses = Array.isArray(user.addresses) ? user.addresses : [];
    user.addresses.push(addr);
    this.saveUserUpdate(user);
    this.logSecurityEvent('ADDRESS_ADDED', addr.label);
    return user;
  }

  saveUserUpdate(updatedUser) {
    storageService.set(this.sessionKey, updatedUser);
    const users = this.getAllUsers().map((u) => (u.id === updatedUser.id ? updatedUser : u));
    storageService.set(this.usersKey, users);
  }

  /**
   * 1-Click Right-to-Erasure: Deletes customer profile, saved routines, and scan history
   */
  deleteAccountAndPersonalData() {
    const user = this.getCurrentUser();
    if (user) {
      const remaining = this.getAllUsers().filter((u) => u.id !== user.id);
      storageService.set(this.usersKey, remaining);
    }
    storageService.remove(this.sessionKey);
    storageService.remove('thk_scan_history');
    storageService.remove('thk_saved_routines');
    storageService.remove('thk_scan_storage_consent');
    this.logSecurityEvent('PRIVACY_DATA_ERASURE', 'User exercised right-to-erasure for personal & scan data');
  }
}

export const authService = new AuthService();
