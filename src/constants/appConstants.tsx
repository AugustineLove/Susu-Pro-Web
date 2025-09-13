const companyJSON = localStorage.getItem('susupro_company');
      const company = companyJSON ? JSON.parse(companyJSON) : null;
      export const companyId = company?.id;
      export const companyName = company?.companyName;