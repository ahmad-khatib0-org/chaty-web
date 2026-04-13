import { ClassCollection } from './collection'
import type { HydratedServer } from '../hydration'
import type { Server } from '../models'

export class ServerCollection extends ClassCollection<Server, HydratedServer> { }
