// Document Sections - Categorized by type
export const DOCUMENT_SECTIONS = {
  BASIC_DOCUMENTS: 'Basic Documents',
  INCOME_SALARIED: 'Income Documents (Salaried)',
  INCOME_BUSINESS: 'Income Documents (Business)',
  PROPERTY_DOCUMENTS: 'Property Documents',
  VEHICLE_DOCUMENTS: 'Vehicle Documents'
};

// Helper function to categorize documents into sections
export const categorizeDocuments = (documents) => {
  const sections = {};

  // Define categorization rules
  const basicDocs = ['PAN Card', 'Aadhaar Card', 'Aadhar card', 'Adharcard', 'Pan card', 'Pancard',
    '1 Passport-size Photo', 'Photo', '5 Cheques', 'Driving Licence (as per vehicle category)',
    'Electricity Bill (Address Proof)', 'Light bill', 'Address Proof (Electricity Bill / Rent Agreement)',
    'Mail id', 'Email ID', 'MO.no.', 'Mob no', 'Mother Name', 'Mother name'];

  const salaryDocs = ['Last 3 Months Salary Slips', 'Salary slip 3 months', 'Salary slip 3 Month',
    '3 month (latest) salary slip', 'Form 16', 'Form no.16', 'Form 16 (2 years)',
    'Form no. 16 for 2 years (with part A&B)', 'Office ID Card/ joining letter',
    'Offering and joining letter'];

  const businessDocs = ['2 Years ITR (Income Tax Returns)', '2 years ITR', 'ITR 3 years', 'ITR - 3 years',
    'Shop Act / Udyam / Business Proof', 'Shopact license', 'Shop act license',
    'Udyam Certificate', 'Udhyam certificate', 'Shop act / Udyam / Business Proof',
    'Shop Act/ Udhyam', 'GST Certificate (if applicable)', 'GST Certificate', 'GST certificate',
    'Food license', 'Shop act / Udhyam / Business Proof'];

  const propertyDocs = ['NA order / City survey Utara', 'NA order/ City Survey', 'NA order/ City Survey',
    'Ferfar', 'Kharedi dast (chain documents)', 'Kharedi dast (Chain Doc)', 'Kharedi Dast',
    'Layout plan', 'Sanction plan', 'Bandhkam Parvana', 'Complition letter',
    'Agreement to sale', 'RERA Certificate', '7/12 उतारा', '8A उतारा', '7/12 / 8 A',
    'Gavthan Dakhala', 'Chaturseema Dakhala', 'Gharpatti', 'Last 13 yrs Assessment/ Ferfar',
    'Property Tax Paid Receipt', 'House Tax Paid Receipt', 'House Tax Paid Receipt / Property Document',
    'LOD from previous bank', 'Loan statement of previous bank'];

  const vehicleDocs = ['RC Book', 'Old Vehicle RC', 'RC Xerox Copy', 'Full Insurance', 'Valuation Report',
    'Vehicle Quotation Report', 'Quotation Report', 'Vehicle Valuation Report',
    'Tax', 'Tax Paid Certificate', 'Permit', 'Vehicle Permit', 'Fitness Certificate'];

  const bankDocs = ['6 Months Bank Statement', 'Bank Passbook / 6 Months Bank Statement',
    'Latest 6 Months Bank Statement', 'One year bank statement PDF',
    'Bank account statement 1 year', 'Loan account statement & Sanction letter (if app)',
    'Loan account statement & Sanction letter (if any)', 'Loan account statement & Sanction letter',
    'Loan account statement & Sanction letter of IDBI bank'];

  documents.forEach(doc => {
    if (basicDocs.some(bd => doc.includes(bd) || bd.includes(doc))) {
      if (!sections[DOCUMENT_SECTIONS.BASIC_DOCUMENTS]) sections[DOCUMENT_SECTIONS.BASIC_DOCUMENTS] = [];
      sections[DOCUMENT_SECTIONS.BASIC_DOCUMENTS].push(doc);
    } else if (salaryDocs.some(sd => doc.includes(sd) || sd.includes(doc))) {
      if (!sections[DOCUMENT_SECTIONS.INCOME_SALARIED]) sections[DOCUMENT_SECTIONS.INCOME_SALARIED] = [];
      sections[DOCUMENT_SECTIONS.INCOME_SALARIED].push(doc);
    } else if (businessDocs.some(bd => doc.includes(bd) || bd.includes(doc))) {
      if (!sections[DOCUMENT_SECTIONS.INCOME_BUSINESS]) sections[DOCUMENT_SECTIONS.INCOME_BUSINESS] = [];
      sections[DOCUMENT_SECTIONS.INCOME_BUSINESS].push(doc);
    } else if (propertyDocs.some(pd => doc.includes(pd) || pd.includes(doc))) {
      if (!sections[DOCUMENT_SECTIONS.PROPERTY_DOCUMENTS]) sections[DOCUMENT_SECTIONS.PROPERTY_DOCUMENTS] = [];
      sections[DOCUMENT_SECTIONS.PROPERTY_DOCUMENTS].push(doc);
    } else if (vehicleDocs.some(vd => doc.includes(vd) || vd.includes(doc))) {
      if (!sections[DOCUMENT_SECTIONS.VEHICLE_DOCUMENTS]) sections[DOCUMENT_SECTIONS.VEHICLE_DOCUMENTS] = [];
      sections[DOCUMENT_SECTIONS.VEHICLE_DOCUMENTS].push(doc);
    } else if (bankDocs.some(bkd => doc.includes(bkd) || bkd.includes(doc))) {
      // Bank statements go to basic for now
      if (!sections[DOCUMENT_SECTIONS.BASIC_DOCUMENTS]) sections[DOCUMENT_SECTIONS.BASIC_DOCUMENTS] = [];
      sections[DOCUMENT_SECTIONS.BASIC_DOCUMENTS].push(doc);
    } else {
      // Uncategorized documents go to basic
      if (!sections[DOCUMENT_SECTIONS.BASIC_DOCUMENTS]) sections[DOCUMENT_SECTIONS.BASIC_DOCUMENTS] = [];
      sections[DOCUMENT_SECTIONS.BASIC_DOCUMENTS].push(doc);
    }
  });

  return sections;
};
