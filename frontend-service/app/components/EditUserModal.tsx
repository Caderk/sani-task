// app/components/EditUserModal.tsx

import { User } from "../types/user";
import { FormEvent } from "react";

interface EditUserModalProps {
  show: boolean;
  editingUser: User | null;
  onClose: () => void;
  onChange: (field: keyof User, value: string | null) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function EditUserModal({
  show,
  editingUser,
  onClose,
  onChange,
  onSubmit,
}: EditUserModalProps) {
  if (!show || !editingUser) return null;

  return (
    <div className="modal d-block" tabIndex={-1} onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ top: "20%" }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit User</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={onSubmit}>
            <div className="modal-body">
              {/* Name */}
              <div className="mb-3">
                <label className="form-label">Name:</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={editingUser.name}
                  onChange={(e) => onChange("name", e.target.value)}
                />
              </div>

              {/* Rut */}
              <div className="mb-3">
                <label className="form-label">Rut:</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={editingUser.rut}
                  onChange={(e) => onChange("rut", e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  value={editingUser.email ?? ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    onChange("email", val === "" ? null : val);
                  }}
                />
              </div>

              {/* Birthday */}
              <div className="mb-3">
                <label className="form-label">Birthday:</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={
                    editingUser.birthday
                      ? new Date(editingUser.birthday).toISOString().slice(0, 10)
                      : ""
                  }
                  onChange={(e) => onChange("birthday", e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">
                Update
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
