import { useEffect, useState } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import "./admin.css";

export default function AdminOrderDetail() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .get("/api/orders/detail")
      .then((res) => setRows(res.data || []))
      .catch(async (error) => {
        setErr(error?.response?.data || "Erreur réseau");
      });
  }, []);

  return (
    <AdminLayout title="Toutes les Commandes" subtitle="Visualisation des commandes goodies">
      {err ? <div className="admin-alert admin-alert-err">{err}</div> : null}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>T-shirts</th>
            <th>Bobs</th>
            <th>Shorts</th>
            <th>Maillots</th>
            <th>Gourdes</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8}>Aucune commande pour le moment</td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={`${row.username || "u"}-${row.created_at || idx}`}>
                <td>{row.last_name || "-"}</td>
                <td>{row.first_name || "-"}</td>
                <td>{row.tshirt_qty}</td>
                <td>{row.bob_qty}</td>
                <td>{row.short_qty}</td>
                <td>{row.maillot_qty}</td>
                <td>{row.gourde_qty ?? row.gourd_qty}</td>
                <td>{row.created_at ? new Date(row.created_at).toLocaleString("fr-FR") : "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
}
