// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const contactsTable = document.getElementById('contacts-table');
const contactsList = document.getElementById('contacts-list');
const contactForm = document.getElementById('contact-form');
const searchInput = document.getElementById('search-input');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const toast = document.getElementById('toast');

// Form inputs
const contactIdInput = document.getElementById('contact-id');
const firstNameInput = document.getElementById('first-name');
const lastNameInput = document.getElementById('last-name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');
const notesInput = document.getElementById('notes');

// Initialize local storage
let contacts = JSON.parse(localStorage.getItem('contacts')) || [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Tab navigation
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });

  // Load contacts
  renderContacts();

  // Form submission
  contactForm.addEventListener('submit', handleFormSubmit);
  
  // Cancel button
  cancelBtn.addEventListener('click', () => {
    clearForm();
    switchToTab('list');
  });
  
  // Search functionality
  searchInput.addEventListener('input', filterContacts);
});

// Functions
function renderContacts(filteredContacts = null) {
  const contactsToRender = filteredContacts || contacts;
  contactsList.innerHTML = '';
  
  if (contactsToRender.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `<td colspan="4" style="text-align: center;">No contacts found</td>`;
    contactsList.appendChild(emptyRow);
    return;
  }
  
  contactsToRender.forEach(contact => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contact.firstName} ${contact.lastName}</td>
      <td>${contact.email}</td>
      <td>${contact.phone}</td>
      <td>
        <button class="action-btn edit" data-id="${contact.id}">Edit</button>
        <button class="action-btn delete" data-id="${contact.id}">Delete</button>
      </td>
    `;
    contactsList.appendChild(row);
    
    // Add event listeners to the buttons
    const editBtn = row.querySelector('.edit');
    const deleteBtn = row.querySelector('.delete');
    
    editBtn.addEventListener('click', () => editContact(contact.id));
    deleteBtn.addEventListener('click', () => deleteContact(contact.id));
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const contact = {
    id: contactIdInput.value || Date.now().toString(),
    firstName: firstNameInput.value,
    lastName: lastNameInput.value,
    email: emailInput.value,
    phone: phoneInput.value,
    address: addressInput.value,
    notes: notesInput.value
  };
  
  if (contactIdInput.value) {
    // Edit existing contact
    const index = contacts.findIndex(c => c.id === contactIdInput.value);
    if (index !== -1) {
      contacts[index] = contact;
      showToast('Contact updated successfully!');
    }
  } else {
    // Add new contact
    contacts.push(contact);
    showToast('Contact added successfully!');
  }
  
  // Update localStorage
  localStorage.setItem('contacts', JSON.stringify(contacts));
  
  // Clear form and switch to list tab
  clearForm();
  renderContacts();
  switchToTab('list');
}

function editContact(id) {
  const contact = contacts.find(c => c.id === id);
  if (!contact) return;
  
  // Fill form with contact data
  contactIdInput.value = contact.id;
  firstNameInput.value = contact.firstName;
  lastNameInput.value = contact.lastName;
  emailInput.value = contact.email;
  phoneInput.value = contact.phone;
  addressInput.value = contact.address || '';
  notesInput.value = contact.notes || '';
  
  // Switch to form tab
  switchToTab('form');
  
  // Change button text
  saveBtn.textContent = 'Update Contact';
}

function deleteContact(id) {
  if (!confirm('Are you sure you want to delete this contact?')) return;
  
  contacts = contacts.filter(c => c.id !== id);
  localStorage.setItem('contacts', JSON.stringify(contacts));
  renderContacts();
  showToast('Contact deleted successfully!');
}

function clearForm() {
  contactForm.reset();
  contactIdInput.value = '';
  saveBtn.textContent = 'Save Contact';
}

function switchToTab(tabId) {
  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.click();
    }
  });
}

function filterContacts() {
  const searchTerm = searchInput.value.toLowerCase();
  if (!searchTerm) {
    renderContacts();
    return;
  }
  
  const filtered = contacts.filter(contact => {
    return (
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm) ||
      contact.phone.toLowerCase().includes(searchTerm)
    );
  });
  
  renderContacts(filtered);
}

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.className = isError ? 'toast error show' : 'toast show';
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}