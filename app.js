const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { extractTextFromPDF } = require('./excel');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname))); // Serve o index.html

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const buffer = await extractTextFromPDF(req.file.path);

    res.setHeader('Content-Disposition', 'attachment; filename="output.xlsx"');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buffer);

    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error('Erro ao processar o PDF:', error);
    res.status(500).send('Erro ao processar o PDF');
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
