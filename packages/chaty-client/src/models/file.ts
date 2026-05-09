import { File as APIFile } from '@chaty-app/proto/web-plain/shared/v1/files'

import { Client } from '../client'

export class File {
  readonly #file: APIFile
  readonly client: Client

  /**
   * File Id
   */
  readonly id: string

  /**
   * File bucket
   */
  readonly tag: string

  // ID of user who uploaded this file
  readonly uploaderId: string

  /**
   * Original filename
   */
  readonly filename?: string

  /**
   * Raw content type of this file
   */
  readonly contentType?: string

  /**
   * Size of the file (in bytes)
   */
  readonly size?: number

  constructor(client: Client, file: APIFile) {
    this.#file = file
    this.client = client
    this.id = this.#file.id
    this.uploaderId = this.#file.uploaderId
    this.tag = this.#file.bucket
    this.filename = this.#file.filename
    this.contentType = this.#file.contentType
    this.size = this.#file.size
  }

  static getDefaultAPIFile(): APIFile {
    return {
      bucket: '',
      contentType: '',
      filename: '',
      hash: '',
      id: '',
      size: 0,
      uploadedAt: 0,
      uploaderId: '',
    }
  }

  createFileURL(): string | undefined {
    const files = this.client.configuration?.features?.files
    if (!files?.enabled) return
    return `${files.url}/${this.tag}/${this.id}`
  }
}
