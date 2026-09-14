// Central Data Exporter importing Markdown report files and JSON configuration
import q1Md from './reports/q1.md?raw';
import q2Md from './reports/q2.md?raw';
import q3Md from './reports/q3.md?raw';
import q4Md from './reports/q4.md?raw';

import { parseMarkdownReport } from './reportParser';
import monthlyReports from './monthlyReports.json';
import weeklyReports from './weeklyReports.json';
import feedbackFormConfig from './feedbackFormConfig.json';

const quarterlyReports = {
  Q1: parseMarkdownReport(q1Md),
  Q2: parseMarkdownReport(q2Md),
  Q3: parseMarkdownReport(q3Md),
  Q4: parseMarkdownReport(q4Md)
};

export { quarterlyReports, monthlyReports, weeklyReports, feedbackFormConfig };
