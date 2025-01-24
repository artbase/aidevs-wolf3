import { readdir, readFile } from 'fs/promises';

export class StorageService {

  async getFiles(mapFolder: string, extension: string): Promise<string[]> {
    const files = await readdir(mapFolder);
    const listOfFiles = files.filter(file => file.endsWith(extension));

    return listOfFiles;
  }
}