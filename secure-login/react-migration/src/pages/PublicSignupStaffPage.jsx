import React from "react";

export default function PublicSignupStaffPage() {
  const [formData, setFormData] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    staff_code: "",
    staff_type: "",
    tireuse: false,
    cuisine: false,
    arbitre_beach_rugby: false,
    arbitre_beach_soccer: false,
    arbitre_beach_volley: false,
    arbitre_dodgeball: false,
    arbitre_handball: false,
  });
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function handleInputChange(event) {
    const { name, type, checked, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!formData.username || !formData.password || !formData.email || !formData.staff_code) {
      setError("Veuillez renseigner username, email, mot de passe et code staff.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/signup_staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        setError(text || "Inscription staff echouee.");
        return;
      }

      const payload = await response.json();
      setMessage(payload.message || "Inscription staff reussie.");
    } catch (submitError) {
      setError("Erreur reseau lors de l'inscription staff.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section style={{ maxWidth: 840, margin: "0 auto", padding: "1.5rem" }}>
      <h1>Inscription Staff</h1>
      <p>Version React initiale de la page legacy <code>public/signup_staff.html</code>.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.85rem" }}>
        <input name="first_name" placeholder="Prenom" value={formData.first_name} onChange={handleInputChange} />
        <input name="last_name" placeholder="Nom" value={formData.last_name} onChange={handleInputChange} />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
        <input name="phone" placeholder="Telephone" value={formData.phone} onChange={handleInputChange} />
        <input name="username" placeholder="Nom d'utilisateur" value={formData.username} onChange={handleInputChange} required />
        <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleInputChange} required />
        <input name="staff_code" type="password" placeholder="Code staff" value={formData.staff_code} onChange={handleInputChange} required />

        <fieldset style={{ border: "1px solid #ddd", padding: "0.75rem" }}>
          <legend>Type de staff</legend>
          <label><input type="radio" name="staff_type" value="mixte" checked={formData.staff_type === "mixte"} onChange={handleInputChange} /> Mixte</label>
          <label style={{ marginLeft: 16 }}><input type="radio" name="staff_type" value="jour" checked={formData.staff_type === "jour"} onChange={handleInputChange} /> Jour</label>
          <label style={{ marginLeft: 16 }}><input type="radio" name="staff_type" value="nuit" checked={formData.staff_type === "nuit"} onChange={handleInputChange} /> Nuit</label>
        </fieldset>

        <fieldset style={{ border: "1px solid #ddd", padding: "0.75rem" }}>
          <legend>Questions staff</legend>
          <label><input type="checkbox" name="tireuse" checked={formData.tireuse} onChange={handleInputChange} /> Tireuse</label><br />
          <label><input type="checkbox" name="cuisine" checked={formData.cuisine} onChange={handleInputChange} /> Cuisine</label><br />
          <label><input type="checkbox" name="arbitre_beach_rugby" checked={formData.arbitre_beach_rugby} onChange={handleInputChange} /> Arbitre Beach Rugby</label><br />
          <label><input type="checkbox" name="arbitre_beach_soccer" checked={formData.arbitre_beach_soccer} onChange={handleInputChange} /> Arbitre Beach Soccer</label><br />
          <label><input type="checkbox" name="arbitre_beach_volley" checked={formData.arbitre_beach_volley} onChange={handleInputChange} /> Arbitre Beach Volley</label><br />
          <label><input type="checkbox" name="arbitre_dodgeball" checked={formData.arbitre_dodgeball} onChange={handleInputChange} /> Arbitre Dodgeball</label><br />
          <label><input type="checkbox" name="arbitre_handball" checked={formData.arbitre_handball} onChange={handleInputChange} /> Arbitre Handball</label>
        </fieldset>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creation..." : "Creer le compte"}
        </button>

        {message ? <p style={{ color: "#1f7a1f" }}>{message}</p> : null}
        {error ? <p style={{ color: "#a32222" }}>{error}</p> : null}
      </form>
    </section>
  );
}
