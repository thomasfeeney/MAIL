"use client";

import React, { useState } from "react";
import { useContacts, Contact } from "@/hooks/useContacts";

function ContactRow({
  contact,
  onUpdate,
  onDelete,
}: {
  contact: Contact;
  onUpdate: (updates: Partial<Contact>) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(contact);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(contact);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="py-2 px-3">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Name"
          />
        </td>
        <td className="py-2 px-3">
          <input
            type="text"
            value={editData.role}
            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Role/Area"
          />
        </td>
        <td className="py-2 px-3">
          <input
            type="email"
            value={editData.email}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Email"
          />
        </td>
        <td className="py-2 px-3">
          <input
            type="text"
            value={editData.notes}
            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Notes"
          />
        </td>
        <td className="py-2 px-3 text-right">
          <button
            onClick={handleSave}
            className="text-xs text-blue-600 hover:text-blue-800 mr-2"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50 group">
      <td className="py-2 px-3 font-medium text-gray-900">{contact.name || "—"}</td>
      <td className="py-2 px-3 text-gray-600">{contact.role || "—"}</td>
      <td className="py-2 px-3">
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="text-blue-600 hover:text-blue-800"
          >
            {contact.email}
          </a>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="py-2 px-3 text-gray-500 text-sm">{contact.notes || "—"}</td>
      <td className="py-2 px-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-gray-500 hover:text-gray-700 mr-2"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function MarketingTab() {
  const {
    contacts,
    addContact,
    deleteContact,
    updateContact,
    isLoading,
    error,
    isSaving,
  } = useContacts();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <span className="text-gray-400">Loading contacts...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Marketing</h2>
        <p className="text-gray-600 text-sm">
          Video series planning and promotional content coordination.
        </p>
      </div>

      {/* Video Series Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-700 mb-2">30-Second Video Series</h3>
        <p className="text-sm text-gray-500 mb-3">
          Track progress of faculty introduction videos for the MAIL program page.
        </p>
        <div className="text-sm text-gray-600">
          Videos recorded: <span className="font-medium">4 / 10</span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden w-48">
          <div className="h-full bg-blue-500" style={{ width: "40%" }} />
        </div>
      </div>

      {/* Info Sessions Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-700 mb-3">Info Sessions</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Monthly Schedule</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1 per month (standard)</li>
              <li>2 in January, August</li>
              <li>3 in March/April, October/November</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Session Times</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>12:00 PM (default)</li>
              <li>6:00 PM (evening option)</li>
              <li>8:00 AM (international)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Spring In-Person Event</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Book room via 25Live (note ASC restrictions)</li>
              <li>Order catering 2 months ahead</li>
              <li>TommieLink, Digital Signage, Posters</li>
              <li>CAS Social Media (Adam)</li>
              <li>OneStThomas &amp; MAIL Sessions page</li>
              <li>Canvas announcement + Padlet</li>
              <li>Invite MAIL students to attend</li>
              <li>Consider classroom visits (CAS courses)</li>
              <li>UST Family Portal post (optional)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contacts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-gray-700">Key Contacts</h3>
            {isSaving && <span className="text-xs text-gray-400">Saving...</span>}
          </div>
          <button
            onClick={addContact}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Contact
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Name</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Role/Area</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Email</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Notes</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No contacts yet. Click "Add Contact" to get started.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    onUpdate={(updates) => updateContact(contact.id, updates)}
                    onDelete={() => deleteContact(contact.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Contacts are saved automatically to Google Sheets.
        </p>
      </div>
    </div>
  );
}
