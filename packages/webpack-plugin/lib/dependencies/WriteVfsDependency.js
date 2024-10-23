const NullDependency = require('webpack/lib/dependencies/NullDependency')
const makeSerializable = require('webpack/lib/util/makeSerializable')

class WriteVfsDependency extends NullDependency {
  constructor (filename, content) {
    super()
    this.filename = filename
    this.content = content
  }

  get type () {
    return 'mpx app entry'
  }

  mpxAction (module, compilation, callback) {
    const mpx = compilation.__mpx__
    const vfs = mpx.__vfs
    if (vfs) {
      vfs.writeModule(this.filename, this.content)
    }
    return callback()
  }

  serialize (context) {
    const { write } = context
    write(this.filename)
    write(this.content)
    super.serialize(context)
  }

  deserialize (context) {
    const { read } = context
    this.filename = read()
    this.content = read()
    super.deserialize(context)
  }
}

WriteVfsDependency.Template = class WriteVfsDependencyTemplate {
  apply () {
  }
}

makeSerializable(WriteVfsDependency, '@mpxjs/webpack-plugin/lib/dependencies/WriteVfsDependency')

module.exports = WriteVfsDependency
