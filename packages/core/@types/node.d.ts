declare let global: Record<string, any> // in web, we use global varible to do some things, here to declare

type Dict<T> = {
  [k: string]: T | undefined
}

type EnvType = Dict<string>

declare let process: {
  env: EnvType
}
