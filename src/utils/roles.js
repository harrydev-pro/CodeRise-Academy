// "admin" is the administrator role. "instructor" is its earlier name; the server treats
// both the same, so the interface does too.
export function isAdminRole(role) {
  return role === "admin" || role === "instructor";
}

export function homePathFor(user) {
  return isAdminRole(user?.role) ? "/admin" : "/dashboard";
}
