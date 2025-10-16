"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var xlsx = require("xlsx");
// Inicializar o Prisma Client
var prisma = new client_1.PrismaClient();
// Função para carregar dados da planilha
var loadExcelData = function (filePath) {
    var workbook = xlsx.readFile(filePath);
    var sheetName = workbook.SheetNames[0];
    var sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return sheetData;
};
// Função para validar e converter datas
var parseDate = function (date) {
    if (!date)
        return null;
    try {
        var parsedDate = new Date(date);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
    catch (_a) {
        console.warn("Data inv\u00E1lida encontrada: \"".concat(date, "\""));
        return null;
    }
};
// Função principal para popular o banco
var populateDatabase = function () { return __awaiter(void 0, void 0, void 0, function () {
    var filePath, data, _i, data_1, row, className, studentName, birthDate, guardian, guardianEmail, phones, classRecord, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, 7, 9]);
                filePath = "file.xlsx";
                data = loadExcelData(filePath);
                _i = 0, data_1 = data;
                _a.label = 1;
            case 1:
                if (!(_i < data_1.length)) return [3 /*break*/, 5];
                row = data_1[_i];
                className = row.TURMA;
                studentName = row.ALUNO;
                birthDate = String(row["DATA DE NASCIMENTO"]);
                guardian = row.RESPONSÁVEL || "N/A";
                guardianEmail = row["EMAIL RESPONSÁVEL"] || "";
                phones = typeof row.TELEFONE === "string"
                    ? row.TELEFONE.split(",").map(function (phone) { return phone.trim(); }).join(", ")
                    : "";
                if (!birthDate) {
                    console.warn("Data de nascimento inv\u00E1lida para o aluno ".concat(studentName, ". Pulando inser\u00E7\u00E3o."));
                    return [3 /*break*/, 4];
                }
                return [4 /*yield*/, prisma.class.upsert({
                        where: { name: className },
                        update: {},
                        create: { name: className },
                    })];
            case 2:
                classRecord = _a.sent();
                return [4 /*yield*/, prisma.student.create({
                        data: {
                            name: studentName,
                            birthDate: birthDate,
                            guardian: guardian,
                            guardianEmail: guardianEmail,
                            phones: phones,
                            classId: classRecord.id,
                        },
                    })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5:
                console.log("Banco de dados populado com sucesso!");
                return [3 /*break*/, 9];
            case 6:
                error_1 = _a.sent();
                console.error("Erro ao popular o banco de dados:", error_1);
                return [3 /*break*/, 9];
            case 7: return [4 /*yield*/, prisma.$disconnect()];
            case 8:
                _a.sent();
                return [7 /*endfinally*/];
            case 9: return [2 /*return*/];
        }
    });
}); };
// Executar a função principal
populateDatabase();
