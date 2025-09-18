const companyJSON = localStorage.getItem('susupro_company');
      const company = companyJSON ? JSON.parse(companyJSON) : null;
      export const companyId = company?.id;
      export const companyName = company?.companyName;



      
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