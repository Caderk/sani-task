// app/components/AddUserModal.tsx

import { User } from "../types/user";
import { FormEvent } from "react";

interface AddUserModalProps {
  show: boolean;
  newUser: Omit<User, "id">;
  onClose: () => void;
  onChange: (field: keyof Omit<User, "id">, value: string | null) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function AddUserModal({
  show,
  newUser,
  onClose,
  onChange,
  onSubmit,
}: AddUserModalProps) {
  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex={-1} onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ top: "20%" }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add User</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name:</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={newUser.name}
                  onChange={(e) => onChange("name", e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Rut:</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={newUser.rut}
                  onChange={(e) => onChange("rut", e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  value={newUser.email ?? ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    onChange("email", val === "" ? null : val);
                  }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Birthday:</label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={newUser.birthday}
                  onChange={(e) => onChange("birthday", e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">
                Save
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
