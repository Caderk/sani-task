// app/components/AddUserModal.tsx

import { User } from "../types/user";

interface AddUserModalProps {
  show: boolean;
  newUser: Omit<User, "id">;
  onClose: () => void;
  onChange: (field: keyof Omit<User, "id">, value: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          minWidth: "300px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Add User</h2>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Name: </label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>Rut: </label>
            <input
              type="text"
              required
              value={newUser.rut}
              onChange={(e) => onChange("rut", e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>Email: </label>
            <input
              type="email"
              value={newUser.email ?? ""}
              onChange={(e) => {
                const val = e.target.value.trim();
                onChange("email", val === "" ? null : val);
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Birthday: </label>
            <input
              type="date"
              required
              value={newUser.birthday}
              onChange={(e) => onChange("birthday", e.target.value)}
            />
          </div>

          <button type="submit" style={{ marginRight: "0.5rem" }}>
            Save
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
