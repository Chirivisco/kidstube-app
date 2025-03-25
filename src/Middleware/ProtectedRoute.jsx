import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Componente de protección de rutas basado en roles.
 * Este componente verifica si el perfil seleccionado tiene el rol adecuado para acceder a una ruta.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {ReactNode} props.children - Componente hijo que se renderizará si el acceso está permitido.
 * @param {Array<string>} props.allowedRoles - Lista de roles permitidos para acceder a la ruta.
 * @returns {ReactNode} - El componente hijo si el acceso está permitido, o una redirección si no lo está.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Obtén el perfil seleccionado desde el localStorage
  const selectedProfile = JSON.parse(localStorage.getItem("selectedProfile"));

  /**
   * Caso 1: No hay un perfil seleccionado.
   * Si no se encuentra un perfil en el localStorage, redirige al selector de perfiles.
   */
  if (!selectedProfile) {
    return <Navigate to="/profile-select" replace />;
  }

  /**
   * Caso 2: El perfil tiene un rol inválido.
   * Si el rol del perfil no es "main" ni "restricted", redirige a la raíz ("/").
   */
  if (!["main", "restricted"].includes(selectedProfile.role)) {
    return <Navigate to="/" replace />;
  }

  /**
   * Caso 3: El perfil tiene un rol válido pero no está permitido para esta ruta.
   * Si el rol del perfil no está en la lista de roles permitidos (`allowedRoles`):
   * - Si el rol es "restricted", redirige al dashboard restringido.
   * - Si el rol es "main", redirige al dashboard principal.
   */
  if (!allowedRoles.includes(selectedProfile.role)) {
    if (selectedProfile.role === "restricted") {
      return <Navigate to={`/restricted-dashboard/${selectedProfile._id}`} replace />;
    }
    if (selectedProfile.role === "main") {
      return <Navigate to="/main-dashboard" replace />;
    }
  }

  /**
   * Caso 4: El perfil tiene el rol permitido.
   * Si el perfil tiene un rol válido y está permitido para esta ruta, renderiza el contenido de la ruta.
   */
  return children;
};

export default ProtectedRoute;