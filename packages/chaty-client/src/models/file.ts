import { File as APIFile } from '@chaty-app/proto/web-plain/shared/v1/files'

export class File {
  readonly #file: APIFile

  constructor(file: APIFile) {
    this.#file = file
  }
}
