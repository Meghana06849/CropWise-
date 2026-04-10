import jsPDF from 'jspdf';
import { formatCurrency, formatDateTime, formatNumber } from './utils';

export const downloadPredictionPdf = (prediction) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFillColor(47, 130, 68);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('CropWise Prediction Report', 14, 16);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  y = 40;

  const lines = [
    ['Farm Location', `${prediction.state}, ${prediction.district}`],
    ['Season', prediction.season],
    ['Created', formatDateTime(prediction.createdAt)],
    ['Predicted Crop', prediction.predicted_crop],
    ['Expected Yield', `${formatNumber(prediction.expected_yield)} t/ha`],
    ['Expected Production', `${formatNumber(prediction.expected_production)} tonnes`],
    ['Confidence', `${formatNumber(prediction.confidence, 0)}%`],
    ['Market Price', formatCurrency(prediction.market_price)],
    ['Price Trend', prediction.price_trend],
    ['Estimated Revenue', formatCurrency(prediction.estimated_revenue)],
    ['Soil pH', String(prediction.soil_ph)],
    ['Nitrogen', String(prediction.nitrogen)],
    ['Phosphorus', String(prediction.phosphorus)],
    ['Potassium', String(prediction.potassium)],
    ['Rainfall', `${formatNumber(prediction.rainfall)} mm`],
    ['Area', `${formatNumber(prediction.area)} ha`]
  ];

  lines.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(value), 68, y);
    y += 8;
  });

  y += 2;
  doc.setFont(undefined, 'bold');
  doc.text('Recommendations', 14, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  prediction.recommendations?.forEach((item) => {
    const wrapped = doc.splitTextToSize(`- ${item}`, pageWidth - 28);
    doc.text(wrapped, 14, y);
    y += wrapped.length * 6;
  });

  y += 2;
  doc.setFont(undefined, 'bold');
  doc.text('Soil Tips', 14, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.text(doc.splitTextToSize(prediction.soil_tips || '', pageWidth - 28), 14, y);

  doc.save(`cropwise-report-${prediction.predicted_crop.replace(/\s+/g, '-').toLowerCase()}.pdf`);
};
