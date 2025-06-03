import { v4 } from 'uuid';

export class RandomUtils {
  static getInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  static getArray<T>(length: number, generator: () => T) {
    return Array.from({ length }, generator);
  }

  static getColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }
  static getRandomDate() {
    return new Date(new Date().getTime() - RandomUtils.getInt(0, 100) * 24 * 60 * 60 * 1000).toISOString();
  }
  static getBoolean() {
    return Math.random() < 0.5;
  }
  static getString() {
    return Math.random().toString(36).substring(7);
  }
  static getUuid() {
    return v4();
  }

  static getId() {
    return RandomUtils.getUuid();
  }
}
