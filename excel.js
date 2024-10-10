const fs = require('fs');
const pdf = require('pdf-parse');
const ExcelJS = require('exceljs');

const POSITION = {
  x: 4,
  y: 5,
};

const colunas = {
  sessao: '30',
  codigoPergunta: '119',
  pergunta: '142',
  resposta: '408',
  comentario: '526',
};

const regex = /^[0-9].*/;
const regexPergunta = /^[0-9] [0-9].*/;
let workbook;
let worksheet;

function render_page(pageData) {
  let render_options = {
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  };

  return pageData.getTextContent(render_options).then(function (textContent) {
    let lastY,
      text = '';

    const rows = [];
    const current = {
      sessao: '',
      pergunta: '',
      resposta: '',
      comentario: '',
    };
    let sessao = '';

    for (let item of textContent.items) {
      if (lastY == item.transform[POSITION.y] || !lastY) {
        text += item.str;
      } else {
        text += '\n' + item.str;
      }
      lastY = item.transform[POSITION.y];

      const indexX = item.transform[POSITION.x].toFixed(0);
      const indexY = item.transform[POSITION.y].toFixed(0);

      if (indexX === colunas.sessao) {
        if (regex.test(item.str)) {
          sessao = item.str;
        }
        continue;
      }

      if (indexX === colunas.codigoPergunta) {
        current.pergunta += item.str + ' - ';
        continue;
      }

      if (indexX === colunas.pergunta) {
        current.pergunta += item.str;
        current.sessao = sessao;
        continue;
      }

      if (indexX === colunas.resposta) {
        current.resposta = item.str;
        rows.push({ ...current });

        current.sessao = item.str;
        current.pergunta = '';
        current.resposta = '';
        current.comentario = '';
        continue;
      }

      if (indexX === colunas.comentario) {
        rows[rows.length - 1].comentario = item.str;
        continue;
      }
    }

    worksheet.addRows(rows);

    return text;
  });
}

let options = {
  pagerender: render_page,
};

const extractTextFromPDF = async (filePath) => {
  workbook = new ExcelJS.Workbook();
  worksheet = workbook.addWorksheet('Aba 1');

  worksheet.columns = [
    { header: 'Sessao', key: 'sessao', width: 20 },
    { header: 'Pergunta', key: 'pergunta', width: 20 },
    { header: 'Resposta', key: 'resposta', width: 20 },
    { header: 'Comentario', key: 'comentario', width: 20 },
  ];

  const dataBuffer = fs.readFileSync(filePath);
  try {
    await pdf(dataBuffer, options);

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
    // workbook.xlsx
    //   .writeFile(pathToSave)
    //   .then(() => {
    //     console.log('Arquivo Excel criado e salvo com sucesso em:', pathToSave);
    //   })
    //   .catch((err) => {
    //     console.error('Erro ao salvar o arquivo Excel:', err);
    //   });
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
  }
};

module.exports = {
  extractTextFromPDF,
};
