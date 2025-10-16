import { PrismaClient } from "@prisma/client";
import * as xlsx from "xlsx";

// Tipo para representar cada linha da planilha
type ExcelRow = {
  TURMA: string;
  ALUNO: string;
  "DATA DE NASCIMENTO": string | null;
  RESPONSÁVEL: string;
  "EMAIL RESPONSÁVEL": string | null;
  TELEFONE: string | null;
};

// Inicializar o Prisma Client
const prisma = new PrismaClient();

// Função para carregar dados da planilha
const loadExcelData = (filePath: string): ExcelRow[] => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheetData: ExcelRow[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  return sheetData;
};

// Função para validar e converter datas
const parseDate = (date: string | null): Date | null => {
  if (!date) return null;
  try {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  } catch {
    console.warn(`Data inválida encontrada: "${date}"`);
    return null;
  }
};

// Função principal para popular o banco
const populateDatabase = async () => {
  try {
    // Caminho para o arquivo Excel
    const filePath = "file.xlsx";
    const data = loadExcelData(filePath);

    for (const row of data) {
      const className = row.TURMA;
      const studentName = row.ALUNO;
      const birthDate = String(row["DATA DE NASCIMENTO"]);
      const guardian = row.RESPONSÁVEL || "N/A";
      const guardianEmail = row["EMAIL RESPONSÁVEL"] || "";
      const phones = typeof row.TELEFONE === "string" 
        ? row.TELEFONE.split(",").map((phone: string) => phone.trim()).join(", ")
        : "";

      if (!birthDate) {
        console.warn(
          `Data de nascimento inválida para o aluno ${studentName}. Pulando inserção.`
        );
        continue;
      }

      const classRecord = await prisma.class.upsert({
        where: { name: className },
        update: {},
        create: { name: className },
      });

      await prisma.student.create({
        data: {
          name: studentName,
          birthDate,
          guardian,
          guardianEmail,
          phones,
          classId: classRecord.id,
        },
      });
    }

    console.log("Banco de dados populado com sucesso!");
  } catch (error) {
    console.error("Erro ao popular o banco de dados:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// Executar a função principal
populateDatabase();
