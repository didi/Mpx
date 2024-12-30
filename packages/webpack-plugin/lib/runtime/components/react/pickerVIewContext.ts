import { createContext, useContext } from 'react'
import { SharedValue } from 'react-native-reanimated'

type ContextValue = SharedValue<number>

export const PickerViewColumnAnimationContext = createContext<
    ContextValue | undefined
>(undefined)

export const usePickerViewColumnAnimationContext = () => {
  const value = useContext(PickerViewColumnAnimationContext)
  if (value === undefined) {
    throw new Error(
      'usePickerViewColumnAnimationContext must be called from within PickerViewColumnAnimationContext.Provider!'
    )
  }
  return value
}
