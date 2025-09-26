export const companyJSON = localStorage.getItem('susupro_company');
const user = companyJSON ? JSON.parse(companyJSON) : null;

export const getEffectiveCompanyId = () => {
  if (!user) return null;

  if (user.type === "company") {
    return user.id; 
  }

  if (user.type === "staff") {
    return user.companyId; // staff points to parent company id
  }

  return null;
};

export const getUserRole = () => {
  if (!user) return null;
  return user.type === "company" ? "admin" : user.role;
}
export const getDisplayName = () => {
  if (!user) return null;

  return user.type === "company" ? user.companyName : user.staffName;
};

      
export function formatDate(dateString: string, locale: string = "en-US"): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",  
    day: "numeric", 
  }).format(date);
}

export const companyId = getEffectiveCompanyId();
export const companyName = getDisplayName();
export const userRole = getUserRole();
