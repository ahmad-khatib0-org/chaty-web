import { object, string, array, boolean } from 'yup'

import { AppError } from '@chaty-app/proto/web/shared/v1/error_pb'
import { UseFormReturnType } from '@mantine/form'
import { GROUPS_DESCRIPTION_MAX_LENGTH, GROUPS_NAME_MAX_LENGTH, GROUPS_NAME_MIN_LENGTH } from '../shared'

export class GroupsCreateHelpers {
  constructor() { }

  static form(tr: Record<string, string>) {
    return object().shape({
      name: string()
        .min(GROUPS_NAME_MIN_LENGTH, tr.groupNameRequired)
        .max(GROUPS_NAME_MAX_LENGTH, tr.groupNameLength)
        .required(tr.groupNameRequired),
      description: string().max(GROUPS_DESCRIPTION_MAX_LENGTH, tr.groupDescriptionLength).notRequired(),
      recipients: array(string()).notRequired(),
      nsfw: boolean(),
    })
  }

  static formValues() {
    return { name: '', description: '', recipients: [], nsfw: false }
  }

  static handleSubmitErrors(err: AppError, form: UseFormReturnType<ReturnType<typeof this.formValues>>) {
    const e = err.errors
    if (e.hasOwnProperty('name')) form.setFieldError('name', e['name'])
    if (e.hasOwnProperty('description')) form.setFieldError('description', e['description'])
    if (e.hasOwnProperty('recipients')) form.setFieldError('recipients', e['recipients'])
  }
}
