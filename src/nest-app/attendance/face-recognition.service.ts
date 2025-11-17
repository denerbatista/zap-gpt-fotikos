import { randomUUID } from 'crypto';
import { Injectable, NotFoundException } from '../framework';
import { StudentsService } from '../students/students.service';
import { Student } from '../students/entities/student.entity';

interface EmbeddingMetadata {
  studentId: string;
  embedding: number[];
  version: string;
}

@Injectable()
export class FaceRecognitionService {
  private readonly templates = new Map<string, EmbeddingMetadata>();
  static inject = [StudentsService];

  constructor(private readonly studentsService: StudentsService) {}

  register(studentId: string, imageBase64: string) {
    const student = this.studentsService.findOne(studentId);
    const embedding = this.toEmbedding(imageBase64);
    const version = randomUUID();
    this.templates.set(student.id, { studentId: student.id, embedding, version });

    return {
      studentId: student.id,
      registeredAt: new Date().toISOString(),
      templateVersion: version,
      vectorSize: embedding.length,
    };
  }

  identify(imageBase64: string): { student: Student; confidence: number } {
    const embedding = this.toEmbedding(imageBase64);
    let bestMatch: { studentId: string; score: number } | null = null;

    this.templates.forEach((metadata, studentId) => {
      const score = this.cosineSimilarity(metadata.embedding, embedding);
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { studentId, score };
      }
    });

    if (!bestMatch || bestMatch.score < 0.92) {
      throw new NotFoundException('Nenhum rosto correspondente encontrado.');
    }

    return {
      student: this.studentsService.findOne(bestMatch.studentId),
      confidence: Number(bestMatch.score.toFixed(2)),
    };
  }

  private toEmbedding(imageBase64: string): number[] {
    const payload = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const buffer = Buffer.from(payload, 'base64');
    const buckets = 32;
    const embedding = new Array(buckets).fill(0);

    for (let i = 0; i < buffer.length; i += 1) {
      embedding[i % buckets] += buffer[i];
    }

    const magnitude = Math.sqrt(embedding.reduce((acc, value) => acc + value * value, 0)) || 1;
    return embedding.map((value) => Number((value / magnitude).toFixed(6)));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const minLength = Math.min(a.length, b.length);
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < minLength; i += 1) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const denominator = Math.sqrt(magA) * Math.sqrt(magB) || 1;
    return dot / denominator;
  }
}
