import { loadPackageDefinition } from 'grpc'
import { loadSync, PackageDefinition } from '@grpc/proto-loader'
import { join } from 'path'

const definition: PackageDefinition = loadSync(join(__dirname, './protos/provision.proto'))
export default loadPackageDefinition(definition)
