import { PrismaClient } from '@prisma/client';
import {
  formatPhoneNumber,
  sendMessagesWithDelay,
  splitMessages,
} from '../util';

// Inicializar o Prisma Client
const prisma = new PrismaClient();

class MessageService {
  public async mainStudents({
    currentMessage,
    chatId,
    client,
    messageFrom,
  }: {
    currentMessage: string;
    chatId: string;
    client: any;
    messageFrom: any;
  }) {
    const splitCurrentMessage = currentMessage.split(';');
    return this.sendMessage(
      splitCurrentMessage[0],
      splitCurrentMessage[1],
      splitCurrentMessage[2],
      client,
      messageFrom
    );
  }

  private getInstructions(): string {
    return `
    *Instruções de Uso do Sistema de Mensagens:*

    *1. Enviar mensagem para TODOS os responsáveis:*
       *Comando:*
    /recado;todos;[mensagem personalizada]

       *Exemplo:*
    /recado;todos;Reunião de pais amanhã às 19h.

    *2. Enviar mensagem para uma CLASSE específica:*
       *Comando:*
    /recado;[nome da classe];[mensagem personalizada]

       *Exemplo:*
    /recado;Classe A;Lembrem-se de trazer os materiais.

    *3. Enviar mensagem para um ESTUDANTE específico:*
       *Comando:*
    /recado;[nome do estudante];[mensagem personalizada]

       *Exemplo:*
    /recado;João Silva;Parabéns pela dedicação nas atividades.

    *4. Enviar mensagem de ATRASO para um estudante:*
       *Comando:*
    /atraso;[nome do estudante]

       *Exemplo:*
    /atraso;João Silva

    *5. Enviar mensagem de FALTA para um estudante:*
       *Comando:*
    /falta;[nome do estudante]

       *Exemplo:*
    /falta;João Silva

    *6. Pesquisar ALUNOS com base no nome:*
       *Comando:*
    /pesquisar;[termo de busca]

       *Exemplo:*
    /pesquisar;João

       *Resultado:*
    Lista todos os alunos cujo nome contenha o termo pesquisado, junto com suas respectivas turmas.

    *7. Listar todas as TURMAS com quantidade de alunos:*
       *Comando:*
    /turmas

       *Resultado:*
    Mostra todas as turmas cadastradas e a quantidade de alunos em cada uma.

    Obs: Certifique-se de usar nomes de estudantes e classes exatamente como cadastrados no sistema.
    `;
  }

  private async sendMessage(
    command: string,
    target: string,
    customMessage: string = '',
    client: any,
    messageFrom: string
  ) {
    if (command === '/instrucoes') {
      return { message: this.getInstructions() };
    }
  
    if (command === '/recado') {
      if (target.toLowerCase() === 'todos') {
        return this.sendGeneralMessageToAll(customMessage, client, messageFrom);
      } else {
        return this.sendClassMessage(target, customMessage, client, messageFrom);
      }
    }
  
    if (command === '/pesquisar') {
      const students = await this.findStudentsByPartialName(target);
      if (students.length) {
        const response = students
          .map(
            (student) =>
              `Aluno: ${student.name}, Turma: ${
                student.Class?.name || 'Sem turma'
              }\n`
          )
          .join('\n');
        return { message: `Resultados da pesquisa:\n${response}` };
      } else {
        return { message: `Nenhum aluno encontrado com o termo: ${target}` };
      }
    }
  
    const student = await this.findStudentByName(target);
  
    if (!student) {
      return { message: `Aluno ${target} não encontrado.`, student: null };
    }
  
    switch (command) {
      case '/atraso':
        return {
          message: this.sendLateMessage(
            student,
            customMessage,
            client,
            messageFrom
          ),
          student,
        };
  
      case '/falta':
        return {
          message: this.sendAbsenceMessage(
            student,
            customMessage,
            client,
            messageFrom
          ),
          student,
        };
  
      default:
        return {
          message: 'Comando inválido. Use /instrucoes para mais informações.',
          student,
        };
    }
  }
  
  // Método para buscar estudantes cujo nome contenha o termo pesquisado
  private async findStudentsByPartialName(name: string): Promise<Student[]> {
    // Recupera todos os alunos com base no termo pesquisado
    const students = await prisma.student.findMany({
      where: {
        name: {
          contains: name,
        },
      },
      include: {
        Class: true, // Inclui a relação com a turma
      },
    });
  
    return students.map((studentRecord) => ({
      id: studentRecord.id,
      name: studentRecord.name,
      birthDate: studentRecord.birthDate,
      guardian: studentRecord.guardian,
      guardianEmail: studentRecord.guardianEmail,
      phones: studentRecord.phones,
      classId: studentRecord.classId,
      Class: studentRecord.Class
        ? { id: studentRecord.Class.id, name: studentRecord.Class.name }
        : undefined,
    }));
  }
  

  // Método para enviar mensagens para todos os estudantes do banco de dados
  private async sendGeneralMessageToAll(
    customMessage: string,
    client: any,
    messageFrom: string
  ) {
    // Buscar todos os estudantes
    const students = await prisma.student.findMany({
      include: {
        Class: true, // Inclui a relação com a turma, caso necessário
      },
    });

    if (!students.length) {
      return { message: 'Nenhum estudante encontrado no banco de dados.' };
    }

    const messages = [];
    for (const student of students) {
      const message = `Olá, ${student.guardian}. A EEEFM Narceu de Paiva Filho comunica: ${customMessage}. Caso não seja você, favor desconsiderar. Este número foi informado como contato do responsável.`;

      const result = await this.sendToGuardian(
        student.phones,
        message,
        student,
        client,
        messageFrom
      );
      messages.push(result);
    }

    return {
      message: `Mensagens enviadas para todos os responsáveis cadastrados no banco de dados.`,
      details: messages,
    };
  }

  private async sendClassMessage(
    className: string,
    customMessage: string,
    client: any,
    messageFrom: string
  ) {
    // Buscar estudantes da classe
    const students = await prisma.student.findMany({
      where: {
        Class: {
          name: className,
        },
      },
      include: {
        Class: true,
      },
    });

    if (!students.length) {
      return {
        message: `Nenhum estudante encontrado para a classe ${className}.`,
      };
    }

    const messages = [];
    for (const student of students) {
      const message = `Olá, ${student.guardian}. A EEEFM Narceu de Paiva Filho comunica: ${customMessage}. Caso não seja você, favor desconsiderar. Este número foi informado como contato do responsável.`;

      const result = await this.sendToGuardian(
        student.phones,
        message,
        student,
        client,
        messageFrom
      );
      messages.push(result);
    }

    return {
      message: `Mensagens enviadas para todos os responsáveis da classe ${className}.`,
      details: messages,
    };
  }

  private async findStudentByName(name: string): Promise<Student | null> {
    // Recupera todos os alunos e realiza a comparação manualmente
    const students = await prisma.student.findMany({
      include: {
        Class: true, // Inclui a relação com a turma
      },
    });

    const studentRecord = students.find(
      (student) => student.name.toLowerCase() === name.toLowerCase()
    );

    if (!studentRecord) return null;

    return {
      id: studentRecord.id,
      name: studentRecord.name,
      birthDate: studentRecord.birthDate,
      guardian: studentRecord.guardian,
      guardianEmail: studentRecord.guardianEmail,
      phones: studentRecord.phones,
      classId: studentRecord.classId,
      Class: studentRecord.Class
        ? { id: studentRecord.Class.id, name: studentRecord.Class.name }
        : undefined,
    };
  }

  private sendLateMessage(
    student: Student,
    customMessage: string,
    client: any,
    messageFrom: string
  ) {
    const message = `Olá, ${student.guardian}. A EEEFM Narceu de Paiva Filho informa que o aluno ${student.name} está atrasado hoje. Caso não seja você, favor desconsiderar. Este número foi informado como contato do responsável.`;
    return this.sendToGuardian(
      student.phones,
      message,
      student,
      client,
      messageFrom
    );
  }

  private sendAbsenceMessage(
    student: Student,
    customMessage: string,
    client: any,
    messageFrom: string
  ) {
    const message = `Olá, ${student.guardian}. A EEEFM Narceu de Paiva Filho informa que o aluno ${student.name} não compareceu às aulas hoje. Caso não seja você, favor desconsiderar. Este número foi informado como contato do responsável.`;
    return this.sendToGuardian(
      student.phones,
      message,
      student,
      client,
      messageFrom
    );
  }

  private sendGeneralMessage(
    student: Student,
    customMessage: string,
    client: any,
    messageFrom: string
  ) {
    const message = `Olá, ${student.guardian}. A EEEFM Narceu de Paiva Filho comunica: ${customMessage}. Caso não seja você, favor desconsiderar. Este número foi informado como contato do responsável.`;
    return this.sendToGuardian(
      student.phones,
      message,
      student,
      client,
      messageFrom
    );
  }

  private async sendToGuardian(
    contact: string,
    message: string,
    student: Student,
    client: any,
    messageFrom: string
  ) {
    console.log(`Enviando mensagem para ${contact}: ${message}`, student);

    const splitPhones = contact.includes(',') ? contact.split(',') : [contact];
    console.log(`Possui ${splitPhones.length} numeros de resposnsavel`);

    for (let i = 0; i < splitPhones.length; i++) {
      console.log(`enviando para o ${i + 1}º`);
      const targetNumber = formatPhoneNumber(String(splitPhones[i]));
      const splitMessagesArray = splitMessages(message);

      try {
        await sendMessagesWithDelay({
          client,
          messages: splitMessagesArray,
          targetNumber,
        });
        console.log(
          `A seguinte mensagem foi enviada para ${student?.guardian}(${splitPhones[i]}) responsável pelo aluno(a) ${student?.name}: \n${message}`
        );
        return `A seguinte mensagem foi enviada para ${student?.guardian}(${splitPhones[i]}) responsável pelo aluno(a) ${student?.name}: \n${message}`;
      } catch (error) {
        return `Erro ao enviar mensagem para responsável do aluno ${student?.name} (${splitPhones[i]}):`;

        console.error(
          `Erro ao enviar mensagem para responsável do aluno ${student?.name} (${splitPhones[i]}):`,
          error
        );
      }
    }
  }
}

// Interface para o aluno
interface Student {
  id: string;
  name: string;
  birthDate: string;
  guardian: string;
  guardianEmail: string;
  phones: string;
  classId: string;
  Class?: { id: string; name: string };
}

export const messageService = new MessageService();
