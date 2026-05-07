// src/lib/mockData.ts

export const mockUser = {
  student: { id: 1, email: 'ahmed.benali@enscs.dz', firstName: 'Ahmed', lastName: 'Benali', fullName: 'Ahmed Benali', role: 'STUDENT' as const, matricule: 'NSC2024001', department: 'Cybersecurity', yearOfStudy: 3 },
  supervisor: { id: 2, email: 'dr.meziane@enscs.dz', firstName: 'Karima', lastName: 'Meziane', fullName: 'Dr. Karima Meziane', role: 'SUPERVISOR' as const, specialization: 'Network Security' },
  admin: { id: 3, email: 'admin@enscs.dz', firstName: 'Sofiane', lastName: 'Hamidi', fullName: 'Sofiane Hamidi', role: 'ADMIN' as const },
};

export const mockOffers = [
  { id: 1, title: 'Cybersecurity Analyst Intern', description: 'Join our SOC team to monitor, detect, and respond to security incidents. You will work alongside senior analysts using SIEM tools, threat intelligence platforms, and incident response playbooks. This internship provides hands-on experience in a live production environment with real threats.\n\n**Responsibilities:**\n- Monitor security dashboards and alerts\n- Investigate potential security incidents\n- Document findings and escalation procedures\n- Assist in vulnerability assessments', companyName: 'Algérie Télécom', companyLocation: 'Alger, Hydra', startDate: '2026-06-01', endDate: '2026-08-31', durationWeeks: 13, requiredSkills: 'SIEM,Splunk,Network Analysis,Linux,Python', status: 'OPEN', applicationCount: 8, createdAt: '2026-04-01T09:00:00' },
  { id: 2, title: 'Penetration Testing Intern', description: 'Conduct authorised penetration tests on web applications and internal networks. Work with the red team on engagements for enterprise clients across multiple industries.', companyName: 'CasaNet Security', companyLocation: 'Oran, Bir El Djir', startDate: '2026-07-01', endDate: '2026-09-30', durationWeeks: 13, requiredSkills: 'Kali Linux,Metasploit,Burp Suite,OWASP,Python', status: 'OPEN', applicationCount: 15, createdAt: '2026-04-03T10:00:00' },
  { id: 3, title: 'Cloud Security Engineer Intern', description: 'Support the cloud security team in securing AWS and Azure environments. Implement security controls, conduct cloud configuration reviews, and assist in DevSecOps pipelines.', companyName: 'Sonatrach Digital', companyLocation: 'Alger, El Harrach', startDate: '2026-06-15', endDate: '2026-09-15', durationWeeks: 13, requiredSkills: 'AWS,Azure,Terraform,Docker,IaC', status: 'OPEN', applicationCount: 5, createdAt: '2026-04-05T11:00:00' },
  { id: 4, title: 'Malware Analysis Intern', description: 'Perform static and dynamic analysis of malware samples in a controlled sandbox environment. Produce detailed technical reports on malware behaviour, indicators of compromise, and remediation recommendations.', companyName: 'DGSI Algérie', companyLocation: 'Alger, Ben Aknoun', startDate: '2026-07-15', endDate: '2026-10-15', durationWeeks: 13, requiredSkills: 'Reverse Engineering,IDA Pro,x86 Assembly,Sandbox Analysis,YARA', status: 'OPEN', applicationCount: 3, createdAt: '2026-04-07T08:00:00' },
  { id: 5, title: 'Security Awareness & GRC Intern', description: 'Assist the GRC team in maintaining ISO 27001 compliance, conducting risk assessments, and developing security awareness training programs for employees.', companyName: 'BNA Bank', companyLocation: 'Alger, Hussein Dey', startDate: '2026-06-01', endDate: '2026-08-01', durationWeeks: 9, requiredSkills: 'ISO 27001,Risk Assessment,NIST,Policy Writing,Microsoft 365', status: 'OPEN', applicationCount: 12, createdAt: '2026-04-10T09:30:00' },
  { id: 6, title: 'Digital Forensics Intern', description: 'Work in the digital forensics lab assisting investigators with evidence collection, chain of custody documentation, and forensic analysis using industry-standard tools.', companyName: 'PNIJ Algérie', companyLocation: 'Constantine', startDate: '2026-06-01', endDate: '2026-08-31', durationWeeks: 13, requiredSkills: 'EnCase,Autopsy,FTK,Memory Forensics,Report Writing', status: 'CLOSED', applicationCount: 22, createdAt: '2026-03-15T10:00:00' },
];

export const mockApplications = [
  { id: 1, studentId: 1, studentName: 'Ahmed Benali', offerId: 1, offerTitle: 'Cybersecurity Analyst Intern', companyName: 'Algérie Télécom', coverLetter: 'I am a third-year cybersecurity student with hands-on experience in network monitoring and SIEM tools through academic projects. I am deeply passionate about threat detection and believe this role at Algérie Télécom will allow me to apply my skills in a real-world environment...', status: 'ACCEPTED', adminNotes: 'Strong academic profile. Technical skills match well.', hasResume: true, appliedAt: '2026-04-10T14:23:00' },
  { id: 2, studentId: 1, studentName: 'Ahmed Benali', offerId: 2, offerTitle: 'Penetration Testing Intern', companyName: 'CasaNet Security', coverLetter: 'My passion for offensive security began with CTF competitions where I developed skills in web application exploitation and network penetration testing...', status: 'PENDING', adminNotes: null, hasResume: true, appliedAt: '2026-04-14T09:11:00' },
  { id: 3, studentId: 1, studentName: 'Ahmed Benali', offerId: 5, offerTitle: 'Security Awareness & GRC Intern', companyName: 'BNA Bank', coverLetter: 'I have studied GRC frameworks extensively and hold a foundational ISO 27001 awareness certificate...', status: 'UNDER_REVIEW', adminNotes: 'Good profile, awaiting HR confirmation.', hasResume: true, appliedAt: '2026-04-16T11:30:00' },
];

export const mockReports = [
  { id: 1, studentId: 1, studentName: 'Ahmed Benali', applicationId: 1, offerTitle: 'Cybersecurity Analyst Intern', hasReport: true, hasDailyLog: false, submissionDeadline: '2026-09-14', submittedAt: '2026-09-10T10:00:00', isLate: false, reportFileSizeBytes: 2048000 },
];

export const mockEvaluations = [
  { id: 1, supervisorId: 2, supervisorName: 'Dr. Karima Meziane', reportId: 1, studentName: 'Ahmed Benali', offerTitle: 'Cybersecurity Analyst Intern', grade: 16.5, technicalFeedback: 'Excellent understanding of SIEM tools. Demonstrated strong analytical skills.', professionalFeedback: 'Very professional attitude, punctual, and collaborative.', generalComments: 'One of the strongest interns this semester.', companyFeedback: 'Company praised the student\'s initiative and report quality.', evaluatedAt: '2026-09-15T14:00:00' },
];

export const mockUsers = {
  students: [
    { id: 1, firstName: 'Ahmed', lastName: 'Benali', email: 'ahmed.benali@enscs.dz', matricule: 'NSC2024001', department: 'Cybersecurity', yearOfStudy: 3, enabled: true, createdAt: '2024-09-01' },
    { id: 4, firstName: 'Yasmine', lastName: 'Hadj', email: 'yasmine.hadj@enscs.dz', matricule: 'NSC2024042', department: 'Cybersecurity', yearOfStudy: 2, enabled: true, createdAt: '2024-09-01' },
    { id: 5, firstName: 'Mourad', lastName: 'Bensalem', email: 'mourad.bensalem@enscs.dz', matricule: 'NSC2023018', department: 'Cybersecurity', yearOfStudy: 4, enabled: true, createdAt: '2023-09-01' },
    { id: 6, firstName: 'Nadia', lastName: 'Aoufi', email: 'nadia.aoufi@enscs.dz', matricule: 'NSC2024078', department: 'Cybersecurity', yearOfStudy: 2, enabled: false, createdAt: '2024-09-01' },
  ],
  supervisors: [
    { id: 2, firstName: 'Karima', lastName: 'Meziane', email: 'dr.meziane@enscs.dz', specialization: 'Network Security', enabled: true, createdAt: '2020-09-01' },
    { id: 7, firstName: 'Rachid', lastName: 'Boukhalfa', email: 'r.boukhalfa@enscs.dz', specialization: 'Malware Analysis', enabled: true, createdAt: '2019-09-01' },
  ],
};

export const adminStats = {
  totalOffers: 6, openOffers: 5, totalApplications: 48, pendingReview: 12, overdueReports: 2,
};

export const supervisorStats = {
  reportsAssigned: 8, evaluated: 5, pending: 3, avgGrade: 14.2,
};

export type Offer       = typeof mockOffers[0];
export type Application = typeof mockApplications[0];
export type Report      = typeof mockReports[0];
export type Evaluation  = typeof mockEvaluations[0];
