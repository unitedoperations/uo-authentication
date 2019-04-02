export type Nullable<T> = T | null | undefined

export type Throwable<T> = T | never

export type UserStoreEntity = {
  username: string
  email: string
  forums_id: number
  discord_id: string
  teamspeak_id: string
  teamspeak_db_id: number
  ip: string
  createdAt: string
}

export type EntityData = {
  name: keyof UserStoreEntity
  value: any
  excludeFromIndexes?: boolean
}

export type Fields = {
  [k: string]: {
    name: string
    value?: string
    fields?: Fields
  }
}

export type ForumsGroup = {
  id: number
  name: string
  formattedName: string
}

export type ForumsUser = {
  id: number
  name: string
  title: string
  timeZone: string
  formattedName: string
  primaryGroup: ForumsGroup
  secondaryGroups: ForumsGroup[]
  email: string
  joined: string
  registrationIpAddress: string
  warningPoints: number
  reputationPoints: number
  photoUrl: string
  photoUrlIsDefault: boolean
  coverPhotoUrl: string
  profileUrl: string
  validating: boolean
  posts: number
  lastActivity: string
  lastVisit: string
  lastPost: string
  profileViews: number
  birthday: string
  customFields: Fields
}

export type DiscordUser = {
  id: string
  username: string
  discriminator: string
  avatar: Nullable<string>
  bot?: boolean
  mfa_enabled?: boolean
  locale?: string
  verified?: boolean
  email: string
  flags: number
  premium_type?: number
}

export type TeamspeakUser = {
  cid: number
  client_database_id: number
  client_unique_identifier: string
  client_nickname: string
  client_servergroups: string
  client_created: number
  client_lastconencted: number
  client_totalconnections: number
  client_country: string
  connection_client_ip: string
}

export type TeamspeakServerGroup = {
  name: string
  sgid: number
  cldbid?: number
}

export enum TeamspeakGroups {
  PublicRelationsOfficer = 10,
  GameServerOfficer = 11,
  MissionMakingOfficer = 12,
  WebServerOfficer = 13,
  TrainingOfficer = 14,
  GameModerator = 19,
  ForumModerator = 22,
  UOTCInstructor = 23,
  DonorOfficer = 25,
  DonorRegular = 26,
  DonorMember = 27,
  TeamSpeakOfficer = 85,
  Regular = 86,
  Officer = 88,
  Member = 90,
  AirForcesOfficer = 108
}
