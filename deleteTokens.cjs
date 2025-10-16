const { existsSync, rm } = require('fs');
const path = require('path');

const folderPath = path.resolve(__dirname, 'tokens'); // Substitua 'nome_da_pasta' pelo nome da pasta que deseja apagar

if (existsSync(folderPath)) {
  rm(folderPath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error('Erro ao apagar a pasta:', err);
    } else {
      console.log('Pasta apagada com sucesso!');
    }
  });
} else {
  console.log('A pasta não existe.');
}
