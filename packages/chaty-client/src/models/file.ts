import { File as APIFile } from '@chaty-app/proto/web-plain/shared/v1/files'

export class File {
  readonly #file: APIFile

  constructor(file: APIFile) {
    this.#file = file
  }

  static getDefaultAPIFile(): APIFile {
    return {
      bucket: '',
      contentType: '',
      filename: '',
      hash: '',
      id: '',
      size: '',
      uploadedAt: '',
      uploaderId: '',
    }
  }
}
