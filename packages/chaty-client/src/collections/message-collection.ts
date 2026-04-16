import { ClassCollection } from './collection'
import { Message } from '../models'
import type { HydratedMessage } from '../hydration'

export class MessageCollection extends ClassCollection<Message, HydratedMessage> { }
