// Traduce los errores de Supabase Auth a mensajes claros en español.
export function traducirErrorAuth(error: { message: string; code?: string }): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Correo o contraseña incorrectos. Comprueba que no haya espacios ni mayúsculas de más.";
    case "email_not_confirmed":
      return "Todavía no has confirmado tu correo. Revisa tu bandeja de entrada y la carpeta de spam.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Has hecho demasiados intentos seguidos. Espera unos minutos antes de volver a probar.";
    case "weak_password":
      return "La contraseña es demasiado débil. Usa al menos 8 caracteres y evita contraseñas muy comunes.";
    case "same_password":
      return "La nueva contraseña debe ser distinta de la actual.";
    case "user_already_exists":
      return "Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.";
    case "email_address_invalid":
      return "Ese correo no parece válido.";
    case "signup_disabled":
      return "Los registros están desactivados temporalmente.";
    case "session_not_found":
    case "session_expired":
      return "Tu sesión ha caducado. Abre de nuevo el enlace del correo o solicita uno nuevo.";
  }

  // Respaldo por texto, por si alguna versión no devuelve "code"
  const m = error.message ?? "";
  if (m.includes("Invalid login credentials"))
    return "Correo o contraseña incorrectos. Comprueba que no haya espacios ni mayúsculas de más.";
  if (m.includes("Email not confirmed"))
    return "Todavía no has confirmado tu correo. Revisa tu bandeja de entrada y la carpeta de spam.";
  if (m.includes("Database error saving new user"))
    return "No se pudo crear tu cuenta. Puede que ese nick ya esté en uso: prueba con otro.";
  if (m.includes("Auth session missing"))
    return "El enlace ha caducado o ya se había usado. Solicita uno nuevo.";

  return "Ha ocurrido un error inesperado. Inténtalo de nuevo en unos minutos.";
}
