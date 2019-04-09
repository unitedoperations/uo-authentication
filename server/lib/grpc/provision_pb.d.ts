// package: 
// file: provision.proto

import * as jspb from "google-protobuf";

export class Empty extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Empty.AsObject;
  static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Empty;
  static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
  export type AsObject = {
  }
}

export class Status extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Status.AsObject;
  static toObject(includeInstance: boolean, msg: Status): Status.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Status, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Status;
  static deserializeBinaryFromReader(message: Status, reader: jspb.BinaryReader): Status;
}

export namespace Status {
  export type AsObject = {
    success: boolean,
  }
}

export class User extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): User.AsObject;
  static toObject(includeInstance: boolean, msg: User): User.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: User, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): User;
  static deserializeBinaryFromReader(message: User, reader: jspb.BinaryReader): User;
}

export namespace User {
  export type AsObject = {
    id: string,
  }
}

export class UserRolesList extends jspb.Message {
  clearUsersList(): void;
  getUsersList(): Array<UserRolesList.RoleSet>;
  setUsersList(value: Array<UserRolesList.RoleSet>): void;
  addUsers(value?: UserRolesList.RoleSet, index?: number): UserRolesList.RoleSet;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserRolesList.AsObject;
  static toObject(includeInstance: boolean, msg: UserRolesList): UserRolesList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UserRolesList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserRolesList;
  static deserializeBinaryFromReader(message: UserRolesList, reader: jspb.BinaryReader): UserRolesList;
}

export namespace UserRolesList {
  export type AsObject = {
    usersList: Array<UserRolesList.RoleSet.AsObject>,
  }

  export class RoleSet extends jspb.Message {
    getId(): string;
    setId(value: string): void;

    clearRolesList(): void;
    getRolesList(): Array<string>;
    setRolesList(value: Array<string>): void;
    addRoles(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RoleSet.AsObject;
    static toObject(includeInstance: boolean, msg: RoleSet): RoleSet.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RoleSet, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RoleSet;
    static deserializeBinaryFromReader(message: RoleSet, reader: jspb.BinaryReader): RoleSet;
  }

  export namespace RoleSet {
    export type AsObject = {
      id: string,
      rolesList: Array<string>,
    }
  }
}

export class AllUserRolesList extends jspb.Message {
  clearUsersList(): void;
  getUsersList(): Array<UserRolesList>;
  setUsersList(value: Array<UserRolesList>): void;
  addUsers(value?: UserRolesList, index?: number): UserRolesList;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AllUserRolesList.AsObject;
  static toObject(includeInstance: boolean, msg: AllUserRolesList): AllUserRolesList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AllUserRolesList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AllUserRolesList;
  static deserializeBinaryFromReader(message: AllUserRolesList, reader: jspb.BinaryReader): AllUserRolesList;
}

export namespace AllUserRolesList {
  export type AsObject = {
    usersList: Array<UserRolesList.AsObject>,
  }
}

export class RoleDiff extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  clearAssignList(): void;
  getAssignList(): Array<string>;
  setAssignList(value: Array<string>): void;
  addAssign(value: string, index?: number): string;

  clearRevokeList(): void;
  getRevokeList(): Array<string>;
  setRevokeList(value: Array<string>): void;
  addRevoke(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RoleDiff.AsObject;
  static toObject(includeInstance: boolean, msg: RoleDiff): RoleDiff.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RoleDiff, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RoleDiff;
  static deserializeBinaryFromReader(message: RoleDiff, reader: jspb.BinaryReader): RoleDiff;
}

export namespace RoleDiff {
  export type AsObject = {
    id: string,
    assignList: Array<string>,
    revokeList: Array<string>,
  }
}

