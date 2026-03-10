import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import "./admin.css";

function badge(user) {
  if (user.is_admin) return { label: "Admin", bg: "#b42318", fg: "#fff" };
  if (user.is_staff) return { label: "Staff", bg: "#50D4BC", fg: "#111" };
  return { label: "Utilisateur", bg: "#ece7ff", fg: "#111" };
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadUsers = useCallback(async () => {
    setErr("");
    try {
      const res = await api.get("/api/users");
      setUsers(res.data || []);
    } catch (error) {
      setErr("Erreur de chargement utilisateurs");
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function deleteUser(user) {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.username} ?`)) return;
    setMsg("");
    setErr("");
    try {
      await api.delete(`/api/users/${user.id}`);
      setMsg("Utilisateur supprimé avec succès");
      await loadUsers();
    } catch (error) {
      setErr(error?.response?.data || "Échec de suppression");
    }
  }

  return (
    <AdminLayout title="Gestion des Utilisateurs" subtitle="Administrez les comptes utilisateurs">
      {msg ? <div className="admin-alert admin-alert-ok">{msg}</div> : null}
      {err ? <div className="admin-alert admin-alert-err">{err}</div> : null}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Username</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6}>Aucun utilisateur trouvé</td>
            </tr>
          ) : (
            users.map((user) => {
              const b = badge(user);
              return (
                <tr key={user.id}>
                  <td>{user.last_name || "-"}</td>
                  <td>{user.first_name || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>{user.username}</td>
                  <td>
                    <span style={{ background: b.bg, color: b.fg, borderRadius: 999, padding: "3px 10px" }}>
                      {b.label}
                    </span>
                  </td>
                  <td>
                    <button className="admin-danger-btn" onClick={() => deleteUser(user)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
}
